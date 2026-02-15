import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/react'
import './globals.css'
import { Providers } from './providers'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Keep Nexus — The Operations Layer Your Bitcoin Custody Is Missing',
  description: 'Manage and verify your Bitcoin holdings across generations. Simple. Portable. Sovereign.',
  keywords: 'Bitcoin, custody, inheritance, estate planning, multisig, governance, KEEP',
  authors: [{ name: 'Keep Nexus' }],
  openGraph: {
    title: 'Keep Nexus — Bitcoin Custody Operations',
    description: 'Manage and verify your Bitcoin holdings across generations. Simple. Portable. Sovereign.',
    type: 'website',
    locale: 'en_US',
    url: 'https://keep.co',
    siteName: 'Keep Nexus',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Keep Nexus — Bitcoin Custody Operations',
    description: 'Manage and verify your Bitcoin holdings across generations. Simple. Portable. Sovereign.',
    creator: '@keepnexus',
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png' }],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable} dark`}>
      <body className="min-h-screen antialiased">
        <Providers>
          {children}
        </Providers>
        <Analytics />
      </body>
    </html>
  )
}