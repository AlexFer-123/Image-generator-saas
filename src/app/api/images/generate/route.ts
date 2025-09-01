import { NextRequest, NextResponse } from 'next/server'
import { withAuthAndImageLimit } from '@/lib/middleware/auth'
import connectDB from '@/lib/database'
import User from '@/lib/models/User'
import GeneratedImage from '@/lib/models/GeneratedImage'
import { generateImage, validatePrompt, optimizePrompt } from '@/lib/openai'
import { ApiResponse, ImageGenerationRequest } from '@/types'

export const POST = withAuthAndImageLimit(async (request) => {
  try {
    if (!request.user) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Usuário não autenticado'
      }, { status: 401 })
    }

    const body: ImageGenerationRequest = await request.json()
    const { prompt, size = '1024x1024', quality = 'standard', style = 'vivid' } = body

    // Validar dados de entrada
    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Prompt é obrigatório e deve ser uma string'
      }, { status: 400 })
    }

    // Validar prompt
    const promptValidation = await validatePrompt(prompt)
    if (!promptValidation.isValid) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: promptValidation.reason || 'Prompt inválido'
      }, { status: 400 })
    }

    // Conectar ao banco
    await connectDB()

    // Buscar usuário atualizado
    const user = await User.findById(request.user.id)
    if (!user) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Usuário não encontrado'
      }, { status: 404 })
    }

    // Verificar novamente se pode gerar imagem (double check)
    if (!user.canGenerateImage()) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Limite de imagens atingido. Faça upgrade do seu plano.',
        data: {
          imagesGenerated: user.imagesGenerated,
          maxImages: user.maxImages
        }
      }, { status: 403 })
    }

    try {
      // Otimizar prompt
      const optimizedPrompt = optimizePrompt(prompt)

      // Gerar imagem
      const imageData = await generateImage({
        prompt: optimizedPrompt,
        size,
        quality,
        style
      })

      // Salvar imagem no banco
      const generatedImage = new GeneratedImage({
        userId: user._id,
        prompt: prompt,
        revisedPrompt: imageData.revisedPrompt,
        imageUrl: imageData.url,
        size,
        quality,
        style
      })

      await generatedImage.save()

      // Incrementar contador de imagens do usuário
      await user.incrementImagesGenerated()

      // Preparar resposta
      const responseData = {
        image: {
          id: generatedImage._id.toString(),
          url: imageData.url,
          prompt: prompt,
          revisedPrompt: imageData.revisedPrompt,
          size,
          quality,
          style,
          createdAt: generatedImage.createdAt
        },
        user: {
          imagesGenerated: user.imagesGenerated + 1,
          maxImages: user.maxImages,
          remainingImages: user.maxImages - (user.imagesGenerated + 1)
        }
      }

      return NextResponse.json<ApiResponse>({
        success: true,
        message: 'Imagem gerada com sucesso',
        data: responseData
      }, { status: 201 })

    } catch (imageError: any) {
      console.error('Erro ao gerar imagem:', imageError)

      // Se foi erro da OpenAI, retornar mensagem específica
      return NextResponse.json<ApiResponse>({
        success: false,
        error: imageError.message || 'Erro ao gerar imagem'
      }, { status: 400 })
    }

  } catch (error: any) {
    console.error('Erro na API de geração de imagens:', error)
    
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 })
  }
})

