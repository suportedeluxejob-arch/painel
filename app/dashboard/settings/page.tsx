import Image from "next/image"

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground text-balance">Configurações</h1>
        <p className="text-muted-foreground">Gerencie as configurações do sistema</p>
      </div>

      <div className="relative rounded-xl overflow-hidden">
        {/* Animated gradient border */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary via-chart-2 to-warning animate-gradient-x opacity-75 blur-sm" />
        <div className="absolute inset-[2px] bg-card rounded-xl" />

        {/* Content */}
        <div className="relative p-8 space-y-6">
          <div className="flex flex-col items-center gap-4">
            {/* Logo with glow effect */}
            <div className="relative">
              <div className="absolute inset-0 bg-purple-500/30 blur-xl rounded-full animate-pulse" />
              <div className="relative h-24 w-24 rounded-full overflow-hidden border-4 border-purple-500/50 shadow-2xl shadow-purple-500/50">
                <Image src="/logo.jpg" alt="Panel do 7" width={96} height={96} className="object-cover" />
              </div>
            </div>

            {/* Beta badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/20 to-chart-2/20 border border-primary/30">
              <div className="h-2 w-2 rounded-full bg-warning animate-pulse" />
              <span className="text-sm font-bold text-foreground uppercase tracking-wider">Versão Beta</span>
            </div>

            {/* Message */}
            <div className="text-center space-y-2 max-w-md">
              <h3 className="text-xl font-bold text-foreground">Acesso Exclusivo VIP</h3>
              <p className="text-muted-foreground leading-relaxed">
                Esta é a fase beta do <span className="text-primary font-semibold">Panel do 7</span>, sendo desenvolvido
                pelo <span className="text-chart-2 font-semibold">Adm Anoxqui</span>.
              </p>
              <p className="text-sm text-muted-foreground/80">
                Você está entre os primeiros a testar esta plataforma exclusiva.
              </p>
            </div>

            {/* Decorative elements */}
            <div className="flex gap-2 mt-4">
              <div className="h-1 w-12 rounded-full bg-gradient-to-r from-primary to-transparent" />
              <div className="h-1 w-12 rounded-full bg-gradient-to-r from-chart-2 to-transparent" />
              <div className="h-1 w-12 rounded-full bg-gradient-to-r from-warning to-transparent" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
