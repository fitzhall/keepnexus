'use client'

import { ReactNode } from 'react'
import { LazyMotion, domAnimation, MotionConfig } from 'framer-motion'
import { FamilySetupProvider } from '@/lib/context/FamilySetup'

interface ProvidersProps {
  children: ReactNode
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
          {children}
        </MotionConfig>
      </LazyMotion>
    </FamilySetupProvider>
  )
}
