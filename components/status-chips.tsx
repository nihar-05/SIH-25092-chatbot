"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { fetchHealth, fetchReady } from "@/lib/api"
import { t } from "@/lib/i18n"

interface StatusChipsProps {
  lang: string
}

export function StatusChips({ lang }: StatusChipsProps) {
  const [health, setHealth] = useState<boolean | null>(null)
  const [ready, setReady] = useState<{ has_gemini: boolean; has_tavily: boolean } | null>(null)

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const [healthStatus, readyStatus] = await Promise.all([fetchHealth(), fetchReady()])
        setHealth(healthStatus)
        setReady(readyStatus)
      } catch (error) {
        setHealth(false)
        setReady(null)
      }
    }

    checkStatus()
    const interval = setInterval(checkStatus, 30000) // Check every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const isReady = ready?.has_gemini && ready?.has_tavily

  return (
    <div className="flex gap-2">
      <Badge variant={health ? "default" : "secondary"} className={health ? "bg-green-500" : "bg-gray-500"}>
        {t(lang, "health")}: {health ? "✓" : "✗"}
      </Badge>
      <Badge variant={isReady ? "default" : "secondary"} className={isReady ? "bg-green-500" : "bg-gray-500"}>
        {t(lang, "ready")}: {isReady ? "✓" : "✗"}
      </Badge>
    </div>
  )
}
