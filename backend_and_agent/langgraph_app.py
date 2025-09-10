# langgraph_app.py
from __future__ import annotations
import os
import json
from typing import TypedDict, List, Literal, Optional, Dict, Any

from dotenv import load_dotenv
load_dotenv()

# --- LLM: Gemini ---
import google.generativeai as genai

# --- Search: Tavily ---
# pip install tavily-python
from tavily import TavilyClient

# --- LangGraph core ---
# pip install "langgraph>=0.2.0"
from langgraph.graph import StateGraph, END

GEMINI_API_KEY = os.getenv("GOOGLE_API_KEY")
if not GEMINI_API_KEY:
    raise RuntimeError("Missing GOOGLE_API_KEY in environment.")
genai.configure(api_key=GEMINI_API_KEY)

TAVILY_API_KEY = os.getenv("TAVILY_API_KEY", "")
tavily = TavilyClient(api_key=TAVILY_API_KEY) if TAVILY_API_KEY else None

# ---------------------------
# In-memory per-user memory
# ---------------------------
# WARNING: For demo only. Use a DB in production.
SESSIONS: Dict[str, List[Dict[str, str]]] = {}

# ---------------------------
# LangGraph State
# ---------------------------
Intent = Literal["chat", "resources", "unknown"]

class GraphState(TypedDict, total=False):
    user_id: str
    messages: List[Dict[str, str]]  # [{"role": "user"/"assistant"/"system", "content": "..."}]
    intent: Intent
    search_query: Optional[str]
    resources: List[Dict[str, Any]]
    language: Optional[str]

# ---------------------------
# System prompt for Gemini
# ---------------------------
SYSTEM_INSTRUCTION = """
You are a calm, warm, and empathetic psychological support assistant.
Your priorities:
1) Listen actively, validate feelings, and reflect back understanding.
2) Offer 2–4 small, doable next steps or gentle reframes.
3) Do not diagnose or give medical claims; you're not a therapist.
4) If there's self-harm or harm to others, urge immediate help (local emergency services, trusted people, licensed professionals).
5) Keep answers concise, plain, and non-judgmental.
6) Tone: steady, supportive, practical.

You must ALSO act as a router:
- Decide if the user is asking for general support ("chat") OR asking for resources like links, research, articles, or references ("resources").
- If "resources", produce a simple search query we can send to a web search node.

Return a STRICT JSON object with keys:
{
  "assistant_reply": string,     // your empathetic response
  "intent": "chat" | "resources" | "unknown",
  "search_query": string | null  // short query if intent == "resources", else null
}
Do NOT include code fences or extra text, only JSON.
"""

gemini_model = genai.GenerativeModel(
    model_name="gemini-1.5-flash",
    system_instruction=SYSTEM_INSTRUCTION,
)

# ---------------------------
# Node 1: Gemini Router
# ---------------------------
def node_gemini_router(state: GraphState) -> GraphState:
    """Produces a consoling reply + classifies intent + (optional) search query."""
    messages = state.get("messages", [])
    language = state.get("language")

    # Build a minimal prompt (messages already hold conversation)
    # We'll pass the last user message as the primary content.
    last_user = next((m for m in reversed(messages) if m["role"] == "user"), None)
    user_text = last_user["content"] if last_user else ""

    # Extra context for language preference (optional)
    context = ""
    if language:
        context = f"User prefers language: {language}\n"

    prompt = (context + f"User says:\n{user_text}").strip()

    try:
        resp = gemini_model.generate_content(
            prompt,
            generation_config={
                "temperature": 0.6,
                "top_p": 0.9,
                "top_k": 40,
                "max_output_tokens": 800,
            },
        )
        raw = (resp.text or "").strip()
        # Gemini sometimes wraps JSON—try to locate JSON block
        json_text = _extract_json(raw)
        data = json.loads(json_text)
        assistant_reply = (data.get("assistant_reply") or "").strip()
        intent = data.get("intent", "unknown")
        search_query = data.get("search_query")

        if not assistant_reply:
            assistant_reply = "I’m here with you. Could you share a bit more about what’s on your mind?"

        # Update messages with assistant_reply
        messages.append({"role": "assistant", "content": assistant_reply})

        return {
            **state,
            "messages": messages,
            "intent": intent if intent in ("chat", "resources") else "unknown",
            "search_query": (search_query or None),
        }
    except Exception:
        # Soft fallback
        messages.append({
            "role": "assistant",
            "content": "I’m here for you. I had trouble forming a response—could you tell me a little more?"
        })
        return {
            **state,
            "messages": messages,
            "intent": "unknown",
            "search_query": None,
        }

def _extract_json(text: str) -> str:
    """Best-effort extraction of a JSON object from model text."""
    # If it's already pure JSON, return it
    t = text.strip()
    if t.startswith("{") and t.endswith("}"):
        return t
    # Otherwise try to find the first {...} block
    start = t.find("{")
    end = t.rfind("}")
    if start != -1 and end != -1 and end > start:
        return t[start:end+1]
    # Last resort: minimal default
    return '{"assistant_reply": "I’m here with you.", "intent": "unknown", "search_query": null}'

# ---------------------------
# Node 2: Tavily Search
# ---------------------------
def node_tavily_search(state: GraphState) -> GraphState:
    """If intent==resources, fetch up to 5 resources using Tavily."""
    if not tavily:
        # Tavily not configured; just return state unchanged with note.
        return {
            **state,
            "resources": [{
                "title": "Tavily not configured",
                "url": "https://docs.tavily.com/",
                "snippet": "Set TAVILY_API_KEY in your environment to enable resource search."
            }]
        }

    query = state.get("search_query") or ""
    if not query:
        return {**state, "resources": []}

    try:
        res = tavily.search(
            query=query,
            max_results=5,
            search_depth="basic",
            include_answer=False,
        )
        items = res.get("results", []) if isinstance(res, dict) else []
        resources = []
        for it in items[:5]:
            resources.append({
                "title": it.get("title"),
                "url": it.get("url"),
                "score": it.get("score"),
                "snippet": it.get("content") or it.get("snippet") or "",
            })
        return {**state, "resources": resources}
    except Exception:
        return {**state, "resources": []}

# ---------------------------
# Build the graph
# ---------------------------
def build_graph():
    g = StateGraph(GraphState)
    g.add_node("gemini_router", node_gemini_router)
    g.add_node("tavily_search", node_tavily_search)

    # Entry -> Gemini
    g.set_entry_point("gemini_router")

    # Conditional edge: go to search only if intent == "resources", else end.
    def should_search(state: GraphState) -> str:
        return "tavily_search" if state.get("intent") == "resources" else END

    g.add_conditional_edges("gemini_router", should_search, { "tavily_search": "tavily_search", END: END })
    # After search, end
    g.add_edge("tavily_search", END)

    return g.compile()

GRAPH = build_graph()

# ---------------------------
# Orchestration helpers
# ---------------------------
def run_conversation(user_id: str, user_message: str, language: Optional[str] = None) -> Dict[str, Any]:
    """Append user message to memory, run graph once, update memory, return final state essentials."""
    history = SESSIONS.get(user_id, [])
    history.append({"role": "user", "content": user_message})

    state: GraphState = {
        "user_id": user_id,
        "messages": history,
        "language": language,
    }

    final_state = GRAPH.invoke(state)

    # Persist updated messages back to session memory
    SESSIONS[user_id] = final_state.get("messages", history)

    # Prepare a clean response payload
    assistant_msg = next((m["content"] for m in reversed(final_state["messages"]) if m["role"] == "assistant"), "I’m here and listening.")
    payload = {
        "reply": assistant_msg,
        "intent": final_state.get("intent", "unknown"),
        "search_query": final_state.get("search_query"),
        "resources": final_state.get("resources", []),
        "suggestions": [
            "Suggest one tiny step I can take today.",
            "Help me reframe this thought.",
            "Teach me a 2-minute grounding exercise.",
        ],
    }
    return payload

def reset_session(user_id: str):
    SESSIONS[user_id] = []
