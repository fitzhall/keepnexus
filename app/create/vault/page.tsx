'use client'

import { useState, useEffect } from 'react'
import { useFamilySetup } from '@/lib/context/FamilySetup'
import type { Wallet } from '@/lib/keep-core/data-model'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const PLATFORMS = ['Theya', 'Casa', 'Unchained', 'Nunchuk', 'Other']
const LABEL_PRESETS = ['cold', 'warm', 'hot']

export default function CreateVaultPage() {
  const router = useRouter()
  const { setup, addWallet } = useFamilySetup()

  const [label, setLabel] = useState('cold')
  const [customLabel, setCustomLabel] = useState('')
  const [platform, setPlatform] = useState('Unchained')
  const [quorumM, setQuorumM] = useState(2)
  const [quorumN, setQuorumN] = useState(3)

  // Pre-fill from first existing wallet if present
  useEffect(() => {
    if (setup.wallets.length > 0) {
      const first = setup.wallets[0]
      setQuorumM(first.threshold || 2)
      setQuorumN(first.total_keys || 3)
      if (first.platform) setPlatform(first.platform)
      if (first.label) {
        if (LABEL_PRESETS.includes(first.label)) {
          setLabel(first.label)
        } else {
          setLabel('custom')
          setCustomLabel(first.label)
        }
      }
    }
  }, [setup.wallets])

  const handleNext = () => {
    if (quorumM < 1 || quorumM > quorumN || quorumN > 15) return

    const vaultLabel = label === 'custom' ? (customLabel.trim() || 'primary') : label

    const wallet: Wallet = {
      id: `wallet-${vaultLabel}-${Date.now()}`,
      descriptor: '',
      threshold: quorumM,
      total_keys: quorumN,
      created_at: new Date().toISOString(),
      label: vaultLabel,
      platform,
    }
    addWallet(wallet)

    router.push('/create/roles')
  }

  return (
    <main className="nexus">
      <div className="nexus-container">
        <div className="nexus-title">KEEP NEXUS · create · 2/7 · K key governance</div>

        <div className="nexus-divider" />

        <div className="space-y-6">
          <div>
            <label className="text-sm text-zinc-500 block mb-2">vault label</label>
            <div className="flex gap-2 flex-wrap">
              {LABEL_PRESETS.map(preset => (
                <button
                  key={preset}
                  className={`nexus-btn ${label === preset ? 'nexus-btn-primary' : ''}`}
                  onClick={() => setLabel(preset)}
                >
                  [{preset}]
                </button>
              ))}
              <button
                className={`nexus-btn ${label === 'custom' ? 'nexus-btn-primary' : ''}`}
                onClick={() => setLabel('custom')}
              >
                [custom]
              </button>
            </div>
            {label === 'custom' && (
              <input
                className="nexus-input w-full mt-2"
                type="text"
                placeholder="custom label"
                value={customLabel}
                onChange={(e) => setCustomLabel(e.target.value)}
              />
            )}
          </div>

          <div>
            <label className="text-sm text-zinc-500 block mb-2">platform</label>
            <select
              className="nexus-select w-full"
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
            >
              {PLATFORMS.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm text-zinc-500 block mb-2">quorum (M-of-N)</label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                className="bg-transparent border-b border-zinc-700 text-zinc-200 focus:border-zinc-400 outline-none px-1 py-0.5 font-mono w-16 text-center"
                value={quorumM}
                onChange={(e) => setQuorumM(parseInt(e.target.value) || 1)}
                min={1}
                max={quorumN}
              />
              <span className="text-zinc-500">of</span>
              <input
                type="number"
                className="bg-transparent border-b border-zinc-700 text-zinc-200 focus:border-zinc-400 outline-none px-1 py-0.5 font-mono w-16 text-center"
                value={quorumN}
                onChange={(e) => setQuorumN(parseInt(e.target.value) || 2)}
                min={1}
                max={15}
              />
            </div>
            {quorumM > quorumN && (
              <p className="text-red-400 text-xs mt-2">M cannot exceed N</p>
            )}
          </div>
        </div>

        <div className="nexus-divider" />

        <div className="nexus-actions">
          <Link href="/create/family" className="nexus-btn">[back]</Link>
          <button
            className="nexus-btn-primary"
            onClick={handleNext}
            disabled={quorumM < 1 || quorumM > quorumN || quorumN > 15}
          >
            [next]
          </button>
          <Link href="/dashboard" className="nexus-btn">[cancel]</Link>
        </div>
      </div>
    </main>
  )
}
