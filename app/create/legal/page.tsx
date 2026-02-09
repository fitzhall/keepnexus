'use client'

import { useState, useEffect } from 'react'
import { useFamilySetup } from '@/lib/context/FamilySetup'
import type { LegalDocuments } from '@/lib/keep-core/data-model'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function CreateLegalPage() {
  const router = useRouter()
  const { setup, updateLegal } = useFamilySetup()

  const [jurisdiction, setJurisdiction] = useState('')
  const [hasTrust, setHasTrust] = useState(false)
  const [hasWill, setHasWill] = useState(false)
  const [bitcoinInDocs, setBitcoinInDocs] = useState(false)

  useEffect(() => {
    if (setup.legal) {
      setJurisdiction(setup.legal.jurisdiction || '')
      setHasTrust(setup.legal.has_trust || false)
      setHasWill(setup.legal.has_will || false)
      setBitcoinInDocs(setup.legal.bitcoin_in_docs || false)
    }
  }, [setup.legal])

  const handleNext = () => {
    const now = new Date().toISOString()
    const legal: LegalDocuments = {
      ...setup.legal,
      has_will: hasWill,
      has_trust: hasTrust,
      has_letter_of_instruction: setup.legal.has_letter_of_instruction || false,
      trust_name: hasTrust ? (setup.legal.trust_name || `${setup.family_name} Trust`) : undefined,
      jurisdiction,
      bitcoin_in_docs: bitcoinInDocs,
      last_review: now,
      next_review: setup.legal.next_review || now,
    }
    updateLegal(legal)
    router.push('/create/advisors')
  }

  return (
    <main className="nexus">
      <div className="nexus-container">
        <div className="nexus-title">KEEP NEXUS · create · 5/7 · E estate integration</div>

        <div className="nexus-divider" />

        <div className="space-y-6">
          <div>
            <label className="text-sm text-zinc-500 block mb-2">jurisdiction</label>
            <input
              type="text"
              className="bg-transparent border-b border-zinc-700 text-zinc-200 focus:border-zinc-400 outline-none px-1 py-0.5 font-mono w-full"
              value={jurisdiction}
              onChange={(e) => setJurisdiction(e.target.value)}
              placeholder="e.g. California, USA"
              autoFocus
            />
          </div>

          <div>
            <label className="text-sm text-zinc-500 block mb-2">will exists?</label>
            <div className="flex gap-4">
              <button
                className={hasWill ? 'nexus-btn-primary' : 'nexus-btn'}
                onClick={() => setHasWill(true)}
              >
                [yes]
              </button>
              <button
                className={!hasWill ? 'nexus-btn-primary' : 'nexus-btn'}
                onClick={() => setHasWill(false)}
              >
                [no]
              </button>
            </div>
          </div>

          <div>
            <label className="text-sm text-zinc-500 block mb-2">trust exists?</label>
            <div className="flex gap-4">
              <button
                className={hasTrust ? 'nexus-btn-primary' : 'nexus-btn'}
                onClick={() => setHasTrust(true)}
              >
                [yes]
              </button>
              <button
                className={!hasTrust ? 'nexus-btn-primary' : 'nexus-btn'}
                onClick={() => setHasTrust(false)}
              >
                [no]
              </button>
            </div>
          </div>

          <div>
            <label className="text-sm text-zinc-500 block mb-2">bitcoin mentioned in legal docs?</label>
            <div className="flex gap-4">
              <button
                className={bitcoinInDocs ? 'nexus-btn-primary' : 'nexus-btn'}
                onClick={() => setBitcoinInDocs(true)}
              >
                [yes]
              </button>
              <button
                className={!bitcoinInDocs ? 'nexus-btn-primary' : 'nexus-btn'}
                onClick={() => setBitcoinInDocs(false)}
              >
                [no]
              </button>
            </div>
          </div>
        </div>

        <div className="nexus-divider" />

        <div className="nexus-actions">
          <Link href="/create/heirs" className="nexus-btn">[back]</Link>
          <button className="nexus-btn-primary" onClick={handleNext}>[next]</button>
          <Link href="/dashboard" className="nexus-btn">[cancel]</Link>
        </div>
      </div>
    </main>
  )
}
