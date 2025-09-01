import mongoose, { Schema, model, models } from 'mongoose'

const subscriptionSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  stripeSubscriptionId: {
    type: String,
    required: true,
    unique: true
  },
  stripePriceId: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'canceled', 'incomplete', 'incomplete_expired', 'past_due', 'trialing', 'unpaid'],
    required: true
  },
  currentPeriodStart: {
    type: Date,
    required: true
  },
  currentPeriodEnd: {
    type: Date,
    required: true
  },
  maxImages: {
    type: Number,
    required: true,
    min: 0
  },
  cancelAtPeriodEnd: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
})

// Método para verificar se a assinatura está ativa
subscriptionSchema.methods.isActive = function() {
  return this.status === 'active' && this.currentPeriodEnd > new Date()
}

// Método para verificar se a assinatura está no período de teste
subscriptionSchema.methods.isTrialing = function() {
  return this.status === 'trialing' && this.currentPeriodEnd > new Date()
}

// Método para verificar se a assinatura pode ser usada (ativa ou em teste)
subscriptionSchema.methods.canUse = function() {
  return this.isActive() || this.isTrialing()
}

export default models.Subscription || model('Subscription', subscriptionSchema)

