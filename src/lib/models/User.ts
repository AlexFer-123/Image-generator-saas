import mongoose, { Schema, model, models } from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new Schema({
  email: {
    type: String,
    required: [true, 'Email é obrigatório'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email inválido']
  },
  name: {
    type: String,
    required: [true, 'Nome é obrigatório'],
    trim: true,
    minlength: [2, 'Nome deve ter pelo menos 2 caracteres'],
    maxlength: [50, 'Nome deve ter no máximo 50 caracteres']
  },
  password: {
    type: String,
    required: [true, 'Senha é obrigatória'],
    minlength: [6, 'Senha deve ter pelo menos 6 caracteres']
  },
  stripeCustomerId: {
    type: String,
    unique: true,
    sparse: true
  },
  imagesGenerated: {
    type: Number,
    default: 0,
    min: 0
  },
  maxImages: {
    type: Number,
    default: 5,
    min: 0
  },
  refreshTokens: [{
    token: String,
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 604800 // 7 dias
    }
  }]
}, {
  timestamps: true
})

// Hash password antes de salvar
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next()
  
  try {
    const salt = await bcrypt.genSalt(12)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error) {
    next(error)
  }
})

// Método para comparar senha
userSchema.methods.comparePassword = async function(candidatePassword: string) {
  return bcrypt.compare(candidatePassword, this.password)
}

// Método para incrementar imagens geradas
userSchema.methods.incrementImagesGenerated = function() {
  this.imagesGenerated += 1
  return this.save()
}

// Método para verificar se pode gerar mais imagens
userSchema.methods.canGenerateImage = function() {
  return this.imagesGenerated < this.maxImages
}

// Método para resetar contador de imagens (usado quando renovar plano)
userSchema.methods.resetImageCount = function() {
  this.imagesGenerated = 0
  return this.save()
}

// Remover refresh tokens expirados
userSchema.methods.cleanExpiredTokens = function() {
  this.refreshTokens = this.refreshTokens.filter(
    (tokenObj: any) => tokenObj.createdAt.getTime() + 604800000 > Date.now()
  )
  return this.save()
}

// Adicionar refresh token
userSchema.methods.addRefreshToken = function(token: string) {
  this.refreshTokens.push({ token })
  return this.save()
}

// Remover refresh token específico
userSchema.methods.removeRefreshToken = function(token: string) {
  this.refreshTokens = this.refreshTokens.filter(
    (tokenObj: any) => tokenObj.token !== token
  )
  return this.save()
}

// Verificar se refresh token é válido
userSchema.methods.isRefreshTokenValid = function(token: string) {
  return this.refreshTokens.some(
    (tokenObj: any) => tokenObj.token === token && 
    tokenObj.createdAt.getTime() + 604800000 > Date.now()
  )
}

export default models.User || model('User', userSchema)

