"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Key, Copy, CheckCircle2, XCircle, Clock, Trash2, Plus, Shield, Loader2, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { auth } from "@/lib/firebase"
import { isUserAdmin } from "@/lib/admin-auth"

interface AccessCode {
  code: string
  createdAt: string
  expiresAt: string | null
  maxUses: number
  usedCount: number
  used: boolean
  active: boolean
  usedAt?: string
  revokedAt?: string
}

export default function AdminPage() {
  const router = useRouter()
  const [codes, setCodes] = useState<AccessCode[]>([])
  const [loading, setLoading] = useState(true)
  const [checkingAdmin, setCheckingAdmin] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [expiresInDays, setExpiresInDays] = useState("30")
  const { toast } = useToast()

  useEffect(() => {
    const checkAdminStatus = async () => {
      const user = auth.currentUser

      if (!user) {
        router.push("/admin/login")
        return
      }

      const adminStatus = await isUserAdmin(user.email)

      if (!adminStatus) {
        toast({
          title: "Acesso Negado",
          description: "Apenas administradores podem acessar esta página",
          variant: "destructive",
        })
        router.push("/admin/login")
        return
      }

      setIsAdmin(true)
      setCheckingAdmin(false)
    }

    checkAdminStatus()
  }, [router, toast])

  const loadCodes = async () => {
    setLoading(true)
    try {
      const user = auth.currentUser
      if (!user?.email) {
        throw new Error("Usuário não autenticado")
      }

      const response = await fetch("/api/admin/list-codes", {
        headers: {
          Authorization: `Bearer ${user.email}`,
        },
      })

      if (response.status === 403) {
        toast({
          title: "Acesso Negado",
          description: "Você não tem permissão para acessar esta função",
          variant: "destructive",
        })
        router.push("/dashboard")
        return
      }

      const data = await response.json()
      setCodes(data.codes || [])
    } catch (error) {
      console.error("[v0] Error loading codes:", error)
      toast({
        title: "Erro",
        description: "Erro ao carregar códigos",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isAdmin) {
      loadCodes()
    }
  }, [isAdmin])

  const generateCode = async () => {
    setGenerating(true)
    try {
      const user = auth.currentUser
      if (!user?.email) {
        throw new Error("Usuário não autenticado")
      }

      const response = await fetch("/api/admin/generate-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.email}`,
        },
        body: JSON.stringify({
          expiresInDays: expiresInDays ? Number.parseInt(expiresInDays) : null,
          maxUses: 1,
        }),
      })

      if (response.status === 403) {
        toast({
          title: "Acesso Negado",
          description: "Você não tem permissão para gerar códigos",
          variant: "destructive",
        })
        return
      }

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Código Gerado!",
          description: `Código: ${data.code}`,
        })
        await loadCodes()
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      console.error("[v0] Error generating code:", error)
      toast({
        title: "Erro",
        description: "Erro ao gerar código",
        variant: "destructive",
      })
    } finally {
      setGenerating(false)
    }
  }

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    toast({
      title: "Copiado!",
      description: "Código copiado para a área de transferência",
    })
  }

  const revokeCode = async (code: string) => {
    try {
      const user = auth.currentUser
      if (!user?.email) {
        throw new Error("Usuário não autenticado")
      }

      const response = await fetch("/api/admin/revoke-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.email}`,
        },
        body: JSON.stringify({ code }),
      })

      if (response.status === 403) {
        toast({
          title: "Acesso Negado",
          description: "Você não tem permissão para revogar códigos",
          variant: "destructive",
        })
        return
      }

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Código Revogado",
          description: "O código foi desativado com sucesso",
        })
        await loadCodes()
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      console.error("[v0] Error revoking code:", error)
      toast({
        title: "Erro",
        description: "Erro ao revogar código",
        variant: "destructive",
      })
    }
  }

  const getStatusBadge = (code: AccessCode) => {
    if (!code.active || code.revokedAt) {
      return (
        <Badge variant="destructive" className="gap-1">
          <XCircle className="h-3 w-3" />
          Revogado
        </Badge>
      )
    }

    if (code.used) {
      return (
        <Badge variant="secondary" className="gap-1">
          <CheckCircle2 className="h-3 w-3" />
          Usado
        </Badge>
      )
    }

    if (code.expiresAt && new Date(code.expiresAt) < new Date()) {
      return (
        <Badge variant="outline" className="gap-1">
          <Clock className="h-3 w-3" />
          Expirado
        </Badge>
      )
    }

    return (
      <Badge variant="default" className="gap-1 bg-success">
        <CheckCircle2 className="h-3 w-3" />
        Ativo
      </Badge>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("pt-BR")
  }

  if (checkingAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Verificando permissões...</p>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  const activeCodes = codes.filter((c) => c.active && !c.used)
  const usedCodes = codes.filter((c) => c.used)
  const revokedCodes = codes.filter((c) => !c.active || c.revokedAt)

  return (
    <div className="w-full min-h-screen bg-background">
      <div className="container mx-auto p-4 md:p-6 space-y-6 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Administração</h1>
              <p className="text-sm text-muted-foreground">Gerenciar códigos de acesso ao painel</p>
            </div>
          </div>
          <Button onClick={loadCodes} variant="outline" size="sm" disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
        </div>

        <Alert className="border-primary/20 bg-primary/5">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            <strong>Área Restrita:</strong> Esta página é protegida e apenas administradores autenticados podem acessar.
            Todos os códigos são criptografados e armazenados com segurança no Firebase.
          </AlertDescription>
        </Alert>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Códigos Ativos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-success">{activeCodes.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Códigos Usados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{usedCodes.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Códigos Revogados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-destructive">{revokedCodes.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Generate Code */}
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Gerar Novo Código
            </CardTitle>
            <CardDescription>Crie códigos de acesso únicos e seguros para novos usuários</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="expires">Validade (dias)</Label>
                <Input
                  id="expires"
                  type="number"
                  placeholder="30"
                  value={expiresInDays}
                  onChange={(e) => setExpiresInDays(e.target.value)}
                  min="1"
                />
                <p className="text-xs text-muted-foreground">Deixe vazio para código sem expiração</p>
              </div>
            </div>

            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                Os códigos são gerados usando criptografia segura e armazenados no Firebase. Cada código é único e pode
                ser usado apenas uma vez.
              </AlertDescription>
            </Alert>

            <Button onClick={generateCode} disabled={generating} className="w-full sm:w-auto">
              {generating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Gerar Código
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Codes List */}
        <Card>
          <CardHeader>
            <CardTitle>Códigos Gerados</CardTitle>
            <CardDescription>Lista de todos os códigos de acesso criados</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Carregando códigos...
              </div>
            ) : codes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">Nenhum código gerado ainda</div>
            ) : (
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[120px]">Código</TableHead>
                      <TableHead className="min-w-[100px]">Status</TableHead>
                      <TableHead className="min-w-[150px]">Criado em</TableHead>
                      <TableHead className="min-w-[150px]">Expira em</TableHead>
                      <TableHead className="min-w-[150px]">Usado em</TableHead>
                      <TableHead className="text-right min-w-[100px]">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {codes.map((code) => (
                      <TableRow key={code.code}>
                        <TableCell className="font-mono font-bold text-xs sm:text-sm">{code.code}</TableCell>
                        <TableCell>{getStatusBadge(code)}</TableCell>
                        <TableCell className="text-xs sm:text-sm text-muted-foreground">
                          {formatDate(code.createdAt)}
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm text-muted-foreground">
                          {code.expiresAt ? formatDate(code.expiresAt) : "Sem expiração"}
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm text-muted-foreground">
                          {code.usedAt ? formatDate(code.usedAt) : "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => copyCode(code.code)}>
                              <Copy className="h-4 w-4" />
                            </Button>
                            {code.active && !code.used && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => revokeCode(code.code)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
