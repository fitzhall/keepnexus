'use client'

import Link from 'next/link'

export default function UpdateContinuityPage() {
  return (
    <main className="nexus">
      <div className="nexus-container">
        <div className="nexus-title">KEEP NEXUS · record event</div>

        <div className="nexus-divider" />

        <p className="text-zinc-300 text-sm mb-6">What happened?</p>

        <div className="space-y-4">
          <Link href="/update/continuity/checkin" className="block">
            <div className="nexus-row hover:text-zinc-100 transition-colors">
              <span className="text-zinc-300 font-medium">[check-in]</span>
              <span className="nexus-row-value text-zinc-500">all signers verified responsive</span>
            </div>
          </Link>

          <Link href="/update/continuity/drill" className="block">
            <div className="nexus-row hover:text-zinc-100 transition-colors">
              <span className="text-zinc-300 font-medium">[drill]</span>
              <span className="nexus-row-value text-zinc-500">recovery exercise completed</span>
            </div>
          </Link>

          <Link href="/update/continuity/event" className="block">
            <div className="nexus-row hover:text-zinc-100 transition-colors">
              <span className="text-zinc-300 font-medium">[life event]</span>
              <span className="nexus-row-value text-zinc-500">marriage, move, device change, etc.</span>
            </div>
          </Link>
        </div>

        <div className="nexus-divider" />

        <div className="nexus-actions">
          <Link href="/update" className="nexus-btn">[cancel]</Link>
        </div>
      </div>
    </main>
  )
}
