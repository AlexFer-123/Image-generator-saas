'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { AuthUser, ApiResponse } from '@/types'
import axios from 'axios'
import Cookies from 'js-cookie'
import { toast } from 'react-hot-toast'

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  login: (email: string, password: string) => Promise<boolean>
  register: (name: string, email: string, password: string) => Promise<boolean>
  logout: () => void
  refreshUser: () => Promise<void>
  updateUserImages: (imagesGenerated: number) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Configurar axios interceptor para incluir token automaticamente
axios.interceptors.request.use((config) => {
  const token = Cookies.get('accessToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Interceptor para renovar token automaticamente
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = Cookies.get('refreshToken')
        if (!refreshToken) {
          throw new Error('No refresh token')
        }

        const response = await axios.post('/api/auth/refresh', {
          refreshToken
        })

        if (response.data.success) {
          const { accessToken } = response.data.data
          Cookies.set('accessToken', accessToken, { expires: 1/96 }) // 15 minutos
          originalRequest.headers.Authorization = `Bearer ${accessToken}`
          return axios(originalRequest)
        }
      } catch (refreshError) {
        // Refresh falhou, fazer logout
        Cookies.remove('accessToken')
        Cookies.remove('refreshToken')
        window.location.href = '/login'
      }
    }

    return Promise.reject(error)
  }
)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  // Carregar usuário do token ao inicializar
  const loadUser = useCallback(async () => {
    try {
      const token = Cookies.get('accessToken')
      if (!token) {
        setLoading(false)
        return
      }

      const response = await axios.get('/api/auth/me')
      if (response.data.success) {
        setUser(response.data.data)
      }
    } catch (error) {
      console.error('Erro ao carregar usuário:', error)
      // Se falhar, tentar renovar token
      const refreshToken = Cookies.get('refreshToken')
      if (refreshToken) {
        try {
          const refreshResponse = await axios.post('/api/auth/refresh', {
            refreshToken
          })
          
          if (refreshResponse.data.success) {
            const { accessToken } = refreshResponse.data.data
            Cookies.set('accessToken', accessToken, { expires: 1/96 })
            
            // Tentar carregar usuário novamente
            const userResponse = await axios.get('/api/auth/me')
            if (userResponse.data.success) {
              setUser(userResponse.data.data)
            }
          }
        } catch (refreshError) {
          // Refresh falhou, limpar tokens
          Cookies.remove('accessToken')
          Cookies.remove('refreshToken')
        }
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadUser()
  }, [loadUser])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await axios.post<ApiResponse<{
        user: AuthUser
        accessToken: string
        refreshToken: string
      }>>('/api/auth/login', { email, password })

      if (response.data.success && response.data.data) {
        const { user, accessToken, refreshToken } = response.data.data
        
        // Salvar tokens nos cookies
        Cookies.set('accessToken', accessToken, { expires: 1/96 }) // 15 minutos
        Cookies.set('refreshToken', refreshToken, { expires: 7 }) // 7 dias
        
        setUser(user)
        toast.success('Login realizado com sucesso!')
        return true
      } else {
        toast.error(response.data.message || 'Erro ao fazer login')
        return false
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao fazer login'
      toast.error(message)
      return false
    }
  }

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      const response = await axios.post<ApiResponse<{
        user: AuthUser
        accessToken: string
        refreshToken: string
      }>>('/api/auth/register', { name, email, password })

      if (response.data.success && response.data.data) {
        const { user, accessToken, refreshToken } = response.data.data
        
        // Salvar tokens nos cookies
        Cookies.set('accessToken', accessToken, { expires: 1/96 }) // 15 minutos
        Cookies.set('refreshToken', refreshToken, { expires: 7 }) // 7 dias
        
        setUser(user)
        toast.success('Conta criada com sucesso!')
        return true
      } else {
        toast.error(response.data.message || 'Erro ao criar conta')
        return false
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao criar conta'
      toast.error(message)
      return false
    }
  }

  const logout = () => {
    // Remover tokens
    Cookies.remove('accessToken')
    Cookies.remove('refreshToken')
    
    // Limpar usuário
    setUser(null)
    
    // Fazer logout no servidor (opcional - para invalidar refresh token)
    axios.post('/api/auth/logout').catch(() => {})
    
    toast.success('Logout realizado com sucesso!')
  }

  const refreshUser = async () => {
    try {
      const response = await axios.get('/api/auth/me')
      if (response.data.success) {
        setUser(response.data.data)
      }
    } catch (error) {
      console.error('Erro ao atualizar dados do usuário:', error)
    }
  }

  const updateUserImages = (imagesGenerated: number) => {
    if (user) {
      setUser({
        ...user,
        imagesGenerated
      })
    }
  }

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    refreshUser,
    updateUserImages
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
}

