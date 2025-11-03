'use client'

import * as React from 'react'
import { m, HTMLMotionProps } from 'framer-motion'
import { cn } from '@/lib/utils/cn'

export interface GlassPanelProps extends HTMLMotionProps<'div'> {
  variant?: 'default' | 'card' | 'dialog' | 'overlay'
  blur?: 'none' | 'light' | 'medium' | 'heavy'
  glow?: boolean
  hover?: boolean
  children: React.ReactNode
}

const GlassPanel = React.forwardRef<HTMLDivElement, GlassPanelProps>(
  ({
    className,
    variant = 'default',
    blur = 'medium',
    glow = false,
    hover = false,
    children,
    ...props
  }, ref) => {
    const baseStyles = 'relative overflow-hidden transition-all duration-300'

    const variants = {
      default: 'bg-glass-white border border-glass-light rounded-2xl',
      card: 'bg-glass-white border border-glass-light rounded-2xl p-6',
      dialog: 'bg-dark-surface/90 border border-dark-border rounded-3xl p-8',
      overlay: 'bg-dark-bg/50 border border-glass-light rounded-xl p-4',
    }

    const blurStyles = {
      none: '',
      light: 'backdrop-light',
      medium: 'backdrop-medium',
      heavy: 'backdrop-heavy',
    }

    const glowStyles = glow ? 'shadow-glow-md' : ''
    const hoverStyles = hover ? 'hover:bg-glass-light hover:border-primary/30 hover:shadow-glow-sm' : ''

    return (
      <m.div
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          blurStyles[blur],
          glowStyles,
          hoverStyles,
          className
        )}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        {...props}
      >
        {/* Gradient border effect */}
        <div className="absolute inset-0 rounded-[inherit] bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 animate-gradient-shift opacity-50 pointer-events-none" />

        {/* Content */}
        <div className="relative z-10">
          {children}
        </div>

        {/* Inner glow effect on hover */}
        {hover && (
          <m.div
            className="absolute inset-0 rounded-[inherit] pointer-events-none"
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            style={{
              boxShadow: 'inset 0 0 30px rgba(0, 212, 255, 0.1)',
            }}
          />
        )}
      </m.div>
    )
  }
)

GlassPanel.displayName = 'GlassPanel'

export { GlassPanel }