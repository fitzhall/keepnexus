'use client'

import { m } from 'framer-motion'

interface LiquidLoaderProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function LiquidLoader({ size = 'md', className = '' }: LiquidLoaderProps) {
  const sizeMap = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className={`relative ${sizeMap[size]}`}>
        {/* Outer rotating ring */}
        <m.div
          className="absolute inset-0 rounded-full border-2 border-primary/20 border-t-primary"
          animate={{ rotate: 360 }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'linear',
          }}
        />

        {/* Inner pulsing dot */}
        <m.div
          className="absolute inset-2 rounded-full bg-gradient-primary"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Liquid morphing effect */}
        <m.div
          className="absolute inset-0 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(0,212,255,0.3) 0%, transparent 70%)',
            filter: 'blur(4px)',
          }}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 0.5,
          }}
        />
      </div>
    </div>
  )
}