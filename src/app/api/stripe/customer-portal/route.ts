import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/middleware/auth'
import { createCustomerPortalSession } from '@/lib/stripe'
import connectDB from '@/lib/database'
import User from '@/lib/models/User'
import { ApiResponse } from '@/types'

export const POST = withAuth(async (request) => {
  try {
    if (!request.user) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Usuário não autenticado'
      }, { status: 401 })
    }

    // Conectar ao banco
    await connectDB()

    // Buscar usuário com customer ID
    const user = await User.findById(request.user.id)
    if (!user) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Usuário não encontrado'
      }, { status: 404 })
    }

    if (!user.stripeCustomerId) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Usuário não possui assinatura ativa'
      }, { status: 400 })
    }

    // URL de retorno
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const returnUrl = `${baseUrl}/dashboard`

    // Criar sessão do portal do cliente
    const session = await createCustomerPortalSession(user.stripeCustomerId, returnUrl)

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        url: session.url
      }
    })

  } catch (error: any) {
    console.error('Erro ao criar sessão do portal do cliente:', error)
    
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 })
  }
})

