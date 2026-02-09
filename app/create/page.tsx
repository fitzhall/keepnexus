'use client'

import Link from 'next/link'

export default function CreatePage() {
  return (
    <main className="nexus">
      <div className="nexus-container">
        <div className="nexus-title">KEEP NEXUS · create</div>

        <div className="nexus-divider" />

        <p className="text-zinc-300 text-sm leading-relaxed">
          Let&apos;s set up your Bitcoin inheritance plan.
        </p>
        <p className="text-zinc-500 text-sm mt-2">
          This takes about 5 minutes.
        </p>

        <div className="nexus-divider" />

        <div className="nexus-actions">
          <Link href="/create/family" className="nexus-btn-primary">[start]</Link>
          <Link href="/import" className="nexus-btn">[import existing]</Link>
          <Link href="/dashboard" className="nexus-btn">[cancel]</Link>
        </div>
      </div>
    </main>
  )
}
