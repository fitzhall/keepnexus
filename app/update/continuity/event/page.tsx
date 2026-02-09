'use client'

import { useState } from 'react'
import { useFamilySetup } from '@/lib/context/FamilySetup'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const EVENT_TYPES = [
  'marriage',
  'divorce',
  'birth',
  'death',
  'move',
  'device change',
  'other',
] as const

export default function RecordLifeEventPage() {
  const router = useRouter()
  const { addEventLogEntry } = useFamilySetup()

  const today = new Date().toISOString().split('T')[0]
  const [eventType, setEventType] = useState<string>('marriage')
  const [date, setDate] = useState(today)
  const [description, setDescription] = useState('')
  const [actionItems, setActionItems] = useState('')

  const handleSave = () => {
    addEventLogEntry(
      'life_event',
      `Life Event: ${eventType} — ${description}\n\nAction items: ${actionItems}`.trim(),
      { date, eventType, actionItems }
    )
    router.push('/dashboard')
  }

  return (
    <main className="nexus">
      <div className="nexus-container">
        <div className="nexus-title">KEEP NEXUS · record life event</div>

        <div className="nexus-divider" />

        <div className="space-y-4">
          <div>
            <div className="text-sm text-zinc-500 mb-3">event type</div>
            <div className="flex flex-wrap gap-2">
              {EVENT_TYPES.map((type) => (
                <button
                  key={type}
                  className={eventType === type ? 'nexus-btn-primary' : 'nexus-btn'}
                  onClick={() => setEventType(type)}
                >
                  [{type}]
                </button>
              ))}
            </div>
          </div>

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
            <div className="text-sm text-zinc-500 mb-2">description</div>
            <textarea
              className="nexus-textarea w-full h-24"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="what happened..."
            />
          </div>

          <div>
            <div className="text-sm text-zinc-500 mb-2">action items</div>
            <textarea
              className="nexus-textarea w-full h-24"
              value={actionItems}
              onChange={(e) => setActionItems(e.target.value)}
              placeholder="what needs to change in the plan..."
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
