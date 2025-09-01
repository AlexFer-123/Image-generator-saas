'use client'

import Link from 'next/link'
import { useState } from 'react'
import { 
  Sparkles, 
  Zap, 
  Shield, 
  Users, 
  Star, 
  ArrowRight, 
  Check,
  Palette,
  Wand2,
  Image as ImageIcon,
  CreditCard
} from 'lucide-react'
import TestCardInstructions from '@/components/TestCardInstructions'

const features = [
  {
    icon: Wand2,
    title: 'IA Avançada',
    description: 'Utilizamos a mais recente tecnologia de IA para gerar imagens únicas e impressionantes a partir de qualquer descrição.'
  },
  {
    icon: Zap,
    title: 'Rápido e Eficiente',
    description: 'Gere suas imagens em segundos. Nossa plataforma otimizada garante resultados rápidos sem comprometer a qualidade.'
  },
  {
    icon: Palette,
    title: 'Estilos Diversos',
    description: 'Desde arte digital até fotorrealismo, nossa IA pode criar imagens em diversos estilos e formatos.'
  },
  {
    icon: Shield,
    title: 'Seguro e Confiável',
    description: 'Suas criações são protegidas com criptografia de ponta e você mantém todos os direitos sobre suas imagens.'
  }
]

const testimonials = [
  {
    name: 'Maria Silva',
    role: 'Designer Gráfica',
    content: 'Revolucionou meu fluxo de trabalho! Consigo criar concepts incríveis em minutos.',
    rating: 5
  },
  {
    name: 'João Santos',
    role: 'Criador de Conteúdo',
    content: 'A qualidade das imagens é impressionante. Meus seguidores adoram o conteúdo visual único.',
    rating: 5
  },
  {
    name: 'Ana Costa',
    role: 'Empreendedora',
    content: 'Economizei milhares em design. Agora posso criar todas as imagens que preciso para meu negócio.',
    rating: 5
  }
]

const pricingPlans = [
  {
    name: 'Gratuito',
    price: 'R$ 0',
    period: '/mês',
    images: '5 imagens',
    features: [
      '5 imagens por mês',
      'Qualidade padrão',
      'Formatos básicos',
      'Suporte por email'
    ],
    popular: false
  },
  {
    name: 'Pro',
    price: 'R$ 29',
    period: '/mês',
    images: '100 imagens',
    features: [
      '100 imagens por mês',
      'Qualidade HD',
      'Todos os formatos',
      'Suporte prioritário',
      'Histórico de imagens',
      'API access'
    ],
    popular: true
  },
  {
    name: 'Business',
    price: 'R$ 99',
    period: '/mês',
    images: '500 imagens',
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
    popular: false
  }
]

export default function LandingPage() {
  const [email, setEmail] = useState('')
  const [showTestCards, setShowTestCards] = useState(false)

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Implementar newsletter signup
    console.log('Newsletter signup:', email)
    setEmail('')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold gradient-text">AI Image Maker</span>
            </div>
            
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-purple-600 transition-colors">
                Funcionalidades
              </a>
              <a href="#pricing" className="text-gray-600 hover:text-purple-600 transition-colors">
                Preços
              </a>
              <a href="#testimonials" className="text-gray-600 hover:text-purple-600 transition-colors">
                Depoimentos
              </a>
            </nav>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowTestCards(true)}
                className="flex items-center space-x-2 text-gray-600 hover:text-purple-600 transition-colors"
                title="Ver cartões de teste"
              >
                <CreditCard className="w-4 h-4" />
                <span className="hidden sm:inline">Cartões de Teste</span>
              </button>
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
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              Transforme{' '}
              <span className="gradient-text">Ideias</span>
              <br />
              em{' '}
              <span className="gradient-text">Arte Visual</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed">
              Crie imagens incríveis usando inteligência artificial. 
              Basta descrever o que você imagina e nossa IA transforma em realidade visual.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Link 
                href="/register"
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center"
              >
                Começar Agora - É Grátis
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              
              <Link 
                href="#demo"
                className="border-2 border-purple-200 text-purple-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-purple-50 transition-all duration-300"
              >
                Ver Demonstração
              </Link>
            </div>

            <div className="flex items-center justify-center space-x-8 text-sm text-gray-500">
              <div className="flex items-center">
                <Check className="w-4 h-4 text-green-500 mr-2" />
                5 imagens gratuitas
              </div>
              <div className="flex items-center">
                <Check className="w-4 h-4 text-green-500 mr-2" />
                Sem cartão de crédito
              </div>
              <div className="flex items-center">
                <Check className="w-4 h-4 text-green-500 mr-2" />
                Resultados em segundos
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section id="demo" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-bold text-center mb-4">
              Veja a Magia Acontecer
            </h2>
            <p className="text-xl text-gray-600 text-center mb-12">
              Exemplos reais de imagens geradas pela nossa IA
            </p>

            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="space-y-6">
                <div className="bg-gray-50 p-6 rounded-xl">
                  <h3 className="font-semibold text-gray-800 mb-2">Prompt:</h3>
                  <p className="text-gray-600 italic">
                    "Um gato astronauta flutuando no espaço com nebulosas coloridas ao fundo, estilo digital art"
                  </p>
                </div>
                
                <div className="bg-gray-50 p-6 rounded-xl">
                  <h3 className="font-semibold text-gray-800 mb-2">Prompt:</h3>
                  <p className="text-gray-600 italic">
                    "Paisagem futurística com cidade cyberpunk, neon lights, chuva, estilo cinematográfico"
                  </p>
                </div>

                <div className="bg-gray-50 p-6 rounded-xl">
                  <h3 className="font-semibold text-gray-800 mb-2">Prompt:</h3>
                  <p className="text-gray-600 italic">
                    "Retrato de uma mulher elegante em aquarela, cabelos fluindo, cores suaves e pastéis"
                  </p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-100 to-blue-100 rounded-2xl p-8 text-center">
                <ImageIcon className="w-24 h-24 text-purple-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-800 mb-4">
                  Suas Imagens Aparecerão Aqui
                </h3>
                <p className="text-gray-600 mb-6">
                  Em segundos, veja suas ideias se transformarem em arte visual única e impressionante.
                </p>
                <Link 
                  href="/register"
                  className="inline-flex items-center bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-300"
                >
                  Experimentar Agora
                  <Sparkles className="ml-2 w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-bold text-center mb-4">
              Por que Escolher Nossa Plataforma?
            </h2>
            <p className="text-xl text-gray-600 text-center mb-16">
              Tecnologia de ponta para resultados excepcionais
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-blue-100 rounded-xl flex items-center justify-center mx-auto mb-6">
                    <feature.icon className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-4">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-bold text-center mb-4">
              Planos Simples e Transparentes
            </h2>
            <p className="text-xl text-gray-600 text-center mb-16">
              Escolha o plano ideal para suas necessidades
            </p>

            <div className="grid md:grid-cols-3 gap-8">
              {pricingPlans.map((plan, index) => (
                <div 
                  key={index} 
                  className={`bg-white rounded-2xl p-8 border-2 transition-all duration-300 hover:shadow-xl ${
                    plan.popular 
                      ? 'border-purple-200 shadow-lg relative' 
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
                    <Link 
                      href="/register"
                      className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-300 text-center block ${
                        plan.popular
                          ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-lg hover:scale-105'
                          : 'border-2 border-purple-200 text-purple-600 hover:bg-purple-50'
                      }`}
                    >
                      {plan.name === 'Gratuito' ? 'Começar Grátis' : 'Escolher Plano'}
                    </Link>
                    
                    {plan.name !== 'Gratuito' && (
                      <button
                        onClick={() => setShowTestCards(true)}
                        className="w-full text-xs text-gray-500 hover:text-purple-600 transition-colors underline"
                      >
                        Ver cartões de teste
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-bold text-center mb-4">
              O que Nossos Usuários Dizem
            </h2>
            <p className="text-xl text-gray-600 text-center mb-16">
              Histórias reais de sucesso com nossa plataforma
            </p>

            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  
                  <p className="text-gray-600 mb-6 italic">"{testimonial.content}"</p>
                  
                  <div>
                    <h4 className="font-semibold text-gray-800">{testimonial.name}</h4>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-blue-600">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Pronto para Criar Arte Incrível?
            </h2>
            <p className="text-xl text-purple-100 mb-8">
              Junte-se a milhares de criadores que já estão transformando suas ideias em realidade visual.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <Link 
                href="/register"
                className="bg-white text-purple-600 px-8 py-4 rounded-xl text-lg font-semibold hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center"
              >
                Começar Agora - 5 Imagens Grátis
                <Sparkles className="ml-2 w-5 h-5" />
              </Link>
            </div>

            <div className="flex items-center justify-center space-x-6 text-purple-200 text-sm">
              <span>Não é necessário cartão de crédito</span>
              <span>•</span>
              <span>Cancele a qualquer momento</span>
              <span>•</span>
              <button
                onClick={() => setShowTestCards(true)}
                className="underline hover:text-white transition-colors"
              >
                Cartões de teste disponíveis
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">AI Image Maker</span>
              </div>
              <p className="text-gray-400">
                Transforme suas ideias em arte visual com o poder da inteligência artificial.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Produto</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#features" className="hover:text-white transition-colors">Funcionalidades</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Preços</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Suporte</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Central de Ajuda</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contato</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Termos de Uso</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacidade</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cookies</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 mt-8 text-center text-gray-400">
            <p>&copy; 2024 AI Image Maker. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>

      {/* Test Card Instructions Modal */}
      <TestCardInstructions 
        show={showTestCards} 
        onClose={() => setShowTestCards(false)} 
      />
    </div>
  )
}
