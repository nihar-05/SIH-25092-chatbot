"use client"

import { useState, type KeyboardEvent } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Send } from "lucide-react"
import { t } from "@/lib/i18n"

interface MessageInputProps {
  onSend: (message: string, offerCheckin: boolean) => void
  disabled: boolean
  lang: string
}

export function MessageInput({ onSend, disabled, lang }: MessageInputProps) {
  const [message, setMessage] = useState("")
  const [offerCheckin, setOfferCheckin] = useState(false)

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSend(message.trim(), offerCheckin)
      setMessage("")
    }
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="space-y-4 p-6 bg-card border border-border rounded-2xl shadow-sm">
      <div className="flex items-center space-x-3 p-4 bg-muted/50 rounded-xl border-2 border-border/60 shadow-sm">
        <Checkbox
          id="checkin"
          checked={offerCheckin}
          onCheckedChange={(checked) => setOfferCheckin(!!checked)}
          className="border-2 border-primary/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
        />
        <label htmlFor="checkin" className="text-sm font-medium text-foreground cursor-pointer leading-relaxed">
          {t(lang, "offerCheckin")}
        </label>
      </div>
      <div className="flex gap-3">
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t(lang, "placeholder")}
          className="min-h-[60px] resize-none text-base leading-relaxed placeholder:text-muted-foreground/70 placeholder:text-base"
          disabled={disabled}
        />
        <Button
          onClick={handleSend}
          disabled={!message.trim() || disabled}
          size="icon"
          className="h-[60px] w-[60px] rounded-xl shadow-sm"
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}
