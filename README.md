# AI Image Generator SaaS

Um SaaS completo para geração de imagens usando inteligência artificial, construído com Next.js, TypeScript, MongoDB e integração com OpenAI e Stripe.

## 🚀 Funcionalidades

- **Landing Page Atrativa**: Interface moderna e responsiva
- **Autenticação Completa**: Sistema JWT com refresh tokens
- **Geração de Imagens**: Integração com OpenAI DALL-E 3
- **Sistema de Pagamentos**: Integração completa com Stripe
- **Dashboard do Usuário**: Interface intuitiva para gerenciar imagens
- **Controle de Uso**: Limite de imagens por plano
- **Histórico de Imagens**: Galeria com todas as imagens geradas
- **Dockerizado**: Pronto para produção

## 🛠 Tecnologias Utilizadas

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, MongoDB, Mongoose
- **Autenticação**: JWT com refresh tokens
- **Pagamentos**: Stripe
- **IA**: OpenAI DALL-E 3
- **Containerização**: Docker, Docker Compose
- **Proxy**: Nginx

## 📋 Pré-requisitos

- Node.js 18+ 
- Docker e Docker Compose
- Conta OpenAI com API key
- Conta Stripe configurada

## 🚀 Instalação e Configuração

### 1. Clone o repositório

```bash
git clone <seu-repositorio>
cd ai-image-generator-saas
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

Crie um arquivo `.env.local` baseado no `.env.example`:

```bash
# Database
MONGODB_URI=mongodb://localhost:27017/ai-image-generator

# JWT Secrets (gere chaves seguras em produção)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-jwt-key-change-this-in-production

# Stripe
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# OpenAI
OPENAI_API_KEY=sk-your-openai-api-key

# App URL
NEXTAUTH_URL=http://localhost:3000
```

### 4. Configuração do Stripe

1. Crie produtos no Stripe Dashboard:
   - **Pro**: R$ 29/mês, 100 imagens
   - **Business**: R$ 99/mês, 500 imagens

2. Configure o webhook endpoint: `https://seu-dominio.com/api/stripe/webhook`

3. Eventos necessários no webhook:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

4. **Cartões de Teste**: O sistema está configurado para aceitar cartões de teste do Stripe mesmo em produção para fins de demonstração:
   - **Visa**: 4242 4242 4242 4242
   - **Mastercard**: 5555 5555 5555 4444
   - **American Express**: 3782 8224 6310 005
   - Use qualquer data futura e CVC válido
   - Configure `STRIPE_ALLOW_TEST_CARDS=true` no .env

## 🐳 Execução com Docker

### Desenvolvimento

```bash
# Subir apenas os serviços de banco
docker-compose -f docker-compose.dev.yml up -d

# Executar a aplicação em modo desenvolvimento
npm run dev
```

### Produção

```bash
# Configurar variáveis de ambiente no arquivo .env
cp .env.example .env

# Subir todos os serviços
docker-compose up -d
```

A aplicação estará disponível em:
- **App**: http://localhost:3000
- **MongoDB Express**: http://localhost:8081 (admin/admin123)

## 📁 Estrutura do Projeto

```
src/
├── app/                    # App Router do Next.js
│   ├── api/               # API Routes
│   │   ├── auth/          # Endpoints de autenticação
│   │   ├── images/        # Endpoints de imagens
│   │   └── stripe/        # Endpoints do Stripe
│   ├── dashboard/         # Dashboard do usuário
│   ├── login/             # Página de login
│   ├── register/          # Página de registro
│   ├── globals.css        # Estilos globais
│   ├── layout.tsx         # Layout principal
│   └── page.tsx           # Landing page
├── lib/                   # Utilitários e configurações
│   ├── contexts/          # Contextos React
│   ├── middleware/        # Middlewares de autenticação
│   ├── models/           # Modelos MongoDB
│   ├── auth.ts           # Utilitários JWT
│   ├── database.ts       # Conexão MongoDB
│   ├── openai.ts         # Integração OpenAI
│   └── stripe.ts         # Integração Stripe
├── types/                # Tipos TypeScript
└── components/           # Componentes reutilizáveis
```

## 🔐 Sistema de Autenticação

- **JWT Access Token**: Expira em 15 minutos
- **Refresh Token**: Expira em 7 dias, armazenado no banco
- **Renovação Automática**: Interceptor Axios renova tokens automaticamente
- **Segurança**: Senhas hasheadas com bcrypt, tokens seguros

## 💳 Planos e Preços

| Plano | Preço | Imagens/mês | Recursos |
|-------|-------|-------------|----------|
| Gratuito | R$ 0 | 5 | Qualidade padrão |
| Pro | R$ 29 | 100 | HD, Histórico, API |
| Business | R$ 99 | 500 | Ultra HD, Marca personalizada |

### 🧪 Cartões de Teste

O sistema inclui suporte completo para cartões de teste do Stripe, permitindo demonstrações sem cobrança real:

#### Cartões Disponíveis:
- **Visa Aprovado**: `4242 4242 4242 4242`
- **Mastercard**: `5555 5555 5555 4444` 
- **American Express**: `3782 8224 6310 005`
- **Visa Brasil**: `4000 0007 6000 0002`

#### Como Usar:
1. Use qualquer data de expiração futura (ex: 12/25)
2. Use qualquer CVC (123 para Visa/Master, 1234 para Amex)
3. Use qualquer CEP válido
4. O fluxo completo funciona, mas sem cobrança real

#### Configuração:
```bash
# No arquivo .env
STRIPE_ALLOW_TEST_CARDS=true
```

Os cartões de teste estão disponíveis na interface através do botão "Cartões de Teste" no header e seções de preços.

## 🎨 Geração de Imagens

- **Modelo**: DALL-E 3 da OpenAI
- **Formatos**: 1024x1024, 1792x1024, 1024x1792
- **Qualidades**: Standard e HD
- **Estilos**: Vivid e Natural
- **Validação**: Filtros de conteúdo automáticos

## 📊 Monitoramento e Logs

- **Rate Limiting**: Nginx com limites por IP
- **Logs**: Console logs estruturados
- **Health Check**: Endpoint `/health`
- **MongoDB Express**: Interface web para banco

## 🚀 Deploy em Produção

### 1. Configuração do Servidor

```bash
# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 2. Configuração SSL (Opcional)

```bash
# Gerar certificados Let's Encrypt
sudo apt install certbot
sudo certbot certonly --standalone -d seu-dominio.com
```

### 3. Deploy

```bash
# Clonar repositório
git clone <seu-repositorio>
cd ai-image-generator-saas

# Configurar variáveis de produção
cp .env.example .env
# Editar .env com valores reais

# Subir aplicação
docker-compose up -d
```

## 📝 Scripts Disponíveis

```bash
npm run dev          # Desenvolvimento
npm run build        # Build de produção
npm run start        # Iniciar produção
npm run lint         # Linting
npm run type-check   # Verificação de tipos
```

## 🔧 Troubleshooting

### Problemas Comuns

1. **Erro de conexão MongoDB**
   ```bash
   docker-compose logs mongo
   ```

2. **Erro OpenAI API**
   - Verificar se a API key está correta
   - Verificar créditos na conta OpenAI

3. **Erro Stripe Webhook**
   - Verificar se o endpoint está acessível
   - Verificar secret do webhook

### Logs

```bash
# Logs da aplicação
docker-compose logs app

# Logs do banco
docker-compose logs mongo

# Logs do Nginx
docker-compose logs nginx
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para detalhes.

## 📞 Suporte

Para suporte, entre em contato através do email: suporte@aiimagemaker.com

---

Desenvolvido com ❤️ usando Next.js e OpenAI
