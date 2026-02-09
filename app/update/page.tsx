'use client'

import Link from 'next/link'

export default function UpdateMenuPage() {
  return (
    <main className="nexus">
      <div className="nexus-container">
        <div className="nexus-title">KEEP NEXUS · update</div>

        <div className="nexus-divider" />

        <p className="text-zinc-300 text-sm mb-6">What changed?</p>

        <div className="space-y-4">
          <Link href="/update/family" className="block">
            <div className="nexus-row hover:text-zinc-100 transition-colors">
              <span className="text-zinc-300 font-medium">[family]</span>
              <span className="nexus-row-value text-zinc-500">reserve name</span>
            </div>
          </Link>

          <Link href="/update/vault" className="block">
            <div className="nexus-row hover:text-zinc-100 transition-colors">
              <span className="text-zinc-300 font-medium">[vault]</span>
              <span className="nexus-row-value text-zinc-500">keys, multisig, custody platform</span>
            </div>
          </Link>

          <Link href="/update/heirs" className="block">
            <div className="nexus-row hover:text-zinc-100 transition-colors">
              <span className="text-zinc-300 font-medium">[heirs]</span>
              <span className="nexus-row-value text-zinc-500">beneficiaries, allocations</span>
            </div>
          </Link>

          <Link href="/update/legal" className="block">
            <div className="nexus-row hover:text-zinc-100 transition-colors">
              <span className="text-zinc-300 font-medium">[legal]</span>
              <span className="nexus-row-value text-zinc-500">jurisdiction, trust, documents</span>
            </div>
          </Link>

          <Link href="/update/roles" className="block">
            <div className="nexus-row hover:text-zinc-100 transition-colors">
              <span className="text-zinc-300 font-medium">[roles]</span>
              <span className="nexus-row-value text-zinc-500">who has access, professionals</span>
            </div>
          </Link>

          <Link href="/update/policies" className="block">
            <div className="nexus-row hover:text-zinc-100 transition-colors">
              <span className="text-zinc-300 font-medium">[policies]</span>
              <span className="nexus-row-value text-zinc-500">checkin frequency, drills, triggers</span>
            </div>
          </Link>

          <Link href="/update/charter" className="block">
            <div className="nexus-row hover:text-zinc-100 transition-colors">
              <span className="text-zinc-300 font-medium">[charter]</span>
              <span className="nexus-row-value text-zinc-500">mission, principles, review cadence</span>
            </div>
          </Link>

          <Link href="/update/continuity" className="block">
            <div className="nexus-row hover:text-zinc-100 transition-colors">
              <span className="text-zinc-300 font-medium">[continuity]</span>
              <span className="nexus-row-value text-zinc-500">record check-in, drill, or event</span>
            </div>
          </Link>
        </div>

        <div className="nexus-divider" />

        <div className="nexus-actions">
          <Link href="/dashboard" className="nexus-btn">[cancel]</Link>
        </div>
      </div>
    </main>
  )
}
