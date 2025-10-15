"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PRE_MADE_TEMPLATES, type PreMadeTemplate } from "@/lib/page-templates"
import { PAGE_TEMPLATES } from "@/lib/types"
import { cn } from "@/lib/utils"
import { Check, Eye } from "lucide-react"
import Image from "next/image"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"

interface TemplatePreviewSelectorProps {
  selected?: string
  onSelect: (template: PreMadeTemplate) => void
}

export function TemplatePreviewSelector({ selected, onSelect }: TemplatePreviewSelectorProps) {
  const [filterType, setFilterType] = useState<string>("all")
  const [previewTemplate, setPreviewTemplate] = useState<PreMadeTemplate | null>(null)

  const filteredTemplates =
    filterType === "all" ? PRE_MADE_TEMPLATES : PRE_MADE_TEMPLATES.filter((t) => t.template === filterType)

  return (
    <div className="space-y-6">
      <ScrollArea className="w-full">
        <div className="flex gap-2 pb-2">
          <Button
            variant={filterType === "all" ? "default" : "outline"}
            size="default"
            onClick={() => setFilterType("all")}
            className={cn(
              "whitespace-nowrap h-10 px-4",
              filterType === "all" && "bg-primary text-primary-foreground hover:bg-primary/90",
            )}
          >
            Todos
          </Button>
          {PAGE_TEMPLATES.map((template) => (
            <Button
              key={template.id}
              variant={filterType === template.id ? "default" : "outline"}
              size="default"
              onClick={() => setFilterType(template.id)}
              className={cn(
                "whitespace-nowrap h-10 px-4",
                filterType === template.id && "bg-primary text-primary-foreground hover:bg-primary/90",
              )}
            >
              {template.name}
            </Button>
          ))}
        </div>
      </ScrollArea>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3">
        {filteredTemplates.map((template) => (
          <Card
            key={template.id}
            className={cn(
              "cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] glass-effect border-border/50 group overflow-hidden",
              selected === template.id && "border-primary ring-2 ring-primary/20",
            )}
            onClick={() => onSelect(template)}
          >
            <CardContent className="p-0">
              <div className="flex flex-col">
                <div className="relative aspect-[16/9] overflow-hidden bg-muted flex-shrink-0">
                  <Image
                    src={template.thumbnail || "/placeholder.svg"}
                    alt={template.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent" />

                  <Button
                    size="sm"
                    variant="secondary"
                    className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg h-9"
                    onClick={(e) => {
                      e.stopPropagation()
                      setPreviewTemplate(template)
                    }}
                  >
                    <Eye className="h-4 w-4 mr-1.5" />
                    Preview
                  </Button>

                  {selected === template.id && (
                    <div className="absolute top-3 left-3 h-8 w-8 rounded-full bg-primary flex items-center justify-center shadow-lg">
                      <Check className="h-4 w-4 text-primary-foreground" />
                    </div>
                  )}
                </div>

                <div className="p-5 space-y-3 flex-1 flex flex-col">
                  <div className="space-y-2 flex-1">
                    <h3 className="font-semibold text-lg text-foreground text-balance leading-tight">
                      {template.name}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{template.description}</p>
                  </div>

                  <Badge variant="secondary" className="text-xs font-medium w-fit">
                    {PAGE_TEMPLATES.find((t) => t.id === template.template)?.name}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
        <DialogContent className="max-w-5xl max-h-[90vh] glass-effect border-border/50 p-0">
          <ScrollArea className="max-h-[90vh]">
            <div className="p-6">
              <DialogHeader className="mb-6">
                <DialogTitle className="text-2xl text-foreground">{previewTemplate?.name}</DialogTitle>
                <DialogDescription className="text-base">{previewTemplate?.description}</DialogDescription>
              </DialogHeader>

              {previewTemplate && (
                <div className="space-y-6">
                  <div className="relative aspect-video overflow-hidden rounded-lg bg-muted border border-border/50">
                    <Image
                      src={previewTemplate.thumbnail || "/placeholder.svg"}
                      alt={previewTemplate.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1200px) 100vw, 1200px"
                    />
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-3">
                      <h3 className="text-2xl font-bold text-foreground">{previewTemplate.content.title}</h3>
                      <p className="text-muted-foreground leading-relaxed">{previewTemplate.content.description}</p>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-semibold text-lg text-foreground">Seções Incluídas:</h4>
                      <div className="grid gap-3">
                        {previewTemplate.content.sections.map((section, index) => (
                          <div
                            key={section.id}
                            className="p-4 rounded-lg bg-secondary/50 border border-border/50 flex items-start gap-4 hover:bg-secondary/70 transition-colors"
                          >
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold flex-shrink-0">
                              {index + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-foreground capitalize mb-1">{section.type}</p>
                              <p className="text-sm text-muted-foreground">
                                {section.type === "hero" && "Seção principal com título e call-to-action"}
                                {section.type === "features" && "Grade de recursos e benefícios"}
                                {section.type === "cta" && "Chamada para ação"}
                                {section.type === "content" && "Conteúdo personalizado"}
                                {section.type === "gallery" && "Galeria de imagens/projetos"}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Button
                      onClick={() => {
                        onSelect(previewTemplate)
                        setPreviewTemplate(null)
                      }}
                      size="lg"
                      className="w-full btn-gradient-hover bg-primary hover:bg-primary/90 text-primary-foreground h-12"
                    >
                      Usar Este Template
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  )
}
