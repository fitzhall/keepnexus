'use client'

import { useState, useEffect } from 'react'
import { useFamilySetup } from '@/lib/context/FamilySetup'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const FREQUENCY_OPTIONS = ['monthly', 'quarterly', 'annual'] as const

const LIFE_EVENT_OPTIONS = [
  { key: 'marriage_divorce', label: 'marriage / divorce' },
  { key: 'birth_death', label: 'birth / death' },
  { key: 'move', label: 'move' },
  { key: 'device_change', label: 'device change' },
  { key: 'other', label: 'other' },
]

export default function UpdatePoliciesPage() {
  const router = useRouter()
  const { setup, updateDrillSettings } = useFamilySetup()

  const [checkinFrequency, setCheckinFrequency] = useState<string>('quarterly')
  const [drillFrequency, setDrillFrequency] = useState<string>('monthly')
  const [triggers, setTriggers] = useState<Record<string, boolean>>({
    marriage_divorce: false,
    birth_death: false,
    move: false,
    device_change: false,
    other: false,
  })
  const [otherText, setOtherText] = useState('')

  useEffect(() => {
    if (setup.drillSettings) {
      setDrillFrequency(setup.drillSettings.frequency || 'monthly')
    }
  }, [setup.drillSettings])

  const handleSave = () => {
    updateDrillSettings({
      ...setup.drillSettings,
      frequency: drillFrequency as 'monthly' | 'quarterly',
      notificationDays: checkinFrequency === 'monthly' ? 30 : checkinFrequency === 'quarterly' ? 90 : 365,
    })
    router.push('/dashboard')
  }

  return (
    <main className="nexus">
      <div className="nexus-container">
        <div className="nexus-title">KEEP NEXUS · update policies</div>

        <div className="nexus-divider" />

        {/* Checkin Frequency */}
        <div className="space-y-6">
          <div>
            <div className="text-sm text-zinc-500 mb-3">checkin frequency</div>
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

          {/* Drill Frequency */}
          <div>
            <div className="text-sm text-zinc-500 mb-3">drill frequency</div>
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

          {/* Life Event Triggers */}
          <div>
            <div className="text-sm text-zinc-500 mb-3">life event triggers</div>
            <div className="space-y-3">
              {LIFE_EVENT_OPTIONS.map((option) => (
                <label key={option.key} className="flex items-center gap-3 text-sm text-zinc-300 cursor-pointer">
                  <input
                    type="checkbox"
                    className="nexus-checkbox"
                    checked={triggers[option.key] || false}
                    onChange={(e) =>
                      setTriggers((prev) => ({ ...prev, [option.key]: e.target.checked }))
                    }
                  />
                  {option.label}
                </label>
              ))}
              {triggers.other && (
                <input
                  type="text"
                  className="bg-transparent border-b border-zinc-700 text-zinc-200 focus:border-zinc-400 outline-none px-1 py-0.5 font-mono w-full mt-1"
                  value={otherText}
                  onChange={(e) => setOtherText(e.target.value)}
                  placeholder="describe trigger..."
                />
              )}
            </div>
          </div>
        </div>

        <div className="nexus-divider" />

        <div className="nexus-actions">
          <button className="nexus-btn-primary" onClick={handleSave}>[save]</button>
          <Link href="/update" className="nexus-btn">[cancel]</Link>
        </div>
      </div>
    </main>
  )
}
