import jwt from 'jsonwebtoken'
import { AuthTokens, AuthUser } from '@/types'

const JWT_SECRET = process.env.JWT_SECRET!
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!

if (!JWT_SECRET || !JWT_REFRESH_SECRET) {
  throw new Error('JWT secrets must be defined in environment variables')
}

export interface JWTPayload {
  userId: string
  email: string
  name: string
  iat?: number
  exp?: number
}

// Gerar tokens de acesso e refresh
export function generateTokens(user: AuthUser): AuthTokens {
  const payload: JWTPayload = {
    userId: user.id,
    email: user.email,
    name: user.name
  }

  const accessToken = jwt.sign(payload, JWT_SECRET, {
    expiresIn: '15m' // Token de acesso expira em 15 minutos
  })

  const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: '7d' // Refresh token expira em 7 dias
  })

  return {
    accessToken,
    refreshToken
  }
}

// Verificar token de acesso
export function verifyAccessToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch (error) {
    return null
  }
}

// Verificar refresh token
export function verifyRefreshToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET) as JWTPayload
  } catch (error) {
    return null
  }
}

// Extrair token do header Authorization
export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  return authHeader.substring(7)
}

// Gerar novo access token usando refresh token
export function refreshAccessToken(refreshToken: string): string | null {
  const payload = verifyRefreshToken(refreshToken)
  if (!payload) {
    return null
  }

  const newPayload: JWTPayload = {
    userId: payload.userId,
    email: payload.email,
    name: payload.name
  }

  return jwt.sign(newPayload, JWT_SECRET, {
    expiresIn: '15m'
  })
}

// Verificar se token está expirado (mas ainda válido para refresh)
export function isTokenExpired(token: string): boolean {
  try {
    jwt.verify(token, JWT_SECRET)
    return false
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      return true
    }
    return false
  }
}

// Decodificar token sem verificar (útil para extrair payload de tokens expirados)
export function decodeToken(token: string): JWTPayload | null {
  try {
    return jwt.decode(token) as JWTPayload
  } catch (error) {
    return null
  }
}

