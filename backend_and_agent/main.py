# main.py
from __future__ import annotations
from typing import Optional, List, Dict, Any
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from langgraph_app import run_conversation, reset_session

app = FastAPI(title="LangGraph Counselor API", version="1.0.0")

# CORS (relax for dev; restrict in prod)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # e.g. ["http://localhost:3000"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    user_id: str = Field(..., description="Stable id to keep conversation memory")
    message: str = Field(..., description="User's message")
    language: Optional[str] = Field(None, description="Language hint, e.g., 'en' or 'hi'")

class ResourceItem(BaseModel):
    title: Optional[str] = None
    url: Optional[str] = None
    score: Optional[float] = None
    snippet: Optional[str] = None

class ChatResponse(BaseModel):
    reply: str
    intent: str
    search_query: Optional[str] = None
    resources: List[ResourceItem] = []
    suggestions: List[str] = []

class ResetRequest(BaseModel):
    user_id: str

@app.get("/")
def root():
    return {"ok": True, "service": "LangGraph Counselor API", "health": "green"}

@app.post("/chat", response_model=ChatResponse)
def chat(req: ChatRequest):
    msg = req.message.strip()
    if not msg:
        raise HTTPException(status_code=400, detail="Message cannot be empty.")
    result = run_conversation(user_id=req.user_id, user_message=msg, language=req.language)
    return ChatResponse(**result)

@app.post("/reset")
def reset(req: ResetRequest):
    reset_session(req.user_id)
    return {"ok": True, "message": f"Session {req.user_id} cleared."}
