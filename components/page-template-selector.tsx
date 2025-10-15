"use client"

import { Card, CardContent } from "@/components/ui/card"
import { PAGE_TEMPLATES, type PageTemplate } from "@/lib/types"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

interface PageTemplateSelectorProps {
  selected?: PageTemplate
  onSelect: (template: PageTemplate) => void
}

export function PageTemplateSelector({ selected, onSelect }: PageTemplateSelectorProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {PAGE_TEMPLATES.map((template) => (
        <Card
          key={template.id}
          className={cn(
            "cursor-pointer transition-all hover:scale-105 glass-effect border-border/50",
            selected === template.id && "border-primary/50 ring-2 ring-primary/20",
          )}
          onClick={() => onSelect(template.id)}
        >
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className={cn("rounded-lg bg-gradient-to-br p-4 text-center", template.color)}>
                <span className="text-4xl">{template.icon}</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-foreground">{template.name}</h3>
                  {selected === template.id && (
                    <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                      <Check className="h-3 w-3 text-primary-foreground" />
                    </div>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{template.description}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
