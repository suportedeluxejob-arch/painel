"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { TemplatePreviewSelector } from "./template-preview-selector"
import { createNewPage, savePage } from "@/lib/pages-store"
import type { PreMadeTemplate } from "@/lib/page-templates"
import { ArrowRight, ArrowLeft } from "lucide-react"

interface CreatePageDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreatePageDialog({ open, onOpenChange }: CreatePageDialogProps) {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2>(1)
  const [pageName, setPageName] = useState("")
  const [selectedPreMadeTemplate, setSelectedPreMadeTemplate] = useState<PreMadeTemplate>()

  const handleCreate = () => {
    if (!pageName || !selectedPreMadeTemplate) return

    const newPage = createNewPage(pageName, selectedPreMadeTemplate.template)
    newPage.content = selectedPreMadeTemplate.content

    savePage(newPage)
    onOpenChange(false)
    router.push(`/dashboard/pages/${newPage.id}`)

    // Reset form
    setStep(1)
    setPageName("")
    setSelectedPreMadeTemplate(undefined)
  }

  const canProceed = step === 1 ? pageName.trim() : selectedPreMadeTemplate

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[92vh] glass-effect border-border/50 p-0">
        <ScrollArea className="max-h-[92vh]">
          <div className="p-6">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-2xl text-foreground">
                {step === 1 ? "Criar Nova Página" : "Telas Disponíveis"}
              </DialogTitle>
              <DialogDescription className="text-base">
                {step === 1 ? "Dê um nome para sua nova página" : "Selecione uma tela pronta para usar"}
              </DialogDescription>
            </DialogHeader>

            <div className="py-2">
              {step === 1 ? (
                <div className="space-y-4 max-w-xl">
                  <div className="space-y-2">
                    <Label htmlFor="page-name" className="text-foreground text-base">
                      Nome da Página
                    </Label>
                    <Input
                      id="page-name"
                      placeholder="Ex: Landing Page Principal"
                      value={pageName}
                      onChange={(e) => setPageName(e.target.value)}
                      className="bg-secondary/50 border-border/50 focus:border-primary h-11 text-base"
                      autoFocus
                    />
                    <p className="text-sm text-muted-foreground">O slug será gerado automaticamente baseado no nome</p>
                  </div>
                </div>
              ) : (
                <TemplatePreviewSelector selected={selectedPreMadeTemplate?.id} onSelect={setSelectedPreMadeTemplate} />
              )}
            </div>

            <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-border/50">
              {step === 2 && (
                <Button variant="outline" onClick={() => setStep(1)} className="border-border/50" size="lg">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
              )}
              {step === 1 ? (
                <Button
                  onClick={() => setStep(2)}
                  disabled={!pageName.trim()}
                  className="btn-gradient-hover bg-primary hover:bg-primary/90 text-primary-foreground"
                  size="lg"
                >
                  Próximo
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleCreate}
                  disabled={!canProceed}
                  className="btn-gradient-hover bg-primary hover:bg-primary/90 text-primary-foreground"
                  size="lg"
                >
                  Criar Página
                </Button>
              )}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
