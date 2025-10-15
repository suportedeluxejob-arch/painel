"use client"

import { useState } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PRE_MADE_TEMPLATES } from "@/lib/page-templates"
import type { PageTemplate } from "@/lib/types"
import { ExternalLink, Copy, Check } from "lucide-react"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface ScreensBrowserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const TEMPLATE_LABELS: Record<PageTemplate, string> = {
  landing: "Redes Sociais",
  contact: "Localização",
  about: "Institucional",
  portfolio: "Portfólio",
  pricing: "Preços",
  blog: "Blog",
}

export function ScreensBrowserDialog({ open, onOpenChange }: ScreensBrowserDialogProps) {
  const [selectedFilter, setSelectedFilter] = useState<PageTemplate | "all">("all")
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const filteredTemplates =
    selectedFilter === "all" ? PRE_MADE_TEMPLATES : PRE_MADE_TEMPLATES.filter((t) => t.template === selectedFilter)

  const handleCopyLink = (id: string) => {
    const url = `${window.location.origin}/screens/${id}`
    navigator.clipboard.writeText(url)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleOpenScreen = (id: string) => {
    window.open(`/screens/${id}`, "_blank")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[85vh] p-0 glass-effect border-border/50">
        <ScrollArea className="max-h-[85vh]">
          <div className="p-6 md:p-8">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-2xl md:text-3xl font-bold text-foreground">Telas Disponíveis</DialogTitle>
              <DialogDescription className="text-sm md:text-base text-muted-foreground mt-2">
                Escolha uma tela pronta e compartilhe o link com seus amigos
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-wrap gap-2 mb-6">
              <Button
                variant={selectedFilter === "all" ? "default" : "outline"}
                onClick={() => setSelectedFilter("all")}
                size="sm"
                className={cn(
                  "rounded-full",
                  selectedFilter === "all"
                    ? "bg-primary text-primary-foreground"
                    : "border-border/50 hover:border-primary/50",
                )}
              >
                Todas
              </Button>
              {(Object.keys(TEMPLATE_LABELS) as PageTemplate[]).map((type) => {
                const hasTemplates = PRE_MADE_TEMPLATES.some((t) => t.template === type)
                if (!hasTemplates) return null

                return (
                  <Button
                    key={type}
                    variant={selectedFilter === type ? "default" : "outline"}
                    onClick={() => setSelectedFilter(type)}
                    size="sm"
                    className={cn(
                      "rounded-full",
                      selectedFilter === type
                        ? "bg-primary text-primary-foreground"
                        : "border-border/50 hover:border-primary/50",
                    )}
                  >
                    {TEMPLATE_LABELS[type]}
                  </Button>
                )
              })}
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-2">
              {filteredTemplates.map((template) => (
                <div
                  key={template.id}
                  className="group relative rounded-xl border border-border/50 bg-card overflow-hidden hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/5"
                >
                  <div className="relative aspect-[16/9] bg-muted overflow-hidden">
                    <Image
                      src={template.thumbnail || "/placeholder.svg"}
                      alt={template.name}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />

                    <div className="absolute top-3 right-3">
                      <Badge variant="secondary" className="capitalize backdrop-blur-sm bg-background/80">
                        {TEMPLATE_LABELS[template.template]}
                      </Badge>
                    </div>
                  </div>

                  <div className="p-5 space-y-4">
                    <div className="space-y-2 min-h-[80px]">
                      <h3 className="font-semibold text-lg text-foreground leading-tight line-clamp-1">
                        {template.name}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                        {template.description}
                      </p>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button
                        onClick={() => handleOpenScreen(template.id)}
                        className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                        size="default"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Abrir Tela
                      </Button>
                      <Button
                        onClick={() => handleCopyLink(template.id)}
                        variant="outline"
                        size="default"
                        className="border-border/50 hover:border-primary/50 px-4"
                      >
                        {copiedId === template.id ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredTemplates.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Nenhuma tela encontrada para este filtro</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
