import { type NextRequest, NextResponse } from "next/server"
import { ref, set, get } from "firebase/database"
import { database } from "@/lib/firebase"
import { isUserAdmin, extractEmailFromAuth } from "@/lib/server-auth"

// Gera um código único e seguro
function generateSecureCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let code = ""
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    const email = extractEmailFromAuth(authHeader)

    if (!email) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    const isAdmin = await isUserAdmin(email)

    if (!isAdmin) {
      return NextResponse.json({ error: "Acesso negado: apenas administradores" }, { status: 403 })
    }

    const { expiresInDays, maxUses = 1 } = await request.json()

    // Gera um código único
    let code = generateSecureCode()
    let attempts = 0
    const maxAttempts = 10

    // Garante que o código é único
    while (attempts < maxAttempts) {
      const codeRef = ref(database, `access_codes/${code}`)
      const snapshot = await get(codeRef)

      if (!snapshot.exists()) {
        break
      }

      code = generateSecureCode()
      attempts++
    }

    if (attempts >= maxAttempts) {
      return NextResponse.json({ error: "Erro ao gerar código único" }, { status: 500 })
    }

    // Calcula data de expiração
    let expiresAt = null
    if (expiresInDays && expiresInDays > 0) {
      const expireDate = new Date()
      expireDate.setDate(expireDate.getDate() + expiresInDays)
      expiresAt = expireDate.toISOString()
    }

    // Salva o código no banco
    const codeData = {
      code,
      createdAt: new Date().toISOString(),
      expiresAt,
      maxUses,
      usedCount: 0,
      used: false,
      active: true,
      createdBy: email,
    }

    const codeRef = ref(database, `access_codes/${code}`)
    await set(codeRef, codeData)

    return NextResponse.json({
      success: true,
      code,
      expiresAt,
      maxUses,
    })
  } catch (error) {
    console.error("[v0] Error generating access code:", error)
    return NextResponse.json({ error: "Erro ao gerar código" }, { status: 500 })
  }
}
