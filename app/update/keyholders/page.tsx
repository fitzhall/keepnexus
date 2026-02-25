'use client'

import { useState, useEffect } from 'react'
import { useFamilySetup } from '@/lib/context/FamilySetup'
import type { StorageType, KeyHolder, FunctionalRole } from '@/lib/keep-core/data-model'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const DEVICE_OPTIONS: { value: StorageType | '—'; label: string }[] = [
  { value: 'hardware-wallet', label: 'Coldcard' },
  { value: 'hardware-wallet', label: 'Ledger' },
  { value: 'hardware-wallet', label: 'Trezor' },
  { value: 'hardware-wallet', label: 'BitBox' },
  { value: 'hardware-wallet', label: 'Passport' },
  { value: 'paper', label: 'Paper' },
  { value: 'hardware-wallet', label: 'Other' },
  { value: '—', label: '—' },
]

interface RoleEntry {
  id: string
  name: string
  device: string
  functional_role: FunctionalRole
}

function createEmptyRole(): RoleEntry {
  return {
    id: `kh-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    name: '',
    device: '—',
    functional_role: 'signer',
  }
}

export default function UpdateKeyholdersPage() {
  const router = useRouter()
  const { setup, loadFromFile } = useFamilySetup()

  const [roles, setRoles] = useState<RoleEntry[]>(() => {
    if (setup.keyholders?.length > 0) {
      return setup.keyholders.map(kh => ({
        id: kh.id,
        name: kh.name || '',
        device: kh.location || '—',
        functional_role: kh.functional_role || 'signer',
      }))
    }
    return [
      { ...createEmptyRole(), functional_role: 'owner' },
      { ...createEmptyRole(), functional_role: 'signer' },
      { ...createEmptyRole(), functional_role: 'protector' },
    ]
  })

  useEffect(() => {
    if (setup.keyholders?.length > 0) {
      setRoles(
        setup.keyholders.map(kh => ({
          id: kh.id,
          name: kh.name || '',
          device: kh.location || '—',
          functional_role: kh.functional_role || 'signer',
        }))
      )
    }
  }, [setup.keyholders])

  const updateRole = (index: number, field: keyof RoleEntry, value: string) => {
    const updated = [...roles]
    updated[index] = { ...updated[index], [field]: value }
    setRoles(updated)
  }

  const addRow = () => {
    setRoles([...roles, createEmptyRole()])
  }

  const removeRow = (index: number) => {
    if (roles.length <= 1) return
    setRoles(roles.filter((_, i) => i !== index))
  }

  const wallet = setup.wallets?.[0]
  const ownerSignerCount = roles.filter(
    r => r.name.trim() && (r.functional_role === 'owner' || r.functional_role === 'signer')
  ).length
  const thresholdMet = !wallet || ownerSignerCount >= wallet.threshold
  const isCold = wallet?.tier === 'cold'

  const handleSave = () => {
    const keyholders: KeyHolder[] = roles
      .filter(r => r.name.trim())
      .map(r => {
        const deviceOption = DEVICE_OPTIONS.find(d => d.label === r.device)
        const existing = setup.keyholders.find(kh => kh.id === r.id)
        return {
          id: r.id,
          name: r.name.trim(),
          role: existing?.role || ('other' as const),
          jurisdiction: existing?.jurisdiction || '',
          storage_type: (deviceOption?.value === '—' ? 'hardware-wallet' : (deviceOption?.value || 'hardware-wallet')) as StorageType,
          location: r.device === '—' ? '' : r.device,
          key_age_days: existing?.key_age_days || 0,
          is_sharded: existing?.is_sharded || false,
          functional_role: r.functional_role,
          contact: existing?.contact,
          last_verified: existing?.last_verified,
        }
      })

    loadFromFile({ ...setup, keyholders, last_modified: new Date().toISOString() })
    router.push('/dashboard')
  }

  return (
    <main className="nexus">
      <div className="nexus-container">
        <div className="nexus-title">KEEP NEXUS · update keyholders</div>

        <div className="nexus-divider" />

        <p className="text-zinc-500 text-xs font-mono mb-4">
          Who holds keys to your Bitcoin? Assign owner, signer, and protector roles.
        </p>

        {/* Column Headers */}
        <div className="flex items-center gap-2 text-xs text-zinc-500 uppercase tracking-wider mb-4">
          <span className="flex-1">name</span>
          <span className="w-28">function</span>
          <span className="w-28">device</span>
          <span className="w-8" />
        </div>

        {/* Role Rows */}
        <div className="space-y-3">
          {roles.map((role, idx) => (
            <div key={role.id} className="flex items-center gap-2">
              <input
                type="text"
                className="bg-transparent border-b border-zinc-700 text-zinc-200 focus:border-zinc-400 outline-none px-1 py-0.5 font-mono flex-1"
                value={role.name}
                onChange={(e) => updateRole(idx, 'name', e.target.value)}
                placeholder="Name"
              />
              <select
                className="nexus-select w-28"
                value={role.functional_role}
                onChange={(e) => updateRole(idx, 'functional_role', e.target.value)}
              >
                <option value="owner">Owner</option>
                <option value="signer">Signer</option>
                <option value="protector">Protector</option>
              </select>
              <select
                className="nexus-select w-28"
                value={role.device}
                onChange={(e) => updateRole(idx, 'device', e.target.value)}
              >
                {DEVICE_OPTIONS.map(d => (
                  <option key={d.label} value={d.label}>{d.label}</option>
                ))}
              </select>
              <button
                className="text-zinc-600 hover:text-zinc-400 text-sm w-8 text-center"
                onClick={() => removeRow(idx)}
                title="Remove"
              >
                [x]
              </button>
            </div>
          ))}
        </div>

        <button
          className="nexus-btn mt-4 text-xs"
          onClick={addRow}
        >
          [+ add keyholder]
        </button>

        {/* Threshold feedback */}
        {isCold && wallet && !thresholdMet && (
          <p className="text-yellow-500 text-xs mt-4">
            Cold vault needs {wallet.threshold} owners/signers but only {ownerSignerCount} designated.
            Protectors are for emergency only.
          </p>
        )}

        <div className="nexus-divider" />

        <div className="nexus-actions">
          <button className="nexus-btn-primary" onClick={handleSave}>[save]</button>
          <Link href="/update" className="nexus-btn">[cancel]</Link>
        </div>
      </div>
    </main>
  )
}
