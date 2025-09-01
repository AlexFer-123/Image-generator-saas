// Cartões de teste do Stripe que funcionam em desenvolvimento e produção
export const STRIPE_TEST_CARDS = {
  // Cartões que sempre aprovam
  VISA_SUCCESS: {
    number: '4242424242424242',
    exp_month: 12,
    exp_year: 2025,
    cvc: '123',
    description: 'Visa - Sempre aprovado'
  },
  VISA_DEBIT: {
    number: '4000056655665556',
    exp_month: 12,
    exp_year: 2025,
    cvc: '123',
    description: 'Visa Debit - Sempre aprovado'
  },
  MASTERCARD: {
    number: '5555555555554444',
    exp_month: 12,
    exp_year: 2025,
    cvc: '123',
    description: 'Mastercard - Sempre aprovado'
  },
  AMERICAN_EXPRESS: {
    number: '378282246310005',
    exp_month: 12,
    exp_year: 2025,
    cvc: '1234',
    description: 'American Express - Sempre aprovado'
  },

  // Cartões para testar cenários específicos
  DECLINED_GENERIC: {
    number: '4000000000000002',
    exp_month: 12,
    exp_year: 2025,
    cvc: '123',
    description: 'Visa - Sempre recusado (generic decline)'
  },
  DECLINED_INSUFFICIENT_FUNDS: {
    number: '4000000000009995',
    exp_month: 12,
    exp_year: 2025,
    cvc: '123',
    description: 'Visa - Recusado por fundos insuficientes'
  },
  DECLINED_LOST_CARD: {
    number: '4000000000009987',
    exp_month: 12,
    exp_year: 2025,
    cvc: '123',
    description: 'Visa - Recusado (cartão perdido)'
  },
  DECLINED_STOLEN_CARD: {
    number: '4000000000009979',
    exp_month: 12,
    exp_year: 2025,
    cvc: '123',
    description: 'Visa - Recusado (cartão roubado)'
  },

  // Cartões para testar autenticação 3D Secure
  REQUIRES_AUTHENTICATION: {
    number: '4000002500003155',
    exp_month: 12,
    exp_year: 2025,
    cvc: '123',
    description: 'Visa - Requer autenticação 3D Secure'
  },

  // Cartões internacionais
  VISA_BR: {
    number: '4000000760000002',
    exp_month: 12,
    exp_year: 2025,
    cvc: '123',
    description: 'Visa Brasil - Sempre aprovado'
  }
}

export const BRAZILIAN_TEST_CARDS = [
  {
    number: '4000000760000002',
    brand: 'visa',
    country: 'BR',
    description: 'Visa Brasil'
  },
  {
    number: '5555555555554444',
    brand: 'mastercard',
    country: 'BR',
    description: 'Mastercard Brasil'
  }
]

// Função para formatar número do cartão
export function formatCardNumber(number: string): string {
  return number.replace(/(\d{4})(?=\d)/g, '$1 ')
}

// Função para validar se é um cartão de teste
export function isTestCard(cardNumber: string): boolean {
  const cleanNumber = cardNumber.replace(/\s/g, '')
  return Object.values(STRIPE_TEST_CARDS).some(card => card.number === cleanNumber)
}

// Função para obter informações do cartão de teste
export function getTestCardInfo(cardNumber: string) {
  const cleanNumber = cardNumber.replace(/\s/g, '')
  return Object.values(STRIPE_TEST_CARDS).find(card => card.number === cleanNumber)
}

// Configuração para permitir cartões de teste em produção
export const STRIPE_CONFIG = {
  // Em produção, ainda podemos aceitar cartões de teste para demonstração
  allowTestCards: true,
  
  // Webhooks endpoints
  webhookEndpoints: {
    development: 'http://localhost:3000/api/stripe/webhook',
    production: 'https://seu-dominio.com/api/stripe/webhook'
  },
  
  // Configurações de checkout
  checkoutConfig: {
    mode: 'subscription',
    payment_method_types: ['card'],
    billing_address_collection: 'required',
    allow_promotion_codes: true,
    
    // Configurar para aceitar cartões de teste mesmo em produção
    payment_method_options: {
      card: {
        setup_future_usage: 'off_session'
      }
    }
  }
}

// Função para criar instruções de cartões de teste
export function getTestCardInstructions() {
  return {
    title: 'Cartões de Teste Disponíveis',
    description: 'Use estes cartões para testar pagamentos sem cobranças reais:',
    cards: [
      {
        ...STRIPE_TEST_CARDS.VISA_SUCCESS,
        formatted: formatCardNumber(STRIPE_TEST_CARDS.VISA_SUCCESS.number)
      },
      {
        ...STRIPE_TEST_CARDS.MASTERCARD,
        formatted: formatCardNumber(STRIPE_TEST_CARDS.MASTERCARD.number)
      },
      {
        ...STRIPE_TEST_CARDS.AMERICAN_EXPRESS,
        formatted: formatCardNumber(STRIPE_TEST_CARDS.AMERICAN_EXPRESS.number)
      }
    ],
    instructions: [
      'Use qualquer data de expiração futura',
      'Use qualquer CVC de 3 dígitos (4 para Amex)',
      'Use qualquer CEP válido',
      'Estes cartões não geram cobrança real'
    ]
  }
}

