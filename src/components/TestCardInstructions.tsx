'use client'

import { useState } from 'react'
import { CreditCard, Copy, Check, Info, X } from 'lucide-react'
import { getTestCardInstructions, formatCardNumber } from '@/lib/stripe-test-cards'
import { toast } from 'react-hot-toast'

interface TestCardInstructionsProps {
  show: boolean
  onClose: () => void
}

export default function TestCardInstructions({ show, onClose }: TestCardInstructionsProps) {
  const [copiedCard, setCopiedCard] = useState<string | null>(null)
  const instructions = getTestCardInstructions()

  if (!show) return null

  const copyCardNumber = async (cardNumber: string) => {
    try {
      await navigator.clipboard.writeText(cardNumber)
      setCopiedCard(cardNumber)
      toast.success('Número do cartão copiado!')
      setTimeout(() => setCopiedCard(null), 2000)
    } catch (error) {
      toast.error('Erro ao copiar número do cartão')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{instructions.title}</h2>
              <p className="text-sm text-gray-600">{instructions.description}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Alert */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <div className="flex items-start space-x-3">
              <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">Importante</h3>
                <p className="text-sm text-blue-800">
                  Estes são cartões de teste do Stripe. Nenhuma cobrança real será feita, 
                  mas você poderá testar todo o fluxo de pagamento e assinatura.
                </p>
              </div>
            </div>
          </div>

          {/* Test Cards */}
          <div className="space-y-4 mb-6">
            <h3 className="font-semibold text-gray-900">Cartões de Teste Disponíveis:</h3>
            
            {instructions.cards.map((card, index) => (
              <div key={index} className="border border-gray-200 rounded-xl p-4 hover:border-blue-300 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <CreditCard className="w-5 h-5 text-gray-400" />
                      <span className="font-mono text-lg font-semibold text-gray-900">
                        {card.formatted}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{card.description}</p>
                    <div className="flex space-x-4 text-xs text-gray-500">
                      <span>Exp: {card.exp_month.toString().padStart(2, '0')}/{card.exp_year}</span>
                      <span>CVC: {card.cvc}</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => copyCardNumber(card.number)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                    title="Copiar número do cartão"
                  >
                    {copiedCard === card.number ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Instructions */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Como usar:</h3>
            
            <div className="grid gap-3">
              {instructions.instructions.map((instruction, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-semibold text-green-600">{index + 1}</span>
                  </div>
                  <p className="text-sm text-gray-700">{instruction}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-6 p-4 bg-gray-50 rounded-xl">
            <h4 className="font-semibold text-gray-900 mb-2">Informações Adicionais:</h4>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>• Os pagamentos são processados em modo de teste</li>
              <li>• Você receberá confirmações por email normalmente</li>
              <li>• O webhook será acionado como em produção</li>
              <li>• Você pode cancelar a assinatura a qualquer momento</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500">
              Powered by Stripe Test Environment
            </p>
            <button
              onClick={onClose}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Entendi, continuar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

