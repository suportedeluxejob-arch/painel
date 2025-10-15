import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { ref, set, get } from "firebase/database"
import { database } from "@/lib/firebase"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get("stripe-signature")!

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err: any) {
      console.error("[v0] Webhook signature verification failed:", err.message)
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
    }

    console.log("[v0] Stripe webhook event:", event.type)

    // Processa eventos do Stripe
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session

        if (session.customer && session.subscription) {
          const accessRef = ref(database, `paid_access/${session.customer}`)
          await set(accessRef, {
            customerId: session.customer,
            subscriptionId: session.subscription,
            status: "active",
            createdAt: new Date().toISOString(),
            email: session.customer_email,
            amount: 4990, // R$ 49,90
            currency: "brl",
          })

          console.log("[v0] Access granted for customer:", session.customer)
        }
        break
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription

        const accessRef = ref(database, `paid_access/${subscription.customer}`)
        const snapshot = await get(accessRef)

        if (snapshot.exists()) {
          await set(accessRef, {
            ...snapshot.val(),
            status: subscription.status,
            updatedAt: new Date().toISOString(),
          })

          console.log("[v0] Subscription updated:", subscription.customer, subscription.status)
        }
        break
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription

        const accessRef = ref(database, `paid_access/${subscription.customer}`)
        const snapshot = await get(accessRef)

        if (snapshot.exists()) {
          await set(accessRef, {
            ...snapshot.val(),
            status: "canceled",
            canceledAt: new Date().toISOString(),
          })

          console.log("[v0] Subscription canceled:", subscription.customer)
        }
        break
      }

      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice
        console.log("[v0] Invoice paid:", invoice.customer)

        if (invoice.customer) {
          const accessRef = ref(database, `paid_access/${invoice.customer}`)
          const snapshot = await get(accessRef)

          if (snapshot.exists()) {
            await set(accessRef, {
              ...snapshot.val(),
              status: "active",
              lastPaymentAt: new Date().toISOString(),
            })
          }
        }
        break
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice
        console.log("[v0] Invoice payment failed:", invoice.customer)

        if (invoice.customer) {
          const accessRef = ref(database, `paid_access/${invoice.customer}`)
          const snapshot = await get(accessRef)

          if (snapshot.exists()) {
            await set(accessRef, {
              ...snapshot.val(),
              status: "payment_failed",
              lastPaymentFailedAt: new Date().toISOString(),
            })
          }
        }
        break
      }

      default:
        console.log("[v0] Unhandled event type:", event.type)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("[v0] Webhook error:", error)
    return NextResponse.json({ error: "Webhook error" }, { status: 500 })
  }
}
