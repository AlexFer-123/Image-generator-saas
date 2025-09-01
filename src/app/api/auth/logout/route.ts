import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/middleware/auth'
import connectDB from '@/lib/database'
import User from '@/lib/models/User'
import { ApiResponse } from '@/types'

export const POST = withAuth(async (request) => {
  try {
    if (!request.user) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Usuário não autenticado'
      }, { status: 401 })
    }

    const { refreshToken } = await request.json()

    // Conectar ao banco
    await connectDB()

    // Buscar usuário
    const user = await User.findById(request.user.id)
    if (!user) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Usuário não encontrado'
      }, { status: 404 })
    }

    // Se refresh token foi fornecido, removê-lo especificamente
    if (refreshToken) {
      await user.removeRefreshToken(refreshToken)
    } else {
      // Se não foi fornecido, limpar todos os tokens expirados
      await user.cleanExpiredTokens()
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Logout realizado com sucesso'
    })

  } catch (error: any) {
    console.error('Erro ao fazer logout:', error)
    
    return NextResponse.json<ApiResponse>({
      success: false,
      message: 'Erro interno do servidor'
    }, { status: 500 })
  }
})

