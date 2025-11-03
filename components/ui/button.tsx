'use client'

import * as React from 'react'
import { m, HTMLMotionProps } from 'framer-motion'
import { cn } from '@/lib/utils/cn'
import { LiquidLoader } from '@/components/animations/liquid-loader'

export interface ButtonProps extends HTMLMotionProps<'button'> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  glow?: boolean
  loading?: boolean
  children: React.ReactNode
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    className,
    variant = 'primary',
    size = 'md',
    glow = false,
    loading = false,
    disabled,
    children,
    ...props
  }, ref) => {
    const baseStyles = 'relative inline-flex items-center justify-center font-medium transition-all duration-200 focus-ring rounded-xl overflow-hidden'

    const variants = {
      primary: 'bg-gradient-to-r from-primary to-primary/80 text-white hover:from-primary/90 hover:to-primary/70',
      secondary: 'bg-gradient-to-r from-secondary to-secondary/80 text-white hover:from-secondary/90 hover:to-secondary/70',
      ghost: 'bg-glass-white backdrop-blur-md border border-glass-light text-text-primary hover:bg-glass-light',
      danger: 'bg-gradient-to-r from-danger to-danger/80 text-white hover:from-danger/90 hover:to-danger/70',
      success: 'bg-gradient-to-r from-success to-success/80 text-white hover:from-success/90 hover:to-success/70',
    }

    const sizes = {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-5 py-2.5 text-sm',
      lg: 'px-7 py-3 text-base',
      xl: 'px-9 py-4 text-lg',
    }

    const glowStyles = glow ? 'btn-glow' : ''

    return (
      <m.button
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          glowStyles,
          disabled || loading ? 'opacity-50 cursor-not-allowed' : 'hover-lift',
          className
        )}
        disabled={disabled || loading}
        whileHover={!disabled && !loading ? { scale: 1.02 } : {}}
        whileTap={!disabled && !loading ? { scale: 0.98 } : {}}
        {...props}
      >
        {/* Gradient overlay on hover */}
        <m.div
          className="absolute inset-0 bg-gradient-to-t from-white/0 to-white/10"
          initial={{ opacity: 0, y: '100%' }}
          whileHover={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        />

        {/* Content */}
        <span className="relative z-10 flex items-center gap-2">
          {loading ? (
            <LiquidLoader size="sm" />
          ) : (
            children
          )}
        </span>

        {/* Ripple effect on click */}
        {!disabled && !loading && (
          <m.span
            className="absolute inset-0 rounded-xl"
            initial={{ scale: 0, opacity: 0.5 }}
            whileTap={{ scale: 2, opacity: 0 }}
            transition={{ duration: 0.5 }}
            style={{
              background: 'radial-gradient(circle, rgba(255,255,255,0.5) 0%, transparent 70%)',
            }}
          />
        )}
      </m.button>
    )
  }
)

Button.displayName = 'Button'

export { Button }