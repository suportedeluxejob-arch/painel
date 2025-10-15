"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import type { CaptureData } from "@/lib/geolocation"

interface WorldMapProps {
  captures: CaptureData[]
}

interface MapMarker {
  id: string
  lat: number
  lng: number
  country: string
  city: string
  pageType: string
  timestamp: number
}

export function WorldMap({ captures }: WorldMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [hoveredMarker, setHoveredMarker] = useState<MapMarker | null>(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  // Convert captures to markers
  const markers: MapMarker[] = captures
    .filter((c) => c.geolocation || c.ipData)
    .map((c) => ({
      id: c.id,
      lat: c.geolocation?.latitude || 0,
      lng: c.geolocation?.longitude || 0,
      country: c.geolocation?.country || c.ipData?.country || "Unknown",
      city: c.geolocation?.city || c.ipData?.city || "Unknown",
      pageType: c.pageType,
      timestamp: c.timestamp,
    }))

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()

    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr

    ctx.scale(dpr, dpr)

    // Clear canvas
    ctx.fillStyle = "#000000"
    ctx.fillRect(0, 0, rect.width, rect.height)

    // Draw world map outline (simplified continents)
    drawWorldOutline(ctx, rect.width, rect.height)

    // Draw markers
    markers.forEach((marker) => {
      const x = ((marker.lng + 180) / 360) * rect.width
      const y = ((90 - marker.lat) / 180) * rect.height

      drawMarker(ctx, x, y, marker.pageType)
    })

    // Draw connections between recent markers
    if (markers.length > 1) {
      const recentMarkers = markers.slice(0, 5)
      for (let i = 0; i < recentMarkers.length - 1; i++) {
        const from = recentMarkers[i]
        const to = recentMarkers[i + 1]

        const x1 = ((from.lng + 180) / 360) * rect.width
        const y1 = ((90 - from.lat) / 180) * rect.height
        const x2 = ((to.lng + 180) / 360) * rect.width
        const y2 = ((90 - to.lat) / 180) * rect.height

        drawConnection(ctx, x1, y1, x2, y2)
      }
    }
  }, [markers])

  const drawWorldOutline = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.strokeStyle = "#0ea5e9"
    ctx.lineWidth = 0.5
    ctx.globalAlpha = 0.3

    // Simplified world map paths (continents outline)
    // North America
    ctx.beginPath()
    ctx.moveTo(width * 0.15, height * 0.25)
    ctx.lineTo(width * 0.25, height * 0.2)
    ctx.lineTo(width * 0.3, height * 0.35)
    ctx.lineTo(width * 0.25, height * 0.45)
    ctx.lineTo(width * 0.15, height * 0.4)
    ctx.closePath()
    ctx.stroke()

    // South America
    ctx.beginPath()
    ctx.moveTo(width * 0.25, height * 0.5)
    ctx.lineTo(width * 0.3, height * 0.55)
    ctx.lineTo(width * 0.28, height * 0.7)
    ctx.lineTo(width * 0.23, height * 0.65)
    ctx.closePath()
    ctx.stroke()

    // Europe
    ctx.beginPath()
    ctx.moveTo(width * 0.48, height * 0.25)
    ctx.lineTo(width * 0.55, height * 0.22)
    ctx.lineTo(width * 0.58, height * 0.3)
    ctx.lineTo(width * 0.52, height * 0.32)
    ctx.closePath()
    ctx.stroke()

    // Africa
    ctx.beginPath()
    ctx.moveTo(width * 0.48, height * 0.35)
    ctx.lineTo(width * 0.55, height * 0.38)
    ctx.lineTo(width * 0.56, height * 0.6)
    ctx.lineTo(width * 0.5, height * 0.62)
    ctx.lineTo(width * 0.47, height * 0.5)
    ctx.closePath()
    ctx.stroke()

    // Asia
    ctx.beginPath()
    ctx.moveTo(width * 0.6, height * 0.2)
    ctx.lineTo(width * 0.75, height * 0.18)
    ctx.lineTo(width * 0.8, height * 0.3)
    ctx.lineTo(width * 0.75, height * 0.45)
    ctx.lineTo(width * 0.65, height * 0.4)
    ctx.lineTo(width * 0.6, height * 0.3)
    ctx.closePath()
    ctx.stroke()

    // Australia
    ctx.beginPath()
    ctx.moveTo(width * 0.75, height * 0.65)
    ctx.lineTo(width * 0.82, height * 0.63)
    ctx.lineTo(width * 0.83, height * 0.72)
    ctx.lineTo(width * 0.77, height * 0.73)
    ctx.closePath()
    ctx.stroke()

    ctx.globalAlpha = 1
  }

  const drawMarker = (ctx: CanvasRenderingContext2D, x: number, y: number, pageType: string) => {
    const colors: Record<string, string> = {
      instagram: "#e91e63",
      facebook: "#3b82f6",
      location: "#10b981",
      default: "#f59e0b",
    }

    const color = colors[pageType] || colors.default

    // Outer glow
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, 20)
    gradient.addColorStop(0, color + "80")
    gradient.addColorStop(1, color + "00")

    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.arc(x, y, 20, 0, Math.PI * 2)
    ctx.fill()

    // Inner circle
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.arc(x, y, 6, 0, Math.PI * 2)
    ctx.fill()

    // Center dot
    ctx.fillStyle = "#ffffff"
    ctx.beginPath()
    ctx.arc(x, y, 2, 0, Math.PI * 2)
    ctx.fill()
  }

  const drawConnection = (ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number) => {
    const gradient = ctx.createLinearGradient(x1, y1, x2, y2)
    gradient.addColorStop(0, "#0ea5e980")
    gradient.addColorStop(1, "#f59e0b80")

    ctx.strokeStyle = gradient
    ctx.lineWidth = 1.5
    ctx.globalAlpha = 0.6

    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.stroke()

    ctx.globalAlpha = 1
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    setMousePos({ x: e.clientX, y: e.clientY })

    // Check if hovering over a marker
    let found = false
    for (const marker of markers) {
      const markerX = ((marker.lng + 180) / 360) * rect.width
      const markerY = ((90 - marker.lat) / 180) * rect.height

      const distance = Math.sqrt(Math.pow(x - markerX, 2) + Math.pow(y - markerY, 2))

      if (distance < 10) {
        setHoveredMarker(marker)
        found = true
        break
      }
    }

    if (!found) {
      setHoveredMarker(null)
    }
  }

  return (
    <div className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-crosshair"
        style={{ width: "100%", height: "100%" }}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoveredMarker(null)}
      />

      {hoveredMarker && (
        <div
          className="absolute z-50 bg-background/95 border border-border rounded-lg p-3 shadow-lg pointer-events-none"
          style={{
            left: mousePos.x + 10,
            top: mousePos.y + 10,
          }}
        >
          <div className="space-y-1 text-sm">
            <p className="font-semibold text-foreground">
              {hoveredMarker.city}, {hoveredMarker.country}
            </p>
            <p className="text-muted-foreground">Type: {hoveredMarker.pageType}</p>
            <p className="text-xs text-muted-foreground">{new Date(hoveredMarker.timestamp).toLocaleString()}</p>
          </div>
        </div>
      )}
    </div>
  )
}
