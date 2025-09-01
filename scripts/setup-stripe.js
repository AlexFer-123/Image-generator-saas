#!/usr/bin/env node

/**
 * Script para configurar produtos e preços no Stripe
 * Execute: node scripts/setup-stripe.js
 */

const Stripe = require('stripe')
require('dotenv').config({ path: '.env.local' })

const stripe = Stripe(process.env.STRIPE_SECRET_KEY)

async function setupStripeProducts() {
  console.log('🔧 Configurando produtos no Stripe...\n')

  try {
    // Verificar se já existem produtos
    const existingProducts = await stripe.products.list({ limit: 10 })
    const existingProductNames = existingProducts.data.map(p => p.name)

    const products = [
      {
        name: 'AI Image Generator - Pro',
        description: 'Plano Pro com 100 imagens por mês, qualidade HD e recursos avançados',
        metadata: {
          plan: 'pro',
          maxImages: '100'
        },
        price: {
          unit_amount: 2900, // R$ 29.00
          currency: 'brl',
          recurring: {
            interval: 'month'
          }
        }
      },
      {
        name: 'AI Image Generator - Business',
        description: 'Plano Business com 500 imagens por mês, qualidade ultra HD e recursos empresariais',
        metadata: {
          plan: 'business',
          maxImages: '500'
        },
        price: {
          unit_amount: 9900, // R$ 99.00
          currency: 'brl',
          recurring: {
            interval: 'month'
          }
        }
      }
    ]

    for (const productData of products) {
      // Verificar se o produto já existe
      if (existingProductNames.includes(productData.name)) {
        console.log(`⏭️  Produto "${productData.name}" já existe, pulando...`)
        continue
      }

      console.log(`📦 Criando produto: ${productData.name}`)

      // Criar produto
      const product = await stripe.products.create({
        name: productData.name,
        description: productData.description,
        metadata: productData.metadata
      })

      console.log(`✅ Produto criado: ${product.id}`)

      // Criar preço
      console.log(`💰 Criando preço para: ${productData.name}`)
      
      const price = await stripe.prices.create({
        unit_amount: productData.price.unit_amount,
        currency: productData.price.currency,
        recurring: productData.price.recurring,
        product: product.id,
        metadata: productData.metadata
      })

      console.log(`✅ Preço criado: ${price.id}`)
      console.log(`💡 Adicione ao seu .env: STRIPE_${productData.metadata.plan.toUpperCase()}_PRICE_ID=${price.id}\n`)
    }

    console.log('🎉 Configuração do Stripe concluída!')
    console.log('\n📝 Próximos passos:')
    console.log('1. Copie os Price IDs mostrados acima para seu arquivo .env')
    console.log('2. Configure o webhook endpoint no Stripe Dashboard')
    console.log('3. Teste os pagamentos usando os cartões de teste disponíveis')
    console.log('\n🔗 Links úteis:')
    console.log('- Dashboard: https://dashboard.stripe.com/products')
    console.log('- Webhooks: https://dashboard.stripe.com/webhooks')
    console.log('- Cartões de teste: https://stripe.com/docs/testing#cards')

  } catch (error) {
    console.error('❌ Erro ao configurar Stripe:', error.message)
    process.exit(1)
  }
}

async function setupWebhook() {
  console.log('\n🔗 Configurando webhook...')

  try {
    const webhooks = await stripe.webhookEndpoints.list()
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const webhookUrl = `${baseUrl}/api/stripe/webhook`

    // Verificar se webhook já existe
    const existingWebhook = webhooks.data.find(w => w.url === webhookUrl)
    
    if (existingWebhook) {
      console.log(`⏭️  Webhook já existe: ${existingWebhook.id}`)
      console.log(`🔑 Secret: ${existingWebhook.secret || 'Não disponível via API'}`)
      return
    }

    const webhook = await stripe.webhookEndpoints.create({
      url: webhookUrl,
      enabled_events: [
        'checkout.session.completed',
        'customer.subscription.created',
        'customer.subscription.updated',
        'customer.subscription.deleted',
        'invoice.payment_succeeded',
        'invoice.payment_failed'
      ],
      description: 'AI Image Generator Webhook'
    })

    console.log(`✅ Webhook criado: ${webhook.id}`)
    console.log(`🔑 Webhook Secret: ${webhook.secret}`)
    console.log(`💡 Adicione ao seu .env: STRIPE_WEBHOOK_SECRET=${webhook.secret}`)

  } catch (error) {
    console.error('❌ Erro ao configurar webhook:', error.message)
  }
}

// Verificar se as chaves estão configuradas
if (!process.env.STRIPE_SECRET_KEY) {
  console.error('❌ STRIPE_SECRET_KEY não encontrada no arquivo .env.local')
  console.log('💡 Configure sua chave secreta do Stripe primeiro')
  process.exit(1)
}

// Executar setup
async function main() {
  console.log('🚀 Setup do Stripe para AI Image Generator\n')
  
  await setupStripeProducts()
  await setupWebhook()
  
  console.log('\n✨ Setup concluído com sucesso!')
}

main().catch(console.error)

