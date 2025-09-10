"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { t } from "@/lib/i18n"

interface AboutSectionProps {
  lang: string
}

export function AboutSection({ lang }: AboutSectionProps) {
  return (
    <Card className="border-none shadow-none bg-transparent">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl text-foreground">{t(lang, "about")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground space-y-4 leading-relaxed">
          <div className="bg-muted/50 p-4 rounded-xl border border-border">
            <p className="text-foreground leading-relaxed">
              The Playground provides mental health support and resources. This is a demonstration interface for testing
              the chatbot capabilities with advanced AI assistance.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl">
            <h4 className="font-semibold text-blue-900 mb-2">About the Consent Checkbox</h4>
            <p className="text-blue-800 text-sm leading-relaxed">
              The "Offer check-in (consent)" checkbox allows you to give permission for the AI assistant to proactively
              offer mental health check-ins and follow-up support. When enabled, the system may suggest wellness
              resources, coping strategies, or encourage you to seek professional help when appropriate. This feature
              helps provide more personalized and caring support throughout your conversation.
            </p>
          </div>

          <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl">
            <p className="text-amber-800 leading-relaxed">
              <strong className="text-amber-900">Disclaimer:</strong> This tool is not a substitute for professional
              medical advice. If you're experiencing a mental health crisis, please contact emergency services or a
              mental health professional immediately.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
