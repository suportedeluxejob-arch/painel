"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { SetupForm } from "@/components/setup-form"
import { isSystemConfigured } from "@/lib/auth"
import { Loader2 } from "lucide-react"

export default function SetupPage() {
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)
  const [isConfigured, setIsConfigured] = useState(false)

  useEffect(() => {
    async function checkSetup() {
      try {
        const configured = await isSystemConfigured()
        console.log("[v0] System configured:", configured)
        setIsConfigured(configured)

        if (configured) {
          // Sistema já configurado, redireciona para login
          router.push("/")
        }
      } catch (error) {
        console.error("[v0] Error checking setup:", error)
      } finally {
        setIsChecking(false)
      }
    }

    checkSetup()
  }, [router])

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Verificando configuração...</p>
        </div>
      </div>
    )
  }

  if (isConfigured) {
    return null // Vai redirecionar
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-chart-2/5 pointer-events-none" />
      <div className="relative z-10">
        <SetupForm />
      </div>
    </div>
  )
}
