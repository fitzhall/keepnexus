'use client'

import { useState, useEffect } from 'react'
import { useFamilySetup } from '@/lib/context/FamilySetup'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const PLATFORMS = ['Theya', 'Casa', 'Unchained', 'Nunchuk', 'Other']
const LABEL_PRESETS = ['cold', 'warm', 'hot']

export default function CreateVaultPage() {
  const router = useRouter()
  const { setup, updateMultisig, addVault } = useFamilySetup()

  const [label, setLabel] = useState('cold')
  const [customLabel, setCustomLabel] = useState('')
  const [platform, setPlatform] = useState('Unchained')
  const [quorumM, setQuorumM] = useState(setup.multisig.threshold || 2)
  const [quorumN, setQuorumN] = useState(setup.multisig.totalKeys || 3)

  useEffect(() => {
    setQuorumM(setup.multisig.threshold || 2)
    setQuorumN(setup.multisig.totalKeys || 3)
  }, [setup.multisig.threshold, setup.multisig.totalKeys])

  const handleNext = () => {
    if (quorumM < 1 || quorumM > quorumN || quorumN > 15) return

    const multisig = {
      ...setup.multisig,
      family: setup.familyName,
      threshold: quorumM,
      totalKeys: quorumN,
      platform,
    }
    updateMultisig(multisig)

    // Create first vault entry
    const vaultLabel = label === 'custom' ? (customLabel.trim() || 'primary') : label
    addVault({
      id: `vault-${vaultLabel}-${Date.now()}`,
      label: vaultLabel,
      multisig,
    })

    router.push('/create/roles')
  }

  return (
    <main className="nexus">
      <div className="nexus-container">
        <div className="nexus-title">KEEP NEXUS · create · 2/7</div>

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
