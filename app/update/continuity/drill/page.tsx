'use client'

import { useState } from 'react'
import { useFamilySetup } from '@/lib/context/FamilySetup'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const DRILL_TYPES = ['full recovery', 'partial', 'tabletop'] as const
const OUTCOMES = ['pass', 'fail'] as const

export default function RecordDrillPage() {
  const router = useRouter()
  const { addDrillRecord } = useFamilySetup()

  const today = new Date().toISOString().split('T')[0]
  const [date, setDate] = useState(today)
  const [drillType, setDrillType] = useState<string>('full recovery')
  const [participants, setParticipants] = useState('')
  const [outcome, setOutcome] = useState<string>('pass')
  const [notes, setNotes] = useState('')

  const handleSave = () => {
    addDrillRecord({
      id: `drill-${Date.now()}`,
      date: new Date(date),
      participants: participants.split(',').map((p) => p.trim()).filter(Boolean),
      result: outcome === 'pass' ? 'passed' : 'failed',
      notes: `[${drillType}] ${notes}`.trim(),
      duration: 0,
      recoveryTime: 0,
    })
    router.push('/dashboard')
  }

  return (
    <main className="nexus">
      <div className="nexus-container">
        <div className="nexus-title">KEEP NEXUS · record drill</div>

        <div className="nexus-divider" />

        <div className="space-y-4">
          <div className="nexus-row">
            <span className="nexus-row-label">date</span>
            <input
              type="date"
              className="bg-transparent border-b border-zinc-700 text-zinc-200 focus:border-zinc-400 outline-none px-1 py-0.5 font-mono"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div>
            <div className="text-sm text-zinc-500 mb-3">type</div>
            <div className="flex gap-2">
              {DRILL_TYPES.map((type) => (
                <button
                  key={type}
                  className={drillType === type ? 'nexus-btn-primary' : 'nexus-btn'}
                  onClick={() => setDrillType(type)}
                >
                  [{type}]
                </button>
              ))}
            </div>
          </div>

          <div className="nexus-row">
            <span className="nexus-row-label">participants</span>
            <input
              type="text"
              className="bg-transparent border-b border-zinc-700 text-zinc-200 focus:border-zinc-400 outline-none px-1 py-0.5 font-mono flex-1"
              value={participants}
              onChange={(e) => setParticipants(e.target.value)}
              placeholder="name1, name2, ..."
            />
          </div>

          <div>
            <div className="text-sm text-zinc-500 mb-3">outcome</div>
            <div className="flex gap-2">
              {OUTCOMES.map((o) => (
                <button
                  key={o}
                  className={outcome === o ? 'nexus-btn-primary' : 'nexus-btn'}
                  onClick={() => setOutcome(o)}
                >
                  [{o}]
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="text-sm text-zinc-500 mb-2">notes</div>
            <textarea
              className="nexus-textarea w-full h-24"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="drill observations..."
            />
          </div>
        </div>

        <div className="nexus-divider" />

        <div className="nexus-actions">
          <button className="nexus-btn-primary" onClick={handleSave}>[save]</button>
          <Link href="/update/continuity" className="nexus-btn">[cancel]</Link>
        </div>
      </div>
    </main>
  )
}
