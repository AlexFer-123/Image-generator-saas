import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/middleware/auth'
import connectDB from '@/lib/database'
import GeneratedImage from '@/lib/models/GeneratedImage'
import { ApiResponse } from '@/types'

export const GET = withAuth(async (request) => {
  try {
    if (!request.user) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Usuário não autenticado'
      }, { status: 401 })
    }

    // Extrair parâmetros de query
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50) // Max 50 por página
    const skip = (page - 1) * limit

    // Conectar ao banco
    await connectDB()

    // Buscar imagens do usuário
    const [images, totalCount] = await Promise.all([
      GeneratedImage.findByUserId(request.user.id, limit, skip),
      GeneratedImage.countByUserId(request.user.id)
    ])

    // Calcular informações de paginação
    const totalPages = Math.ceil(totalCount / limit)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1

    const responseData = {
      images: images.map((image: any) => ({
        id: image._id.toString(),
        url: image.imageUrl,
        prompt: image.prompt,
        revisedPrompt: image.revisedPrompt,
        size: image.size,
        quality: image.quality,
        style: image.style,
        createdAt: image.createdAt
      })),
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        limit,
        hasNextPage,
        hasPrevPage
      }
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: responseData
    })

  } catch (error: any) {
    console.error('Erro ao buscar histórico de imagens:', error)
    
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 })
  }
})

