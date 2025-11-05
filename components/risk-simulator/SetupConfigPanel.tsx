/**
 * SetupConfigPanel - Configure multisig setup (M-of-N, keys, holders)
 * Phase 2: Allows full customization of multisig configuration
 */

'use client'

import { MultisigSetup, Key, StorageType, KeyRole } from '@/lib/risk-simulator/types'
import { useState } from 'react'
import { Plus, Trash2, Copy } from 'lucide-react'

interface SetupConfigPanelProps {
  setup: MultisigSetup
  onUpdate: (setup: MultisigSetup) => void
}

const STORAGE_TYPES: StorageType[] = ['hardware-wallet', 'paper', 'vault', 'digital', 'custodian']

const PRESET_TEMPLATES = [
  { name: '2-of-3 (Basic)', threshold: 2, totalKeys: 3 },
  { name: '3-of-5 (Standard)', threshold: 3, totalKeys: 5 },
  { name: '4-of-7 (Advanced)', threshold: 4, totalKeys: 7 },
]

export function SetupConfigPanel({ setup, onUpdate }: SetupConfigPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  // Update M-of-N threshold
  const handleUpdateThreshold = (threshold: number) => {
    onUpdate({ ...setup, threshold })
  }

  // Update total number of keys
  const handleUpdateTotalKeys = (totalKeys: number) => {
    const currentKeys = setup.keys.length
    let newKeys = [...setup.keys]
    const roleAssignments: KeyRole[] = ['primary', 'spouse', 'child', 'attorney', 'custodian', 'trusted-friend', 'other']

    // Add keys if increasing
    if (totalKeys > currentKeys) {
      for (let i = currentKeys; i < totalKeys; i++) {
        newKeys.push({
          id: `key-${Date.now()}-${i}`,
          holder: `Key Holder ${i + 1}`,
          role: roleAssignments[i] || 'other',
          type: 'full',
          storage: 'hardware-wallet',
          location: 'Location TBD'
        })
      }
    }
    // Remove keys if decreasing
    else if (totalKeys < currentKeys) {
      newKeys = newKeys.slice(0, totalKeys)
    }

    onUpdate({
      ...setup,
      totalKeys,
      threshold: Math.min(setup.threshold, totalKeys), // Ensure threshold <= totalKeys
      keys: newKeys
    })
  }

  // Update individual key
  const handleUpdateKey = (keyId: string, updates: Partial<Key>) => {
    onUpdate({
      ...setup,
      keys: setup.keys.map(key =>
        key.id === keyId ? { ...key, ...updates } : key
      )
    })
  }

  // Remove a key
  const handleRemoveKey = (keyId: string) => {
    const newKeys = setup.keys.filter(key => key.id !== keyId)
    onUpdate({
      ...setup,
      totalKeys: newKeys.length,
      threshold: Math.min(setup.threshold, newKeys.length),
      keys: newKeys
    })
  }

  // Add a new key
  const handleAddKey = () => {
    const roleAssignments: KeyRole[] = ['primary', 'spouse', 'child', 'attorney', 'custodian', 'trusted-friend', 'other']
    const index = setup.keys.length
    const newKey: Key = {
      id: `key-${Date.now()}`,
      holder: `Key Holder ${index + 1}`,
      role: roleAssignments[index] || 'other',
      type: 'full',
      storage: 'hardware-wallet',
      location: 'Location TBD'
    }
    onUpdate({
      ...setup,
      totalKeys: setup.keys.length + 1,
      keys: [...setup.keys, newKey]
    })
  }

  // Load a preset template
  const handleLoadPreset = (threshold: number, totalKeys: number) => {
    const newKeys: Key[] = []

    // Define roles to assign (matching the scenarios)
    const roleAssignments: KeyRole[] = ['primary', 'spouse', 'child', 'attorney', 'custodian', 'trusted-friend', 'other']

    for (let i = 0; i < totalKeys; i++) {
      // Determine holder name and role based on position
      let holderName = `Key Holder ${i + 1}`
      let role: KeyRole = roleAssignments[i] || 'other'

      // Use more descriptive names for common setups
      if (i === 0) {
        holderName = 'Primary Holder'
        role = 'primary'
      } else if (i === 1) {
        holderName = 'Spouse/Partner'
        role = 'spouse'
      } else if (i === 2) {
        holderName = 'Trusted Third Party'
        role = totalKeys === 3 ? 'attorney' : 'child'
      } else if (i === 3) {
        holderName = 'Attorney/Lawyer'
        role = 'attorney'
      } else if (i === 4) {
        holderName = 'Backup Holder'
        role = 'custodian'
      }

      newKeys.push({
        id: `key-${Date.now()}-${i}`,
        holder: holderName,
        role: role,
        type: 'full',
        storage: i < 2 ? 'hardware-wallet' : 'paper',
        location: i === 0 ? 'Home Safe' : i === 1 ? 'Spouse Location' : 'Secure Location'
      })
    }
    onUpdate({
      ...setup,
      threshold,
      totalKeys,
      keys: newKeys
    })
  }

  return (
    <div className="space-y-4">
      {/* Simple Header Display */}
      <div className="text-center py-4">
        <div className="text-3xl font-light text-gray-900">
          {setup.threshold}-of-{setup.totalKeys} Multisig
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-sm text-gray-500 hover:text-gray-700 mt-2"
        >
          {isExpanded ? 'Hide Configuration ▲' : 'Edit Configuration ▼'}
        </button>
      </div>

      {/* Expandable Configuration */}
      {isExpanded && (
        <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-6">

          {/* Preset Templates */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Quick Templates
            </label>
            <div className="flex gap-2">
              {PRESET_TEMPLATES.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => handleLoadPreset(preset.threshold, preset.totalKeys)}
                  className="text-sm px-4 py-2 border border-gray-700 rounded hover:bg-gray-100 text-gray-900 font-medium"
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          {/* M-of-N Selector */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Threshold (M) - Signatures Required
              </label>
              <select
                value={setup.threshold}
                onChange={(e) => handleUpdateThreshold(Number(e.target.value))}
                className="w-full text-sm border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-gray-900 focus:border-gray-900 bg-white text-gray-900"
              >
                {Array.from({ length: setup.totalKeys }, (_, i) => i + 1).map(num => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Total Keys (N)
              </label>
              <select
                value={setup.totalKeys}
                onChange={(e) => handleUpdateTotalKeys(Number(e.target.value))}
                className="w-full text-sm border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-gray-900 focus:border-gray-900 bg-white text-gray-900"
              >
                {[2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Key Configuration */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-xs font-medium text-gray-700">
                Key Holders ({setup.keys.length})
              </label>
              <button
                onClick={handleAddKey}
                className="text-xs px-2 py-1 bg-gray-900 text-white rounded hover:bg-gray-800 flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                Add Key
              </button>
            </div>

            <div className="space-y-3">
              {setup.keys.map((key, index) => (
                <div key={key.id} className="border border-gray-200 rounded p-3">
                  <div className="flex items-start gap-3">
                    {/* Key Number */}
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-900 text-white text-xs flex items-center justify-center mt-1">
                      {index + 1}
                    </div>

                    {/* Key Configuration */}
                    <div className="flex-1 space-y-2">
                      {/* Holder Name */}
                      <input
                        type="text"
                        value={key.holder}
                        onChange={(e) => handleUpdateKey(key.id, { holder: e.target.value })}
                        placeholder="Key holder name"
                        className="w-full text-sm border border-gray-300 rounded px-2 py-1.5 focus:ring-2 focus:ring-gray-900 focus:border-gray-900 bg-white text-gray-900 font-medium"
                      />

                      {/* Role, Storage & Location */}
                      <div className="grid grid-cols-3 gap-2">
                        <select
                          value={key.role || 'other'}
                          onChange={(e) => handleUpdateKey(key.id, { role: e.target.value as KeyRole })}
                          className="text-xs border border-gray-300 rounded px-2 py-1.5 focus:ring-2 focus:ring-gray-900 focus:border-gray-900 bg-white text-gray-900"
                        >
                          <option value="primary">Primary</option>
                          <option value="spouse">Spouse</option>
                          <option value="child">Child</option>
                          <option value="attorney">Attorney</option>
                          <option value="custodian">Custodian</option>
                          <option value="trusted-friend">Trusted Friend</option>
                          <option value="other">Other</option>
                        </select>
                        <select
                          value={key.storage}
                          onChange={(e) => handleUpdateKey(key.id, { storage: e.target.value as StorageType })}
                          className="text-xs border border-gray-300 rounded px-2 py-1.5 focus:ring-2 focus:ring-gray-900 focus:border-gray-900 bg-white text-gray-900"
                        >
                          {STORAGE_TYPES.map(type => (
                            <option key={type} value={type}>
                              {type.replace('-', ' ')}
                            </option>
                          ))}
                        </select>
                        <input
                          type="text"
                          value={key.location}
                          onChange={(e) => handleUpdateKey(key.id, { location: e.target.value })}
                          placeholder="Location"
                          className="text-xs border border-gray-300 rounded px-2 py-1.5 focus:ring-2 focus:ring-gray-900 focus:border-gray-900 bg-white text-gray-900 font-medium"
                        />
                      </div>
                    </div>

                    {/* Remove Button */}
                    {setup.keys.length > 2 && (
                      <button
                        onClick={() => handleRemoveKey(key.id)}
                        className="flex-shrink-0 text-red-600 hover:text-red-700 mt-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="text-xs text-gray-500 bg-gray-50 rounded p-3">
            <strong>Tip:</strong> Your multisig requires <strong>{setup.threshold}</strong> signatures out of <strong>{setup.totalKeys}</strong> total keys. Configure each key holder&apos;s name, storage type, and location for accurate risk analysis.
          </div>

          {/* File Operations */}
          <div className="pt-4 border-t border-gray-200">
            <div className="text-xs text-gray-500 mb-2">Configuration Management</div>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50">
                Import Configuration
              </button>
              <button className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50">
                Export Configuration
              </button>
              <button className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50">
                Generate PDF Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
