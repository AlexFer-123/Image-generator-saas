import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

export default stripe

// Configuração dos produtos e preços
export const STRIPE_PRODUCTS = {
  PRO: {
    priceId: process.env.STRIPE_PRO_PRICE_ID || 'price_pro_monthly',
    name: 'Pro',
    maxImages: 100,
    price: 2900, // R$ 29.00 em centavos
  },
  BUSINESS: {
    priceId: process.env.STRIPE_BUSINESS_PRICE_ID || 'price_business_monthly',
    name: 'Business',
    maxImages: 500,
    price: 9900, // R$ 99.00 em centavos
  }
}

export interface CreateCheckoutSessionParams {
  priceId: string
  userId: string
  userEmail: string
  successUrl: string
  cancelUrl: string
}

export async function createCheckoutSession(params: CreateCheckoutSessionParams) {
  const { priceId, userId, userEmail, successUrl, cancelUrl } = params

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: userEmail,
      client_reference_id: userId,
      metadata: {
        userId,
        environment: process.env.NODE_ENV || 'development',
      },
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      subscription_data: {
        metadata: {
          userId,
        },
      },
      // Configurações para aceitar cartões de teste
      payment_method_options: {
        card: {
          setup_future_usage: 'off_session',
        },
      },
      // Permitir cartões de teste mesmo em produção para demonstração
      ...(process.env.STRIPE_ALLOW_TEST_CARDS === 'true' && {
        payment_intent_data: {
          metadata: {
            test_mode: 'true',
          },
        },
      }),
    })

    return session
  } catch (error) {
    console.error('Erro ao criar sessão de checkout:', error)
    throw error
  }
}

export async function createCustomerPortalSession(customerId: string, returnUrl: string) {
  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    })

    return session
  } catch (error) {
    console.error('Erro ao criar sessão do portal do cliente:', error)
    throw error
  }
}

export async function retrieveSubscription(subscriptionId: string) {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)
    return subscription
  } catch (error) {
    console.error('Erro ao recuperar assinatura:', error)
    throw error
  }
}

export async function cancelSubscription(subscriptionId: string, cancelAtPeriodEnd = true) {
  try {
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: cancelAtPeriodEnd,
    })
    return subscription
  } catch (error) {
    console.error('Erro ao cancelar assinatura:', error)
    throw error
  }
}

export async function reactivateSubscription(subscriptionId: string) {
  try {
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false,
    })
    return subscription
  } catch (error) {
    console.error('Erro ao reativar assinatura:', error)
    throw error
  }
}

export function getProductByPriceId(priceId: string) {
  return Object.values(STRIPE_PRODUCTS).find(product => product.priceId === priceId)
}

export function formatPrice(amount: number, currency = 'BRL') {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency,
  }).format(amount / 100)
}

export function isSubscriptionActive(subscription: Stripe.Subscription) {
  return subscription.status === 'active' || subscription.status === 'trialing'
}

export function getSubscriptionStatus(subscription: Stripe.Subscription) {
  switch (subscription.status) {
    case 'active':
      return 'Ativa'
    case 'trialing':
      return 'Período de teste'
    case 'canceled':
      return 'Cancelada'
    case 'incomplete':
      return 'Incompleta'
    case 'incomplete_expired':
      return 'Expirada'
    case 'past_due':
      return 'Em atraso'
    case 'unpaid':
      return 'Não paga'
    default:
      return 'Desconhecida'
  }
}
