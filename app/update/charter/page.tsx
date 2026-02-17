'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useFamilySetup } from '@/lib/context/FamilySetup'
import type { Charter } from '@/lib/keep-core/data-model'

export default function CharterPage() {
  const router = useRouter()
  const { setup, updateCharter } = useFamilySetup()
  const { charter } = setup

  const [mission, setMission] = useState(charter.mission)
  const [principles, setPrinciples] = useState<string[]>(charter.principles)
  const [newPrinciple, setNewPrinciple] = useState('')
  const [reviewFrequency, setReviewFrequency] = useState<'quarterly' | 'annual'>(charter.reviewFrequency)

  const addPrinciple = () => {
    const trimmed = newPrinciple.trim()
    if (trimmed) {
      setPrinciples(prev => [...prev, trimmed])
      setNewPrinciple('')
    }
  }

  const removePrinciple = (index: number) => {
    setPrinciples(prev => prev.filter((_, i) => i !== index))
  }

  const handleSave = () => {
    const updated: Charter = {
      mission: mission.trim(),
      principles,
      reviewFrequency,
      lastReviewed: charter.lastReviewed,
    }
    updateCharter(updated)
    router.push('/dashboard')
  }

  return (
    <main className="nexus">
      <div className="nexus-container">
        <div className="nexus-title">KEEP NEXUS · charter</div>

        <div className="nexus-divider" />

        {/* Mission */}
        <div className="space-y-2 mb-6">
          <label className="text-zinc-400 text-xs uppercase tracking-wider">mission</label>
          <textarea
            className="nexus-input w-full"
            rows={3}
            placeholder="Why does this reserve exist?"
            value={mission}
            onChange={e => setMission(e.target.value)}
          />
        </div>

        {/* Principles */}
        <div className="space-y-2 mb-6">
          <label className="text-zinc-400 text-xs uppercase tracking-wider">principles</label>

          {principles.length > 0 && (
            <div className="space-y-1">
              {principles.map((p, i) => (
                <div key={i} className="nexus-row">
                  <span className="nexus-row-value text-zinc-300 flex-1">{p}</span>
                  <button
                    className="text-zinc-600 hover:text-zinc-300 transition-colors ml-2 text-sm"
                    onClick={() => removePrinciple(i)}
                  >
                    [x]
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <input
              className="nexus-input flex-1"
              type="text"
              placeholder="add a principle"
              value={newPrinciple}
              onChange={e => setNewPrinciple(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addPrinciple()
                }
              }}
            />
            <button className="nexus-btn" onClick={addPrinciple}>
              [add]
            </button>
          </div>
        </div>

        {/* Review Frequency */}
        <div className="space-y-2 mb-6">
          <label className="text-zinc-400 text-xs uppercase tracking-wider">review frequency</label>
          <div className="flex gap-2">
            <button
              className={`nexus-btn ${reviewFrequency === 'quarterly' ? 'nexus-btn-primary' : ''}`}
              onClick={() => setReviewFrequency('quarterly')}
            >
              [quarterly]
            </button>
            <button
              className={`nexus-btn ${reviewFrequency === 'annual' ? 'nexus-btn-primary' : ''}`}
              onClick={() => setReviewFrequency('annual')}
            >
              [annual]
            </button>
          </div>
        </div>

        <div className="nexus-divider" />

        <div className="nexus-actions">
          <button className="nexus-btn nexus-btn-primary" onClick={handleSave}>[save]</button>
          <Link href="/update" className="nexus-btn">[cancel]</Link>
        </div>
      </div>
    </main>
  )
}
