export interface User {
  _id: string
  email: string
  name: string
  password?: string
  stripeCustomerId?: string
  subscription?: Subscription
  imagesGenerated: number
  maxImages: number
  createdAt: Date
  updatedAt: Date
}

export interface Subscription {
  _id: string
  userId: string
  stripeSubscriptionId: string
  stripePriceId: string
  status: 'active' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'trialing' | 'unpaid'
  currentPeriodStart: Date
  currentPeriodEnd: Date
  maxImages: number
  createdAt: Date
  updatedAt: Date
}

export interface GeneratedImage {
  _id: string
  userId: string
  prompt: string
  imageUrl: string
  revisedPrompt?: string
  size: '1024x1024' | '1792x1024' | '1024x1792'
  quality: 'standard' | 'hd'
  style?: 'vivid' | 'natural'
  createdAt: Date
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface AuthUser {
  id: string
  email: string
  name: string
  imagesGenerated: number
  maxImages: number
  subscription?: {
    status: string
    currentPeriodEnd: Date
  }
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export interface ImageGenerationRequest {
  prompt: string
  size?: '1024x1024' | '1792x1024' | '1024x1792'
  quality?: 'standard' | 'hd'
  style?: 'vivid' | 'natural'
}

export interface StripeProduct {
  id: string
  name: string
  description: string
  prices: StripePrice[]
}

export interface StripePrice {
  id: string
  unit_amount: number
  currency: string
  recurring?: {
    interval: 'month' | 'year'
    interval_count: number
  }
  maxImages: number
}

export interface PricingPlan {
  id: string
  name: string
  description: string
  price: number
  currency: string
  interval: 'month' | 'year'
  maxImages: number
  features: string[]
  popular?: boolean
}

