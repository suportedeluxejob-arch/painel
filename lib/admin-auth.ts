import { auth, database } from "./firebase"
import { ref, get } from "firebase/database"

const ADMIN_EMAIL = "dono.admin@painel-loc.com"

export async function isUserAdmin(email: string | null | undefined): Promise<boolean> {
  if (!email) return false

  if (email === ADMIN_EMAIL) return true

  try {
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

export async function requireAdmin(): Promise<boolean> {
  const user = auth.currentUser

  if (!user) {
    throw new Error("Não autenticado")
  }

  const isAdmin = await isUserAdmin(user.email)

  if (!isAdmin) {
    throw new Error("Acesso negado: apenas administradores")
  }

  return true
}
