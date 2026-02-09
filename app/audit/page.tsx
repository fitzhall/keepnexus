'use client'

import { useFamilySetup } from '@/lib/context/FamilySetup'
import Link from 'next/link'

function formatTimestamp(date: Date): string {
  const d = date instanceof Date ? date : new Date(date)
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

export default function AuditPage() {
  const { setup } = useFamilySetup()
  const entries = [...(setup.auditTrail || [])].reverse()

  return (
    <main className="nexus">
      <div className="nexus-container">
        <div className="nexus-title">KEEP NEXUS &middot; audit trail</div>

        <div className="nexus-divider" />

        {entries.length === 0 ? (
          <p className="text-zinc-500 text-sm font-mono">no entries recorded</p>
        ) : (
          <div className="space-y-3">
            {entries.map((entry) => (
              <div key={entry.id} className="text-sm font-mono">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="text-zinc-500">{formatTimestamp(entry.timestamp)}</span>
                  <span className="text-amber-500/80">{entry.action}</span>
                </div>
                <div className="text-zinc-400 mt-0.5 pl-1">{entry.details}</div>
                {entry.field && (
                  <div className="text-zinc-600 text-xs mt-0.5 pl-1">
                    {entry.field}: {entry.oldValue ?? '(empty)'} &rarr; {entry.newValue ?? '(empty)'}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="nexus-divider" />

        <div className="nexus-actions">
          <Link href="/dashboard" className="nexus-btn">[back]</Link>
        </div>
      </div>
    </main>
  )
}
