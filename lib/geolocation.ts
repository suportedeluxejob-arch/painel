// Geolocation capture utilities
export interface IPData {
  ip: string
  latitude?: number
  longitude?: number
  city?: string
  region?: string
  country?: string
  countryCode?: string
  timezone?: string
  isp?: string
  org?: string
  as?: string
}

export interface DeviceInfo {
  userAgent: string
  platform: string
  language: string
  screenResolution: string
  timezone: string
  cookiesEnabled: boolean
}

export interface CaptureData {
  id: string
  pageName: string
  pageType: string
  timestamp: number
  ipData?: IPData
  deviceInfo: DeviceInfo
  formData?: Record<string, any>
}

// Get IP and location data from external API
export async function getIPData(): Promise<IPData | null> {
  try {
    console.log("[v0] 🌐 Fetching IP data from ip-api.com...")

    const response = await fetch(
      "https://ip-api.com/json/?fields=status,message,country,countryCode,region,city,lat,lon,timezone,isp,org,as,query",
    )

    if (!response.ok) {
      console.error("[v0] ❌ IP API HTTP error:", response.status)
      throw new Error("Failed to fetch IP data")
    }

    const data = await response.json()
    console.log("[v0] 📦 IP API raw response:", JSON.stringify(data))

    if (data.status === "fail") {
      console.error("[v0] ❌ IP API fail:", data.message)
      throw new Error(data.message || "IP lookup failed")
    }

    if (typeof data.lat === "undefined" || typeof data.lon === "undefined" || data.lat === null || data.lon === null) {
      console.warn("[v0] ⚠️ IP API missing coordinates, trying fallback API (ipapi.co)...")
      return await getIPDataFallback()
    }

    const ipData: IPData = {
      ip: data.query,
      latitude: data.lat,
      longitude: data.lon,
      city: data.city,
      region: data.region,
      country: data.country,
      countryCode: data.countryCode,
      timezone: data.timezone,
      isp: data.isp,
      org: data.org,
      as: data.as,
    }

    console.log("[v0] ✅ IP data with coordinates:", {
      ip: ipData.ip,
      lat: ipData.latitude,
      lon: ipData.longitude,
      city: ipData.city,
      country: ipData.country,
    })

    return ipData
  } catch (error) {
    console.error("[v0] ❌ IP data error:", error)
    console.log("[v0] 🔄 Trying fallback API...")
    return await getIPDataFallback()
  }
}

async function getIPDataFallback(): Promise<IPData | null> {
  try {
    console.log("[v0] 🌐 Fetching IP data from ipapi.co (fallback)...")

    const response = await fetch("https://ipapi.co/json/")

    if (!response.ok) {
      console.error("[v0] ❌ Fallback API HTTP error:", response.status)
      throw new Error("Fallback API failed")
    }

    const data = await response.json()
    console.log("[v0] 📦 Fallback API raw response:", JSON.stringify(data))

    if (data.error) {
      console.error("[v0] ❌ Fallback API error:", data.reason)
      throw new Error(data.reason || "Fallback IP lookup failed")
    }

    // Check if coordinates exist
    if (typeof data.latitude === "undefined" || typeof data.longitude === "undefined") {
      console.error("[v0] ❌ Fallback API also missing coordinates!")
      return null
    }

    const ipData: IPData = {
      ip: data.ip,
      latitude: data.latitude,
      longitude: data.longitude,
      city: data.city,
      region: data.region,
      country: data.country_name,
      countryCode: data.country_code,
      timezone: data.timezone,
      isp: data.org,
      org: data.org,
      as: data.asn,
    }

    console.log("[v0] ✅ Fallback IP data with coordinates:", {
      ip: ipData.ip,
      lat: ipData.latitude,
      lon: ipData.longitude,
      city: ipData.city,
      country: ipData.country,
    })

    return ipData
  } catch (error) {
    console.error("[v0] ❌ Fallback API error:", error)
    return null
  }
}

// Get device information
export function getDeviceInfo(): DeviceInfo {
  const deviceInfo: DeviceInfo = {
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language,
    screenResolution: `${window.screen.width}x${window.screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    cookiesEnabled: navigator.cookieEnabled,
  }

  console.log("[v0] Device info captured:", deviceInfo)
  return deviceInfo
}

export async function captureAllData(): Promise<{
  ipData: IPData | null
  deviceInfo: DeviceInfo
}> {
  console.log("[v0] Starting data capture...")

  const ipData = await getIPData()
  const deviceInfo = getDeviceInfo()

  console.log("[v0] Data capture complete")

  return {
    ipData,
    deviceInfo,
  }
}
