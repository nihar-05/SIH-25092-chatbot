"use client"

import { useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"
import { t } from "@/lib/i18n"
import ReactMarkdown from "react-markdown"

interface Message {
  role: "user" | "assistant"
  text: string
}

interface ChatWindowProps {
  messages: Message[]
  isLoading: boolean
  riskLevel: "None" | "High"
  lang: string
}

export function ChatWindow({ messages, isLoading, riskLevel, lang }: ChatWindowProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isLoading])

  return (
    <div className="flex flex-col h-full">
      {riskLevel === "High" && (
        <Alert className="mb-6 border-red-200 bg-red-50 rounded-xl">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">{t(lang, "crisisAlert")}</AlertDescription>
        </Alert>
      )}

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-6 p-6 bg-card border border-border rounded-2xl shadow-sm"
      >
        <AnimatePresence>
          {messages.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className={`flex gap-4 ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {message.role === "assistant" && (
                <Avatar className="h-10 w-10 bg-primary shadow-sm">
                  <AvatarFallback className="bg-primary text-primary-foreground font-semibold text-sm">
                    AI
                  </AvatarFallback>
                </Avatar>
              )}
              <div
                className={`max-w-[80%] p-4 rounded-2xl shadow-sm ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground ml-auto"
                    : "bg-muted/50 border border-border text-foreground"
                }`}
              >
                {message.role === "assistant" ? (
                 <div className="prose prose-sm max-w-none [&>p]:mb-3 [&>p:last-child]:mb-0 [&>p]:text-base [&>p]:leading-relaxed prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground">
                  <ReactMarkdown>
                    {message.text}
                  </ReactMarkdown>
                </div>

                ) : (
                  <p className="text-base leading-relaxed">{message.text}</p>
                )}
              </div>
              {message.role === "user" && (
                <Avatar className="h-10 w-10 bg-secondary shadow-sm">
                  <AvatarFallback className="bg-secondary text-secondary-foreground font-semibold text-sm">
                    U
                  </AvatarFallback>
                </Avatar>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex gap-4">
            <Avatar className="h-10 w-10 bg-primary shadow-sm">
              <AvatarFallback className="bg-primary text-primary-foreground font-semibold text-sm">AI</AvatarFallback>
            </Avatar>
            <div className="bg-muted/50 border border-border p-4 rounded-2xl shadow-sm">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
