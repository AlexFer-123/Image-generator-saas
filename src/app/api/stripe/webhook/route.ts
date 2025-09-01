import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import stripe, { getProductByPriceId } from '@/lib/stripe'
import connectDB from '@/lib/database'
import User from '@/lib/models/User'
import Subscription from '@/lib/models/Subscription'

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const headersList = headers()
    const signature = headersList.get('stripe-signature')!

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err: any) {
      console.error('Erro na verificação do webhook:', err.message)
      return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 })
    }

    // Conectar ao banco
    await connectDB()

    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session)
        break

      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice)
        break

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice)
        break

      default:
        console.log(`Evento não tratado: ${event.type}`)
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Erro no webhook:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  try {
    const userId = session.client_reference_id || session.metadata?.userId

    if (!userId) {
      console.error('User ID não encontrado na sessão de checkout')
      return
    }

    // Buscar usuário
    const user = await User.findById(userId)
    if (!user) {
      console.error('Usuário não encontrado:', userId)
      return
    }

    // Salvar customer ID do Stripe no usuário
    if (session.customer && !user.stripeCustomerId) {
      user.stripeCustomerId = session.customer as string
      await user.save()
    }

    console.log('Checkout session completed para usuário:', userId)

  } catch (error) {
    console.error('Erro ao processar checkout session completed:', error)
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  try {
    const userId = subscription.metadata.userId

    if (!userId) {
      console.error('User ID não encontrado na assinatura')
      return
    }

    // Buscar usuário
    const user = await User.findById(userId)
    if (!user) {
      console.error('Usuário não encontrado:', userId)
      return
    }

    // Obter informações do produto
    const priceId = subscription.items.data[0]?.price.id
    const product = getProductByPriceId(priceId)

    if (!product) {
      console.error('Produto não encontrado para price ID:', priceId)
      return
    }

    // Criar ou atualizar assinatura no banco
    const existingSubscription = await Subscription.findOne({ userId })

    if (existingSubscription) {
      existingSubscription.stripeSubscriptionId = subscription.id
      existingSubscription.stripePriceId = priceId
      existingSubscription.status = subscription.status
      existingSubscription.currentPeriodStart = new Date(subscription.current_period_start * 1000)
      existingSubscription.currentPeriodEnd = new Date(subscription.current_period_end * 1000)
      existingSubscription.maxImages = product.maxImages
      await existingSubscription.save()
    } else {
      const newSubscription = new Subscription({
        userId,
        stripeSubscriptionId: subscription.id,
        stripePriceId: priceId,
        status: subscription.status,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        maxImages: product.maxImages
      })
      await newSubscription.save()
    }

    // Atualizar limite de imagens do usuário
    user.maxImages = product.maxImages
    await user.save()

    console.log('Assinatura criada para usuário:', userId)

  } catch (error) {
    console.error('Erro ao processar subscription created:', error)
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  try {
    const userId = subscription.metadata.userId

    if (!userId) {
      console.error('User ID não encontrado na assinatura')
      return
    }

    // Buscar assinatura no banco
    const dbSubscription = await Subscription.findOne({ stripeSubscriptionId: subscription.id })
    
    if (!dbSubscription) {
      console.error('Assinatura não encontrada no banco:', subscription.id)
      return
    }

    // Atualizar dados da assinatura
    const priceId = subscription.items.data[0]?.price.id
    const product = getProductByPriceId(priceId)

    dbSubscription.stripePriceId = priceId
    dbSubscription.status = subscription.status
    dbSubscription.currentPeriodStart = new Date(subscription.current_period_start * 1000)
    dbSubscription.currentPeriodEnd = new Date(subscription.current_period_end * 1000)
    dbSubscription.cancelAtPeriodEnd = subscription.cancel_at_period_end
    
    if (product) {
      dbSubscription.maxImages = product.maxImages
    }

    await dbSubscription.save()

    // Atualizar usuário
    const user = await User.findById(userId)
    if (user && product) {
      user.maxImages = product.maxImages
      await user.save()
    }

    console.log('Assinatura atualizada para usuário:', userId)

  } catch (error) {
    console.error('Erro ao processar subscription updated:', error)
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  try {
    const userId = subscription.metadata.userId

    if (!userId) {
      console.error('User ID não encontrado na assinatura')
      return
    }

    // Buscar assinatura no banco
    const dbSubscription = await Subscription.findOne({ stripeSubscriptionId: subscription.id })
    
    if (dbSubscription) {
      dbSubscription.status = 'canceled'
      await dbSubscription.save()
    }

    // Resetar usuário para plano gratuito
    const user = await User.findById(userId)
    if (user) {
      user.maxImages = 5 // Plano gratuito
      user.imagesGenerated = 0 // Resetar contador
      await user.save()
    }

    console.log('Assinatura cancelada para usuário:', userId)

  } catch (error) {
    console.error('Erro ao processar subscription deleted:', error)
  }
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  try {
    const subscriptionId = invoice.subscription as string

    if (!subscriptionId) {
      return
    }

    // Buscar assinatura
    const subscription = await Subscription.findOne({ stripeSubscriptionId: subscriptionId })
    
    if (!subscription) {
      console.error('Assinatura não encontrada para invoice:', invoice.id)
      return
    }

    // Se é um pagamento recorrente (renovação), resetar contador de imagens
    if (invoice.billing_reason === 'subscription_cycle') {
      const user = await User.findById(subscription.userId)
      if (user) {
        user.imagesGenerated = 0
        await user.save()
      }
    }

    console.log('Pagamento bem-sucedido para assinatura:', subscriptionId)

  } catch (error) {
    console.error('Erro ao processar invoice payment succeeded:', error)
  }
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  try {
    const subscriptionId = invoice.subscription as string

    if (!subscriptionId) {
      return
    }

    // Aqui você pode implementar lógica para notificar o usuário sobre o pagamento falhado
    // Por exemplo, enviar email, desabilitar funcionalidades, etc.

    console.log('Pagamento falhou para assinatura:', subscriptionId)

  } catch (error) {
    console.error('Erro ao processar invoice payment failed:', error)
  }
}

