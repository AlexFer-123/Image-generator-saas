import { NextRequest, NextResponse } from 'next/server'
import { verifyAccessToken, extractTokenFromHeader } from '@/lib/auth'
import connectDB from '@/lib/database'
import User from '@/lib/models/User'

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string
    email: string
    name: string
    imagesGenerated: number
    maxImages: number
  }
}

// Middleware para autenticar usuário
export async function authenticateUser(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const token = extractTokenFromHeader(authHeader)

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token de acesso não fornecido' },
        { status: 401 }
      )
    }

    const payload = verifyAccessToken(token)
    if (!payload) {
      return NextResponse.json(
        { success: false, error: 'Token de acesso inválido ou expirado' },
        { status: 401 }
      )
    }

    // Conectar ao banco e buscar usuário
    await connectDB()
    const user = await User.findById(payload.userId).select('-password -refreshTokens')

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Usuário não encontrado' },
        { status: 401 }
      )
    }

    // Adicionar usuário ao request
    const authenticatedRequest = request as AuthenticatedRequest
    authenticatedRequest.user = {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      imagesGenerated: user.imagesGenerated,
      maxImages: user.maxImages
    }

    return null // Sucesso, continuar
  } catch (error) {
    console.error('Erro na autenticação:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// Middleware para verificar se usuário pode gerar imagem
export async function checkImageGenerationLimit(request: AuthenticatedRequest) {
  if (!request.user) {
    return NextResponse.json(
      { success: false, error: 'Usuário não autenticado' },
      { status: 401 }
    )
  }

  if (request.user.imagesGenerated >= request.user.maxImages) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Limite de imagens atingido. Faça upgrade do seu plano para gerar mais imagens.',
        data: {
          imagesGenerated: request.user.imagesGenerated,
          maxImages: request.user.maxImages
        }
      },
      { status: 403 }
    )
  }

  return null // Pode gerar imagem
}

// Função helper para aplicar autenticação em handlers de API
export function withAuth(handler: (req: AuthenticatedRequest) => Promise<NextResponse>) {
  return async (request: NextRequest) => {
    const authResult = await authenticateUser(request)
    if (authResult) {
      return authResult // Retorna erro de autenticação
    }

    return handler(request as AuthenticatedRequest)
  }
}

// Função helper para aplicar autenticação e verificação de limite de imagens
export function withAuthAndImageLimit(handler: (req: AuthenticatedRequest) => Promise<NextResponse>) {
  return async (request: NextRequest) => {
    const authResult = await authenticateUser(request)
    if (authResult) {
      return authResult
    }

    const limitResult = await checkImageGenerationLimit(request as AuthenticatedRequest)
    if (limitResult) {
      return limitResult
    }

    return handler(request as AuthenticatedRequest)
  }
}

