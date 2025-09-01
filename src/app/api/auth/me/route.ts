import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/middleware/auth'
import connectDB from '@/lib/database'
import User from '@/lib/models/User'
import Subscription from '@/lib/models/Subscription'
import { ApiResponse, AuthUser } from '@/types'

export const GET = withAuth(async (request) => {
  try {
    if (!request.user) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Usuário não autenticado'
      }, { status: 401 })
    }

    // Conectar ao banco
    await connectDB()

    // Buscar dados atualizados do usuário
    const user = await User.findById(request.user.id).select('-password -refreshTokens')
    if (!user) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Usuário não encontrado'
      }, { status: 404 })
    }

    // Buscar assinatura ativa do usuário
    const subscription = await Subscription.findOne({ 
      userId: user._id,
      status: { $in: ['active', 'trialing'] }
    })

    // Preparar dados do usuário
    const authUser: AuthUser = {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      imagesGenerated: user.imagesGenerated,
      maxImages: user.maxImages,
      subscription: subscription ? {
        status: subscription.status,
        currentPeriodEnd: subscription.currentPeriodEnd
      } : undefined
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: authUser
    })

  } catch (error: any) {
    console.error('Erro ao buscar dados do usuário:', error)
    
    return NextResponse.json<ApiResponse>({
      success: false,
      message: 'Erro interno do servidor'
    }, { status: 500 })
  }
})

