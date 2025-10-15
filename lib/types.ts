export interface Page {
  id: string
  name: string
  slug: string
  template: PageTemplate
  status: "active" | "draft" | "archived"
  createdAt: string
  updatedAt: string
  views: number
  content: PageContent
}

export type PageTemplate = "landing" | "contact" | "about" | "portfolio" | "pricing" | "blog"

export interface PageContent {
  title: string
  description: string
  heroImage?: string
  sections: Section[]
}

export interface Section {
  id: string
  type: "hero" | "features" | "cta" | "content" | "gallery"
  data: Record<string, unknown>
}

export const PAGE_TEMPLATES = [
  {
    id: "landing" as PageTemplate,
    name: "Landing Page",
    description: "Página inicial com hero e call-to-action",
    icon: "🚀",
    color: "from-blue-500/20 to-cyan-500/20",
  },
  {
    id: "contact" as PageTemplate,
    name: "Contato",
    description: "Formulário de contato e informações",
    icon: "📧",
    color: "from-green-500/20 to-emerald-500/20",
  },
  {
    id: "about" as PageTemplate,
    name: "Sobre",
    description: "Página institucional sobre a empresa",
    icon: "ℹ️",
    color: "from-purple-500/20 to-pink-500/20",
  },
  {
    id: "portfolio" as PageTemplate,
    name: "Portfólio",
    description: "Galeria de projetos e trabalhos",
    icon: "🎨",
    color: "from-orange-500/20 to-red-500/20",
  },
  {
    id: "pricing" as PageTemplate,
    name: "Preços",
    description: "Tabela de preços e planos",
    icon: "💰",
    color: "from-yellow-500/20 to-amber-500/20",
  },
  {
    id: "blog" as PageTemplate,
    name: "Blog",
    description: "Lista de artigos e posts",
    icon: "📝",
    color: "from-indigo-500/20 to-violet-500/20",
  },
]
