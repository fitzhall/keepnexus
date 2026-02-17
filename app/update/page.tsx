'use client'

import { useState, useMemo } from 'react'
import { useFamilySetup } from '@/lib/context/FamilySetup'
import { calculatePillarReport, PillarReport } from '@/lib/keep-core/keep-score-v2'
import Link from 'next/link'

interface MenuEntry {
  href: string
  label: string
  description: string
}

interface PillarMenu {
  key: string
  letter: string
  name: string
  items: MenuEntry[]
  report: PillarReport | null
}

export default function UpdateMenuPage() {
  const { setup } = useFamilySetup()

  const report = useMemo(() => {
    if (!setup.family_name) return null
    return calculatePillarReport(setup)
  }, [setup])

  const pillars: PillarMenu[] = [
    {
      key: 'K', letter: 'K', name: 'key governance',
      report: report?.K ?? null,
      items: [
        { href: '/update/family', label: 'family', description: 'reserve name' },
        { href: '/update/vault', label: 'vault', description: 'keys, multisig, custody platform' },
      ],
    },
    {
      key: 'E_estate', letter: 'E', name: 'estate integration',
      report: report?.E_estate ?? null,
      items: [
        { href: '/update/heirs', label: 'heirs', description: 'beneficiaries, allocations' },
        { href: '/update/legal', label: 'legal', description: 'jurisdiction, trust, documents' },
        { href: '/update/charter', label: 'charter', description: 'mission, principles, review cadence' },
      ],
    },
    {
      key: 'E_continuity', letter: 'E', name: 'ensured continuity',
      report: report?.E_continuity ?? null,
      items: [
        { href: '/update/policies', label: 'policies', description: 'checkin frequency, drills, triggers' },
        { href: '/update/continuity', label: 'continuity', description: 'record check-in, drill, or event' },
      ],
    },
    {
      key: 'P', letter: 'P', name: 'professional stewardship',
      report: report?.P ?? null,
      items: [
        { href: '/update/roles', label: 'roles', description: 'who has access, professionals' },
      ],
    },
  ]

  // Auto-expand first incomplete pillar
  const firstIncompleteKey = pillars.find(p => p.report && !p.report.configured)?.key ?? null

  const [expanded, setExpanded] = useState<Set<string>>(
    () => new Set(firstIncompleteKey ? [firstIncompleteKey] : [])
  )

  const togglePillar = (key: string) => {
    setExpanded(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  return (
    <main className="nexus">
      <div className="nexus-container">
        <div className="nexus-title">KEEP NEXUS · update</div>

        <div className="nexus-divider" />

        <p className="text-zinc-400 dark:text-zinc-500 text-sm mb-4">What changed?</p>

        <div className="space-y-1">
          {pillars.map((pillar) => {
            const items = pillar.report?.items ?? []
            const doneCount = items.filter(i => i.done).length
            const dots = items.map(i => (i.done ? '\u25CF' : '\u25CB')).join('')
            const pct = items.length > 0 ? doneCount / items.length : 0
            const letterColor = pct >= 0.75 ? 'text-green-500' : pct >= 0.4 ? 'text-yellow-500' : 'text-red-500'
            const isExpanded = expanded.has(pillar.key)

            return (
              <div key={pillar.key}>
                <button
                  onClick={() => togglePillar(pillar.key)}
                  className="w-full flex items-center gap-1.5 sm:gap-2 text-xs text-zinc-500 pt-4 pb-1 font-mono tracking-wide min-w-0 cursor-pointer hover:text-zinc-400 transition-colors"
                >
                  <span className="text-zinc-400 dark:text-zinc-600 hidden sm:inline">{'\u2500\u2500'}</span>
                  <span className={`${letterColor} font-medium uppercase shrink-0`}>{pillar.letter}</span>
                  <span className="text-zinc-400 dark:text-zinc-600 shrink-0">{'\u00B7'}</span>
                  <span className="text-zinc-500 truncate">{pillar.name}</span>
                  <span className="flex-1 border-b border-zinc-200 dark:border-zinc-800 hidden sm:block" />
                  {dots && <span className="text-zinc-500 tracking-widest shrink-0 ml-auto">[{dots}]</span>}
                  <span className="text-zinc-600 shrink-0 text-xs ml-1">{isExpanded ? '\u25B4' : '\u25BE'}</span>
                </button>

                {isExpanded && (
                  <div className="space-y-1 pl-2 mt-1">
                    {pillar.items.map(item => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="nexus-row hover:text-zinc-200 dark:hover:text-zinc-100 transition-colors block"
                      >
                        <span className="nexus-row-label text-zinc-400 dark:text-zinc-300 font-medium">[{item.label}]</span>
                        <span className="nexus-row-value text-zinc-500">{item.description}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div className="nexus-divider" />

        <div className="nexus-actions">
          <Link href="/dashboard" className="nexus-btn">[cancel]</Link>
        </div>
      </div>
    </main>
  )
}
