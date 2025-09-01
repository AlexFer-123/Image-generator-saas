import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/middleware/auth'
import { createCheckoutSession, STRIPE_PRODUCTS } from '@/lib/stripe'
import { ApiResponse } from '@/types'

export const POST = withAuth(async (request) => {
  try {
    if (!request.user) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Usuário não autenticado'
      }, { status: 401 })
    }

    const { priceId } = await request.json()

    if (!priceId) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Price ID é obrigatório'
      }, { status: 400 })
    }

    // Verificar se o price ID é válido
    const product = Object.values(STRIPE_PRODUCTS).find(p => p.priceId === priceId)
    if (!product) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Plano inválido'
      }, { status: 400 })
    }

    // URLs de sucesso e cancelamento
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const successUrl = `${baseUrl}/dashboard?success=true&session_id={CHECKOUT_SESSION_ID}`
    const cancelUrl = `${baseUrl}/dashboard?canceled=true`

    // Criar sessão de checkout
    const session = await createCheckoutSession({
      priceId,
      userId: request.user.id,
      userEmail: request.user.email,
      successUrl,
      cancelUrl
    })

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        sessionId: session.id,
        url: session.url
      }
    })

  } catch (error: any) {
    console.error('Erro ao criar sessão de checkout:', error)
    
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 })
  }
})

