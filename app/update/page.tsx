'use client'

import { useState, useMemo } from 'react'
import { useFamilySetup } from '@/lib/context/FamilySetup'
import { calculatePillarReport, PillarReport } from '@/lib/keep-core/keep-score-v2'
import Link from 'next/link'

interface MenuEntry {
  href: string
  label: string
  description: string
  doneKey?: string
}

interface PillarMenu {
  key: string
  letter: string
  name: string
  hint: string
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
      hint: 'How your Bitcoin is held and who controls the keys.',
      report: report?.K ?? null,
      items: [
        { href: '/update/family', label: 'family', description: 'your reserve name' },
        { href: '/update/vault', label: 'vault', description: 'wallets, key setup, custody platform' },
        { href: '/update/keyholders', label: 'keyholders', description: 'who holds keys, owner/signer/protector roles' },
      ],
    },
    {
      key: 'E_estate', letter: 'E', name: 'estate integration',
      hint: 'Who inherits, what legal docs exist, and your family mission.',
      report: report?.E_estate ?? null,
      items: [
        { href: '/update/heirs', label: 'heirs', description: 'who receives your Bitcoin' },
        { href: '/update/legal', label: 'legal', description: 'trusts, wills, jurisdiction' },
        { href: '/update/charter', label: 'charter', description: 'your family\'s guiding principles' },
      ],
    },
    {
      key: 'E_continuity', letter: 'E', name: 'ensured continuity',
      hint: 'Proof that your plan still works. Drills, check-ins, and event logs.',
      report: report?.E_continuity ?? null,
      items: [
        { href: '/update/policies', label: 'policies', description: 'how often you check in and drill' },
        { href: '/update/continuity', label: 'continuity', description: 'log a check-in, drill, or event' },
      ],
    },
    {
      key: 'P', letter: 'P', name: 'professional stewardship',
      hint: 'The professionals helping protect your plan.',
      report: report?.P ?? null,
      items: [
        { href: '/update/roles', label: 'roles', description: 'advisor, attorney, CPA' },
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

  // Overall progress
  const allItems = pillars.flatMap(p => p.report?.items ?? [])
  const doneCount = allItems.filter(i => i.done).length
  const totalCount = allItems.length

  return (
    <main className="nexus">
      <div className="nexus-container">
        <div className="nexus-title">KEEP NEXUS · update</div>

        <div className="nexus-divider" />

        <p className="text-zinc-300 dark:text-zinc-300 text-sm">
          Pick a section to update. Tap any pillar to see options.
        </p>
        <p className="text-zinc-500 text-xs font-mono mt-1 mb-4">
          {doneCount}/{totalCount} complete · {totalCount - doneCount === 0 ? 'all set' : `${totalCount - doneCount} remaining`}
        </p>

        <div className="space-y-1">
          {pillars.map((pillar) => {
            const items = pillar.report?.items ?? []
            const pillarDone = items.filter(i => i.done).length
            const dots = items.map(i => (i.done ? '\u25CF' : '\u25CB')).join('')
            const pct = items.length > 0 ? pillarDone / items.length : 0
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
                  <div className="pl-2 mt-1">
                    <p className="text-zinc-500 dark:text-zinc-500 text-xs font-mono mb-2 pl-1">
                      {pillar.hint}
                    </p>
                    <div className="space-y-1">
                      {pillar.items.map(item => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className="flex items-center gap-2 py-1.5 px-1 hover:bg-zinc-100 dark:hover:bg-zinc-900/50 transition-colors rounded block"
                        >
                          <span className="text-zinc-400 dark:text-zinc-300 font-mono text-sm font-medium shrink-0">[{item.label}]</span>
                          <span className="text-zinc-500 text-xs font-mono">{item.description}</span>
                          <span className="ml-auto text-zinc-600 text-xs shrink-0">&rarr;</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div className="nexus-divider" />

        <div className="nexus-actions">
          <Link href="/dashboard" className="nexus-btn">[back to dashboard]</Link>
        </div>
      </div>
    </main>
  )
}
