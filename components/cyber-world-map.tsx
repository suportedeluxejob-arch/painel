"use client"

import { useEffect, useState, useRef } from "react"
import { ComposableMap, Geographies, Geography, Marker, Line } from "react-simple-maps"
import type { CaptureData } from "@/lib/geolocation"

interface CyberWorldMapProps {
  captures: CaptureData[]
  onMarkerClick?: (capture: CaptureData) => void
  highlightedCaptureId?: string | null
  scale?: number
  center?: [number, number]
}

interface MapMarker {
  id: string
  lat: number
  lng: number
  country: string
  city: string
  pageType: string
  timestamp: number
  ip?: string
  captureData: CaptureData
  isNew?: boolean
}

interface CountryStats {
  name: string
  count: number
  lastCapture: number
}

export function CyberWorldMap({
  captures,
  onMarkerClick,
  highlightedCaptureId,
  scale = 147,
  center = [0, 20],
}: CyberWorldMapProps) {
  const [markers, setMarkers] = useState<MapMarker[]>([])
  const [connections, setConnections] = useState<Array<{ from: MapMarker; to: MapMarker; age: number }>>([])
  const [hoveredMarker, setHoveredMarker] = useState<string | null>(null)
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null)
  const [animatingMarkers, setAnimatingMarkers] = useState<Set<string>>(new Set())
  const [countryStats, setCountryStats] = useState<Map<string, CountryStats>>(new Map())
  const prevCapturesLength = useRef(0)

  useEffect(() => {
    const locationCaptures = captures.filter((c) => c.pageType === "location" && c.ipData)

    const newMarkers: MapMarker[] = locationCaptures.map((c, index) => {
      const lat = c.ipData?.latitude ?? 0
      const lng = c.ipData?.longitude ?? 0

      if (lat === 0 && lng === 0) {
        console.warn("[v0] ⚠️ Capture missing coordinates:", {
          id: c.id,
          hasIpData: !!c.ipData,
        })
      }

      return {
        id: c.id,
        lat,
        lng,
        country: c.ipData?.country || "Unknown",
        city: c.ipData?.city || "Unknown",
        pageType: c.pageType,
        timestamp: c.timestamp,
        ip: c.ipData?.ip,
        captureData: c,
        isNew: index < locationCaptures.length - prevCapturesLength.current,
      }
    })

    setMarkers(newMarkers)

    const stats = new Map<string, CountryStats>()
    newMarkers.forEach((marker) => {
      const existing = stats.get(marker.country)
      if (existing) {
        existing.count++
        existing.lastCapture = Math.max(existing.lastCapture, marker.timestamp)
      } else {
        stats.set(marker.country, {
          name: marker.country,
          count: 1,
          lastCapture: marker.timestamp,
        })
      }
    })
    setCountryStats(stats)

    if (locationCaptures.length > prevCapturesLength.current) {
      const newIds = newMarkers.slice(0, locationCaptures.length - prevCapturesLength.current).map((m) => m.id)
      setAnimatingMarkers(new Set(newIds))

      setTimeout(() => {
        setAnimatingMarkers(new Set())
      }, 2000)
    }

    prevCapturesLength.current = locationCaptures.length

    if (newMarkers.length > 1) {
      const recentMarkers = newMarkers.slice(0, 20)
      const newConnections: Array<{ from: MapMarker; to: MapMarker; age: number }> = []
      const now = Date.now()

      for (let i = 0; i < recentMarkers.length - 1; i++) {
        const age = now - recentMarkers[i].timestamp
        newConnections.push({
          from: recentMarkers[i],
          to: recentMarkers[i + 1],
          age,
        })
      }

      setConnections(newConnections)
    }
  }, [captures])

  const getMarkerColor = () => "#10b981"

  const getConnectionColor = (index: number, age: number) => {
    const baseColor = "#10b981"
    const maxAge = 3600000
    const validAge = typeof age === "number" && !isNaN(age) ? age : 0
    const opacity = Math.max(0.2, Math.min(1, 1 - validAge / maxAge))
    return { color: baseColor, opacity }
  }

  const getMarkerSize = (marker: MapMarker, isHovered: boolean, isHighlighted: boolean) => {
    if (isHighlighted) return { outer: 10, middle: 6, inner: 4, core: 1.5 }
    if (isHovered) return { outer: 9, middle: 5.5, inner: 3.5, core: 1.3 }
    if (animatingMarkers.has(marker.id)) return { outer: 9.5, middle: 5.8, inner: 3.8, core: 1.4 }
    return { outer: 8, middle: 5, inner: 3, core: 1 }
  }

  const hasCaptures = (countryName: string) => {
    return markers.some((m) => m.country === countryName)
  }

  const getCountryFill = (countryName: string) => {
    const stats = countryStats.get(countryName)
    if (!stats) return "transparent"

    if (stats.count >= 10) return "rgba(16, 185, 129, 0.3)" // High activity
    if (stats.count >= 5) return "rgba(16, 185, 129, 0.2)" // Medium activity
    return "rgba(16, 185, 129, 0.1)" // Low activity
  }

  return (
    <div className="w-full h-full relative bg-black overflow-hidden">
      <style jsx global>{`
        .rsm-geography {
          outline: none;
        }
        .rsm-geography:hover {
          outline: none;
        }
        
        @keyframes marker-pulse {
          0%, 100% { 
            opacity: 0.4; 
            transform: scale(1); 
          }
          50% { 
            opacity: 1; 
            transform: scale(1.2); 
          }
        }
        
        @keyframes ring-expand {
          0% { 
            opacity: 0.9; 
            r: 6; 
          }
          100% { 
            opacity: 0; 
            r: 20; 
          }
        }
        
        @keyframes marker-spawn {
          0% { 
            opacity: 0; 
            transform: scale(0) rotate(0deg); 
          }
          50% {
            opacity: 1;
            transform: scale(1.3) rotate(180deg);
          }
          100% { 
            opacity: 1; 
            transform: scale(1) rotate(360deg); 
          }
        }
        
        @keyframes line-flow {
          0% { 
            stroke-dashoffset: 1000; 
          }
          100% { 
            stroke-dashoffset: 0; 
          }
        }
        
        @keyframes glow-pulse {
          0%, 100% { 
            filter: drop-shadow(0 0 8px currentColor); 
          }
          50% { 
            filter: drop-shadow(0 0 20px currentColor); 
          }
        }
        
        .marker-pulse {
          animation: marker-pulse 2s ease-in-out infinite;
        }
        
        .marker-ring {
          animation: ring-expand 2s ease-out infinite;
        }
        
        .marker-spawn {
          animation: marker-spawn 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        
        .connection-line {
          stroke-dasharray: 5 5;
          animation: line-flow 2s linear infinite;
        }
        
        .marker-highlighted {
          animation: glow-pulse 1.5s ease-in-out infinite;
        }
        
        .marker-transition {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>

      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          scale,
          center,
        }}
        width={800}
        height={400}
        className="w-full h-full"
        style={{
          width: "100%",
          height: "100%",
        }}
      >
        <defs>
          <filter id="glow-soft">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="glow-medium">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="glow-strong">
            <feGaussianBlur stdDeviation="8" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <radialGradient id="marker-gradient">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="50%" stopColor="#ffffff" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.3" />
          </radialGradient>
        </defs>

        <Geographies geography="https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json">
          {({ geographies }) =>
            geographies.map((geo) => {
              const countryName = geo.properties.name
              const stats = countryStats.get(countryName)
              const isHovered = hoveredCountry === countryName

              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={getCountryFill(countryName)}
                  stroke={stats ? "#10b981" : "#0ea5e9"}
                  strokeWidth={isHovered ? 1 : 0.5}
                  onMouseEnter={() => setHoveredCountry(countryName)}
                  onMouseLeave={() => setHoveredCountry(null)}
                  style={{
                    default: {
                      outline: "none",
                      filter: stats ? "drop-shadow(0 0 2px #10b981)" : "drop-shadow(0 0 1px #0ea5e9)",
                      transition: "all 0.3s ease",
                    },
                    hover: {
                      outline: "none",
                      stroke: stats ? "#10b981" : "#06b6d4",
                      strokeWidth: 1,
                      filter: stats ? "drop-shadow(0 0 4px #10b981)" : "drop-shadow(0 0 3px #06b6d4)",
                      fill: stats ? "rgba(16, 185, 129, 0.4)" : "rgba(6, 182, 212, 0.1)",
                    },
                    pressed: { outline: "none" },
                  }}
                />
              )
            })
          }
        </Geographies>

        {connections.map((conn, index) => {
          const { color, opacity } = getConnectionColor(index, conn.age)
          return (
            <Line
              key={`conn-${conn.from.id}-${conn.to.id}`}
              from={[conn.from.lng, conn.from.lat]}
              to={[conn.to.lng, conn.to.lat]}
              stroke={color}
              strokeWidth={2}
              strokeLinecap="round"
              opacity={opacity}
              filter="url(#glow-soft)"
              className="connection-line"
              style={{
                animationDelay: `${index * 0.15}s`,
                transition: "opacity 0.5s ease",
              }}
            />
          )
        })}

        {markers.map((marker) => {
          const color = getMarkerColor()
          const isHovered = hoveredMarker === marker.id
          const isHighlighted = highlightedCaptureId === marker.id
          const isAnimating = animatingMarkers.has(marker.id)
          const sizes = getMarkerSize(marker, isHovered, isHighlighted)
          const hasPhoto = marker.captureData.formData?.photo

          return (
            <Marker
              key={marker.id}
              coordinates={[marker.lng, marker.lat]}
              onMouseEnter={() => setHoveredMarker(marker.id)}
              onMouseLeave={() => setHoveredMarker(null)}
              onClick={() => onMarkerClick?.(marker.captureData)}
              style={{ cursor: "pointer" }}
            >
              <g
                filter={isHighlighted ? "url(#glow-strong)" : isHovered ? "url(#glow-medium)" : "url(#glow-soft)"}
                className={`marker-transition ${isAnimating ? "marker-spawn" : ""} ${isHighlighted ? "marker-highlighted" : ""}`}
              >
                <circle
                  r={sizes.outer}
                  fill={color}
                  opacity={0.15}
                  className="marker-ring"
                  style={{ animationDelay: "0s" }}
                />

                <circle
                  r={sizes.inner}
                  fill="none"
                  stroke={color}
                  strokeWidth={isHighlighted ? 2 : isHovered ? 1.5 : 1}
                  opacity={0.95}
                />

                <circle r={sizes.inner * 0.6} fill={color} opacity={0.9} />

                <circle r={sizes.core} fill="url(#marker-gradient)" />
              </g>

              {isHovered && (
                <g>
                  <rect
                    x={12}
                    y={hasPhoto ? -80 : -45}
                    width={hasPhoto ? 180 : 160}
                    height={hasPhoto ? 140 : 75}
                    fill="#0f172a"
                    stroke={color}
                    strokeWidth={2}
                    rx={8}
                    opacity={0.98}
                    filter="url(#glow-medium)"
                  />

                  {hasPhoto && (
                    <image
                      href={marker.captureData.formData?.photo}
                      x={18}
                      y={-74}
                      width={168}
                      height={90}
                      clipPath="inset(0 round 6px)"
                      preserveAspectRatio="xMidYMid slice"
                    />
                  )}

                  <text x={18} y={hasPhoto ? 25 : -28} fontSize={10} fill="#ffffff" fontWeight="bold">
                    📍 {marker.city}
                  </text>
                  <text x={18} y={hasPhoto ? 38 : -17} fontSize={8} fill="#94a3b8">
                    {marker.country}
                  </text>

                  <text x={18} y={hasPhoto ? 52 : -5} fontSize={7} fill="#64748b" fontFamily="monospace">
                    Lat: {marker.lat.toFixed(4)}°
                  </text>
                  <text x={18} y={hasPhoto ? 63 : 6} fontSize={7} fill="#64748b" fontFamily="monospace">
                    Lng: {marker.lng.toFixed(4)}°
                  </text>
                </g>
              )}
            </Marker>
          )
        })}
      </ComposableMap>

      {hoveredCountry && countryStats.get(hoveredCountry) && (
        <div className="absolute top-4 left-4 pointer-events-none z-50">
          <div className="px-4 py-3 bg-black/90 backdrop-blur-sm border-2 border-green-500/50 rounded-lg shadow-2xl">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 rounded-full bg-green-500" style={{ boxShadow: "0 0 10px #10b981" }} />
              <span className="text-sm font-bold text-white">{hoveredCountry}</span>
            </div>
            <div className="text-xs text-gray-400">{countryStats.get(hoveredCountry)?.count} captura(s)</div>
          </div>
        </div>
      )}

      <div className="absolute bottom-3 right-3 md:bottom-4 md:right-4 pointer-events-none">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1.5 md:gap-2 px-2 py-1 md:px-3 md:py-1.5 bg-black/80 backdrop-blur-sm border border-green-500/30 rounded-lg shadow-lg">
            <div
              className="w-2 h-2 md:w-3 md:h-3 rounded-full"
              style={{
                backgroundColor: "#10b981",
                boxShadow: "0 0 10px #10b981",
              }}
            />
            <span className="text-[10px] md:text-xs text-gray-300 font-medium">Localização por IP</span>
          </div>

          {countryStats.size > 0 && (
            <div className="px-2 py-1 md:px-3 md:py-1.5 bg-black/80 backdrop-blur-sm border border-cyan-500/30 rounded-lg shadow-lg">
              <span className="text-[10px] md:text-xs text-gray-300 font-medium">
                {countryStats.size} país(es) detectado(s)
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
