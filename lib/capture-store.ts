import { ref, set, push, get } from "firebase/database"
import { database } from "./firebase"
import type { CaptureData } from "./geolocation"

const CAPTURES_REF = "alvos"

// Save capture data to Firebase
export async function saveCapture(data: Omit<CaptureData, "id">): Promise<string> {
  try {
    const capturesRef = ref(database, CAPTURES_REF)
    const newCaptureRef = push(capturesRef)

    const captureData: CaptureData = {
      ...data,
      id: newCaptureRef.key!,
    }

    await set(newCaptureRef, captureData)
    console.log("[v0] Capture saved to Firebase (alvos):", captureData.id)

    return captureData.id
  } catch (error) {
    console.error("[v0] Error saving capture:", error)
    throw error
  }
}

// Get all captures
export async function getAllCaptures(): Promise<CaptureData[]> {
  try {
    const capturesRef = ref(database, CAPTURES_REF)
    const snapshot = await get(capturesRef)

    if (!snapshot.exists()) {
      return []
    }

    const data = snapshot.val()
    return Object.values(data) as CaptureData[]
  } catch (error) {
    console.error("[v0] Error getting captures:", error)
    return []
  }
}

// Get captures by page type
export async function getCapturesByType(pageType: string): Promise<CaptureData[]> {
  const allCaptures = await getAllCaptures()
  return allCaptures.filter((capture) => capture.pageType === pageType)
}

// Get recent captures (last N)
export async function getRecentCaptures(limit = 10): Promise<CaptureData[]> {
  const allCaptures = await getAllCaptures()
  return allCaptures.sort((a, b) => b.timestamp - a.timestamp).slice(0, limit)
}
