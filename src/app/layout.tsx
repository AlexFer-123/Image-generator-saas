import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '@/lib/contexts/AuthContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AI Image Generator - Crie imagens incríveis com IA',
  description: 'Gere imagens únicas e profissionais usando inteligência artificial. Transforme suas ideias em arte visual com nosso gerador de imagens AI.',
  keywords: 'gerador de imagens, inteligência artificial, AI, arte digital, criação de imagens',
  authors: [{ name: 'AI Image Generator Team' }],
  openGraph: {
    title: 'AI Image Generator - Crie imagens incríveis com IA',
    description: 'Transforme suas ideias em arte visual com nosso gerador de imagens AI.',
    type: 'website',
    url: 'https://aiimagemaker.com',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Image Generator - Crie imagens incríveis com IA',
    description: 'Transforme suas ideias em arte visual com nosso gerador de imagens AI.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <AuthProvider>
          {children}
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#4ade80',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 5000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  )
}

