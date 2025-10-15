"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Shield, CreditCard, Key, AlertCircle, Loader2, CheckCircle2, LogOut } from "lucide-react"
import Image from "next/image"
import { auth } from "@/lib/firebase"
import { signOut } from "firebase/auth"
import { onAuthChange } from "@/lib/auth"

export default function AccessPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<"code" | "payment">("code")
  const [accessCode, setAccessCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthChange((user) => {
      setIsAuthenticated(!!user)
      setIsCheckingAuth(false)
    })

    return () => unsubscribe()
  }, [])

  const handleLogout = async () => {
    try {
      await signOut(auth)
      localStorage.removeItem("access_granted")
      setIsAuthenticated(false)
    } catch (err) {
      console.error("[v0] Logout error:", err)
    }
  }

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/verify-access-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: accessCode }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess("Código válido! Redirecionando...")
        localStorage.setItem("access_granted", "true")
        setTimeout(() => router.push("/login"), 1500)
      } else {
        setError(data.error || "Código inválido")
        setIsLoading(false)
      }
    } catch (err) {
      setError("Erro ao verificar código")
      setIsLoading(false)
    }
  }

  const handlePayment = async () => {
    setError("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })

      const data = await response.json()

      if (response.ok && data.url) {
        window.location.href = data.url
      } else {
        setError(data.error || "Erro ao criar sessão de pagamento")
        setIsLoading(false)
      }
    } catch (err) {
      setError("Erro ao processar pagamento")
      setIsLoading(false)
    }
  }

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Verificando...</p>
        </div>
      </div>
    )
  }

  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-chart-2/5 pointer-events-none" />

        <Card className="relative z-10 w-full max-w-md glass-effect border-border/50">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-purple-500/50 shadow-2xl shadow-purple-500/30">
                <Image src="/logo.jpg" alt="Panel do 7" fill className="object-cover" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-center text-balance">Sessão Ativa</CardTitle>
            <CardDescription className="text-center">
              Você já está autenticado no sistema. Para validar um novo acesso, faça logout primeiro.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
              <p className="text-sm text-muted-foreground text-center">
                Se você já tem acesso liberado, pode ir direto para o dashboard. Caso contrário, faça logout para
                validar um código ou realizar o pagamento.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button onClick={() => router.push("/dashboard")} className="bg-primary hover:bg-primary/90">
                Ir para Dashboard
              </Button>
              <Button onClick={handleLogout} variant="outline" className="border-border/50 bg-transparent">
                <LogOut className="mr-2 h-4 w-4" />
                Fazer Logout
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-chart-2/5 pointer-events-none" />

      <div className="relative z-10 w-full max-w-4xl">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-purple-500/50 shadow-2xl shadow-purple-500/30">
              <Image src="/logo.jpg" alt="Panel do 7" fill className="object-cover" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-2 text-balance">Panel do 7</h1>
          <p className="text-muted-foreground text-lg">Acesso Exclusivo VIP</p>
        </div>

        {/* Access Options */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Access Code Option */}
          <Card
            className={`glass-effect border-2 transition-all cursor-pointer ${
              activeTab === "code"
                ? "border-primary shadow-lg shadow-primary/20"
                : "border-border/50 hover:border-primary/50"
            }`}
            onClick={() => setActiveTab("code")}
          >
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                  <Key className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">Código de Acesso</CardTitle>
              </div>
              <CardDescription>Já possui um código restrito? Insira abaixo para liberar acesso</CardDescription>
            </CardHeader>
            <CardContent>
              {activeTab === "code" && (
                <form onSubmit={handleCodeSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="accessCode">Código Restrito</Label>
                    <Input
                      id="accessCode"
                      type="text"
                      placeholder="Digite seu código"
                      value={accessCode}
                      onChange={(e) => setAccessCode(e.target.value)}
                      className="bg-secondary/50 border-border/50 focus:border-primary"
                      required
                      disabled={isLoading}
                    />
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                      <AlertCircle className="h-4 w-4 flex-shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  {success && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 text-sm">
                      <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                      <span>{success}</span>
                    </div>
                  )}

                  <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Verificando...
                      </>
                    ) : (
                      "Verificar Código"
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>

          {/* Payment Option */}
          <Card
            className={`glass-effect border-2 transition-all cursor-pointer ${
              activeTab === "payment"
                ? "border-primary shadow-lg shadow-primary/20"
                : "border-border/50 hover:border-primary/50"
            }`}
            onClick={() => setActiveTab("payment")}
          >
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                  <CreditCard className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">Pagamento Direto</CardTitle>
              </div>
              <CardDescription>Adquira acesso imediato através de pagamento seguro</CardDescription>
            </CardHeader>
            <CardContent>
              {activeTab === "payment" && (
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="text-3xl font-bold">R$ 49,90</span>
                      <span className="text-muted-foreground">/mês</span>
                    </div>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                        Acesso completo ao painel
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                        Suporte prioritário
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                        Atualizações automáticas
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                        Recursos exclusivos VIP
                      </li>
                    </ul>
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                      <AlertCircle className="h-4 w-4 flex-shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <Button
                    onClick={handlePayment}
                    className="w-full bg-primary hover:bg-primary/90"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processando...
                      </>
                    ) : (
                      <>
                        <CreditCard className="mr-2 h-4 w-4" />
                        Pagar com Stripe
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">Pagamento seguro processado pela Stripe</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Security Badge */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 border border-border/50">
            <Shield className="h-4 w-4 text-primary" />
            <span className="text-sm text-muted-foreground">Plataforma segura e criptografada</span>
          </div>
        </div>
      </div>
    </div>
  )
}
