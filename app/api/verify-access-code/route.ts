import { type NextRequest, NextResponse } from "next/server"
import { ref, get, update } from "firebase/database"
import { database } from "@/lib/firebase"

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json()

    if (!code) {
      return NextResponse.json({ error: "Código não fornecido" }, { status: 400 })
    }

    // Verifica se o código existe no banco de dados
    const codeRef = ref(database, `access_codes/${code}`)
    const snapshot = await get(codeRef)

    if (!snapshot.exists()) {
      return NextResponse.json({ error: "Código inválido" }, { status: 401 })
    }

    const codeData = snapshot.val()

    if (!codeData.active) {
      return NextResponse.json({ error: "Código foi revogado" }, { status: 401 })
    }

    // Verifica se o código já foi usado
    if (codeData.used) {
      return NextResponse.json({ error: "Código já utilizado" }, { status: 401 })
    }

    // Verifica se o código expirou
    if (codeData.expiresAt && new Date(codeData.expiresAt) < new Date()) {
      return NextResponse.json({ error: "Código expirado" }, { status: 401 })
    }

    await update(codeRef, {
      used: true,
      usedAt: new Date().toISOString(),
      usedCount: (codeData.usedCount || 0) + 1,
    })

    return NextResponse.json({
      success: true,
      message: "Código válido! Acesso liberado.",
    })
  } catch (error) {
    console.error("[v0] Error verifying access code:", error)
    return NextResponse.json({ error: "Erro ao verificar código" }, { status: 500 })
  }
}
