"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Loader2 } from "lucide-react"
import Image from "next/image"

export default function PaymentSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isVerifying, setIsVerifying] = useState(true)
  const sessionId = searchParams.get("session_id")

  useEffect(() => {
    if (sessionId) {
      // Marca acesso como concedido
      localStorage.setItem("access_granted", "true")
      localStorage.setItem("stripe_session_id", sessionId)

      // Simula verificação
      setTimeout(() => {
        setIsVerifying(false)
      }, 2000)
    }
  }, [sessionId])

  const handleContinue = () => {
    router.push("/login")
  }

  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Card className="w-full max-w-md glass-effect">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4 text-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-lg font-medium">Verificando pagamento...</p>
              <p className="text-sm text-muted-foreground">Aguarde enquanto confirmamos sua assinatura</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-primary/5 pointer-events-none" />

      <Card className="relative z-10 w-full max-w-md glass-effect border-green-500/20">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-purple-500/50 shadow-2xl shadow-purple-500/30">
              <Image src="/logo.jpg" alt="Panel do 7" fill className="object-cover" />
            </div>
          </div>
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-green-500/10 border border-green-500/20">
              <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center text-balance">Pagamento Confirmado!</CardTitle>
          <CardDescription className="text-center">Seu acesso ao Panel do 7 foi liberado com sucesso</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 rounded-lg bg-green-500/5 border border-green-500/20">
            <h3 className="font-semibold mb-2 text-green-600 dark:text-green-400">Acesso VIP Ativado</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                Acesso completo ao painel administrativo
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                Todos os recursos premium desbloqueados
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                Suporte prioritário disponível
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                Cobrança recorrente de R$ 49,90/mês
              </li>
            </ul>
          </div>

          <Button onClick={handleContinue} className="w-full bg-primary hover:bg-primary/90">
            Continuar para Login
          </Button>

          <p className="text-xs text-center text-muted-foreground">Você receberá um email de confirmação em breve</p>
        </CardContent>
      </Card>
    </div>
  )
}
