/**
 * RiskCell - Individual cell in the risk matrix
 * Brutalist monochrome design
 */

'use client'

interface RiskCellProps {
  isAvailable: boolean
  isCompromised?: boolean
}

export function RiskCell({ isAvailable, isCompromised = false }: RiskCellProps) {

  // Determine cell appearance based on state
  const getStyle = () => {
    if (isCompromised) {
      return {
        bg: 'bg-gray-200',
        text: 'text-gray-900',
        border: 'border-gray-400',
        icon: '⚠'
      }
    }

    if (isAvailable) {
      return {
        bg: 'bg-white',
        text: 'text-gray-900',
        border: 'border-gray-300',
        icon: '✓'
      }
    }

    return {
      bg: 'bg-gray-100',
      text: 'text-gray-900',
      border: 'border-gray-300',
      icon: '✗'
    }
  }

  const style = getStyle()

  return (
    <td className={`p-4 text-center border ${style.border} ${style.bg}`}>
      <span className={`text-lg font-medium ${style.text}`}>
        {style.icon}
      </span>
    </td>
  )
}
