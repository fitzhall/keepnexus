'use client'

import { useState, useEffect } from 'react'
import { useFamilySetup } from '@/lib/context/FamilySetup'
import type { ContinuityConfig } from '@/lib/keep-core/data-model'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const FREQUENCY_OPTIONS = ['monthly', 'quarterly', 'annual'] as const

export default function CreatePoliciesPage() {
  const router = useRouter()
  const { setup, updateContinuity, addEventLogEntry } = useFamilySetup()

  const [checkinFrequency, setCheckinFrequency] = useState<string>('quarterly')
  const [drillFrequency, setDrillFrequency] = useState<string>('quarterly')

  useEffect(() => {
    if (setup.continuity) {
      if (setup.continuity.checkin_frequency) setCheckinFrequency(setup.continuity.checkin_frequency)
      if (setup.continuity.drill_frequency) setDrillFrequency(setup.continuity.drill_frequency)
    }
  }, [setup.continuity])

  const handleFinish = () => {
    const freqToDays = (f: string) => f === 'monthly' ? 30 : f === 'quarterly' ? 90 : 365

    const continuity: ContinuityConfig = {
      checkin_frequency: checkinFrequency as ContinuityConfig['checkin_frequency'],
      drill_frequency: drillFrequency as ContinuityConfig['drill_frequency'],
      notification_days: freqToDays(checkinFrequency),
    }
    updateContinuity(continuity)
    addEventLogEntry('setup.completed', `Initial KEEP shard created for ${setup.family_name}`)
    router.push('/dashboard')
  }

  return (
    <main className="nexus">
      <div className="nexus-container">
        <div className="nexus-title">KEEP NEXUS · create · 7/7 · E ensured continuity</div>

        <div className="nexus-divider" />

        <p className="text-sm text-zinc-400 mb-6">
          How often should check-ins and drills happen?
        </p>

        <div className="space-y-6">
          <div>
            <div className="text-sm text-zinc-500 mb-3">check-in frequency</div>
            <p className="text-xs text-zinc-600 mb-2">How often signers are verified responsive</p>
            <div className="flex gap-2">
              {FREQUENCY_OPTIONS.map((freq) => (
                <button
                  key={freq}
                  className={checkinFrequency === freq ? 'nexus-btn-primary' : 'nexus-btn'}
                  onClick={() => setCheckinFrequency(freq)}
                >
                  [{freq}]
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="text-sm text-zinc-500 mb-3">drill frequency</div>
            <p className="text-xs text-zinc-600 mb-2">How often recovery exercises run</p>
            <div className="flex gap-2">
              {FREQUENCY_OPTIONS.map((freq) => (
                <button
                  key={freq}
                  className={drillFrequency === freq ? 'nexus-btn-primary' : 'nexus-btn'}
                  onClick={() => setDrillFrequency(freq)}
                >
                  [{freq}]
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="nexus-divider" />

        <div className="nexus-actions">
          <Link href="/create/advisors" className="nexus-btn">[back]</Link>
          <button className="nexus-btn-primary" onClick={handleFinish}>[finish]</button>
          <Link href="/dashboard" className="nexus-btn">[cancel]</Link>
        </div>
      </div>
    </main>
  )
}
