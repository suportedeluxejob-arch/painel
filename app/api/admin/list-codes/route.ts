import { type NextRequest, NextResponse } from "next/server"
import { ref, get } from "firebase/database"
import { database } from "@/lib/firebase"
import { isUserAdmin, extractEmailFromAuth } from "@/lib/server-auth"

export async function GET(request: NextRequest) {
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

    const codesRef = ref(database, "access_codes")
    const snapshot = await get(codesRef)

    if (!snapshot.exists()) {
      return NextResponse.json({ codes: [] })
    }

    const codesData = snapshot.val()
    const codes = Object.entries(codesData).map(([code, data]: [string, any]) => ({
      code,
      ...data,
    }))

    // Ordena por data de criação (mais recentes primeiro)
    codes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return NextResponse.json({ codes })
  } catch (error) {
    console.error("[v0] Error listing access codes:", error)
    return NextResponse.json({ error: "Erro ao listar códigos" }, { status: 500 })
  }
}
