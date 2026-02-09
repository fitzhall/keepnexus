'use client'

import { ReactNode } from 'react'
import { LazyMotion, domAnimation, MotionConfig } from 'framer-motion'
import { FamilySetupProvider } from '@/lib/context/FamilySetup'
import { useAccessGate } from '@/lib/hooks/useAccessGate'

interface ProvidersProps {
  children: ReactNode
}

function AccessGate({ children }: { children: ReactNode }) {
  const { authorized, checking } = useAccessGate()

  if (checking) {
    return (
      <main className="nexus min-h-screen flex items-center justify-center">
        <div className="text-zinc-700 text-xs font-mono">verifying...</div>
      </main>
    )
  }

  if (!authorized) return null

  return <>{children}</>
}

export function Providers({ children }: ProvidersProps) {
  return (
    <FamilySetupProvider>
      <LazyMotion features={domAnimation} strict>
        <MotionConfig
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 30,
          }}
        >
          <AccessGate>{children}</AccessGate>
        </MotionConfig>
      </LazyMotion>
    </FamilySetupProvider>
  )
}
