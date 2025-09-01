import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/database'
import User from '@/lib/models/User'
import { generateTokens } from '@/lib/auth'
import { ApiResponse, AuthUser } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json()

    // Validações básicas
    if (!name || !email || !password) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Nome, email e senha são obrigatórios'
      }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Senha deve ter pelo menos 6 caracteres'
      }, { status: 400 })
    }

    // Conectar ao banco
    await connectDB()

    // Verificar se usuário já existe
    const existingUser = await User.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Usuário já existe com este email'
      }, { status: 400 })
    }

    // Criar novo usuário
    const user = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      imagesGenerated: 0,
      maxImages: 5 // Plano gratuito
    })

    await user.save()

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
      message: 'Usuário criado com sucesso',
      data: {
        user: authUser,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken
      }
    }, { status: 201 })

  } catch (error: any) {
    console.error('Erro ao registrar usuário:', error)
    
    // Tratar erros de validação do Mongoose
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err: any) => err.message)
      return NextResponse.json<ApiResponse>({
        success: false,
        message: messages.join(', ')
      }, { status: 400 })
    }

    // Tratar erro de duplicata (email único)
    if (error.code === 11000) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Email já está em uso'
      }, { status: 400 })
    }

    return NextResponse.json<ApiResponse>({
      success: false,
      message: 'Erro interno do servidor'
    }, { status: 500 })
  }
}

