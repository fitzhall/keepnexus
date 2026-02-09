'use client'

import { useState } from 'react'
import { useFamilySetup } from '@/lib/context/FamilySetup'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function RecordCheckinPage() {
  const router = useRouter()
  const { addScheduleEvent } = useFamilySetup()

  const today = new Date().toISOString().split('T')[0]
  const [date, setDate] = useState(today)
  const [verifiedBy, setVerifiedBy] = useState('')
  const [signersConfirmed, setSignersConfirmed] = useState('')
  const [notes, setNotes] = useState('')

  const handleSave = () => {
    addScheduleEvent({
      id: `checkin-${Date.now()}`,
      title: 'Signer Check-in',
      description: `Verified by ${verifiedBy}. Signers: ${signersConfirmed}. ${notes}`.trim(),
      date,
      type: 'review',
      completed: true,
    })
    router.push('/dashboard')
  }

  return (
    <main className="nexus">
      <div className="nexus-container">
        <div className="nexus-title">KEEP NEXUS · record check-in</div>

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

          <div className="nexus-row">
            <span className="nexus-row-label">verified by</span>
            <input
              type="text"
              className="bg-transparent border-b border-zinc-700 text-zinc-200 focus:border-zinc-400 outline-none px-1 py-0.5 font-mono flex-1"
              value={verifiedBy}
              onChange={(e) => setVerifiedBy(e.target.value)}
              placeholder="advisor name / firm"
            />
          </div>

          <div className="nexus-row">
            <span className="nexus-row-label">signers</span>
            <input
              type="text"
              className="bg-transparent border-b border-zinc-700 text-zinc-200 focus:border-zinc-400 outline-none px-1 py-0.5 font-mono flex-1"
              value={signersConfirmed}
              onChange={(e) => setSignersConfirmed(e.target.value)}
              placeholder="5 of 5"
            />
          </div>

          <div>
            <div className="text-sm text-zinc-500 mb-2">notes</div>
            <textarea
              className="nexus-textarea w-full h-24"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="any observations..."
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
