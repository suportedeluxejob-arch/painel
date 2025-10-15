import { database } from "./firebase"
import { ref, get } from "firebase/database"

const ADMIN_EMAIL = "dono.admin@painel-loc.com"

// Verifica se um email é admin
export async function isUserAdmin(email: string | null | undefined): Promise<boolean> {
  if (!email) return false

  // Verifica se é o email admin principal
  if (email === ADMIN_EMAIL) return true

  try {
    // Verifica no Firebase se está configurado como admin
    const adminRef = ref(database, `system/admin`)
    const snapshot = await get(adminRef)

    if (snapshot.exists()) {
      const adminData = snapshot.val()
      return adminData.email === email && adminData.configured === true
    }
  } catch (error) {
    console.error("[v0] Error checking admin status:", error)
  }

  return false
}

// Extrai o email do token de autorização (simplificado para este projeto)
export function extractEmailFromAuth(authHeader: string | null): string | null {
  if (!authHeader) return null

  try {
    // O formato esperado é "Bearer email@example.com"
    const parts = authHeader.split(" ")
    if (parts.length === 2 && parts[0] === "Bearer") {
      return parts[1]
    }
  } catch (error) {
    console.error("[v0] Error extracting email from auth:", error)
  }

  return null
}
