'use client'

import * as React from 'react'
import { m } from 'framer-motion'
import { cn } from '@/lib/utils/cn'
import { GlassPanel } from '@/components/ui'
import {
  Shield,
  FileText,
  Users,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowRight,
  TrendingUp,
  Eye
} from 'lucide-react'

export type ThreatStatus = 'secure' | 'warning' | 'danger'
export type ThreatPillar = 'secure' | 'legal' | 'access' | 'future'

interface ThreatBoxProps {
  pillar: ThreatPillar
  status: ThreatStatus
  score: number
  progress: number
  issues?: string[]
  lastUpdated?: Date
  onClick?: () => void
}

const pillarConfig = {
  secure: {
    title: 'Keep it Secure',
    icon: Shield,
    description: 'Multisig wallets & key management',
    gradient: 'from-cyan-500 to-blue-500',
    actions: ['Setup Multisig', 'Rotate Keys', 'Add Signer'],
  },
  legal: {
    title: 'Establish Legal',
    icon: FileText,
    description: 'Trust documents & beneficiaries',
    gradient: 'from-purple-500 to-pink-500',
    actions: ['Generate Trust', 'Add Beneficiary', 'Sign Documents'],
  },
  access: {
    title: 'Ensure Access',
    icon: Users,
    description: 'Heir education & inheritance drills',
    gradient: 'from-emerald-500 to-teal-500',
    actions: ['Invite Heir', 'Schedule Drill', 'Update Contacts'],
  },
  future: {
    title: 'Plan Future',
    icon: Calendar,
    description: 'Tax reports & regulatory compliance',
    gradient: 'from-orange-500 to-yellow-500',
    actions: ['Export Report', 'Schedule Review', 'Update Plan'],
  },
}

const statusConfig = {
  secure: {
    icon: CheckCircle2,
    color: 'text-success',
    bgColor: 'bg-success/10',
    borderColor: 'border-success/30',
    glowColor: 'rgba(16, 185, 129, 0.3)',
    label: 'Secure',
  },
  warning: {
    icon: AlertTriangle,
    color: 'text-warning',
    bgColor: 'bg-warning/10',
    borderColor: 'border-warning/30',
    glowColor: 'rgba(245, 158, 11, 0.3)',
    label: 'Attention',
  },
  danger: {
    icon: XCircle,
    color: 'text-danger',
    bgColor: 'bg-danger/10',
    borderColor: 'border-danger/30',
    glowColor: 'rgba(239, 68, 68, 0.3)',
    label: 'Critical',
  },
}

export function ThreatBox({
  pillar,
  status,
  score,
  progress,
  issues = [],
  lastUpdated = new Date(),
  onClick,
}: ThreatBoxProps) {
  const config = pillarConfig[pillar]
  const statusInfo = statusConfig[status]
  const Icon = config.icon
  const StatusIcon = statusInfo.icon

  const [isHovered, setIsHovered] = React.useState(false)
  const [_showDetails, _setShowDetails] = React.useState(false)

  return (
    <m.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -4 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={onClick}
      className="cursor-pointer"
    >
      <GlassPanel
        variant="card"
        className={cn(
          'relative overflow-hidden transition-all duration-300',
          statusInfo.borderColor,
          'border-2'
        )}
        style={{
          boxShadow: isHovered ? `0 0 30px ${statusInfo.glowColor}` : `0 0 15px ${statusInfo.glowColor}`,
        }}
      >
        {/* Background gradient */}
        <div
          className={cn(
            'absolute inset-0 opacity-5 bg-gradient-to-br',
            config.gradient
          )}
        />

        {/* Header */}
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={cn(
                'p-3 rounded-xl',
                statusInfo.bgColor,
                'backdrop-blur-sm'
              )}>
                <Icon className={cn('w-6 h-6', statusInfo.color)} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-text-primary">
                  {config.title}
                </h3>
                <p className="text-xs text-text-muted">
                  {config.description}
                </p>
              </div>
            </div>
            <StatusIcon className={cn('w-5 h-5', statusInfo.color)} />
          </div>

          {/* Score Display */}
          <div className="mb-4">
            <div className="flex items-baseline justify-between mb-2">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-text-primary">
                  {score}
                </span>
                <span className="text-sm text-text-muted">/100</span>
              </div>
              <span className={cn('text-sm font-medium', statusInfo.color)}>
                {statusInfo.label}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="relative h-2 bg-dark-surface rounded-full overflow-hidden">
              <m.div
                className={cn('absolute inset-y-0 left-0 rounded-full bg-gradient-to-r', config.gradient)}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
              />
              {/* Animated glow on progress bar */}
              <m.div
                className="absolute inset-y-0 left-0 w-full h-full"
                style={{
                  background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)`,
                  x: '-100%',
                }}
                animate={{
                  x: ['100%', '-100%'],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              />
            </div>
          </div>

          {/* Issues/Actions */}
          {issues.length > 0 ? (
            <div className="space-y-2 mb-4">
              <p className="text-xs font-medium text-text-muted uppercase tracking-wide">
                Issues to resolve:
              </p>
              {issues.slice(0, 2).map((issue, i) => (
                <m.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * i }}
                  className="flex items-center gap-2 text-sm text-text-secondary"
                >
                  <span className="w-1 h-1 rounded-full bg-warning" />
                  {issue}
                </m.div>
              ))}
              {issues.length > 2 && (
                <p className="text-xs text-text-muted">
                  +{issues.length - 2} more issues
                </p>
              )}
            </div>
          ) : (
            <div className="mb-4">
              <p className="text-sm text-success flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                All systems operational
              </p>
            </div>
          )}

          {/* Quick Actions (show on hover) */}
          <m.div
            initial={{ opacity: 0, height: 0 }}
            animate={{
              opacity: isHovered ? 1 : 0,
              height: isHovered ? 'auto' : 0
            }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pt-4 border-t border-dark-border">
              <p className="text-xs font-medium text-text-muted uppercase tracking-wide mb-2">
                Quick Actions
              </p>
              <div className="flex flex-wrap gap-2">
                {config.actions.slice(0, 2).map((action, i) => (
                  <button
                    key={i}
                    className="px-3 py-1 text-xs bg-glass-white hover:bg-glass-light rounded-lg
                             border border-glass-light transition-colors"
                    onClick={(e) => {
                      e.stopPropagation()
                      // Handle action
                    }}
                  >
                    {action}
                  </button>
                ))}
                <button
                  className="p-1 text-xs bg-glass-white hover:bg-glass-light rounded-lg
                           border border-glass-light transition-colors"
                  onClick={(e) => {
                    e.stopPropagation()
                    _setShowDetails(true)
                  }}
                >
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </m.div>

          {/* Footer */}
          <div className="flex items-center justify-between text-xs text-text-muted pt-3 border-t border-dark-border">
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              Last checked: {new Date(lastUpdated).toLocaleTimeString()}
            </span>
            <span className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              {progress > 75 ? 'Improving' : 'Needs attention'}
            </span>
          </div>
        </div>

        {/* Animated border gradient */}
        <m.div
          className="absolute inset-0 rounded-[inherit] pointer-events-none"
          style={{
            background: `linear-gradient(90deg, transparent, ${statusInfo.glowColor}, transparent)`,
            opacity: 0.5,
          }}
          animate={{
            x: ['-200%', '200%'],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      </GlassPanel>
    </m.div>
  )
}