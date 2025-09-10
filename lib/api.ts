// app/lib/api.ts

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE?.trim() || "http://127.0.0.1:8000"

export type ChatResource = {
  title?: string
  url?: string
  snippet?: string
  score?: number
}

export type ApiResponse = {
  reply: string
  intent: "chat" | "resources" | "unknown"
  search_query?: string | null
  resources?: ChatResource[]
  suggestions?: string[]
}

/** Ping the FastAPI root (health). */
export async function fetchHealth(): Promise<boolean> {
  try {
    const r = await fetch(`${API_BASE}/`, { cache: "no-store" })
    return r.ok
  } catch {
    return false
  }
}

/** Call the LangGraph-backed /chat endpoint. */
export async function postChat(params: {
  userId: string
  message: string
  language?: "en" | "hi"
}): Promise<ApiResponse> {
  const body = {
    user_id: params.userId,
    message: params.message || "",
    language: params.language,
  }

  const r = await fetch(`${API_BASE}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })

  if (!r.ok) {
    const msg = await r.text().catch(() => "")
    throw new Error(`chat ${r.status} ${msg}`)
  }

  return (await r.json()) as ApiResponse
}

/** Optional: clear server-side memory for a given user id. */
export async function resetSession(userId: string): Promise<boolean> {
  try {
    const r = await fetch(`${API_BASE}/reset`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId }),
    })
    return r.ok
  } catch {
    return false
  }
}
