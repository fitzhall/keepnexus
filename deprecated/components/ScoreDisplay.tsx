/**
 * KEEP Score Display Component
 * Ultra-simple, text-based, terminal aesthetic
 * No animations, no colors (except critical states), pure information
 */

'use client'

import { LittleShardFile } from '@/lib/keep-core/data-model'
import { calculateKEEPScore, formatScoreForDisplay } from '@/lib/keep-core/keep-score-v2'

interface ScoreDisplayProps {
  data: LittleShardFile
  onExport: () => void
  onImport: () => void
}

export function ScoreDisplay({ data, onExport, onImport }: ScoreDisplayProps) {
  const score = calculateKEEPScore(data)

  // Calculate individual KEEP components
  const calculateKeepSecure = (d: LittleShardFile): number => {
    let score = 0
    if (d.wallets.length > 0 && d.wallets[0].threshold >= 2) score += 40
    const hwCount = d.keyholders.filter(k => k.storage_type === 'hardware-wallet').length
    score += Math.min(30, hwCount * 10)
    const avgAge = d.keyholders.length > 0
      ? d.keyholders.reduce((sum, k) => sum + k.key_age_days, 0) / d.keyholders.length
      : 999
    if (avgAge < 365) score += 30
    else if (avgAge < 730) score += 15
    return Math.min(100, score)
  }

  const calculateEstablishLegal = (d: LittleShardFile): number => {
    let score = 0
    if (d.legal_docs.has_trust) score += 40
    if (d.legal_docs.has_will) score += 30
    if (d.legal_docs.has_letter_of_instruction) score += 20
    const daysSince = Math.floor(
      (Date.now() - new Date(d.legal_docs.last_review).getTime()) / (1000 * 60 * 60 * 24)
    )
    if (daysSince < 365) score += 10
    return Math.min(100, score)
  }

  const calculateEnsureAccess = (d: LittleShardFile): number => {
    let score = 0
    if (d.redundancy.passes_3_3_3_rule) {
      score += 40
    } else {
      if (d.redundancy.device_count >= 3) score += 13
      if (d.redundancy.location_count >= 3) score += 13
      if (d.redundancy.person_count >= 3) score += 14
    }
    score += Math.min(30, d.redundancy.geographic_distribution.length * 10)
    const recentDrill = d.drills.find(dr => {
      const days = Math.floor((Date.now() - new Date(dr.timestamp).getTime()) / (1000 * 60 * 60 * 24))
      return days < 90 && dr.success
    })
    if (recentDrill) score += 30
    return Math.min(100, score)
  }

  const calculatePlanFuture = (d: LittleShardFile): number => {
    let score = 0
    if (d.education.heirs_trained) score += 40
    score += Math.min(30, d.education.trained_heirs.length * 10)
    const successfulDrills = d.drills.filter(dr => dr.success).length
    score += Math.min(30, successfulDrills * 10)
    return Math.min(100, score)
  }

  const k = calculateKeepSecure(data)
  const e1 = calculateEstablishLegal(data)
  const e2 = calculateEnsureAccess(data)
  const p = calculatePlanFuture(data)

  const getStatus = (val: number): { text: string; critical: boolean } => {
    if (val >= 80) return { text: '[GOOD]    ', critical: false }
    if (val >= 60) return { text: '[OK]      ', critical: false }
    if (val >= 40) return { text: '[IMPROVE] ', critical: false }
    return { text: '[CRITICAL]', critical: true }
  }

  return (
    <div className="font-mono text-sm text-gray-900">
      {/* Main Score Box */}
      <div className="border border-gray-800 p-4 mb-4 bg-white">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="text-3xl font-bold text-gray-900">KEEP SCORE: {score.value}</div>
            <div className="text-xs text-gray-600 mt-1">
              {data.family_name} • Last updated: {new Date(score.calculated_at).toLocaleDateString()}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onExport}
              className="px-3 py-1 border border-gray-800 hover:bg-gray-100 text-gray-900"
            >
              [EXPORT]
            </button>
            <button
              onClick={onImport}
              className="px-3 py-1 border border-gray-800 hover:bg-gray-100 text-gray-900"
            >
              [IMPORT]
            </button>
          </div>
        </div>

        {/* KEEP Components */}
        <div className="space-y-1 text-gray-900">
          <div className="flex justify-between">
            <span>K: Keep Secure............</span>
            <span>
              {k.toString().padStart(3)}
              <span className={getStatus(k).critical ? 'text-red-600' : 'text-gray-700'}>
                {getStatus(k).text}
              </span>
            </span>
          </div>
          <div className="flex justify-between">
            <span>E: Establish Legal........</span>
            <span>
              {e1.toString().padStart(3)}
              <span className={getStatus(e1).critical ? 'text-red-600' : 'text-gray-700'}>
                {getStatus(e1).text}
              </span>
            </span>
          </div>
          <div className="flex justify-between">
            <span>E: Ensure Access..........</span>
            <span>
              {e2.toString().padStart(3)}
              <span className={getStatus(e2).critical ? 'text-red-600' : 'text-gray-700'}>
                {getStatus(e2).text}
              </span>
            </span>
          </div>
          <div className="flex justify-between">
            <span>P: Plan Future............</span>
            <span>
              {p.toString().padStart(3)}
              <span className={getStatus(p).critical ? 'text-red-600' : 'text-gray-700'}>
                {getStatus(p).text}
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="border border-gray-800 p-4 bg-white">
        <div className="text-xs font-bold mb-2 text-gray-900">RECOMMENDATIONS:</div>
        <div className="space-y-1">
          {score.recommendations.length > 0 ? (
            score.recommendations.map((rec, i) => (
              <div key={i} className="text-xs text-gray-700">
                {i + 1}. {rec}
              </div>
            ))
          ) : (
            <div className="text-xs text-gray-600">
              All systems optimal. Schedule quarterly review.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}