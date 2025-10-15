import { notFound } from "next/navigation"
import { getTemplateById } from "@/lib/page-templates"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, MapPin, Clock, Phone, Mail, MessageCircle } from "lucide-react"
import Link from "next/link"
import { InstagramLogin } from "@/components/instagram-login"
import { FacebookLogin } from "@/components/facebook-login"

export default function ScreenPage({ params }: { params: { id: string } }) {
  const template = getTemplateById(params.id)

  if (!template) {
    notFound()
  }

  const { content } = template

  if (template.id === "instagram") {
    return <InstagramLogin />
  }

  if (template.id === "facebook") {
    return <FacebookLogin />
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header with back button */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/pages">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            </Link>
            <div className="h-6 w-px bg-border hidden sm:block" />
            <div className="hidden sm:block">
              <h1 className="font-semibold text-foreground">{template.name}</h1>
              <p className="text-xs text-muted-foreground">{template.description}</p>
            </div>
          </div>
          <Badge variant="secondary" className="capitalize">
            {template.template}
          </Badge>
        </div>
      </header>

      {/* Page content based on template type */}
      <main className="container py-12">
        {template.template === "landing" && (
          <div className="space-y-16">
            {/* Hero Section */}
            {content.sections?.find((s) => s.type === "hero") && (
              <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-background to-background border border-border/50">
                <div className="grid lg:grid-cols-2 gap-12 items-center p-12 lg:p-16">
                  <div className="space-y-6">
                    <h1 className="text-4xl lg:text-6xl font-bold text-foreground text-balance leading-tight">
                      {content.sections.find((s) => s.type === "hero")?.data.title}
                    </h1>
                    <p className="text-xl text-muted-foreground text-pretty">
                      {content.sections.find((s) => s.type === "hero")?.data.subtitle}
                    </p>
                    <div className="flex flex-wrap gap-4">
                      <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                        {content.sections.find((s) => s.type === "hero")?.data.ctaText}
                      </Button>
                      <Button size="lg" variant="outline">
                        {content.sections.find((s) => s.type === "hero")?.data.ctaSecondary}
                      </Button>
                    </div>
                  </div>
                  <div className="relative aspect-video rounded-xl overflow-hidden border border-border/50">
                    <Image
                      src={content.sections.find((s) => s.type === "hero")?.data.image || "/placeholder.svg"}
                      alt="Hero"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              </section>
            )}

            {/* Features Section */}
            {content.sections?.find((s) => s.type === "features") && (
              <section className="space-y-8">
                <div className="text-center space-y-4">
                  <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
                    {content.sections.find((s) => s.type === "features")?.data.title}
                  </h2>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {content.sections
                    .find((s) => s.type === "features")
                    ?.data.features.map((feature: any, i: number) => (
                      <div
                        key={i}
                        className="p-6 rounded-xl border border-border/50 bg-card hover:border-primary/50 transition-colors"
                      >
                        <h3 className="font-semibold text-lg text-foreground mb-2">{feature.title}</h3>
                        <p className="text-sm text-muted-foreground">{feature.description}</p>
                      </div>
                    ))}
                </div>
              </section>
            )}

            {/* CTA Section */}
            {content.sections?.find((s) => s.type === "cta") && (
              <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-primary/80 p-12 lg:p-16 text-center">
                <div className="relative z-10 space-y-6 max-w-2xl mx-auto">
                  <h2 className="text-3xl lg:text-4xl font-bold text-primary-foreground">
                    {content.sections.find((s) => s.type === "cta")?.data.title}
                  </h2>
                  <p className="text-lg text-primary-foreground/90">
                    {content.sections.find((s) => s.type === "cta")?.data.description}
                  </p>
                  <Button size="lg" variant="secondary" className="bg-background hover:bg-background/90">
                    {content.sections.find((s) => s.type === "cta")?.data.ctaText}
                  </Button>
                </div>
              </section>
            )}
          </div>
        )}

        {template.template === "contact" && (
          <div className="max-w-5xl mx-auto space-y-12">
            <div className="text-center space-y-4">
              <h1 className="text-4xl lg:text-5xl font-bold text-foreground">{content.title}</h1>
              <p className="text-xl text-muted-foreground">{content.description}</p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12">
              {/* Contact Info */}
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-foreground">Informações de Contato</h2>
                <div className="space-y-4">
                  {content.sections
                    ?.find((s) => s.type === "content")
                    ?.data.leftContent?.items.map((item: any, i: number) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <div className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{item.label}</p>
                          <p className="text-muted-foreground">{item.value}</p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Contact Form */}
              <div className="p-8 rounded-xl border border-border/50 bg-card">
                <h2 className="text-2xl font-semibold text-foreground mb-6">Envie sua Mensagem</h2>
                <form className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Nome</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 rounded-lg border border-border/50 bg-background focus:border-primary focus:outline-none"
                      placeholder="Seu nome"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Email</label>
                    <input
                      type="email"
                      className="w-full px-4 py-2 rounded-lg border border-border/50 bg-background focus:border-primary focus:outline-none"
                      placeholder="seu@email.com"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Telefone</label>
                    <input
                      type="tel"
                      className="w-full px-4 py-2 rounded-lg border border-border/50 bg-background focus:border-primary focus:outline-none"
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Mensagem</label>
                    <textarea
                      rows={4}
                      className="w-full px-4 py-2 rounded-lg border border-border/50 bg-background focus:border-primary focus:outline-none resize-none"
                      placeholder="Sua mensagem..."
                    />
                  </div>
                  <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                    Enviar Mensagem
                  </Button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Specific rendering for Location template */}
        {template.id === "localizacao" && (
          <div className="max-w-6xl mx-auto space-y-12">
            <div className="text-center space-y-4">
              <h1 className="text-3xl md:text-5xl font-bold text-foreground">{content.title}</h1>
              <p className="text-lg md:text-xl text-muted-foreground">{content.description}</p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Map */}
              <div className="rounded-xl overflow-hidden border border-border/50 bg-card h-[400px] lg:h-[500px]">
                <iframe
                  src={content.sections?.find((s) => s.type === "content")?.data.mapEmbed}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Mapa de localização"
                />
              </div>

              {/* Info */}
              <div className="space-y-6">
                <div className="p-6 rounded-xl border border-border/50 bg-card space-y-4">
                  <h2 className="text-2xl font-semibold text-foreground flex items-center gap-2">
                    <MapPin className="h-6 w-6 text-primary" />
                    Endereço
                  </h2>
                  <div className="space-y-1 text-muted-foreground">
                    <p>{content.sections?.find((s) => s.type === "content")?.data.address.street}</p>
                    <p>{content.sections?.find((s) => s.type === "content")?.data.address.neighborhood}</p>
                    <p>
                      {content.sections?.find((s) => s.type === "content")?.data.address.city} -{" "}
                      {content.sections?.find((s) => s.type === "content")?.data.address.state}
                    </p>
                    <p>CEP: {content.sections?.find((s) => s.type === "content")?.data.address.zipCode}</p>
                  </div>
                </div>

                <div className="p-6 rounded-xl border border-border/50 bg-card space-y-4">
                  <h2 className="text-2xl font-semibold text-foreground flex items-center gap-2">
                    <Clock className="h-6 w-6 text-primary" />
                    Horário de Funcionamento
                  </h2>
                  <div className="space-y-2 text-muted-foreground">
                    <p>{content.sections?.find((s) => s.type === "content")?.data.hours.weekdays}</p>
                    <p>{content.sections?.find((s) => s.type === "content")?.data.hours.saturday}</p>
                    <p>{content.sections?.find((s) => s.type === "content")?.data.hours.sunday}</p>
                  </div>
                </div>

                <div className="p-6 rounded-xl border border-border/50 bg-card space-y-4">
                  <h2 className="text-2xl font-semibold text-foreground">Contato</h2>
                  <div className="space-y-3">
                    <a
                      href={`tel:${content.sections?.find((s) => s.type === "content")?.data.contact.phone}`}
                      className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Phone className="h-5 w-5" />
                      {content.sections?.find((s) => s.type === "content")?.data.contact.phone}
                    </a>
                    <a
                      href={`https://wa.me/${content.sections?.find((s) => s.type === "content")?.data.contact.whatsapp.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors"
                    >
                      <MessageCircle className="h-5 w-5" />
                      {content.sections?.find((s) => s.type === "content")?.data.contact.whatsapp}
                    </a>
                    <a
                      href={`mailto:${content.sections?.find((s) => s.type === "content")?.data.contact.email}`}
                      className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Mail className="h-5 w-5" />
                      {content.sections?.find((s) => s.type === "content")?.data.contact.email}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Specific rendering for Facebook template */}
        {template.id === "facebook" && (
          <div className="max-w-4xl mx-auto space-y-12">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-border/50">
              <div className="p-8 md:p-16 text-center space-y-6">
                <div className="inline-flex p-4 rounded-full bg-blue-600">
                  <svg className="h-12 w-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </div>
                <h1 className="text-4xl md:text-6xl font-bold text-foreground">{content.title}</h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">{content.description}</p>
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white" asChild>
                  <a
                    href={content.sections?.find((s) => s.type === "hero")?.data.ctaLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {content.sections?.find((s) => s.type === "hero")?.data.ctaText}
                  </a>
                </Button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {content.sections
                ?.find((s) => s.type === "features")
                ?.data.features.map((feature: any, i: number) => (
                  <div key={i} className="p-6 rounded-xl border border-border/50 bg-card">
                    <h3 className="font-semibold text-lg text-foreground mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Add similar rendering for other template types */}
        {!["landing", "contact", "localizacao", "facebook"].includes(template.template) && (
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-4">
              <h1 className="text-4xl lg:text-5xl font-bold text-foreground">{content.title}</h1>
              <p className="text-xl text-muted-foreground">{content.description}</p>
            </div>
            <div className="p-12 rounded-xl border border-border/50 bg-card text-center">
              <p className="text-muted-foreground">
                Esta é uma tela de demonstração do tipo <strong>{template.template}</strong>
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
