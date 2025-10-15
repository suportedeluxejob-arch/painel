import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  updateProfile,
  type User,
} from "firebase/auth"
import { ref, set, get } from "firebase/database"
import { auth, database } from "./firebase"

export interface AdminCredentials {
  username: string
  password: string
}

const ADMIN_EMAIL = "dono.admin@painel-loc.com"
const ADMIN_DISPLAY_NAME = "Administrador Principal"

export async function isSystemConfigured(): Promise<boolean> {
  try {
    const configRef = ref(database, "system/configured")
    const snapshot = await get(configRef)
    return snapshot.exists() && snapshot.val() === true
  } catch (error) {
    console.error("[v0] Error checking system config:", error)
    return false
  }
}

export async function createAdminUser(email: string, password: string, displayName: string): Promise<User> {
  try {
    console.log("[v0] Creating admin user...")
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)

    // Atualiza o perfil do usuário
    await updateProfile(userCredential.user, {
      displayName: displayName,
    })

    // Marca o sistema como configurado
    const configRef = ref(database, "system/configured")
    await set(configRef, true)

    // Salva informações do admin
    const adminRef = ref(database, "system/admin")
    await set(adminRef, {
      email: email,
      displayName: displayName,
      createdAt: new Date().toISOString(),
    })

    console.log("[v0] Admin user created successfully")
    return userCredential.user
  } catch (error: any) {
    console.error("[v0] Error creating admin user:", error)
    if (error.code === "auth/email-already-in-use") {
      throw new Error("Este email já está em uso")
    }
    throw new Error("Erro ao criar usuário admin")
  }
}

export async function loginAdmin(credentials: AdminCredentials): Promise<User> {
  try {
    const email = credentials.username.includes("@") ? credentials.username : ADMIN_EMAIL
    console.log("[v0] Attempting login with:", email)
    const userCredential = await signInWithEmailAndPassword(auth, email, credentials.password)
    console.log("[v0] Login successful:", userCredential.user.email)
    return userCredential.user
  } catch (error: any) {
    console.error("[v0] Login error:", error)
    if (error.code === "auth/invalid-credential") {
      throw new Error("Email ou senha incorretos")
    }
    throw new Error("Credenciais inválidas")
  }
}

export async function logoutAdmin(): Promise<void> {
  try {
    await signOut(auth)
    console.log("[v0] Logout successful")
  } catch (error) {
    console.error("[v0] Logout error:", error)
    throw error
  }
}

export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback)
}

export function getCurrentUser(): User | null {
  return auth.currentUser
}

export function isAuthenticated(): boolean {
  return auth.currentUser !== null
}

// Mantém compatibilidade com código antigo
export function validateAdmin(credentials: AdminCredentials): boolean {
  return credentials.username === "admin" || credentials.username === ADMIN_EMAIL
}

export function setAuthToken(token: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem("admin_token", token)
  }
}

export function getAuthToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("admin_token")
  }
  return null
}

export function removeAuthToken() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("admin_token")
  }
}

export function generateToken(username: string): string {
  return btoa(`${username}:${Date.now()}`)
}
