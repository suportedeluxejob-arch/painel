"use client"

import type React from "react"
import { AuthGuard } from "@/components/auth-guard"
import { HamburgerMenu } from "@/components/hamburger-menu"
import Image from "next/image"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="flex h-screen flex-col bg-background overflow-hidden">
        <header className="sticky top-0 z-50 border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex-shrink-0">
          <div className="flex h-14 md:h-16 items-center justify-between px-3 md:px-6">
            <div className="flex items-center gap-2 md:gap-4">
              <HamburgerMenu />
              <div className="flex items-center gap-2 md:gap-3">
                <div className="h-9 w-9 md:h-11 md:w-11 rounded-full overflow-hidden border-2 border-purple-500/50 shadow-lg shadow-purple-500/20">
                  <Image src="/logo.jpg" alt="ANOXQUI" width={44} height={44} className="object-cover" priority />
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-sm md:text-base font-bold text-foreground bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    ANOXQUI
                  </h1>
                  <p className="text-[10px] text-muted-foreground">Panel do 7</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 md:gap-2 px-2 md:px-3 py-1 md:py-1.5 rounded-lg bg-success/10 border border-success/20">
                <div className="h-1.5 w-1.5 md:h-2 md:w-2 rounded-full bg-success animate-pulse" />
                <span className="text-[10px] md:text-xs font-medium text-success hidden sm:inline">Online</span>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto">
          <div className="container mx-auto px-4 md:px-6 lg:px-8 py-6 max-w-7xl">{children}</div>
        </main>
      </div>
    </AuthGuard>
  )
}
