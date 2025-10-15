import { ref, set, get, remove, onValue } from "firebase/database"
import { database } from "./firebase"
import type { Page, PageTemplate } from "./types"

const PAGES_REF = "pages"

export async function getPages(): Promise<Page[]> {
  try {
    const pagesRef = ref(database, PAGES_REF)
    const snapshot = await get(pagesRef)

    if (snapshot.exists()) {
      const data = snapshot.val()
      console.log("[v0] Pages loaded from Firebase:", Object.keys(data).length)
      return Object.values(data) as Page[]
    }

    console.log("[v0] No pages found in Firebase")
    return []
  } catch (error) {
    console.error("[v0] Error loading pages:", error)
    return []
  }
}

export async function savePage(page: Page): Promise<void> {
  try {
    const pageRef = ref(database, `${PAGES_REF}/${page.id}`)
    await set(pageRef, page)
    console.log("[v0] Page saved to Firebase:", page.id)
  } catch (error) {
    console.error("[v0] Error saving page:", error)
    throw error
  }
}

export async function deletePage(id: string): Promise<void> {
  try {
    const pageRef = ref(database, `${PAGES_REF}/${id}`)
    await remove(pageRef)
    console.log("[v0] Page deleted from Firebase:", id)
  } catch (error) {
    console.error("[v0] Error deleting page:", error)
    throw error
  }
}

export async function getPageById(id: string): Promise<Page | undefined> {
  try {
    const pageRef = ref(database, `${PAGES_REF}/${id}`)
    const snapshot = await get(pageRef)

    if (snapshot.exists()) {
      console.log("[v0] Page found:", id)
      return snapshot.val() as Page
    }

    console.log("[v0] Page not found:", id)
    return undefined
  } catch (error) {
    console.error("[v0] Error getting page:", error)
    return undefined
  }
}

export async function getPageBySlug(slug: string): Promise<Page | undefined> {
  try {
    const pages = await getPages()
    const page = pages.find((p) => p.slug === slug)
    console.log("[v0] Page by slug:", slug, page ? "found" : "not found")
    return page
  } catch (error) {
    console.error("[v0] Error getting page by slug:", error)
    return undefined
  }
}

export async function incrementPageViews(id: string): Promise<void> {
  try {
    const page = await getPageById(id)
    if (page) {
      const pageRef = ref(database, `${PAGES_REF}/${id}/views`)
      await set(pageRef, (page.views || 0) + 1)
      console.log("[v0] Page views incremented:", id)
    }
  } catch (error) {
    console.error("[v0] Error incrementing views:", error)
  }
}

export function subscribeToPages(callback: (pages: Page[]) => void): () => void {
  const pagesRef = ref(database, PAGES_REF)

  const unsubscribe = onValue(pagesRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val()
      const pages = Object.values(data) as Page[]
      console.log("[v0] Pages updated from Firebase:", pages.length)
      callback(pages)
    } else {
      console.log("[v0] No pages in Firebase")
      callback([])
    }
  })

  return unsubscribe
}

export function createNewPage(name: string, template: PageTemplate): Page {
  const slug = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")

  return {
    id: `page_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name,
    slug,
    template,
    status: "draft",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    views: 0,
    content: {
      title: name,
      description: "",
      sections: [],
    },
  }
}
