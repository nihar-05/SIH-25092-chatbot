"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ExternalLink } from "lucide-react"
import type { ChatResource } from "@/lib/api"
import { t } from "@/lib/i18n"

interface ResourceListProps {
  resources: ChatResource[]
  lang: string
}

export function ResourceList({ resources, lang }: ResourceListProps) {
  if (resources.length === 0) {
    return (
      <div className="text-center text-muted-foreground p-8">
        <p>{t(lang, "noResources")}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {resources.map((resource, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <Card className="bg-muted/30 border-border hover:bg-muted/50 transition-all duration-200 hover:shadow-md">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <CardTitle className="text-sm font-medium text-foreground">{resource.title}</CardTitle>
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary/80 transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
              {resource.type && (
                <Badge variant="secondary" className="w-fit text-xs">
                  {resource.type}
                </Badge>
              )}
            </CardHeader>
            {resource.snippet && (
              <CardContent className="pt-0">
                <p className="text-xs text-muted-foreground">{resource.snippet}</p>
              </CardContent>
            )}
          </Card>
        </motion.div>
      ))}
    </div>
  )
}
