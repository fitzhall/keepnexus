import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
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
  title: 'KeepNexus - The 9-minute Bitcoin Governance OS',
  description: 'Turn any Bitcoin stack into a self-driving trust that texts your heirs, your lawyer, and your CPA—automatically.',
  keywords: 'Bitcoin, inheritance, trust, governance, multisig, security',
  authors: [{ name: 'KeepNexus Team' }],
  openGraph: {
    title: 'KeepNexus - The 9-minute Bitcoin Governance OS',
    description: 'Turn any Bitcoin stack into a self-driving trust',
    type: 'website',
    locale: 'en_US',
    url: 'https://keep.co',
    siteName: 'KeepNexus',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KeepNexus - Bitcoin Governance Made Simple',
    description: 'Turn any Bitcoin stack into a self-driving trust',
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
      <body className="bg-dark-bg text-text-primary antialiased min-h-screen">
        <Providers>
          <div className="relative">
            {/* Animated mesh gradient background */}
            <div className="fixed inset-0 bg-mesh-gradient opacity-30 pointer-events-none" />

            {/* Grid pattern overlay */}
            <div className="fixed inset-0 grid-pattern opacity-[0.02] pointer-events-none" />

            {/* Main content */}
            <main className="relative z-10">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  )
}