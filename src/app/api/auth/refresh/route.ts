import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/database'
import User from '@/lib/models/User'
import { verifyRefreshToken, generateTokens } from '@/lib/auth'
import { ApiResponse, AuthUser } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const { refreshToken } = await request.json()

    if (!refreshToken) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Refresh token é obrigatório'
      }, { status: 400 })
    }

    // Verificar se o refresh token é válido
    const payload = verifyRefreshToken(refreshToken)
    if (!payload) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Refresh token inválido ou expirado'
      }, { status: 401 })
    }

    // Conectar ao banco
    await connectDB()

    // Buscar usuário
    const user = await User.findById(payload.userId)
    if (!user) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Usuário não encontrado'
      }, { status: 401 })
    }

    // Verificar se o refresh token existe no banco e ainda é válido
    if (!user.isRefreshTokenValid(refreshToken)) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Refresh token inválido'
      }, { status: 401 })
    }

    // Limpar tokens expirados
    await user.cleanExpiredTokens()

    // Preparar dados do usuário
    const authUser: AuthUser = {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      imagesGenerated: user.imagesGenerated,
      maxImages: user.maxImages
    }

    // Gerar novos tokens
    const tokens = generateTokens(authUser)

    // Remover o refresh token antigo e adicionar o novo
    await user.removeRefreshToken(refreshToken)
    await user.addRefreshToken(tokens.refreshToken)

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Tokens renovados com sucesso',
      data: {
        user: authUser,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken
      }
    })

  } catch (error: any) {
    console.error('Erro ao renovar token:', error)
    
    return NextResponse.json<ApiResponse>({
      success: false,
      message: 'Erro interno do servidor'
    }, { status: 500 })
  }
}

