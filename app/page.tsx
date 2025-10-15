"use client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Users, ArrowRight } from "lucide-react"
import Image from "next/image"

export default function HomePage() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-chart-2/5 pointer-events-none" />

      <div className="relative z-10 w-full max-w-4xl space-y-8">
        {/* Logo */}
        <div className="flex justify-center">
          <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-purple-500/50 shadow-2xl shadow-purple-500/30">
            <Image src="/logo.jpg" alt="ANOXQUI" fill className="object-cover" />
          </div>
        </div>

        {/* Title */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl md:text-5xl font-bold text-balance">Bem-vindo ao Panel do 7</h1>
          <p className="text-lg text-muted-foreground text-balance">Escolha como você deseja acessar a plataforma</p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card
            className="glass-effect border-primary/20 hover:border-primary/40 transition-all cursor-pointer group"
            onClick={() => router.push("/access")}
          >
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-2xl">Sou Cliente</CardTitle>
              <CardDescription className="text-base">
                Tenho um código de acesso ou quero adquirir acesso ao painel
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full group-hover:bg-primary/90" onClick={() => router.push("/access")}>
                Acessar Painel
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          <Card
            className="glass-effect border-destructive/20 hover:border-destructive/40 transition-all cursor-pointer group"
            onClick={() => router.push("/admin/login")}
          >
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-destructive/10 flex items-center justify-center mb-4 group-hover:bg-destructive/20 transition-colors">
                <Shield className="h-6 w-6 text-destructive" />
              </div>
              <CardTitle className="text-2xl">Acesso Administrativo</CardTitle>
              <CardDescription className="text-base">Área de acesso restrito</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="destructive"
                className="w-full group-hover:bg-destructive/90"
                onClick={() => router.push("/admin/login")}
              >
                Entrar
                <Shield className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
