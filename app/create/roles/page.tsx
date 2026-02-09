'use client'

import { useState, useEffect } from 'react'
import { useFamilySetup } from '@/lib/context/FamilySetup'
import { Key, KeyRole, StorageType } from '@/lib/risk-simulator/types'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const STANDARD_ROLES: { id: string; label: string; role: KeyRole }[] = [
  { id: 'primary1', label: 'Primary 1', role: 'primary' },
  { id: 'primary2', label: 'Primary 2', role: 'spouse' },
  { id: 'trustee', label: 'Trustee', role: 'child' },
  { id: 'attorney', label: 'Attorney', role: 'attorney' },
  { id: 'advisor', label: 'Advisor', role: 'custodian' },
]

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
  label: string
  role: KeyRole
  name: string
  device: string
}

export default function CreateRolesPage() {
  const router = useRouter()
  const { setup, updateMultisig } = useFamilySetup()

  const [roles, setRoles] = useState<RoleEntry[]>(() =>
    STANDARD_ROLES.map(r => ({
      ...r,
      name: '',
      device: '—',
    }))
  )

  useEffect(() => {
    if (setup.multisig.keys?.length > 0) {
      const existingKeys = setup.multisig.keys
      setRoles(prev =>
        prev.map((role, idx) => {
          const existing = existingKeys[idx]
          if (existing) {
            return {
              ...role,
              name: existing.holder || '',
              device: existing.location || '—',
            }
          }
          return role
        })
      )
    }
  }, [setup.multisig.keys])

  const updateRole = (index: number, field: 'name' | 'device', value: string) => {
    const updated = [...roles]
    updated[index] = { ...updated[index], [field]: value }
    setRoles(updated)
  }

  const handleNext = () => {
    const keys: Key[] = roles
      .filter(r => r.name.trim() || r.device !== '—')
      .map(r => {
        const deviceOption = DEVICE_OPTIONS.find(d => d.label === r.device)
        return {
          id: r.id,
          holder: r.name.trim() || r.label,
          role: r.role,
          type: 'full' as const,
          storage: deviceOption?.value === '—' ? 'paper' : (deviceOption?.value || 'hardware-wallet'),
          location: r.device === '—' ? '' : r.device,
        }
      })

    updateMultisig({
      ...setup.multisig,
      keys,
    })
    router.push('/create/heirs')
  }

  return (
    <main className="nexus">
      <div className="nexus-container">
        <div className="nexus-title">KEEP NEXUS · create · 3/7</div>

        <div className="nexus-divider" />

        {/* Column Headers */}
        <div className="flex items-center gap-2 text-xs text-zinc-500 uppercase tracking-wider mb-4">
          <span className="w-24">role</span>
          <span className="flex-1">name</span>
          <span className="w-28">device</span>
        </div>

        {/* Role Rows */}
        <div className="space-y-3">
          {roles.map((role, idx) => (
            <div key={role.id} className="flex items-center gap-2">
              <span className="text-zinc-500 text-sm w-24">{role.label}</span>
              <input
                type="text"
                className="bg-transparent border-b border-zinc-700 text-zinc-200 focus:border-zinc-400 outline-none px-1 py-0.5 font-mono flex-1"
                value={role.name}
                onChange={(e) => updateRole(idx, 'name', e.target.value)}
                placeholder="Name"
              />
              <select
                className="nexus-select w-28"
                value={role.device}
                onChange={(e) => updateRole(idx, 'device', e.target.value)}
              >
                {DEVICE_OPTIONS.map(d => (
                  <option key={d.label} value={d.label}>{d.label}</option>
                ))}
              </select>
            </div>
          ))}
        </div>

        <div className="nexus-divider" />

        <div className="nexus-actions">
          <Link href="/create/vault" className="nexus-btn">[back]</Link>
          <button className="nexus-btn-primary" onClick={handleNext}>[next]</button>
          <Link href="/dashboard" className="nexus-btn">[cancel]</Link>
        </div>
      </div>
    </main>
  )
}
