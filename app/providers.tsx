'use client'

import { ReactNode } from 'react'
import { LazyMotion, domAnimation, MotionConfig } from 'framer-motion'
import { FamilySetupProvider } from '@/lib/context/FamilySetup'
import { ThemeProvider } from '@/lib/context/Theme'

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider>
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
    </ThemeProvider>
  )
}
