import mongoose, { Schema, model, models } from 'mongoose'

const generatedImageSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  prompt: {
    type: String,
    required: [true, 'Prompt é obrigatório'],
    trim: true,
    maxlength: [1000, 'Prompt deve ter no máximo 1000 caracteres']
  },
  revisedPrompt: {
    type: String,
    trim: true,
    maxlength: [1000, 'Prompt revisado deve ter no máximo 1000 caracteres']
  },
  imageUrl: {
    type: String,
    required: [true, 'URL da imagem é obrigatória']
  },
  size: {
    type: String,
    enum: ['1024x1024', '1792x1024', '1024x1792'],
    default: '1024x1024'
  },
  quality: {
    type: String,
    enum: ['standard', 'hd'],
    default: 'standard'
  },
  style: {
    type: String,
    enum: ['vivid', 'natural'],
    default: 'vivid'
  },
  model: {
    type: String,
    default: 'dall-e-3'
  },
  cost: {
    type: Number,
    default: 1 // Número de créditos/imagens usado
  }
}, {
  timestamps: true
})

// Índices para melhor performance
generatedImageSchema.index({ userId: 1, createdAt: -1 })
generatedImageSchema.index({ createdAt: -1 })

// Método estático para buscar imagens de um usuário
generatedImageSchema.statics.findByUserId = function(userId: string, limit = 20, skip = 0) {
  return this.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip)
    .lean()
}

// Método estático para contar imagens de um usuário
generatedImageSchema.statics.countByUserId = function(userId: string) {
  return this.countDocuments({ userId })
}

// Método estático para buscar imagens de um usuário em um período
generatedImageSchema.statics.findByUserIdAndDateRange = function(
  userId: string, 
  startDate: Date, 
  endDate: Date
) {
  return this.find({
    userId,
    createdAt: {
      $gte: startDate,
      $lte: endDate
    }
  }).sort({ createdAt: -1 }).lean()
}

export default models.GeneratedImage || model('GeneratedImage', generatedImageSchema)

