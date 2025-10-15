"use client"

import { useEffect, useState } from "react"
import { Shield } from "lucide-react"

export function SecurityLayer() {
  const [devToolsOpen, setDevToolsOpen] = useState(false)

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault()
      return false
    }

    const detectDevTools = () => {
      const threshold = 160
      const widthThreshold = window.outerWidth - window.innerWidth > threshold
      const heightThreshold = window.outerHeight - window.innerHeight > threshold
      const orientation = widthThreshold ? "vertical" : "horizontal"

      if ((orientation === "vertical" && widthThreshold) || (orientation === "horizontal" && heightThreshold)) {
        setDevToolsOpen(true)
        // Redirect or blur page
        document.body.style.filter = "blur(10px)"
        document.body.style.pointerEvents = "none"
      } else {
        setDevToolsOpen(false)
        document.body.style.filter = "none"
        document.body.style.pointerEvents = "auto"
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      // Print Screen
      if (e.key === "PrintScreen") {
        e.preventDefault()
        navigator.clipboard.writeText("")
        return false
      }

      // Ctrl+Shift+I (DevTools)
      if (e.ctrlKey && e.shiftKey && e.key === "I") {
        e.preventDefault()
        return false
      }

      // Ctrl+Shift+J (Console)
      if (e.ctrlKey && e.shiftKey && e.key === "J") {
        e.preventDefault()
        return false
      }

      // Ctrl+U (View Source)
      if (e.ctrlKey && e.key === "u") {
        e.preventDefault()
        return false
      }

      // Ctrl+Shift+C (Inspect Element)
      if (e.ctrlKey && e.shiftKey && e.key === "C") {
        e.preventDefault()
        return false
      }

      // F12 (DevTools)
      if (e.key === "F12") {
        e.preventDefault()
        return false
      }

      // Cmd+Shift+3/4 (Mac screenshots)
      if (e.metaKey && e.shiftKey && (e.key === "3" || e.key === "4")) {
        e.preventDefault()
        return false
      }

      // Cmd+Option+I (Mac DevTools)
      if (e.metaKey && e.altKey && e.key === "i") {
        e.preventDefault()
        return false
      }
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log("[v0] Page hidden - possible screenshot attempt")
      }
    }

    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault()
      return false
    }

    const handleSelectStart = (e: Event) => {
      e.preventDefault()
      return false
    }

    const detectDebugger = () => {
      const start = performance.now()
      debugger
      const end = performance.now()
      if (end - start > 100) {
        setDevToolsOpen(true)
        document.body.style.filter = "blur(10px)"
        document.body.style.pointerEvents = "none"
      }
    }

    // Add event listeners
    document.addEventListener("contextmenu", handleContextMenu)
    document.addEventListener("keydown", handleKeyDown)
    document.addEventListener("copy", handleCopy)
    document.addEventListener("selectstart", handleSelectStart)
    document.addEventListener("visibilitychange", handleVisibilityChange)

    // Check for DevTools periodically
    const devToolsInterval = setInterval(detectDevTools, 1000)
    const debuggerInterval = setInterval(detectDebugger, 3000)

    // Disable drag and drop
    document.addEventListener("dragstart", (e) => e.preventDefault())

    // Add CSS to prevent selection
    const style = document.createElement("style")
    style.textContent = `
      * {
        -webkit-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
        user-select: none !important;
        -webkit-touch-callout: none !important;
      }
      input, textarea {
        -webkit-user-select: text !important;
        -moz-user-select: text !important;
        -ms-user-select: text !important;
        user-select: text !important;
      }
    `
    document.head.appendChild(style)

    // Cleanup
    return () => {
      document.removeEventListener("contextmenu", handleContextMenu)
      document.removeEventListener("keydown", handleKeyDown)
      document.removeEventListener("copy", handleCopy)
      document.removeEventListener("selectstart", handleSelectStart)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      clearInterval(devToolsInterval)
      clearInterval(debuggerInterval)
      document.head.removeChild(style)
    }
  }, [])

  if (devToolsOpen) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-xl">
        <div className="text-center space-y-4 p-8">
          <Shield className="h-16 w-16 text-red-500 mx-auto animate-pulse" />
          <h2 className="text-2xl font-bold text-white">Acesso Negado</h2>
          <p className="text-gray-300">Ferramentas de desenvolvedor não são permitidas nesta página.</p>
          <p className="text-sm text-gray-400">Feche as ferramentas para continuar.</p>
        </div>
      </div>
    )
  }

  return null
}
