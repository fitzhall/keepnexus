'use client'

import { useFamilySetup } from '@/lib/context/FamilySetup'
import { calculatePillarReport, type PillarReport, type PillarItem } from '@/lib/keep-core/keep-score-v2'
import Link from 'next/link'

const PILLAR_META: { key: string; letter: string; label: string }[] = [
  { key: 'K', letter: 'K', label: 'key governance' },
  { key: 'E_estate', letter: 'E', label: 'estate integration' },
  { key: 'E_continuity', letter: 'E', label: 'ensured continuity' },
  { key: 'P', letter: 'P', label: 'professional stewardship' },
]

export default function ReadinessPage() {
  const { setup } = useFamilySetup()
  const report = calculatePillarReport(setup)

  const pillars: Record<string, PillarReport> = {
    K: report.K,
    E_estate: report.E_estate,
    E_continuity: report.E_continuity,
    P: report.P,
  }

  const totalItems = Object.values(pillars).flatMap(p => p.items)
  const doneCount = totalItems.filter(i => i.done).length

  return (
    <main className="nexus">
      <div className="nexus-container">
        <div className="nexus-title">KEEP NEXUS · readiness</div>

        <div className="nexus-divider" />

        <div className="text-sm text-zinc-400 mb-6">
          {doneCount} of {totalItems.length} items configured
        </div>

        <div className="space-y-6">
          {PILLAR_META.map(meta => {
            const pillar = pillars[meta.key]
            const dots = pillar.items.map(i => (i.done ? '\u25CF' : '\u25CB')).join('')

            return (
              <div key={meta.key}>
                {/* Pillar header */}
                <div className="flex items-center gap-2 text-xs text-zinc-500 font-mono tracking-wide mb-3">
                  <span className="text-zinc-600">{'\u2500\u2500'}</span>
                  <span className="text-zinc-400 font-medium uppercase">{meta.letter}</span>
                  <span className="text-zinc-600">{'\u00B7'}</span>
                  <span className="text-zinc-500">{meta.label}</span>
                  <span className="flex-1 border-b border-zinc-800" />
                  <span className="text-zinc-500 tracking-widest">[{dots}]</span>
                </div>

                {/* Items */}
                <div className="space-y-2 pl-2">
                  {pillar.items.map((item: PillarItem, i: number) => (
                    <div key={i} className="nexus-row">
                      <span className={`w-6 text-center ${item.done ? 'text-green-500' : 'text-zinc-600'}`}>
                        [{item.done ? '\u25CF' : '\u25CB'}]
                      </span>
                      {item.done ? (
                        <span className="nexus-row-value text-zinc-400 ml-2">{item.label}</span>
                      ) : (
                        <Link
                          href={item.href || '/update'}
                          className="nexus-row-value text-zinc-300 ml-2 hover:text-zinc-100 transition-colors underline underline-offset-2 decoration-zinc-700 hover:decoration-zinc-400"
                        >
                          {item.label}
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        <div className="nexus-divider" />

        <div className="nexus-actions">
          <Link href="/dashboard" className="nexus-btn">[back]</Link>
        </div>
      </div>
    </main>
  )
}
