import { ref, remove } from "firebase/database"
import { database } from "@/lib/firebase"
import { getCurrentUserId } from "@/lib/user-context"

export async function deleteCapture(captureId: string): Promise<boolean> {
  try {
    const userId = getCurrentUserId()

    if (!userId) {
      console.error("[v0] No user logged in")
      return false
    }

    const captureRef = ref(database, `alvos/${userId}/${captureId}`)
    await remove(captureRef)

    console.log("[v0] Capture deleted successfully:", captureId)
    return true
  } catch (error) {
    console.error("[v0] Error deleting capture:", error)
    return false
  }
}
