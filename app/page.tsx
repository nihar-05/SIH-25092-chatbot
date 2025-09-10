"use client"

import { useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { LanguageSelect } from "@/components/language-select"
import { ChatWindow } from "@/components/chat-window"
import { MessageInput } from "@/components/message-input"
import { ResourceList } from "@/components/resource-list"
import { AboutSection } from "@/components/about-section"

type Lang = "en" | "hi"

interface Message {
  role: "user" | "assistant"
  text: string
}

type ChatResource = {
  title?: string
  url?: string
  snippet?: string
  score?: number
}

type ApiResponse = {
  reply: string
  intent: "chat" | "resources" | "unknown"
  search_query?: string | null
  resources?: ChatResource[]
  suggestions?: string[]
}

const API_BASE =
  (process.env.NEXT_PUBLIC_API_BASE as string) || "http://127.0.0.1:8000"

export default function ChatbotPlayground() {
  const [lang, setLang] = useState<Lang>("en")
  const [messages, setMessages] = useState<Message[]>([])
  const [resources, setResources] = useState<ChatResource[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [riskLevel] = useState<"None" | "High">("None")
  const [showAbout, setShowAbout] = useState(false)

  // simple stable user id for backend memory
  const [userId, setUserId] = useState<string>("")

  const { toast } = useToast()

  // Generate a stable user id once (per tab)
  useEffect(() => {
    if (!userId) {
      const id =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `u_${Math.random().toString(36).slice(2)}`
      setUserId(id)
    }
  }, [userId])

  const handleLanguageChange = (newLang: string) => {
    setLang(newLang === "hi" ? "hi" : "en")
  }

  const callBackend = async (payload: {
    user_id: string
    message: string
    language?: Lang
  }): Promise<ApiResponse> => {
    const r = await fetch(`${API_BASE}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    if (!r.ok) {
      const errTxt = await r.text().catch(() => "")
      throw new Error(`Backend ${r.status}: ${errTxt}`)
    }
    return (await r.json()) as ApiResponse
  }

  const send = async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || !userId) return

    // optimistic user bubble
    setMessages((prev) => [...prev, { role: "user", text: trimmed }])
    setIsLoading(true)

    try {
      const res = await callBackend({
        user_id: userId,
        message: trimmed,
        language: lang,
      })

      // assistant bubble
      setMessages((prev) => [...prev, { role: "assistant", text: res.reply }])

      // resources (if any)
      setResources(res.resources || [])
    } catch (err) {
      console.error("Chat error:", err)
      toast({ title: "Network error", description: "Unable to reach the API.", variant: "destructive" })
      // roll back optimistic user bubble? (keeping it is often nicer UX)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendMessage = (text: string /* offerCheckin unused */) => {
    return send(text)
  }

  const handleGetResources = () => {
    // use last user line to build a resource-seeking prompt
    const lastUser = [...messages].reverse().find((m) => m.role === "user")
    const topic = lastUser?.text || "mental wellbeing tips"
    const ask = `Please share 3–5 reliable resources about: ${topic}`
    return send(ask)
  }

  return (
    <div className="min-h-screen bg-background relative">
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-50/50 to-amber-50/30" />

      <div className="relative z-10 container mx-auto px-6 py-8 max-w-7xl">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-12"
        >
          <div className="flex-1 flex items-center gap-3">
            <h1 className="text-4xl font-bold text-foreground tracking-tight">Playground</h1>
            <Button variant="secondary" onClick={handleGetResources} disabled={isLoading}>
              Get resources
            </Button>
          </div>
          <div className="flex items-center gap-4">
            <LanguageSelect value={lang} onValueChange={handleLanguageChange} lang={lang} />
            <Button
              variant="outline"
              onClick={() => setShowAbout(!showAbout)}
              className="bg-card hover:bg-card/80 border-border shadow-sm"
            >
              About
            </Button>
          </div>
        </motion.header>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-200px)]">
          {/* Chat Column */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 flex flex-col gap-6"
          >
            <ChatWindow messages={messages} isLoading={isLoading} riskLevel={riskLevel} lang={lang} />
            <MessageInput onSend={handleSendMessage} disabled={isLoading} lang={lang} />
          </motion.div>

          {/* Resources Column */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col gap-6"
          >
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-foreground mb-6">Resources</h2>
              <ResourceList resources={resources} lang={lang} />
            </div>

            {showAbout && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-card border border-border rounded-2xl shadow-sm"
              >
                <AboutSection lang={lang} />
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
