import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export interface ImageGenerationOptions {
  prompt: string
  size?: '1024x1024' | '1792x1024' | '1024x1792'
  quality?: 'standard' | 'hd'
  style?: 'vivid' | 'natural'
  n?: number
}

export interface GeneratedImageData {
  url: string
  revisedPrompt?: string
}

export async function generateImage(options: ImageGenerationOptions): Promise<GeneratedImageData> {
  try {
    const {
      prompt,
      size = '1024x1024',
      quality = 'standard',
      style = 'vivid',
      n = 1
    } = options

    // Validar prompt
    if (!prompt || prompt.trim().length === 0) {
      throw new Error('Prompt é obrigatório')
    }

    if (prompt.length > 1000) {
      throw new Error('Prompt deve ter no máximo 1000 caracteres')
    }

    // Gerar imagem usando DALL-E 3
    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt: prompt.trim(),
      size,
      quality,
      style,
      n,
      response_format: 'url'
    })

    if (!response.data || response.data.length === 0) {
      throw new Error('Nenhuma imagem foi gerada')
    }

    const imageData = response.data[0]

    if (!imageData.url) {
      throw new Error('URL da imagem não foi retornada')
    }

    return {
      url: imageData.url,
      revisedPrompt: imageData.revised_prompt
    }

  } catch (error: any) {
    console.error('Erro ao gerar imagem:', error)

    // Tratar erros específicos da OpenAI
    if (error.code === 'content_policy_violation') {
      throw new Error('O prompt viola as políticas de conteúdo da OpenAI. Tente um prompt diferente.')
    }

    if (error.code === 'rate_limit_exceeded') {
      throw new Error('Limite de requisições excedido. Tente novamente em alguns minutos.')
    }

    if (error.code === 'insufficient_quota') {
      throw new Error('Cota da API OpenAI esgotada. Entre em contato com o suporte.')
    }

    if (error.code === 'invalid_request_error') {
      throw new Error('Parâmetros da requisição inválidos. Verifique seu prompt.')
    }

    if (error.message) {
      throw new Error(error.message)
    }

    throw new Error('Erro desconhecido ao gerar imagem')
  }
}

export async function validatePrompt(prompt: string): Promise<{ isValid: boolean; reason?: string }> {
  try {
    // Verificações básicas
    if (!prompt || prompt.trim().length === 0) {
      return { isValid: false, reason: 'Prompt não pode estar vazio' }
    }

    if (prompt.length > 1000) {
      return { isValid: false, reason: 'Prompt deve ter no máximo 1000 caracteres' }
    }

    // Lista de palavras/temas proibidos (básica)
    const forbiddenWords = [
      'nude', 'naked', 'nsfw', 'sexual', 'explicit',
      'violence', 'violent', 'blood', 'gore',
      'hate', 'racist', 'discrimination',
      'illegal', 'drugs', 'weapon'
    ]

    const lowerPrompt = prompt.toLowerCase()
    const foundForbidden = forbiddenWords.find(word => lowerPrompt.includes(word))

    if (foundForbidden) {
      return { 
        isValid: false, 
        reason: 'O prompt contém conteúdo não permitido. Tente algo diferente.' 
      }
    }

    return { isValid: true }

  } catch (error) {
    console.error('Erro ao validar prompt:', error)
    return { isValid: false, reason: 'Erro ao validar prompt' }
  }
}

export function estimateImageCost(options: ImageGenerationOptions): number {
  const { size = '1024x1024', quality = 'standard' } = options

  // Custos baseados na tabela de preços da OpenAI (DALL-E 3)
  // Estes valores são aproximados e podem mudar
  if (quality === 'hd') {
    if (size === '1024x1024') return 0.080 // $0.080
    if (size === '1792x1024' || size === '1024x1792') return 0.120 // $0.120
  } else {
    if (size === '1024x1024') return 0.040 // $0.040
    if (size === '1792x1024' || size === '1024x1792') return 0.080 // $0.080
  }

  return 0.040 // fallback para standard 1024x1024
}

export function optimizePrompt(prompt: string): string {
  // Adicionar melhorias automáticas ao prompt para melhores resultados
  let optimizedPrompt = prompt.trim()

  // Se o prompt é muito curto, sugerir mais detalhes
  if (optimizedPrompt.length < 20) {
    optimizedPrompt += ', high quality, detailed, professional'
  }

  // Se não menciona estilo, adicionar sugestão de estilo
  const hasStyleMention = /style|art|painting|photo|digital|realistic|cartoon|anime/.test(optimizedPrompt.toLowerCase())
  if (!hasStyleMention && optimizedPrompt.length < 100) {
    optimizedPrompt += ', digital art style'
  }

  return optimizedPrompt
}

