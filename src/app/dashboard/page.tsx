'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import { 
  Sparkles, 
  Download, 
  Copy, 
  Trash2, 
  Settings, 
  LogOut, 
  Plus,
  Image as ImageIcon,
  Loader2,
  Wand2,
  Clock,
  Zap,
  User,
  CreditCard
} from 'lucide-react'
import Image from 'next/image'
import TestCardInstructions from '@/components/TestCardInstructions'

interface GeneratedImageData {
  id: string
  url: string
  prompt: string
  revisedPrompt?: string
  size: string
  quality: string
  style: string
  createdAt: string
}

interface ImageHistoryResponse {
  images: GeneratedImageData[]
  pagination: {
    currentPage: number
    totalPages: number
    totalCount: number
    limit: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}

export default function DashboardPage() {
  const { user, logout, updateUserImages } = useAuth()
  const router = useRouter()
  
  const [prompt, setPrompt] = useState('')
  const [size, setSize] = useState<'1024x1024' | '1792x1024' | '1024x1792'>('1024x1024')
  const [quality, setQuality] = useState<'standard' | 'hd'>('standard')
  const [style, setStyle] = useState<'vivid' | 'natural'>('vivid')
  const [generating, setGenerating] = useState(false)
  const [images, setImages] = useState<GeneratedImageData[]>([])
  const [loadingHistory, setLoadingHistory] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showTestCards, setShowTestCards] = useState(false)

  // Redirecionar se não autenticado
  useEffect(() => {
    if (!user) {
      router.push('/login')
    }
  }, [user, router])

  // Carregar histórico de imagens
  const loadImageHistory = async (page = 1) => {
    try {
      setLoadingHistory(true)
      const response = await axios.get<{ success: boolean; data: ImageHistoryResponse }>(`/api/images/history?page=${page}&limit=12`)
      
      if (response.data.success) {
        setImages(response.data.data.images)
        setCurrentPage(response.data.data.pagination.currentPage)
        setTotalPages(response.data.data.pagination.totalPages)
      }
    } catch (error: any) {
      console.error('Erro ao carregar histórico:', error)
      toast.error('Erro ao carregar histórico de imagens')
    } finally {
      setLoadingHistory(false)
    }
  }

  useEffect(() => {
    if (user) {
      loadImageHistory()
    }
  }, [user])

  const handleGenerateImage = async () => {
    if (!prompt.trim()) {
      toast.error('Digite um prompt para gerar a imagem')
      return
    }

    if (!user?.canGenerateImage && user?.imagesGenerated >= user?.maxImages) {
      toast.error('Limite de imagens atingido. Faça upgrade do seu plano.')
      return
    }

    setGenerating(true)
    try {
      const response = await axios.post('/api/images/generate', {
        prompt: prompt.trim(),
        size,
        quality,
        style
      })

      if (response.data.success) {
        toast.success('Imagem gerada com sucesso!')
        
        // Atualizar contador de imagens do usuário
        updateUserImages(response.data.data.user.imagesGenerated)
        
        // Adicionar nova imagem ao início da lista
        setImages(prev => [response.data.data.image, ...prev.slice(0, 11)])
        
        // Limpar prompt
        setPrompt('')
      }
    } catch (error: any) {
      const message = error.response?.data?.error || 'Erro ao gerar imagem'
      toast.error(message)
    } finally {
      setGenerating(false)
    }
  }

  const handleDownloadImage = async (imageUrl: string, prompt: string) => {
    try {
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `ai-image-${prompt.slice(0, 30).replace(/[^a-zA-Z0-9]/g, '-')}.png`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success('Download iniciado!')
    } catch (error) {
      toast.error('Erro ao fazer download da imagem')
    }
  }

  const handleCopyPrompt = (prompt: string) => {
    navigator.clipboard.writeText(prompt)
    toast.success('Prompt copiado!')
  }

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-purple-600" />
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  const remainingImages = user.maxImages - user.imagesGenerated
  const usagePercentage = (user.imagesGenerated / user.maxImages) * 100

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">AI Image Maker</h1>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <User className="w-4 h-4" />
                <span>{user.name}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sair</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Sidebar - Gerador */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <Wand2 className="w-6 h-6 mr-2 text-purple-600" />
                Gerar Imagem
              </h2>

              {/* Usage Stats */}
              <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Uso Mensal</span>
                  <span className="text-sm text-gray-600">{user.imagesGenerated}/{user.maxImages}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div 
                    className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-600">
                  {remainingImages > 0 ? `${remainingImages} imagens restantes` : 'Limite atingido'}
                </p>
              </div>

              {/* Prompt Input */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descreva a imagem que deseja criar
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Ex: Um gato astronauta flutuando no espaço com nebulosas coloridas ao fundo, estilo digital art"
                  className="w-full h-24 px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  maxLength={1000}
                />
                <div className="text-xs text-gray-500 mt-1">
                  {prompt.length}/1000 caracteres
                </div>
              </div>

              {/* Options */}
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tamanho</label>
                  <select
                    value={size}
                    onChange={(e) => setSize(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="1024x1024">Quadrado (1024×1024)</option>
                    <option value="1792x1024">Paisagem (1792×1024)</option>
                    <option value="1024x1792">Retrato (1024×1792)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Qualidade</label>
                  <select
                    value={quality}
                    onChange={(e) => setQuality(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="standard">Padrão</option>
                    <option value="hd">Alta Definição (HD)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Estilo</label>
                  <select
                    value={style}
                    onChange={(e) => setStyle(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="vivid">Vibrante</option>
                    <option value="natural">Natural</option>
                  </select>
                </div>
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerateImage}
                disabled={generating || !prompt.trim() || remainingImages <= 0}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-4 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5 mr-2" />
                    Gerar Imagem
                  </>
                )}
              </button>

              {remainingImages <= 0 && (
                <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-xl">
                  <p className="text-sm text-orange-800 mb-2">
                    Você atingiu o limite mensal.
                  </p>
                  <div className="flex space-x-2">
                    <a href="#" className="text-sm font-medium text-orange-800 underline">
                      Faça upgrade do seu plano
                    </a>
                    <span className="text-orange-600">•</span>
                    <button
                      onClick={() => setShowTestCards(true)}
                      className="text-sm font-medium text-orange-800 underline hover:text-orange-900"
                    >
                      Ver cartões de teste
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Main Content - Gallery */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold flex items-center">
                  <ImageIcon className="w-6 h-6 mr-2 text-purple-600" />
                  Suas Imagens
                </h2>
                {images.length > 0 && (
                  <span className="text-sm text-gray-600">
                    {images.length} de {user.imagesGenerated} imagens
                  </span>
                )}
              </div>

              {loadingHistory ? (
                <div className="text-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-purple-600" />
                  <p className="text-gray-600">Carregando suas imagens...</p>
                </div>
              ) : images.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ImageIcon className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma imagem ainda</h3>
                  <p className="text-gray-600 mb-6">Comece gerando sua primeira imagem usando o painel ao lado.</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {images.map((image) => (
                      <div key={image.id} className="group relative bg-gray-50 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300">
                        <div className="aspect-square relative">
                          <Image
                            src={image.url}
                            alt={image.prompt}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                          
                          {/* Overlay with actions */}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleDownloadImage(image.url, image.prompt)}
                                className="p-2 bg-white/90 hover:bg-white rounded-lg transition-colors"
                                title="Download"
                              >
                                <Download className="w-4 h-4 text-gray-700" />
                              </button>
                              <button
                                onClick={() => handleCopyPrompt(image.prompt)}
                                className="p-2 bg-white/90 hover:bg-white rounded-lg transition-colors"
                                title="Copiar prompt"
                              >
                                <Copy className="w-4 h-4 text-gray-700" />
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Image info */}
                        <div className="p-4">
                          <p className="text-sm text-gray-800 line-clamp-2 mb-2">
                            {image.prompt}
                          </p>
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>{image.size}</span>
                            <span className="flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              {new Date(image.createdAt).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center space-x-2 mt-8">
                      <button
                        onClick={() => loadImageHistory(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Anterior
                      </button>
                      
                      <div className="flex space-x-1">
                        {[...Array(Math.min(5, totalPages))].map((_, i) => {
                          const pageNum = currentPage <= 3 ? i + 1 : currentPage - 2 + i
                          if (pageNum > totalPages) return null
                          
                          return (
                            <button
                              key={pageNum}
                              onClick={() => loadImageHistory(pageNum)}
                              className={`px-3 py-2 text-sm font-medium rounded-lg ${
                                pageNum === currentPage
                                  ? 'bg-purple-600 text-white'
                                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                              }`}
                            >
                              {pageNum}
                            </button>
                          )
                        })}
                      </div>

                      <button
                        onClick={() => loadImageHistory(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Próximo
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Test Card Instructions Modal */}
      <TestCardInstructions 
        show={showTestCards} 
        onClose={() => setShowTestCards(false)} 
      />
    </div>
  )
}
