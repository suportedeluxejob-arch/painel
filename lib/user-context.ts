import { auth } from "./firebase"

/**
 * Get the current authenticated user's ID
 * This is used to isolate data per user in the database
 */
export function getCurrentUserId(): string | null {
  const user = auth.currentUser
  return user ? user.uid : null
}

/**
 * Get the current authenticated user's email
 */
export function getCurrentUserEmail(): string | null {
  const user = auth.currentUser
  return user ? user.email : null
}

/**
 * Check if a user is currently authenticated
 */
export function isUserAuthenticated(): boolean {
  return auth.currentUser !== null
}
