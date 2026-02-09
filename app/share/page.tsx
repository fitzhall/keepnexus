'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useFamilySetup } from '@/lib/context/FamilySetup'
import { createScopedExport, ROLE_SCOPE_DESCRIPTIONS, ShareRole } from '@/lib/shard/scope'

export default function SharePage() {
  const { setup, addEventLogEntry } = useFamilySetup()
  const [selectedRole, setSelectedRole] = useState<ShareRole | null>(null)
  const [recipientName, setRecipientName] = useState('')
  const [exported, setExported] = useState(false)

  const selectRole = (role: ShareRole) => {
    setSelectedRole(role)
    // Pre-fill from professionals if available
    const pros = setup.professionals
    if (role === 'attorney') {
      setRecipientName(pros?.attorney?.name || '')
    } else if (role === 'cpa') {
      setRecipientName(pros?.cpa?.name || '')
    } else if (role === 'advisor') {
      setRecipientName(pros?.advisor?.name || '')
    }
  }

  const handleExport = () => {
    if (!selectedRole || !recipientName.trim()) return

    const scopedData = createScopedExport(setup, selectedRole, recipientName.trim())
    const json = JSON.stringify(scopedData, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)

    const date = new Date().toISOString().split('T')[0]
    const filename = `${setup.family_name || 'nexus'}-${selectedRole}-${date}.keep`

    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    addEventLogEntry('share.exported', `Scoped .keep exported for ${selectedRole}: ${recipientName.trim()}`)
    setExported(true)
  }

  // Success state
  if (exported) {
    return (
      <main className="nexus">
        <div className="nexus-container">
          <div className="nexus-title">KEEP NEXUS</div>
          <div className="nexus-family">Export Complete</div>

          <div className="nexus-divider" />

          <p className="text-sm text-zinc-400 mb-2">
            Scoped .keep file exported for <span className="text-zinc-200">{selectedRole}</span>: <span className="text-zinc-200">{recipientName}</span>
          </p>
          <p className="text-xs text-zinc-500 mb-4">
            Event logged to audit trail.
          </p>

          <div className="nexus-actions">
            <button
              onClick={() => {
                setSelectedRole(null)
                setRecipientName('')
                setExported(false)
              }}
              className="nexus-btn"
            >
              [export another]
            </button>
            <Link href="/dashboard" className="nexus-btn">[back]</Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="nexus">
      <div className="nexus-container">
        <div className="nexus-title">KEEP NEXUS</div>
        <div className="nexus-family">Export Scoped .keep</div>

        <div className="nexus-divider" />

        {!selectedRole ? (
          <>
            <p className="text-sm text-zinc-400 mb-4">Export scoped shard for:</p>
            <div className="nexus-actions">
              <button onClick={() => selectRole('attorney')} className="nexus-btn">[attorney]</button>
              <button onClick={() => selectRole('cpa')} className="nexus-btn">[cpa]</button>
              <button onClick={() => selectRole('advisor')} className="nexus-btn">[advisor]</button>
            </div>
          </>
        ) : (
          <>
            <p className="text-sm text-zinc-400 mb-4">
              Role: <span className="text-zinc-200">{selectedRole}</span>
            </p>

            <div className="space-y-4">
              {/* Recipient name */}
              <div>
                <label className="text-xs text-zinc-500 block mb-1">recipient name</label>
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="Name or firm"
                  className="nexus-input w-full"
                />
              </div>

              {/* Scope preview */}
              <div className="border border-zinc-800 p-3">
                <p className="text-xs text-zinc-500 mb-2">INCLUDED:</p>
                <ul className="text-xs text-zinc-400 space-y-1 mb-3">
                  {ROLE_SCOPE_DESCRIPTIONS[selectedRole].included.map((item, i) => (
                    <li key={i} className="text-green-600">+ {item}</li>
                  ))}
                </ul>
                <p className="text-xs text-zinc-500 mb-2">EXCLUDED:</p>
                <ul className="text-xs text-zinc-400 space-y-1">
                  {ROLE_SCOPE_DESCRIPTIONS[selectedRole].excluded.map((item, i) => (
                    <li key={i} className="text-red-500">- {item}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="nexus-actions">
              <button
                onClick={handleExport}
                disabled={!recipientName.trim()}
                className={`nexus-btn-primary ${!recipientName.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                [export .keep]
              </button>
              <button onClick={() => { setSelectedRole(null); setRecipientName('') }} className="nexus-btn">
                [back]
              </button>
              <Link href="/dashboard" className="nexus-btn">[cancel]</Link>
            </div>
          </>
        )}
      </div>
    </main>
  )
}
