/**
 * RiskCell - Individual cell in the risk matrix
 * 3-state visualization system for clear risk assessment
 */

'use client'

interface RiskCellProps {
  isAvailable: boolean
  isCompromised?: boolean
  isAffected?: boolean  // New prop to distinguish between affected and not applicable
}

export function RiskCell({ isAvailable, isCompromised = false, isAffected = true }: RiskCellProps) {

  // Determine cell appearance based on state
  const getStyle = () => {
    // Compromised state (security breach)
    if (isCompromised) {
      return {
        bg: 'bg-yellow-50',
        text: 'text-yellow-700',
        border: 'border-yellow-300',
        icon: '⚠',
        label: 'COMPROMISED'
      }
    }

    // Not affected by scenario (not applicable)
    if (!isAffected) {
      return {
        bg: 'bg-gray-50',
        text: 'text-gray-400',
        border: 'border-gray-200',
        icon: '—',
        label: 'NOT APPLICABLE'
      }
    }

    // Available (key can be used)
    if (isAvailable) {
      return {
        bg: 'bg-green-50',
        text: 'text-green-700',
        border: 'border-green-300',
        icon: '✓',
        label: 'AVAILABLE'
      }
    }

    // Unavailable (key cannot be used due to scenario)
    return {
      bg: 'bg-red-50',
      text: 'text-red-700',
      border: 'border-red-300',
      icon: '✗',
      label: 'UNAVAILABLE'
    }
  }

  const style = getStyle()

  return (
    <td className={`p-4 text-center border-2 ${style.border} ${style.bg} transition-all`}>
      <span className={`text-xl font-bold ${style.text}`} title={style.label}>
        {style.icon}
      </span>
    </td>
  )
}
