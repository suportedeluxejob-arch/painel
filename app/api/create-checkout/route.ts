import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
})

export async function POST(request: NextRequest) {
  try {
    const origin = request.headers.get("origin") || "http://localhost:3000"

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "brl",
            product_data: {
              name: "Panel do 7 - Acesso Premium",
              description: "Assinatura mensal com acesso completo ao painel administrativo",
            },
            unit_amount: 4990, // R$ 49,90
            recurring: {
              interval: "month",
              interval_count: 1,
            },
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/access`,
      metadata: {
        type: "panel_access",
      },
      allow_promotion_codes: true, // Permite códigos promocionais
      billing_address_collection: "required", // Coleta endereço de cobrança
    })

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error("[v0] Error creating checkout session:", error.message)
    return NextResponse.json({ error: error.message || "Erro ao criar sessão de pagamento" }, { status: 500 })
  }
}
