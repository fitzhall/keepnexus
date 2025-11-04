/**
 * RecoveryPath - Shows which keys would be used to recover funds
 * Brutalist monochrome design
 */

import { SimulationResult } from '@/lib/risk-simulator/types'

interface RecoveryPathProps {
  result: SimulationResult
}

export function RecoveryPath({ result }: RecoveryPathProps) {

  const getOutcomeStyle = () => {
    switch (result.outcome) {
      case 'recoverable':
        return {
          bg: 'bg-white',
          border: 'border-gray-900',
          text: 'text-gray-900',
          badge: 'bg-white border border-gray-900 text-gray-900',
          icon: '✓'
        }
      case 'locked':
        return {
          bg: 'bg-gray-100',
          border: 'border-gray-900',
          text: 'text-gray-900',
          badge: 'bg-gray-900 text-white',
          icon: '✗'
        }
      case 'degraded':
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-900',
          text: 'text-gray-900',
          badge: 'bg-gray-700 text-white',
          icon: '⚠'
        }
      default:
        return {
          bg: 'bg-white',
          border: 'border-gray-300',
          text: 'text-gray-900',
          badge: 'bg-gray-100 text-gray-900',
          icon: '•'
        }
    }
  }

  const style = getOutcomeStyle()

  return (
    <div className={`border-2 ${style.border} ${style.bg} p-4`}>
      {/* Outcome Badge */}
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-mono text-gray-900">{result.scenario.name}</h4>
        <span className={`inline-flex items-center px-2 py-1 text-xs font-mono ${style.badge}`}>
          {style.icon} {result.outcome.toUpperCase()}
        </span>
      </div>

      {/* Key Availability */}
      <div className={`text-xs font-mono ${style.text} mb-2`}>
        {result.details}
      </div>

      {/* Recovery Path (if recoverable) */}
      {result.recoveryPath && result.recoveryPath.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-300">
          <div className="text-xs font-mono text-gray-600 mb-2">RECOVERY PATH:</div>
          <div className="flex items-center gap-2 flex-wrap">
            {result.recoveryPath.map((holder, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="inline-flex items-center px-2 py-1 border border-gray-900 text-xs font-mono text-gray-900">
                  {holder}
                </span>
                {index < result.recoveryPath!.length - 1 && (
                  <span className="text-gray-400 font-mono">+</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendation (if locked) */}
      {result.recommendation && (
        <div className="mt-3 pt-3 border-t border-gray-300">
          <div className="text-xs font-mono text-gray-600 mb-1">! RECOMMENDATION:</div>
          <div className="text-xs font-mono text-gray-900">
            {result.recommendation}
          </div>
        </div>
      )}
    </div>
  )
}
