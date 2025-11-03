'use client'

import { ReactNode } from 'react'
import { LazyMotion, domAnimation, MotionConfig } from 'framer-motion'

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
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
  )
}