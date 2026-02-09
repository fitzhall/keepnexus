'use client'

import { useState, useEffect } from 'react'
import { useFamilySetup } from '@/lib/context/FamilySetup'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function CreateLegalPage() {
  const router = useRouter()
  const { setup, updateTrust } = useFamilySetup()

  const [jurisdiction, setJurisdiction] = useState('')
  const [trustExists, setTrustExists] = useState(false)
  const [bitcoinInDocs, setBitcoinInDocs] = useState(false)

  useEffect(() => {
    if (setup.trust?.trustName) {
      setTrustExists(true)
    }
  }, [setup.trust])

  const handleNext = () => {
    updateTrust({
      ...setup.trust,
      trustName: trustExists ? (setup.trust.trustName || `${setup.familyName} Trust`) : undefined,
      jurisdiction,
      bitcoinInDocs,
      lastReviewed: new Date(),
    })
    router.push('/create/advisors')
  }

  return (
    <main className="nexus">
      <div className="nexus-container">
        <div className="nexus-title">KEEP NEXUS · create · 5/7</div>

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
            <label className="text-sm text-zinc-500 block mb-2">trust exists?</label>
            <div className="flex gap-4">
              <button
                className={trustExists ? 'nexus-btn-primary' : 'nexus-btn'}
                onClick={() => setTrustExists(true)}
              >
                [yes]
              </button>
              <button
                className={!trustExists ? 'nexus-btn-primary' : 'nexus-btn'}
                onClick={() => setTrustExists(false)}
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
