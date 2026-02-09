/**
 * KEEP Score Widget for Main Dashboard
 * Compact version of the score display
 * Shows the essential K.E.E.P metrics at a glance
 */

'use client'

import { useState, useEffect } from 'react'
import { useFamilySetup } from '@/lib/context/FamilySetup'

interface KEEPScoreWidgetProps {
  onScoreUpdate?: (score: { value: number; k: number; e1: number; e2: number; p: number }) => void
}

export function KEEPScoreWidget({ onScoreUpdate }: KEEPScoreWidgetProps) {
  // Use shared context data instead of separate localStorage
  const { setup } = useFamilySetup()
  const [score, setScore] = useState(0)

  // Calculate individual components based on context data
  const getComponents = () => {
    // Quick scoring based on available context data
    let k = 0, e1 = 0, e2 = 0, p = 0

    // K - Keep Secure (based on wallet/keyholder setup)
    const wallet = setup.wallets?.[0]
    if (wallet) {
      if (wallet.threshold >= 2) k += 40
      const hwCount = setup.keyholders?.filter(kh =>
        kh.storage_type === 'hardware-wallet'
      ).length ?? 0
      k += Math.min(30, hwCount * 10)
      if (wallet.total_keys >= 3) k += 30
    }
    k = Math.min(100, k)

    // E - Establish Legal (based on legal data)
    if (setup.legal) {
      if (setup.legal.trust_name) e1 += 40
      if (setup.legal.trustee_names && setup.legal.trustee_names.length > 0) e1 += 30
      if (setup.legal.last_review) e1 += 30
    }
    e1 = Math.min(100, e1)

    // E - Ensure Access (based on drills and distribution)
    if (setup.drills && setup.drills.length > 0) {
      e2 += 30
      const recentDrill = setup.drills[setup.drills.length - 1]
      if (recentDrill && recentDrill.success) e2 += 30
    }
    if (setup.keyholders && setup.keyholders.length >= 3) {
      const locations = new Set(setup.keyholders.map(kh => kh.location))
      e2 += Math.min(30, locations.size * 10)
    }
    e2 = Math.min(100, e2)

    // P - Plan Future (based on heirs)
    if (setup.heirs && setup.heirs.length > 0) {
      p += 40
      p += Math.min(30, setup.heirs.length * 10)
      // Check for key holder heirs (as proxy for training)
      const keyHolderCount = setup.heirs.filter(h => h.isKeyHolder).length
      p += Math.min(30, keyHolderCount * 10)
    }
    p = Math.min(100, p)

    return { k, e1, e2, p }
  }

  useEffect(() => {
    // Calculate score from context data
    const components = getComponents()
    const totalScore = Math.round((components.k + components.e1 + components.e2 + components.p) / 4)
    setScore(totalScore)

    // Notify parent
    if (onScoreUpdate) {
      onScoreUpdate({ value: totalScore, ...components })
    }
  }, [setup])

  const { k, e1, e2, p } = getComponents()

  const getScoreColor = (val: number) => {
    if (val >= 80) return 'text-green-700'
    if (val >= 60) return 'text-yellow-700'
    if (val >= 40) return 'text-orange-700'
    return 'text-red-700'
  }

  return (
    <div className="bg-white border-2 border-gray-900 p-6">
      {/* Just the score number, huge and centered */}
      <div className="text-center mb-4">
        <div className={`text-5xl font-bold ${getScoreColor(score)}`}>
          {score}
        </div>
      </div>

      {/* Simple progress bars for each component */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-900 font-semibold w-4">K</span>
          <div className="flex-1 bg-gray-200 h-2">
            <div className={`h-full ${k >= 80 ? 'bg-green-700' : k >= 40 ? 'bg-yellow-600' : 'bg-red-600'}`} style={{ width: `${k}%` }} />
          </div>
          <span className="text-xs text-gray-900 font-medium w-8 text-right">{k}%</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-900 font-semibold w-4">E₁</span>
          <div className="flex-1 bg-gray-200 h-2">
            <div className={`h-full ${e1 >= 80 ? 'bg-green-700' : e1 >= 40 ? 'bg-yellow-600' : 'bg-red-600'}`} style={{ width: `${e1}%` }} />
          </div>
          <span className="text-xs text-gray-900 font-medium w-8 text-right">{e1}%</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-900 font-semibold w-4">E₂</span>
          <div className="flex-1 bg-gray-200 h-2">
            <div className={`h-full ${e2 >= 80 ? 'bg-green-700' : e2 >= 40 ? 'bg-yellow-600' : 'bg-red-600'}`} style={{ width: `${e2}%` }} />
          </div>
          <span className="text-xs text-gray-900 font-medium w-8 text-right">{e2}%</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-900 font-semibold w-4">P</span>
          <div className="flex-1 bg-gray-200 h-2">
            <div className={`h-full ${p >= 80 ? 'bg-green-700' : p >= 40 ? 'bg-yellow-600' : 'bg-red-600'}`} style={{ width: `${p}%` }} />
          </div>
          <span className="text-xs text-gray-900 font-medium w-8 text-right">{p}%</span>
        </div>
      </div>
    </div>
  )
}