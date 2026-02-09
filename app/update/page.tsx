'use client'

import Link from 'next/link'

interface MenuEntry {
  href: string
  label: string
  description: string
}

const PILLARS: { letter: string; name: string; items: MenuEntry[] }[] = [
  {
    letter: 'K',
    name: 'key governance',
    items: [
      { href: '/update/family', label: 'family', description: 'reserve name' },
      { href: '/update/vault', label: 'vault', description: 'keys, multisig, custody platform' },
    ],
  },
  {
    letter: 'E',
    name: 'estate integration',
    items: [
      { href: '/update/heirs', label: 'heirs', description: 'beneficiaries, allocations' },
      { href: '/update/legal', label: 'legal', description: 'jurisdiction, trust, documents' },
      { href: '/update/charter', label: 'charter', description: 'mission, principles, review cadence' },
    ],
  },
  {
    letter: 'E',
    name: 'ensured continuity',
    items: [
      { href: '/update/policies', label: 'policies', description: 'checkin frequency, drills, triggers' },
      { href: '/update/continuity', label: 'continuity', description: 'record check-in, drill, or event' },
    ],
  },
  {
    letter: 'P',
    name: 'professional stewardship',
    items: [
      { href: '/update/roles', label: 'roles', description: 'who has access, professionals' },
    ],
  },
]

export default function UpdateMenuPage() {
  return (
    <main className="nexus">
      <div className="nexus-container">
        <div className="nexus-title">KEEP NEXUS · update</div>

        <div className="nexus-divider" />

        <p className="text-zinc-300 text-sm mb-6">What changed?</p>

        <div className="space-y-6">
          {PILLARS.map((pillar, pi) => (
            <div key={pi}>
              {/* Pillar header */}
              <div className="flex items-center gap-2 text-xs text-zinc-500 font-mono tracking-wide mb-3">
                <span className="text-zinc-600">{'\u2500\u2500'}</span>
                <span className="text-zinc-400 font-medium uppercase">{pillar.letter}</span>
                <span className="text-zinc-600">{'\u00B7'}</span>
                <span className="text-zinc-500">{pillar.name}</span>
                <span className="flex-1 border-b border-zinc-800" />
              </div>

              {/* Menu items */}
              <div className="space-y-3 pl-2">
                {pillar.items.map(item => (
                  <Link key={item.href} href={item.href} className="block">
                    <div className="nexus-row hover:text-zinc-100 transition-colors">
                      <span className="text-zinc-300 font-medium">[{item.label}]</span>
                      <span className="nexus-row-value text-zinc-500">{item.description}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="nexus-divider" />

        <div className="nexus-actions">
          <Link href="/dashboard" className="nexus-btn">[cancel]</Link>
        </div>
      </div>
    </main>
  )
}
