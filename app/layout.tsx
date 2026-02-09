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
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="bg-zinc-950 text-zinc-50 antialiased min-h-screen">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}