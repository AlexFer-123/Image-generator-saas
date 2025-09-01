import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/database'
import User from '@/lib/models/User'
import { generateTokens } from '@/lib/auth'
import { ApiResponse, AuthUser } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Validações básicas
    if (!email || !password) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Email e senha são obrigatórios'
      }, { status: 400 })
    }

    // Conectar ao banco
    await connectDB()

    // Buscar usuário por email
    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Credenciais inválidas'
      }, { status: 401 })
    }

    // Verificar senha
    const isPasswordValid = await user.comparePassword(password)
    if (!isPasswordValid) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Credenciais inválidas'
      }, { status: 401 })
    }

    // Limpar tokens expirados
    await user.cleanExpiredTokens()

    // Preparar dados do usuário para resposta
    const authUser: AuthUser = {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      imagesGenerated: user.imagesGenerated,
      maxImages: user.maxImages
    }

    // Gerar tokens
    const tokens = generateTokens(authUser)

    // Salvar refresh token no usuário
    await user.addRefreshToken(tokens.refreshToken)

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Login realizado com sucesso',
      data: {
        user: authUser,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken
      }
    })

  } catch (error: any) {
    console.error('Erro ao fazer login:', error)
    
    return NextResponse.json<ApiResponse>({
      success: false,
      message: 'Erro interno do servidor'
    }, { status: 500 })
  }
}

