'use client'

import { useState } from 'react'
import { useFamilySetup } from '@/lib/context/FamilySetup'
import Link from 'next/link'
import type { Vault } from '@/lib/risk-simulator/types'

const PLATFORMS = ['Theya', 'Casa', 'Unchained', 'Nunchuk', 'Other']
const LABEL_PRESETS = ['cold', 'warm', 'hot']

export default function UpdateVaultPage() {
  const { setup, addVault, updateVault, removeVault } = useFamilySetup()
  const [showAdd, setShowAdd] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null)

  // New vault form state
  const [newLabel, setNewLabel] = useState('cold')
  const [newCustomLabel, setNewCustomLabel] = useState('')
  const [newPlatform, setNewPlatform] = useState('Unchained')
  const [newM, setNewM] = useState(2)
  const [newN, setNewN] = useState(3)

  // Edit vault form state
  const [editPlatform, setEditPlatform] = useState('')
  const [editM, setEditM] = useState(2)
  const [editN, setEditN] = useState(3)

  const startEdit = (vault: Vault) => {
    setEditId(vault.id)
    setEditPlatform(vault.multisig.platform || '')
    setEditM(vault.multisig.threshold || 2)
    setEditN(vault.multisig.totalKeys || 3)
    setShowAdd(false)
  }

  const saveEdit = (vault: Vault) => {
    updateVault(vault.id, {
      ...vault,
      multisig: {
        ...vault.multisig,
        platform: editPlatform,
        threshold: editM,
        totalKeys: editN,
      },
    })
    setEditId(null)
  }

  const handleAdd = () => {
    if (newM < 1 || newM > newN || newN > 15) return
    const label = newLabel === 'custom' ? (newCustomLabel.trim() || 'vault') : newLabel
    addVault({
      id: `vault-${label}-${Date.now()}`,
      label,
      multisig: {
        family: setup.familyName,
        threshold: newM,
        totalKeys: newN,
        platform: newPlatform,
        keys: [],
        createdAt: new Date(),
      },
    })
    setShowAdd(false)
    setNewLabel('cold')
    setNewCustomLabel('')
    setNewPlatform('Unchained')
    setNewM(2)
    setNewN(3)
  }

  const handleRemove = (id: string) => {
    removeVault(id)
    setConfirmRemove(null)
  }

  return (
    <main className="nexus">
      <div className="nexus-container">
        <div className="nexus-title">KEEP NEXUS · vaults</div>

        <div className="nexus-divider" />

        {setup.vaults.length === 0 ? (
          <p className="text-zinc-500 text-sm font-mono">no vaults configured</p>
        ) : (
          <div className="space-y-4">
            {setup.vaults.map(vault => (
              <div key={vault.id} className="space-y-2">
                <div
                  className="nexus-row hover:text-zinc-100 transition-colors cursor-pointer"
                  onClick={() => editId === vault.id ? setEditId(null) : startEdit(vault)}
                >
                  <span className="text-zinc-300 font-medium">{vault.label}</span>
                  <span className="nexus-row-value">
                    {vault.multisig.threshold}-of-{vault.multisig.totalKeys}
                    {vault.multisig.platform ? ` · ${vault.multisig.platform}` : ''}
                  </span>
                </div>

                {/* Inline edit */}
                {editId === vault.id && (
                  <div className="pl-4 space-y-3 border-l border-zinc-700">
                    <div className="nexus-row">
                      <span className="nexus-row-label">platform</span>
                      <select
                        className="nexus-select flex-1"
                        value={editPlatform}
                        onChange={(e) => setEditPlatform(e.target.value)}
                      >
                        {PLATFORMS.map(p => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </div>
                    <div className="nexus-row">
                      <span className="nexus-row-label">quorum</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          className="nexus-input w-12 text-center"
                          value={editM}
                          onChange={(e) => setEditM(parseInt(e.target.value) || 1)}
                          min={1}
                          max={editN}
                        />
                        <span className="text-zinc-500">of</span>
                        <input
                          type="number"
                          className="nexus-input w-12 text-center"
                          value={editN}
                          onChange={(e) => setEditN(parseInt(e.target.value) || 2)}
                          min={1}
                          max={15}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="nexus-btn nexus-btn-primary text-xs" onClick={() => saveEdit(vault)}>
                        [save]
                      </button>
                      <button className="nexus-btn text-xs" onClick={() => setEditId(null)}>
                        [cancel]
                      </button>
                      {confirmRemove === vault.id ? (
                        <button
                          className="nexus-btn text-xs text-red-400 hover:text-red-300"
                          onClick={() => handleRemove(vault.id)}
                        >
                          [confirm remove]
                        </button>
                      ) : (
                        <button
                          className="nexus-btn text-xs text-zinc-600 hover:text-red-400"
                          onClick={() => setConfirmRemove(vault.id)}
                        >
                          [remove]
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="nexus-divider" />

        {/* Add vault inline form */}
        {showAdd ? (
          <div className="space-y-4">
            <div className="text-zinc-400 text-xs uppercase tracking-wider">new vault</div>

            <div>
              <label className="text-sm text-zinc-500 block mb-2">label</label>
              <div className="flex gap-2 flex-wrap">
                {LABEL_PRESETS.map(preset => (
                  <button
                    key={preset}
                    className={`nexus-btn text-xs ${newLabel === preset ? 'nexus-btn-primary' : ''}`}
                    onClick={() => setNewLabel(preset)}
                  >
                    [{preset}]
                  </button>
                ))}
                <button
                  className={`nexus-btn text-xs ${newLabel === 'custom' ? 'nexus-btn-primary' : ''}`}
                  onClick={() => setNewLabel('custom')}
                >
                  [custom]
                </button>
              </div>
              {newLabel === 'custom' && (
                <input
                  className="nexus-input w-full mt-2"
                  type="text"
                  placeholder="custom label"
                  value={newCustomLabel}
                  onChange={(e) => setNewCustomLabel(e.target.value)}
                />
              )}
            </div>

            <div className="nexus-row">
              <span className="nexus-row-label">platform</span>
              <select
                className="nexus-select flex-1"
                value={newPlatform}
                onChange={(e) => setNewPlatform(e.target.value)}
              >
                {PLATFORMS.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div className="nexus-row">
              <span className="nexus-row-label">quorum</span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  className="nexus-input w-12 text-center"
                  value={newM}
                  onChange={(e) => setNewM(parseInt(e.target.value) || 1)}
                  min={1}
                  max={newN}
                />
                <span className="text-zinc-500">of</span>
                <input
                  type="number"
                  className="nexus-input w-12 text-center"
                  value={newN}
                  onChange={(e) => setNewN(parseInt(e.target.value) || 2)}
                  min={1}
                  max={15}
                />
              </div>
            </div>

            {newM > newN && (
              <p className="text-red-400 text-xs">M cannot exceed N</p>
            )}

            <div className="flex gap-2">
              <button
                className="nexus-btn nexus-btn-primary text-xs"
                onClick={handleAdd}
                disabled={newM < 1 || newM > newN || newN > 15}
              >
                [add vault]
              </button>
              <button className="nexus-btn text-xs" onClick={() => setShowAdd(false)}>
                [cancel]
              </button>
            </div>
          </div>
        ) : (
          <button className="nexus-btn" onClick={() => { setShowAdd(true); setEditId(null) }}>
            [add vault]
          </button>
        )}

        <div className="nexus-divider" />

        <div className="nexus-actions">
          <Link href="/dashboard" className="nexus-btn">[back]</Link>
        </div>
      </div>
    </main>
  )
}
