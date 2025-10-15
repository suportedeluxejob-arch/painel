import { ref, get } from "firebase/database"
import { database } from "./firebase"

export async function checkAccessGranted(): Promise<boolean> {
  // Verifica se o acesso foi concedido via código ou pagamento
  if (typeof window === "undefined") return false

  const accessGranted = localStorage.getItem("access_granted")
  return accessGranted === "true"
}

export async function verifyPaidAccess(customerId: string): Promise<boolean> {
  try {
    const accessRef = ref(database, `paid_access/${customerId}`)
    const snapshot = await get(accessRef)

    if (!snapshot.exists()) {
      return false
    }

    const accessData = snapshot.val()
    return accessData.status === "active"
  } catch (error) {
    console.error("[v0] Error verifying paid access:", error)
    return false
  }
}
