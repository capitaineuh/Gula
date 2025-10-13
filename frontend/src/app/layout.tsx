import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import SmoothScroll from '@/components/SmoothScroll'
import AuthSessionProvider from '@/components/SessionProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Gula - Analyse de Bilans Sanguins',
  description: 'Plateforme éducative pour analyser et comprendre vos bilans sanguins',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <AuthSessionProvider>
          <SmoothScroll />
          <div className="min-h-screen bg-gray-50">
            {children}
          </div>
        </AuthSessionProvider>
      </body>
    </html>
  )
}

