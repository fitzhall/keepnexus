'use client'

import { useState, useMemo } from 'react'
import { useFamilySetup } from '@/lib/context/FamilySetup'
import { exportToJSON, FILE_EXTENSION } from '@/lib/keep-core/little-shard'
import { calculatePillarReport } from '@/lib/keep-core/keep-score-v2'
import { PillarHeader } from './PillarHeader'
import { ThemeToggle } from './ThemeToggle'
import { InfoTip } from './InfoTip'
import Link from 'next/link'

type PillarKey = 'K' | 'E_estate' | 'E_continuity' | 'P'

export function MainView() {
  const { setup } = useFamilySetup()
  const [copied, setCopied] = useState(false)

  const report = useMemo(() => {
    if (!setup.family_name) return null
    return calculatePillarReport(setup)
  }, [setup])

  // Determine which pillar to auto-expand (first incomplete one)
  const firstIncompletePillar = useMemo<PillarKey | null>(() => {
    if (!report) return null
    const order: PillarKey[] = ['K', 'E_estate', 'E_continuity', 'P']
    return order.find(k => !report[k].configured) ?? null
  }, [report])

  const [expanded, setExpanded] = useState<Set<PillarKey>>(
    () => new Set(firstIncompletePillar ? [firstIncompletePillar] : [])
  )

  if (!setup.family_name || setup.family_name === '' || !report) {
    return <EmptyState />
  }

  const togglePillar = (key: PillarKey) => {
    setExpanded(prev => {
      const next = new Set(prev)
      if (next.has(key)) {
        next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
  }

  // Heirs display
  const heirsDisplay = setup.heirs?.length > 0
    ? setup.heirs.map(h => `${h.name} ${h.allocation}%`).join(' · ')
    : 'none'

  // Legal display
  const legalParts: string[] = []
  if (setup.legal.jurisdiction) legalParts.push(setup.legal.jurisdiction)
  if (setup.legal.has_trust) legalParts.push('trust ✓')
  if (setup.legal.rufadaa_filed) legalParts.push('RUFADAA ✓')
  if (setup.legal.bitcoin_in_docs) legalParts.push('BTC in docs ✓')
  const legalDisplay = legalParts.length > 0 ? legalParts.join(' · ') : 'not configured'

  // Last check display
  const lastCheckDisplay = setup.continuity.last_drill
    ? `${new Date(setup.continuity.last_drill).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} · all signers verified`
    : 'no check-ins recorded'

  // Derive status from pillar completeness
  const allItems = [
    ...report.K.items,
    ...report.E_estate.items,
    ...report.E_continuity.items,
    ...report.P.items,
  ]
  const doneCount = allItems.filter(i => i.done).length
  const totalCount = allItems.length
  const pct = totalCount > 0 ? doneCount / totalCount : 0

  const status = pct >= 0.75 ? 'healthy' : pct >= 0.4 ? 'attention' : 'critical'
  const statusLabel = pct >= 0.75
    ? `healthy · ${doneCount}/${totalCount}`
    : pct >= 0.4
      ? `needs attention · ${doneCount}/${totalCount}`
      : `incomplete · ${doneCount}/${totalCount}`

  // THAP display
  const thapDisplay = setup.thap.current_hash
    ? setup.thap.current_hash.slice(0, 16) + '...'
    : 'calculating...'

  const lastChanged = setup.thap.history.length > 0
    ? new Date(setup.thap.history[setup.thap.history.length - 1].timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : setup.thap.current_hash ? 'current' : '—'

  const handleCopyHash = () => {
    if (!setup.thap.current_hash) return
    navigator.clipboard.writeText(setup.thap.current_hash).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const handleExport = () => {
    const json = exportToJSON(setup)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    const date = new Date().toISOString().split('T')[0]
    link.href = url
    link.download = `${setup.family_name.toLowerCase().replace(/\s+/g, '-')}-${date}${FILE_EXTENSION}`
    link.click()
    URL.revokeObjectURL(url)
  }

  // Professionals display
  const proEntries: { role: string; name: string }[] = []
  if (setup.professionals.advisor?.name) proEntries.push({ role: 'advisor', name: setup.professionals.advisor.name })
  if (setup.professionals.attorney?.name) proEntries.push({ role: 'attorney', name: setup.professionals.attorney.name })
  if (setup.professionals.cpa?.name) proEntries.push({ role: 'CPA', name: setup.professionals.cpa.name })

  // Find first incomplete item for the nudge
  const firstIncomplete = allItems.find(i => !i.done)

  // Last modified display
  const lastModified = setup.last_modified
    ? new Date(setup.last_modified).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : '—'

  return (
    <main className="nexus">
      <div className="nexus-container">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="nexus-title">KEEP NEXUS</div>
          <ThemeToggle />
        </div>
        <div className="nexus-family">{setup.family_name}</div>

        <div className="nexus-divider" />

        {/* Shard status bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-1">
          <div className="nexus-status">
            <span className={`nexus-status-dot ${status}`} />
            <span className="text-sm text-zinc-500 dark:text-zinc-400">{statusLabel}</span>
          </div>
          <div className="text-xs text-zinc-500 font-mono">
            modified {lastModified} · v{setup.version || '2.0'}
          </div>
        </div>

        {/* Nudge for incomplete items */}
        {firstIncomplete && (
          <Link
            href={firstIncomplete.href || '/update'}
            className="block mt-3 px-3 py-2 text-xs font-mono border border-amber-600/30 text-amber-600 dark:text-amber-500 hover:border-amber-500 transition-colors"
          >
            next step → {firstIncomplete.label}
          </Link>
        )}

        {/* ── K : key governance ── */}
        <PillarHeader
          letter="K"
          label="key governance"
          items={report.K.items}
          expanded={expanded.has('K')}
          onToggle={() => togglePillar('K')}
        />
        {expanded.has('K') && (
          <div className="space-y-1 pl-2">
            {setup.wallets.length > 0 ? (
              setup.wallets.map(w => (
                <div key={w.id} className="nexus-row">
                  <span className="nexus-row-label">{w.label}</span>
                  <span className="nexus-row-value">
                    {w.threshold}-of-{w.total_keys}
                    {w.platform ? ` · ${w.platform}` : ''}
                  </span>
                </div>
              ))
            ) : (
              <div className="nexus-row">
                <span className="nexus-row-label">vault</span>
                <span className="nexus-row-value">not configured</span>
              </div>
            )}
          </div>
        )}

        {/* ── E : estate integration ── */}
        <PillarHeader
          letter="E"
          label="estate integration"
          items={report.E_estate.items}
          expanded={expanded.has('E_estate')}
          onToggle={() => togglePillar('E_estate')}
        />
        {expanded.has('E_estate') && (
          <div className="space-y-1 pl-2">
            <div className="nexus-row">
              <span className="nexus-row-label">heirs</span>
              <span className="nexus-row-value">{heirsDisplay}</span>
            </div>
            <div className="nexus-row">
              <span className="nexus-row-label">legal</span>
              <span className="nexus-row-value">{legalDisplay}</span>
            </div>
            <div className="nexus-row">
              <span className="nexus-row-label">charter</span>
              <span className="nexus-row-value">
                {setup.charter.mission
                  ? `${setup.charter.principles.length} principle${setup.charter.principles.length !== 1 ? 's' : ''} · ${setup.charter.reviewFrequency} review`
                  : 'not configured'}
              </span>
            </div>
          </div>
        )}

        {/* ── E : ensured continuity ── */}
        <PillarHeader
          letter="E"
          label="ensured continuity"
          items={report.E_continuity.items}
          expanded={expanded.has('E_continuity')}
          onToggle={() => togglePillar('E_continuity')}
        />
        {expanded.has('E_continuity') && (
          <div className="space-y-1 pl-2">
            <div className="nexus-row">
              <span className="nexus-row-label">last check</span>
              <span className="nexus-row-value">{lastCheckDisplay}</span>
            </div>
          </div>
        )}

        {/* ── P : professional stewardship ── */}
        <PillarHeader
          letter="P"
          label="professional stewardship"
          items={report.P.items}
          expanded={expanded.has('P')}
          onToggle={() => togglePillar('P')}
        />
        {expanded.has('P') && (
          <div className="space-y-1 pl-2">
            {proEntries.length > 0 ? (
              proEntries.map((p, i) => (
                <div key={i} className="nexus-row">
                  <span className="nexus-row-label">{p.role}</span>
                  <span className="nexus-row-value">{p.name}</span>
                </div>
              ))
            ) : (
              <div className="nexus-row">
                <span className="nexus-row-label">&nbsp;</span>
                <span className="nexus-row-value text-zinc-400 dark:text-zinc-600">no professionals configured</span>
              </div>
            )}
          </div>
        )}

        <div className="nexus-divider" />

        {/* THAP + Audit — compact */}
        <div className="space-y-1">
          <div className="nexus-row">
            <span className="nexus-row-label">
              thap
              <InfoTip text="Trust Hash Amendment Protocol. A unique fingerprint of your shard data. If anything changes, the hash changes — so you always know your file is unaltered." />
            </span>
            <button
              className="nexus-row-value font-mono text-xs cursor-pointer hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors"
              onClick={handleCopyHash}
              title="click to copy full hash"
            >
              {copied ? 'copied to clipboard' : thapDisplay}
            </button>
          </div>
          <div className="nexus-row">
            <span className="nexus-row-label">
              changed
              <InfoTip text="Last time your shard data changed. Each change creates a new hash so you can track when updates were made." />
            </span>
            <span className="nexus-row-value">{lastChanged}</span>
          </div>
          {setup.thap.history.length > 0 && (
            <div className="nexus-row">
              <span className="nexus-row-label">prior</span>
              <span className="nexus-row-value text-zinc-400 dark:text-zinc-600 font-mono text-xs">
                {setup.thap.history.length} hash{setup.thap.history.length !== 1 ? 'es' : ''}
              </span>
            </div>
          )}
          <Link href="/audit" className="nexus-row hover:text-zinc-300 transition-colors">
            <span className="nexus-row-label">
              audit
              <InfoTip text="A log of every action taken on your shard — additions, updates, exports. Think of it as a receipt trail for your Bitcoin plan." />
            </span>
            <span className="nexus-row-value text-zinc-400 dark:text-zinc-600">
              {setup.event_log?.length || 0} entries →
            </span>
          </Link>
        </div>

        <div className="nexus-divider" />

        <div className="nexus-actions">
          <Link href="/update" className="nexus-btn">[update]</Link>
          <Link href="/readiness" className="nexus-btn">[readiness]</Link>
          <Link href="/share" className="nexus-btn">[share]</Link>
          <Link href="/proof" className="nexus-btn">[proof]</Link>
          <button className="nexus-btn" onClick={handleExport}>[export]</button>
          <a href="https://backed-x-bitcoin.gitbook.io/keep-protocol/" target="_blank" rel="noopener noreferrer" className="nexus-btn">[docs]</a>
        </div>
      </div>
    </main>
  )
}

function EmptyState() {
  return (
    <main className="nexus">
      <div className="nexus-container">
        <div className="flex items-center justify-between">
          <div className="nexus-title">KEEP NEXUS</div>
          <ThemeToggle />
        </div>

        <div className="nexus-divider" />

        <p className="text-zinc-500 dark:text-zinc-400 text-sm">No shard found.</p>

        <div className="nexus-actions mt-8">
          <Link href="/create" className="nexus-btn">[create]</Link>
          <Link href="/import" className="nexus-btn">[import]</Link>
        </div>
      </div>
    </main>
  )
}
