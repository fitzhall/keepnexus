'use client'

import { useState } from 'react'
import { useFamilySetup } from '@/lib/context/FamilySetup'
import Link from 'next/link'
import type { Wallet } from '@/lib/keep-core/data-model'

const PLATFORMS = ['Theya', 'Casa', 'Unchained', 'Nunchuk', 'Other']
const LABEL_PRESETS = ['cold', 'warm', 'hot']

export default function UpdateVaultPage() {
  const { setup, addWallet, updateWallet, removeWallet } = useFamilySetup()
  const [showAdd, setShowAdd] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null)

  // New wallet form state
  const [newLabel, setNewLabel] = useState('cold')
  const [newCustomLabel, setNewCustomLabel] = useState('')
  const [newPlatform, setNewPlatform] = useState('Unchained')
  const [newM, setNewM] = useState(2)
  const [newN, setNewN] = useState(3)

  // Edit wallet form state
  const [editPlatform, setEditPlatform] = useState('')
  const [editM, setEditM] = useState(2)
  const [editN, setEditN] = useState(3)

  const startEdit = (wallet: Wallet) => {
    setEditId(wallet.id)
    setEditPlatform(wallet.platform || '')
    setEditM(wallet.threshold || 2)
    setEditN(wallet.total_keys || 3)
    setShowAdd(false)
  }

  const saveEdit = (wallet: Wallet) => {
    updateWallet(wallet.id, {
      platform: editPlatform,
      threshold: editM,
      total_keys: editN,
    })
    setEditId(null)
  }

  const handleAdd = () => {
    if (newM < 1 || newM > newN || newN > 15) return
    const label = newLabel === 'custom' ? (newCustomLabel.trim() || 'wallet') : newLabel
    const wallet: Wallet = {
      id: `wallet-${label}-${Date.now()}`,
      label,
      descriptor: '',
      threshold: newM,
      total_keys: newN,
      platform: newPlatform,
      created_at: new Date().toISOString(),
    }
    addWallet(wallet)
    setShowAdd(false)
    setNewLabel('cold')
    setNewCustomLabel('')
    setNewPlatform('Unchained')
    setNewM(2)
    setNewN(3)
  }

  const handleRemove = (id: string) => {
    removeWallet(id)
    setConfirmRemove(null)
  }

  return (
    <main className="nexus">
      <div className="nexus-container">
        <div className="nexus-title">KEEP NEXUS · wallets</div>

        <div className="nexus-divider" />

        {setup.wallets.length === 0 ? (
          <p className="text-zinc-500 text-sm font-mono">no wallets configured</p>
        ) : (
          <div className="space-y-4">
            {setup.wallets.map(wallet => (
              <div key={wallet.id} className="space-y-2">
                <div
                  className="nexus-row hover:text-zinc-100 transition-colors cursor-pointer"
                  onClick={() => editId === wallet.id ? setEditId(null) : startEdit(wallet)}
                >
                  <span className="text-zinc-300 font-medium">{wallet.label}</span>
                  <span className="nexus-row-value">
                    {wallet.threshold}-of-{wallet.total_keys}
                    {wallet.platform ? ` · ${wallet.platform}` : ''}
                  </span>
                </div>

                {/* Inline edit */}
                {editId === wallet.id && (
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
                      <button className="nexus-btn nexus-btn-primary text-xs" onClick={() => saveEdit(wallet)}>
                        [save]
                      </button>
                      <button className="nexus-btn text-xs" onClick={() => setEditId(null)}>
                        [cancel]
                      </button>
                      {confirmRemove === wallet.id ? (
                        <button
                          className="nexus-btn text-xs text-red-400 hover:text-red-300"
                          onClick={() => handleRemove(wallet.id)}
                        >
                          [confirm remove]
                        </button>
                      ) : (
                        <button
                          className="nexus-btn text-xs text-zinc-600 hover:text-red-400"
                          onClick={() => setConfirmRemove(wallet.id)}
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

        {/* Add wallet inline form */}
        {showAdd ? (
          <div className="space-y-4">
            <div className="text-zinc-400 text-xs uppercase tracking-wider">new wallet</div>

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
                [add wallet]
              </button>
              <button className="nexus-btn text-xs" onClick={() => setShowAdd(false)}>
                [cancel]
              </button>
            </div>
          </div>
        ) : (
          <button className="nexus-btn" onClick={() => { setShowAdd(true); setEditId(null) }}>
            [add wallet]
          </button>
        )}

        <div className="nexus-divider" />

        <div className="nexus-actions">
          <Link href="/dashboard" className="nexus-btn">[cancel]</Link>
        </div>
      </div>
    </main>
  )
}
