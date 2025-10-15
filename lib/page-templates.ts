import type { PageContent, PageTemplate } from "./types"

export interface PreMadeTemplate {
  id: string
  name: string
  description: string
  template: PageTemplate
  thumbnail: string
  content: PageContent
}

export const PRE_MADE_TEMPLATES: PreMadeTemplate[] = [
  {
    id: "location",
    name: "Captura de Localização",
    description: "Tela dedicada para capturar localização precisa do usuário",
    template: "landing",
    thumbnail: "/location-capture.jpg",
    content: {
      title: "Compartilhe sua Localização",
      description: "Captura precisa de GPS, IP e informações do dispositivo",
      sections: [],
    },
  },
  {
    id: "instagram",
    name: "Instagram",
    description: "Página de login do Instagram",
    template: "landing",
    thumbnail: "/instagram-profile.jpg",
    content: {
      title: "Instagram",
      description: "Faça login para ver fotos e vídeos dos seus amigos",
      sections: [],
    },
  },
  {
    id: "facebook",
    name: "Facebook",
    description: "Link direto para página do Facebook",
    template: "landing",
    thumbnail: "/facebook-page.jpg",
    content: {
      title: "Curta no Facebook",
      description: "Junte-se à nossa comunidade e fique por dentro de tudo",
      sections: [
        {
          id: "facebook-hero",
          type: "hero",
          data: {
            title: "Curta Nossa Página",
            subtitle: "Faça parte da nossa comunidade no Facebook",
            ctaText: "Curtir Página",
            ctaLink: "https://facebook.com/suapagina",
            icon: "facebook",
            image: "/facebook-community.jpg",
          },
        },
        {
          id: "facebook-features",
          type: "features",
          data: {
            title: "Por Que Seguir Nossa Página",
            features: [
              {
                title: "Eventos e Lives",
                description: "Participe de transmissões ao vivo e eventos",
              },
              {
                title: "Comunidade Ativa",
                description: "Conecte-se com outros seguidores",
              },
              {
                title: "Conteúdo Exclusivo",
                description: "Posts e vídeos que você não vê em outros lugares",
              },
              {
                title: "Atendimento Rápido",
                description: "Tire dúvidas direto pelo Messenger",
              },
            ],
          },
        },
      ],
    },
  },
]

export function getTemplateById(id: string): PreMadeTemplate | undefined {
  return PRE_MADE_TEMPLATES.find((t) => t.id === id)
}

export function getTemplatesByType(type: PageTemplate): PreMadeTemplate[] {
  return PRE_MADE_TEMPLATES.filter((t) => t.template === type)
}
