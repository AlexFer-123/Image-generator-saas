'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/contexts/AuthContext'
import { 
  Sparkles, 
  Check, 
  CreditCard, 
  Shield, 
  Zap,
  ArrowRight
} from 'lucide-react'
import TestCardInstructions from '@/components/TestCardInstructions'
import axios from 'axios'
import { toast } from 'react-hot-toast'

const pricingPlans = [
  {
    id: 'free',
    name: 'Gratuito',
    price: 'R$ 0',
    period: '/mês',
    images: '5 imagens',
    description: 'Perfeito para experimentar',
    features: [
      '5 imagens por mês',
      'Qualidade padrão',
      'Formatos básicos',
      'Suporte por email'
    ],
    popular: false,
    priceId: null
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 'R$ 29',
    period: '/mês',
    images: '100 imagens',
    description: 'Ideal para criadores',
    features: [
      '100 imagens por mês',
      'Qualidade HD',
      'Todos os formatos',
      'Suporte prioritário',
      'Histórico de imagens',
      'API access'
    ],
    popular: true,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID
  },
  {
    id: 'business',
    name: 'Business',
    price: 'R$ 99',
    period: '/mês',
    images: '500 imagens',
    description: 'Para equipes e empresas',
    features: [
      '500 imagens por mês',
      'Qualidade ultra HD',
      'Todos os formatos',
      'Suporte 24/7',
      'Histórico ilimitado',
      'API access',
      'Marca personalizada',
      'Integrações avançadas'
    ],
    popular: false,
    priceId: process.env.NEXT_PUBLIC_STRIPE_BUSINESS_PRICE_ID
  }
]

export default function PricingPage() {
  const { user } = useAuth()
  const [showTestCards, setShowTestCards] = useState(false)
  const [loading, setLoading] = useState<string | null>(null)

  const handleSubscribe = async (priceId: string, planName: string) => {
    if (!user) {
      toast.error('Faça login para continuar')
      return
    }

    if (!priceId) {
      toast.error('ID do plano não configurado')
      return
    }

    setLoading(priceId)
    try {
      const response = await axios.post('/api/stripe/create-checkout-session', {
        priceId
      })

      if (response.data.success && response.data.data.url) {
        window.location.href = response.data.data.url
      } else {
        toast.error('Erro ao criar sessão de pagamento')
      }
    } catch (error: any) {
      const message = error.response?.data?.error || 'Erro ao processar pagamento'
      toast.error(message)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold gradient-text">AI Image Maker</span>
            </Link>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowTestCards(true)}
                className="flex items-center space-x-2 text-gray-600 hover:text-purple-600 transition-colors"
                title="Ver cartões de teste"
              >
                <CreditCard className="w-4 h-4" />
                <span className="hidden sm:inline">Cartões de Teste</span>
              </button>
              
              {user ? (
                <Link 
                  href="/dashboard" 
                  className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-300"
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link 
                    href="/login" 
                    className="text-gray-600 hover:text-purple-600 transition-colors"
                  >
                    Entrar
                  </Link>
                  <Link 
                    href="/register" 
                    className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-300"
                  >
                    Começar Grátis
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Planos Simples e{' '}
              <span className="gradient-text">Transparentes</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8">
              Escolha o plano ideal para suas necessidades de criação de imagens com IA
            </p>

            {/* Test Cards Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-12 max-w-2xl mx-auto">
              <div className="flex items-center justify-center space-x-3">
                <Shield className="w-5 h-5 text-blue-600" />
                <p className="text-blue-800 font-medium">
                  Teste grátis com cartões de demonstração - sem cobrança real
                </p>
                <button
                  onClick={() => setShowTestCards(true)}
                  className="text-blue-600 underline hover:text-blue-800 transition-colors"
                >
                  Ver cartões
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-20 px-4">
        <div className="container mx-auto">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              {pricingPlans.map((plan) => (
                <div 
                  key={plan.id}
                  className={`bg-white rounded-2xl p-8 border-2 transition-all duration-300 hover:shadow-xl relative ${
                    plan.popular 
                      ? 'border-purple-200 shadow-lg' 
                      : 'border-gray-100 hover:border-purple-200'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
                        Mais Popular
                      </span>
                    </div>
                  )}

                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                    <p className="text-gray-600 mb-4">{plan.description}</p>
                    <div className="flex items-baseline justify-center mb-2">
                      <span className="text-4xl font-bold">{plan.price}</span>
                      <span className="text-gray-600 ml-1">{plan.period}</span>
                    </div>
                    <p className="text-purple-600 font-semibold">{plan.images}</p>
                  </div>

                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                        <span className="text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="space-y-3">
                    {plan.id === 'free' ? (
                      <Link 
                        href={user ? '/dashboard' : '/register'}
                        className="w-full py-3 px-6 rounded-xl font-semibold transition-all duration-300 text-center block border-2 border-purple-200 text-purple-600 hover:bg-purple-50"
                      >
                        {user ? 'Ir para Dashboard' : 'Começar Grátis'}
                      </Link>
                    ) : (
                      <>
                        <button
                          onClick={() => handleSubscribe(plan.priceId!, plan.name)}
                          disabled={loading === plan.priceId || !plan.priceId}
                          className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-300 text-center flex items-center justify-center ${
                            plan.popular
                              ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-lg hover:scale-105'
                              : 'border-2 border-purple-200 text-purple-600 hover:bg-purple-50'
                          } disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
                        >
                          {loading === plan.priceId ? (
                            <>
                              <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
                              Processando...
                            </>
                          ) : user ? (
                            <>
                              Assinar {plan.name}
                              <ArrowRight className="w-4 h-4 ml-2" />
                            </>
                          ) : (
                            'Fazer Login'
                          )}
                        </button>
                        
                        <button
                          onClick={() => setShowTestCards(true)}
                          className="w-full text-xs text-gray-500 hover:text-purple-600 transition-colors underline"
                        >
                          Ver cartões de teste gratuitos
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Perguntas Frequentes</h2>
            
            <div className="space-y-8">
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-3">Como funcionam os cartões de teste?</h3>
                <p className="text-gray-600">
                  Utilizamos cartões de teste do Stripe que permitem simular pagamentos reais sem cobrança. 
                  Você pode testar todo o fluxo de assinatura, receber confirmações e usar o sistema normalmente, 
                  mas nenhuma cobrança real será feita.
                </p>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-3">Posso cancelar a qualquer momento?</h3>
                <p className="text-gray-600">
                  Sim! Você pode cancelar sua assinatura a qualquer momento através do seu dashboard ou 
                  portal do cliente. Não há taxas de cancelamento e você continuará tendo acesso até o 
                  final do período pago.
                </p>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-3">O que acontece se eu exceder meu limite?</h3>
                <p className="text-gray-600">
                  Quando você atinge seu limite mensal, não conseguirá gerar mais imagens até o próximo ciclo 
                  de cobrança. Você pode fazer upgrade do seu plano a qualquer momento para ter mais imagens.
                </p>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-3">As imagens geradas são minhas?</h3>
                <p className="text-gray-600">
                  Sim! Todas as imagens que você gerar são suas e você pode usá-las comercialmente. 
                  Mantemos um histórico das suas criações para sua conveniência, mas os direitos são seus.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-blue-600">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Pronto para Começar?
            </h2>
            <p className="text-xl text-purple-100 mb-8">
              Teste nossa plataforma gratuitamente com cartões de demonstração
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {!user ? (
                <Link 
                  href="/register"
                  className="bg-white text-purple-600 px-8 py-4 rounded-xl text-lg font-semibold hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center"
                >
                  Começar Grátis - 5 Imagens
                  <Sparkles className="ml-2 w-5 h-5" />
                </Link>
              ) : (
                <Link 
                  href="/dashboard"
                  className="bg-white text-purple-600 px-8 py-4 rounded-xl text-lg font-semibold hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center"
                >
                  Ir para Dashboard
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              )}
              
              <button
                onClick={() => setShowTestCards(true)}
                className="border-2 border-white text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-white hover:text-purple-600 transition-all duration-300 flex items-center"
              >
                <CreditCard className="mr-2 w-5 h-5" />
                Ver Cartões de Teste
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Test Card Instructions Modal */}
      <TestCardInstructions 
        show={showTestCards} 
        onClose={() => setShowTestCards(false)} 
      />
    </div>
  )
}

