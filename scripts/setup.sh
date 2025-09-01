#!/bin/bash

# Script de configuração inicial do projeto AI Image Generator SaaS

echo "🚀 Configurando AI Image Generator SaaS..."

# Verificar se Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não está instalado. Por favor, instale Node.js 18+ antes de continuar."
    exit 1
fi

# Verificar se Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "⚠️  Docker não está instalado. Algumas funcionalidades podem não funcionar."
fi

# Criar arquivo .env.local se não existir
if [ ! -f .env.local ]; then
    echo "📝 Criando arquivo .env.local..."
    cp env.example .env.local
    echo "✅ Arquivo .env.local criado. Por favor, configure as variáveis de ambiente."
else
    echo "✅ Arquivo .env.local já existe."
fi

# Instalar dependências
echo "📦 Instalando dependências..."
npm install

# Gerar chaves JWT seguras
echo "🔐 Gerando chaves JWT seguras..."
JWT_SECRET=$(openssl rand -base64 32)
JWT_REFRESH_SECRET=$(openssl rand -base64 32)

# Atualizar arquivo .env.local com chaves geradas
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' "s/your-super-secret-jwt-key-change-this-in-production-min-32-chars/$JWT_SECRET/g" .env.local
    sed -i '' "s/your-super-secret-refresh-jwt-key-change-this-in-production-min-32-chars/$JWT_REFRESH_SECRET/g" .env.local
else
    # Linux
    sed -i "s/your-super-secret-jwt-key-change-this-in-production-min-32-chars/$JWT_SECRET/g" .env.local
    sed -i "s/your-super-secret-refresh-jwt-key-change-this-in-production-min-32-chars/$JWT_REFRESH_SECRET/g" .env.local
fi

echo "✅ Chaves JWT geradas e configuradas."

# Verificar se Docker está rodando e iniciar serviços de desenvolvimento
if command -v docker &> /dev/null && docker info &> /dev/null; then
    echo "🐳 Iniciando serviços de desenvolvimento (MongoDB, Redis)..."
    docker-compose -f docker-compose.dev.yml up -d
    echo "✅ Serviços iniciados:"
    echo "   - MongoDB: mongodb://localhost:27017"
    echo "   - MongoDB Express: http://localhost:8081 (admin/admin123)"
    echo "   - Redis: redis://localhost:6379"
else
    echo "⚠️  Docker não está rodando. Você precisará configurar MongoDB manualmente."
fi

echo ""
echo "🎉 Configuração concluída!"
echo ""
echo "📋 Próximos passos:"
echo "1. Configure suas chaves de API no arquivo .env.local:"
echo "   - OPENAI_API_KEY: Sua chave da OpenAI"
echo "   - STRIPE_SECRET_KEY: Sua chave secreta do Stripe"
echo "   - STRIPE_PUBLISHABLE_KEY: Sua chave pública do Stripe"
echo ""
echo "2. Para desenvolvimento, execute:"
echo "   npm run dev"
echo ""
echo "3. Acesse a aplicação em:"
echo "   http://localhost:3000"
echo ""
echo "4. Para produção com Docker:"
echo "   docker-compose up -d"
echo ""
echo "📚 Consulte o README.md para mais informações."

