'use client'

import { useState, useEffect } from 'react'
import { useFamilySetup } from '@/lib/context/FamilySetup'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function UpdateLegalPage() {
  const router = useRouter()
  const { setup, updateLegal } = useFamilySetup()

  const [jurisdiction, setJurisdiction] = useState('')
  const [trustExists, setTrustExists] = useState(false)
  const [bitcoinInDocs, setBitcoinInDocs] = useState(false)
  const [rufadaaFiled, setRufadaaFiled] = useState(false)
  const [trustName, setTrustName] = useState('')

  useEffect(() => {
    if (setup.legal) {
      setTrustName(setup.legal.trust_name || '')
      setTrustExists(setup.legal.has_trust || false)
      setJurisdiction(setup.legal.jurisdiction || '')
      setBitcoinInDocs(setup.legal.bitcoin_in_docs || false)
      setRufadaaFiled(setup.legal.rufadaa_filed || false)
    }
  }, [setup.legal])

  const handleSave = () => {
    updateLegal({
      ...setup.legal,
      has_trust: trustExists,
      trust_name: trustExists ? trustName : undefined,
      jurisdiction,
      bitcoin_in_docs: bitcoinInDocs,
      rufadaa_filed: rufadaaFiled,
      last_review: new Date().toISOString(),
    })
    router.push('/dashboard')
  }

  return (
    <main className="nexus">
      <div className="nexus-container">
        <div className="nexus-title">KEEP NEXUS · update legal</div>

        <div className="nexus-divider" />

        <div className="space-y-4">
          <div className="nexus-row">
            <span className="nexus-row-label">jurisdiction</span>
            <input
              type="text"
              className="nexus-input flex-1"
              value={jurisdiction}
              onChange={(e) => setJurisdiction(e.target.value)}
              placeholder="State"
            />
          </div>

          <div className="nexus-row">
            <span className="nexus-row-label">trust exists</span>
            <div className="flex gap-2">
              <button
                className={`nexus-btn ${trustExists ? 'nexus-btn-primary' : ''}`}
                onClick={() => setTrustExists(true)}
              >
                [yes]
              </button>
              <button
                className={`nexus-btn ${!trustExists ? 'nexus-btn-primary' : ''}`}
                onClick={() => setTrustExists(false)}
              >
                [no]
              </button>
            </div>
          </div>

          {trustExists && (
            <div className="nexus-row">
              <span className="nexus-row-label">trust name</span>
              <input
                type="text"
                className="nexus-input flex-1"
                value={trustName}
                onChange={(e) => setTrustName(e.target.value)}
                placeholder="Family Revocable Living Trust"
              />
            </div>
          )}

          <div className="nexus-row">
            <span className="nexus-row-label">bitcoin in docs</span>
            <div className="flex gap-2">
              <button
                className={`nexus-btn ${bitcoinInDocs ? 'nexus-btn-primary' : ''}`}
                onClick={() => setBitcoinInDocs(true)}
              >
                [yes]
              </button>
              <button
                className={`nexus-btn ${!bitcoinInDocs ? 'nexus-btn-primary' : ''}`}
                onClick={() => setBitcoinInDocs(false)}
              >
                [no]
              </button>
            </div>
          </div>

          <div className="nexus-row">
            <span className="nexus-row-label">RUFADAA filed</span>
            <div className="flex gap-2">
              <button
                className={`nexus-btn ${rufadaaFiled ? 'nexus-btn-primary' : ''}`}
                onClick={() => setRufadaaFiled(true)}
              >
                [yes]
              </button>
              <button
                className={`nexus-btn ${!rufadaaFiled ? 'nexus-btn-primary' : ''}`}
                onClick={() => setRufadaaFiled(false)}
              >
                [no]
              </button>
            </div>
          </div>
        </div>

        <div className="nexus-divider" />

        <div className="text-sm text-zinc-500 mb-4">documents</div>
        <button className="nexus-btn mb-2">[add document]</button>
        <p className="text-sm text-zinc-600">(none yet)</p>

        <div className="nexus-divider" />

        <div className="nexus-actions">
          <button className="nexus-btn-primary" onClick={handleSave}>[save]</button>
          <Link href="/dashboard" className="nexus-btn">[cancel]</Link>
        </div>
      </div>
    </main>
  )
}
