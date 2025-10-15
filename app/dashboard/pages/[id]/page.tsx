"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getPageById, savePage } from "@/lib/pages-store"
import type { Page } from "@/lib/types"
import { ArrowLeft, Save, Eye } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

export default function EditPagePage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [page, setPage] = useState<Page | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const pageData = getPageById(params.id as string)
    if (pageData) {
      const normalizedPage = {
        ...pageData,
        content: {
          title: pageData.content?.title || "",
          description: pageData.content?.description || "",
          sections: pageData.content?.sections || [],
        },
      }
      setPage(normalizedPage)
    } else {
      router.push("/dashboard/pages")
    }
  }, [params.id, router])

  const handleSave = async () => {
    if (!page) return

    setIsSaving(true)
    await new Promise((resolve) => setTimeout(resolve, 500))

    const updatedPage = {
      ...page,
      updatedAt: new Date().toISOString(),
    }

    savePage(updatedPage)
    setPage(updatedPage)
    setIsSaving(false)

    toast({
      title: "Página salva!",
      description: "As alterações foram salvas com sucesso.",
    })
  }

  if (!page) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground text-balance">Editar Página</h1>
            <p className="text-muted-foreground">{page.name}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild className="border-border/50 bg-transparent">
            <Link href={`/p/${page.slug}`} target="_blank">
              <Eye className="h-4 w-4 mr-2" />
              Visualizar
            </Link>
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="btn-gradient-hover bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </div>

      {/* Editor */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card className="glass-effect border-border/50">
            <CardHeader>
              <CardTitle className="text-foreground">Informações Básicas</CardTitle>
              <CardDescription>Configure os detalhes principais da página</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="page-name" className="text-foreground">
                  Nome da Página
                </Label>
                <Input
                  id="page-name"
                  value={page.name}
                  onChange={(e) => setPage({ ...page, name: e.target.value })}
                  className="bg-secondary/50 border-border/50 focus:border-primary"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="page-slug" className="text-foreground">
                  Slug (URL)
                </Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">/p/</span>
                  <Input
                    id="page-slug"
                    value={page.slug}
                    onChange={(e) => setPage({ ...page, slug: e.target.value })}
                    className="bg-secondary/50 border-border/50 focus:border-primary"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="page-title" className="text-foreground">
                  Título
                </Label>
                <Input
                  id="page-title"
                  value={page.content?.title || ""}
                  onChange={(e) => setPage({ ...page, content: { ...page.content, title: e.target.value } })}
                  className="bg-secondary/50 border-border/50 focus:border-primary"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="page-description" className="text-foreground">
                  Descrição
                </Label>
                <Textarea
                  id="page-description"
                  value={page.content?.description || ""}
                  onChange={(e) => setPage({ ...page, content: { ...page.content, description: e.target.value } })}
                  className="bg-secondary/50 border-border/50 focus:border-primary min-h-[100px]"
                  placeholder="Descreva o conteúdo da página..."
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="glass-effect border-border/50">
            <CardHeader>
              <CardTitle className="text-foreground">Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-foreground">Estado da Página</Label>
                <div className="flex flex-col gap-2">
                  {(["draft", "active", "archived"] as const).map((status) => (
                    <Button
                      key={status}
                      variant={page.status === status ? "default" : "outline"}
                      className={
                        page.status === status
                          ? "btn-gradient-hover bg-primary hover:bg-primary/90 text-primary-foreground"
                          : "border-border/50"
                      }
                      onClick={() => setPage({ ...page, status })}
                    >
                      {status === "draft" ? "Rascunho" : status === "active" ? "Ativa" : "Arquivada"}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-effect border-border/50">
            <CardHeader>
              <CardTitle className="text-foreground">Informações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Template:</span>
                <span className="text-foreground capitalize">{page.template}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Visualizações:</span>
                <span className="text-foreground">{page.views}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Criada em:</span>
                <span className="text-foreground">{new Date(page.createdAt).toLocaleDateString("pt-BR")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Atualizada em:</span>
                <span className="text-foreground">{new Date(page.updatedAt).toLocaleDateString("pt-BR")}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
