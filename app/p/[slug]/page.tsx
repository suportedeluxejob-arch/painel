"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { getPageBySlug, incrementPageViews } from "@/lib/pages-store"
import type { Page } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function PublicPageView() {
  const params = useParams()
  const [page, setPage] = useState<Page | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadPage = async () => {
      const foundPage = await getPageBySlug(params.slug as string)

      if (foundPage && foundPage.status === "active") {
        await incrementPageViews(foundPage.id)
        setPage(foundPage)
      } else {
        setNotFound(true)
      }
      setIsLoading(false)
    }

    loadPage()
  }, [params.slug])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-foreground">404</h1>
          <p className="text-muted-foreground">Página não encontrada</p>
          <Button asChild className="btn-gradient-hover bg-primary hover:bg-primary/90 text-primary-foreground">
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  if (!page) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Render sections dynamically */}
      {page.content.sections.map((section) => {
        switch (section.type) {
          case "hero":
            return <HeroSection key={section.id} data={section.data} page={page} />
          case "features":
            return <FeaturesSection key={section.id} data={section.data} />
          case "cta":
            return <CTASection key={section.id} data={section.data} />
          case "content":
            return <ContentSection key={section.id} data={section.data} />
          case "gallery":
            return <GallerySection key={section.id} data={section.data} />
          default:
            return null
        }
      })}

      {/* Footer */}
      <footer className="border-t border-border/50 py-8 mt-16">
        <div className="container mx-auto px-4">
          <p className="text-center text-sm text-muted-foreground">
            Criado com Admin Panel • {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  )
}

function HeroSection({ data, page }: { data: any; page: Page }) {
  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-chart-2/10 pointer-events-none" />
      <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <Badge variant="secondary" className="mb-4">
            {page.template.charAt(0).toUpperCase() + page.template.slice(1)}
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-foreground text-balance">
            {data.title || page.content.title}
          </h1>
          {(data.subtitle || page.content.description) && (
            <p className="text-lg md:text-xl text-muted-foreground text-balance max-w-2xl mx-auto">
              {data.subtitle || page.content.description}
            </p>
          )}
          {(data.ctaText || data.ctaSecondary) && (
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              {data.ctaText && (
                <Button className="btn-gradient-hover bg-primary hover:bg-primary/90 text-primary-foreground">
                  {data.ctaText}
                </Button>
              )}
              {data.ctaSecondary && (
                <Button variant="outline" className="border-border/50 bg-transparent hover:bg-accent">
                  {data.ctaSecondary}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function FeaturesSection({ data }: { data: any }) {
  const features = data.features || []

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-6xl mx-auto">
        {data.title && (
          <h2 className="text-3xl md:text-4xl font-bold text-foreground text-center mb-12 text-balance">
            {data.title}
          </h2>
        )}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature: any, index: number) => (
            <Card key={index} className="glass-effect border-border/50 hover:border-primary/30 transition-all">
              <CardContent className="p-6">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

function CTASection({ data }: { data: any }) {
  return (
    <div className="container mx-auto px-4 py-16">
      <Card className="glass-effect border-border/50 bg-gradient-to-br from-primary/5 to-chart-2/5">
        <CardContent className="p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">{data.title}</h2>
          {data.description && (
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto text-balance">{data.description}</p>
          )}
          {data.ctaText && (
            <Button size="lg" className="btn-gradient-hover bg-primary hover:bg-primary/90 text-primary-foreground">
              {data.ctaText}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function ContentSection({ data }: { data: any }) {
  const blocks = data.blocks || []
  const posts = data.posts || []
  const plans = data.plans || []

  // Pricing table layout
  if (plans.length > 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="grid gap-6 md:grid-cols-3 max-w-6xl mx-auto">
          {plans.map((plan: any, index: number) => (
            <Card
              key={index}
              className={`glass-effect border-border/50 ${plan.highlighted ? "border-primary/50 ring-2 ring-primary/20 scale-105" : ""}`}
            >
              <CardContent className="p-8">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-2xl font-bold text-foreground mb-2">{plan.name}</h3>
                    <p className="text-muted-foreground text-sm">{plan.description}</p>
                  </div>
                  <div>
                    <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                    {plan.period && <span className="text-muted-foreground">{plan.period}</span>}
                  </div>
                  <ul className="space-y-3">
                    {plan.features.map((feature: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <span className="text-primary mt-0.5">✓</span>
                        <span className="text-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className={`w-full ${plan.highlighted ? "btn-gradient-hover bg-primary hover:bg-primary/90 text-primary-foreground" : ""}`}
                    variant={plan.highlighted ? "default" : "outline"}
                  >
                    {plan.cta}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  // Blog posts layout
  if (posts.length > 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          {posts.map((post: any, index: number) => (
            <Card key={index} className="glass-effect border-border/50 hover:border-primary/30 transition-all group">
              <CardContent className="p-0">
                <div className="relative aspect-video overflow-hidden rounded-t-lg bg-muted">
                  <Image
                    src={post.image || "/placeholder.svg"}
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <div className="p-6 space-y-3">
                  <Badge variant="secondary">{post.category}</Badge>
                  <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-muted-foreground text-sm">{post.excerpt}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t border-border/30">
                    <span>{post.author}</span>
                    <span>•</span>
                    <span>{post.date}</span>
                    <span>•</span>
                    <span>{post.readTime}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  // Mission/Values blocks layout
  if (blocks.length > 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {data.title && (
            <h2 className="text-3xl md:text-4xl font-bold text-foreground text-center mb-12 text-balance">
              {data.title}
            </h2>
          )}
          <div className="grid gap-8 md:grid-cols-3">
            {blocks.map((block: any, index: number) => (
              <div key={index} className="text-center space-y-4">
                <div className="text-5xl">{block.icon}</div>
                <h3 className="text-xl font-semibold text-foreground">{block.title}</h3>
                <p className="text-muted-foreground">{block.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return null
}

function GallerySection({ data }: { data: any }) {
  const projects = data.projects || []

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
        {projects.map((project: any, index: number) => (
          <Card
            key={index}
            className="glass-effect border-border/50 hover:border-primary/30 transition-all group overflow-hidden"
          >
            <CardContent className="p-0">
              <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                <Image
                  src={project.image || "/placeholder.svg"}
                  alt={project.title}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <Badge variant="secondary" className="mb-2">
                      {project.category}
                    </Badge>
                    <h3 className="text-xl font-semibold text-foreground mb-2">{project.title}</h3>
                    <p className="text-sm text-muted-foreground">{project.description}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
