"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Menu, LayoutDashboard, FileText, Target, Settings, LogOut, MapPin } from "lucide-react"
import { removeAuthToken } from "@/lib/auth"
import Image from "next/image"

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    description: "Visão geral do sistema",
  },
  {
    name: "Mapa Global",
    href: "/dashboard/map",
    icon: MapPin,
    description: "Visualização de capturas no mapa",
  },
  {
    name: "Telas",
    href: "/dashboard/pages",
    icon: FileText,
    description: "Gerenciar páginas de captura",
  },
  {
    name: "Capturas",
    href: "/dashboard/alvos",
    icon: Target,
    description: "Histórico de capturas",
  },
  {
    name: "Configurações",
    href: "/dashboard/settings",
    icon: Settings,
    description: "Configurações do sistema",
  },
]

export function HamburgerMenu() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = () => {
    removeAuthToken()
    router.push("/")
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="hover:bg-accent transition-colors">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 p-0 bg-card border-border/50">
        <div className="flex flex-col h-full">
          {/* Header */}
          <SheetHeader className="border-b border-border/50 p-6 space-y-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-purple-500/50 shadow-lg shadow-purple-500/20">
                  <Image src="/logo.jpg" alt="ANOXQUI" width={40} height={40} className="object-cover" />
                </div>
                <div>
                  <SheetTitle className="text-foreground text-lg">ANOXQUI</SheetTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">Panel do 7</p>
                </div>
              </div>
            </div>
          </SheetHeader>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-start gap-3 rounded-lg px-4 py-3 transition-all group",
                    isActive
                      ? "bg-primary/10 text-primary border border-primary/20"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                  )}
                >
                  <item.icon
                    className={cn(
                      "h-5 w-5 mt-0.5 transition-transform group-hover:scale-110",
                      isActive && "text-primary",
                    )}
                  />
                  <div className="flex-1 space-y-0.5">
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="text-xs opacity-70">{item.description}</p>
                  </div>
                </Link>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="border-t border-border/50 p-4 space-y-3">
            <div className="rounded-lg bg-muted/50 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-foreground">Status do Sistema</p>
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
                  <span className="text-xs text-success font-medium">Online</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">v1.0.0 - Beta</p>
            </div>

            <Button
              variant="outline"
              className="w-full justify-start text-muted-foreground hover:text-destructive hover:border-destructive/50 bg-transparent"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair do Sistema
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
