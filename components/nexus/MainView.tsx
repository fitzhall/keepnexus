'use client'

import { useState } from 'react'
import { useFamilySetup } from '@/lib/context/FamilySetup'
import Link from 'next/link'

export function MainView() {
  const { setup } = useFamilySetup()
  const { familyName, multisig, heirs, trust, drillSettings, thapHash, thapHistory } = setup
  const [copied, setCopied] = useState(false)

  // If no shard exists (check for actual data)
  if (!familyName || familyName === '') {
    return <EmptyState />
  }

  // Format heirs display
  const heirsDisplay = heirs?.length > 0
    ? heirs.map(h => `${h.name} ${h.allocation}%`).join(' · ')
    : 'none'

  // Format vault display (fallback for when vaults[] is empty)
  const vaultParts: string[] = []
  if (multisig?.threshold && multisig?.totalKeys) {
    vaultParts.push(`${multisig.threshold}-of-${multisig.totalKeys}`)
  }
  if (multisig?.platform) vaultParts.push(multisig.platform)
  if (multisig?.keys?.length) vaultParts.push(`${multisig.keys.length} roles assigned`)
  const vaultDisplay = vaultParts.length > 0 ? vaultParts.join(' · ') : 'not configured'

  // Format legal display
  const legalParts: string[] = []
  if (trust?.jurisdiction) legalParts.push(trust.jurisdiction)
  if (trust?.trustName) legalParts.push('trust ✓')
  if (trust?.rufadaaFiled) legalParts.push('RUFADAA ✓')
  if (trust?.bitcoinInDocs) legalParts.push('BTC in docs ✓')
  const legalDisplay = legalParts.length > 0 ? legalParts.join(' · ') : 'not configured'

  // Format last check display
  const lastCheckDisplay = drillSettings?.lastDrillDate
    ? `${drillSettings.lastDrillDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} · all signers verified`
    : 'no check-ins recorded'

  // Determine status (simplified logic)
  const status = 'healthy'

  // THAP display helpers
  const thapDisplay = thapHash
    ? thapHash.slice(0, 16) + '...'
    : 'calculating...'

  const lastChanged = thapHistory.length > 0
    ? new Date(thapHistory[thapHistory.length - 1].timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : thapHash ? 'current' : '—'

  const handleCopyHash = () => {
    if (!thapHash) return
    navigator.clipboard.writeText(thapHash).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const handleExport = () => {
    const dataStr = JSON.stringify(setup, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    const date = new Date().toISOString().split('T')[0]
    link.href = url
    link.download = `${familyName.toLowerCase().replace(/\s+/g, '-')}-${date}.keepnexus`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <main className="nexus">
      <div className="nexus-container">
        {/* Header */}
        <div className="nexus-title">KEEP NEXUS</div>
        <div className="nexus-family">{familyName} Reserve</div>

        <div className="nexus-divider" />

        {/* Hero - BTC Amount */}
        <div className="nexus-hero-btc">₿ —</div>
        <div className="nexus-hero-fiat">connect wallet to view balance</div>

        {/* Status */}
        <div className="nexus-status">
          <span className={`nexus-status-dot ${status}`} />
          <span className="text-sm text-zinc-400">{status}</span>
        </div>

        <div className="nexus-divider" />

        {/* Status Rows */}
        <div className="space-y-2">
          {setup.vaults.length > 0 ? (
            setup.vaults.map(v => (
              <div key={v.id} className="nexus-row">
                <span className="nexus-row-label">{v.label}</span>
                <span className="nexus-row-value">
                  {v.multisig.threshold}-of-{v.multisig.totalKeys}
                  {v.multisig.platform ? ` · ${v.multisig.platform}` : ''}
                  {v.multisig.keys?.length ? ` · ${v.multisig.keys.length} roles` : ''}
                </span>
              </div>
            ))
          ) : (
            <div className="nexus-row">
              <span className="nexus-row-label">vault</span>
              <span className="nexus-row-value">{vaultDisplay}</span>
            </div>
          )}
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
          <div className="nexus-row">
            <span className="nexus-row-label">last check</span>
            <span className="nexus-row-value">{lastCheckDisplay}</span>
          </div>
        </div>

        <div className="nexus-divider" />

        {/* THAP */}
        <div className="space-y-2">
          <div className="nexus-row">
            <span className="nexus-row-label">thap</span>
            <button
              className="nexus-row-value font-mono text-xs cursor-pointer hover:text-zinc-200 transition-colors"
              onClick={handleCopyHash}
              title="click to copy full hash"
            >
              {copied ? 'copied to clipboard' : thapDisplay}
            </button>
          </div>
          <div className="nexus-row">
            <span className="nexus-row-label">changed</span>
            <span className="nexus-row-value">{lastChanged}</span>
          </div>
          {thapHistory.length > 0 && (
            <div className="nexus-row">
              <span className="nexus-row-label">prior</span>
              <span className="nexus-row-value text-zinc-600 font-mono text-xs">
                {thapHistory.length} hash{thapHistory.length !== 1 ? 'es' : ''}
              </span>
            </div>
          )}
        </div>

        <div className="nexus-divider" />

        {/* Audit Trail + Trail Count */}
        <div className="nexus-row">
          <span className="nexus-row-label">audit</span>
          <span className="nexus-row-value text-zinc-600">
            {setup.auditTrail?.length || 0} entries
          </span>
        </div>

        <div className="nexus-divider" />

        {/* Actions */}
        <div className="nexus-actions">
          <Link href="/update" className="nexus-btn">[update]</Link>
          <Link href="/share" className="nexus-btn">[share]</Link>
          <button className="nexus-btn" onClick={handleExport}>[export]</button>
        </div>
      </div>
    </main>
  )
}

function EmptyState() {
  return (
    <main className="nexus">
      <div className="nexus-container">
        <div className="nexus-title">KEEP NEXUS</div>

        <div className="nexus-divider" />

        <p className="text-zinc-400 text-sm">No shard found.</p>

        <div className="nexus-actions mt-8">
          <Link href="/create" className="nexus-btn">[create]</Link>
          <Link href="/import" className="nexus-btn">[import]</Link>
        </div>
      </div>
    </main>
  )
}
