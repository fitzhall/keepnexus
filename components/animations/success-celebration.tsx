'use client'

import { m, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Check, Sparkles } from 'lucide-react'

interface SuccessCelebrationProps {
  show: boolean
  message?: string
  onComplete?: () => void
}

export function SuccessCelebration({
  show,
  message = 'Success!',
  onComplete
}: SuccessCelebrationProps) {
  const [particles, setParticles] = useState<number[]>([])

  useEffect(() => {
    if (show) {
      setParticles(Array.from({ length: 12 }, (_, i) => i))
      const timer = setTimeout(() => {
        onComplete?.()
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [show, onComplete])

  return (
    <AnimatePresence>
      {show && (
        <m.div
          className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop blur */}
          <m.div
            className="absolute inset-0 bg-dark-bg/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Success container */}
          <m.div
            className="relative"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{
              type: 'spring',
              stiffness: 200,
              damping: 15,
            }}
          >
            {/* Glowing circle background */}
            <m.div
              className="absolute inset-0 w-32 h-32 rounded-full bg-success/20 blur-2xl"
              animate={{
                scale: [1, 2, 1.5],
                opacity: [0.5, 0.8, 0],
              }}
              transition={{
                duration: 2,
                ease: 'easeOut',
              }}
            />

            {/* Success icon */}
            <div className="relative w-32 h-32 flex items-center justify-center">
              <m.div
                className="absolute inset-0 rounded-full bg-gradient-to-br from-success to-success/50"
                animate={{
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 0.5,
                  repeat: 2,
                }}
              />
              <Check className="relative z-10 w-16 h-16 text-white" strokeWidth={3} />
            </div>

            {/* Particles */}
            {particles.map((i) => (
              <m.div
                key={i}
                className="absolute top-1/2 left-1/2 w-2 h-2"
                initial={{
                  x: 0,
                  y: 0,
                }}
                animate={{
                  x: Math.cos((i * 30) * Math.PI / 180) * 120,
                  y: Math.sin((i * 30) * Math.PI / 180) * 120,
                  opacity: [1, 0],
                }}
                transition={{
                  duration: 1.5,
                  ease: 'easeOut',
                  delay: i * 0.05,
                }}
              >
                <Sparkles className="w-3 h-3 text-primary" />
              </m.div>
            ))}
          </m.div>

          {/* Success message */}
          <m.div
            className="absolute bottom-1/3 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: 0.5 }}
          >
            <p className="text-2xl font-bold gradient-text">{message}</p>
          </m.div>
        </m.div>
      )}
    </AnimatePresence>
  )
}