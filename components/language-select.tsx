"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { t } from "@/lib/i18n"

interface LanguageSelectProps {
  value: string
  onValueChange: (value: string) => void
  lang: string
}

export function LanguageSelect({ value, onValueChange, lang }: LanguageSelectProps) {
  const languages = [
    { code: "en", name: "English" },
    { code: "hi", name: "हिंदी" },
  ]

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-[180px] bg-card border-border shadow-sm">
        <SelectValue placeholder={t(lang, "selectLanguage")} />
      </SelectTrigger>
      <SelectContent>
        {languages.map((language) => (
          <SelectItem key={language.code} value={language.code}>
            {language.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
