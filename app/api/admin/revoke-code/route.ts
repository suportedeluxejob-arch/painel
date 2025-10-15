import { type NextRequest, NextResponse } from "next/server"
import { ref, update } from "firebase/database"
import { database } from "@/lib/firebase"
import { isUserAdmin, extractEmailFromAuth } from "@/lib/server-auth"

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

    const { code } = await request.json()

    if (!code) {
      return NextResponse.json({ error: "Código não fornecido" }, { status: 400 })
    }

    const codeRef = ref(database, `access_codes/${code}`)
    await update(codeRef, {
      active: false,
      revokedAt: new Date().toISOString(),
      revokedBy: email,
    })

    return NextResponse.json({
      success: true,
      message: "Código revogado com sucesso",
    })
  } catch (error) {
    console.error("[v0] Error revoking access code:", error)
    return NextResponse.json({ error: "Erro ao revogar código" }, { status: 500 })
  }
}
