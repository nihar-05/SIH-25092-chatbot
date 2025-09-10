Goal: Build a modern, animated Chatbot Playground page for the “SIH Wellbeing Assistant”.
It must include:

A Language dropdown populated from GET /langs (codes like en, hi, bn, te, ta, mr, gu, kn, ml, pa, or, as, ur).

A chat panel wired to POST /chat.

A resources panel that shows resources from the API.

A small About / Status area that pings GET /health and GET /ready.

Clean animations (Framer Motion), great UX, dark mode, responsive.

Design / UX

Minimal, modern glassy cards, rounded-2xl, soft gradients, shadows, subtle blur.

Motion: chat bubbles slide+fade, resource cards stagger in, buttons hover/press micro-interactions.

Accessibility: labels, focus rings, keyboard navigation.

Two columns on desktop (chat left, resources right), stacked on mobile.

API base

Read from NEXT_PUBLIC_API_BASE (default http://127.0.0.1:8000 if not set).

Endpoints & exact fetch calls (implement these helpers)

Create a small api.ts with these functions (TypeScript):

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://127.0.0.1:8000";

export type LangItem = { code: string; name: string };
export type ChatResource = { title: string; type?: string; url: string; lang?: string; snippet?: string };
export type ChatReply = { text: string; ui_ctas: Array<Record<string, any>> };
export type ChatRisk = { level: "None" | "High"; signals: any[] };

export async function fetchLangs(): Promise<LangItem[]> {
  const r = await fetch(`${API_BASE}/langs`, { cache: "no-store" });
  if (!r.ok) throw new Error(`langs ${r.status}`);
  const j = await r.json();
  return Array.isArray(j.languages) ? j.languages : [];
}

export async function fetchHealth(): Promise<boolean> {
  try {
    const r = await fetch(`${API_BASE}/health`, { cache: "no-store" });
    return r.ok;
  } catch { return false; }
}

export async function fetchReady(): Promise<{ has_gemini: boolean; has_tavily: boolean } | null> {
  try {
    const r = await fetch(`${API_BASE}/ready`, { cache: "no-store" });
    if (!r.ok) return null;
    return await r.json();
  } catch { return null; }
}

export async function postChat(params: {
  lang: string;
  text: string;
  offerCheckin?: boolean;
  requestResources?: boolean;
  uid?: string;
  orgId?: string;
}) : Promise<{
  reply: ChatReply;
  risk: ChatRisk;
  resources: ChatResource[];
  telemetry?: Record<string, any>;
}> {
  const body = {
    user: {
      uid: params.uid || "demo-user-1",
      orgId: params.orgId || "demo-org",
      lang: params.lang || "en",
    },
    session: {},
    message: params.text || "",
    context: {
      offer_checkin: !!params.offerCheckin,
      request_resources: !!params.requestResources,
    },
  };
  const r = await fetch(`${API_BASE}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!r.ok) {
    const msg = await r.text().catch(() => "");
    throw new Error(`chat ${r.status} ${msg}`);
  }
  const j = await r.json();
  return {
    reply: j.reply || { text: "", ui_ctas: [] },
    risk: j.risk || { level: "None", signals: [] },
    resources: Array.isArray(j.resources) ? j.resources : [],
    telemetry: j.telemetry || {},
  };
}

i18n dictionary & fallback

Create a tiny i18n map. Provide EN + HI strings; fallback to EN for other codes (bn, te, ta, mr, gu, kn, ml, pa, or, as, ur):

export const I18N: Record<string, Record<string, string>> = {
  en: {
    placeholder: "Type your message…",
    send: "Send",
    offerCheckin: "Offer check-in (consent)",
    resources: "Resources",
    about: "About",
    apiStatus: "API Status",
    selectLanguage: "Language",
  },
  hi: {
    placeholder: "अपना संदेश लिखें…",
    send: "भेजें",
    offerCheckin: "चेक-इन का प्रस्ताव (सहमति)",
    resources: "संसाधन",
    about: "जानकारी",
    apiStatus: "API स्थिति",
    selectLanguage: "भाषा",
  },
  bn: {}, te: {}, ta: {}, mr: {}, gu: {}, kn: {}, ml: {}, pa: {}, or: {}, as: {}, ur: {},
};

export function t(lang: string, key: string) {
  const L = I18N[lang] || {};
  return L[key] ?? I18N.en[key] ?? key;
}

Page behavior

Top bar: left “SIH Wellbeing Assistant”; right Language dropdown (populated from fetchLangs()), “About” link.

Language dropdown:

Default en. Load options via fetchLangs() on mount. Persist to localStorage.sih_lang.

On change: update selected lang (state + localStorage) → re-render UI strings via t(lang, ...).

The selected code must be used in postChat({ lang }).

Chat column:

Scrollable transcript with animated bubbles (AnimatePresence). User bubbles right-aligned; AI bubbles left with app avatar.

Input row: multiline textarea (Enter = new line, Ctrl/Cmd+Enter = send) + “Send”.

Checkbox: “Offer check-in (consent)” → set a boolean flag that’s sent to /chat on the next message.

When sending:

optimistic user bubble immediately

show an animated skeleton for AI while awaiting response

on success, render reply.text as Markdown (links, lists, paragraphs)

if risk.level === "High", show a red banner at top of chat panel with a short crisis note (no diagnosis).

Resources column:

If resources.length > 0: show as cards (title, small type pill, external link icon). Animate cards in a stagger.

If 0: show a muted empty state (“No resources yet.”).

About / Status:

A small section togglable from top bar or as a right-column footer: “About”, privacy blurb, disclaimers.

Show 2 chips: /health (green if ok), /ready (green if both has_gemini and has_tavily true, else gray).

Components to generate

LanguageSelect:

Loads options from fetchLangs().

Controlled value. Persists to localStorage.

Renders with shadcn/ui Select (or a nice dropdown), label from t(lang,"selectLanguage").

ChatWindow:

Keeps an array of { role: "user"|"assistant", text: string }.

Auto-scroll to bottom on new message.

Markdown rendering (basic) for assistant messages.

MessageInput:

Textarea + Send button; checkbox for consent.

Ctrl/Cmd+Enter sends.

ResourceList:

Grid/list of resource cards; each opens url in new tab.

StatusChips:

Fetches fetchHealth() and fetchReady(); shows green/gray.

Toasts:

On any fetch error, show a toast “Network error. Retry”.

State flow (pseudo)

On mount:

langs = await fetchLangs() (fallback to [en/English, hi/Hindi] on failure).

lang = localStorage.sih_lang || 'en'

Preload /health and /ready for chips.

On send:

Push optimistic user bubble.

Call postChat({ lang, text, offerCheckin: consentChecked, requestResources: false }).

Append assistant bubble with reply.text.

Replace resources column with returned resources.

If risk.level === "High", show alert banner.

Clear input; reset offerCheckin (keep it sticky if you prefer).

Visual details

Smooth container with max-w-7xl, gap-6; chat column grows; resources sticky on desktop (top: 88px).

Cards: rounded-2xl, subtle blur/gradient border, hover raise + slight scale.

Motion timings: 0.2–0.35s; stagger 0.06–0.1s per resource card.

Dark mode: darker glass, brighter text, accessible contrast.

Edge cases

If /langs fails → fallback options with just EN + HI.

If /chat fails → toast + keep user input for retry.

If lang code not in dictionary → UI strings fall back to EN via t().

Deliverables

A single page (Next.js/React) with all components.

Uses Tailwind + Framer Motion + shadcn/ui.

Fully wired to the four endpoints with the provided fetch helpers.
