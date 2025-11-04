/**
 * ResilienceScore - Display resilience percentage
 * Brutalist monochrome design
 */

'use client'

interface ResilienceScoreProps {
  score: number  // 0-100
  totalScenarios: number
  recoverableScenarios: number
}

export function ResilienceScore({ score, totalScenarios, recoverableScenarios }: ResilienceScoreProps) {

  const getScoreLabel = () => {
    if (score >= 80) return 'STRONG'
    if (score >= 50) return 'MODERATE'
    return 'WEAK'
  }

  return (
    <div className="border-2 border-gray-900 bg-white p-6">
      <div className="text-xs font-mono uppercase text-gray-600 mb-3">
        Resilience Score
      </div>
      <div className="text-5xl font-mono text-gray-900 mb-3">
        {score}%
      </div>
      <div className="text-xs font-mono text-gray-600 mb-3">
        {recoverableScenarios}/{totalScenarios} recoverable
      </div>
      <div className="text-xs font-mono text-gray-900 border-t border-gray-300 pt-3">
        {getScoreLabel()}
      </div>
    </div>
  )
}
