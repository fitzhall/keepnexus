'use client'

import { useState, useEffect } from 'react'
import { useFamilySetup, Heir } from '@/lib/context/FamilySetup'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const RELATIONSHIP_OPTIONS = [
  'spouse',
  'child',
  'parent',
  'sibling',
  'trust',
  'charity',
  'other'
]

export default function UpdateHeirsPage() {
  const router = useRouter()
  const { setup, updateHeirs } = useFamilySetup()

  const [heirs, setHeirs] = useState<Heir[]>([])

  useEffect(() => {
    if (setup.heirs?.length > 0) {
      setHeirs(setup.heirs)
    }
  }, [setup.heirs])

  const addHeir = () => {
    const newHeir: Heir = {
      id: `heir-${Date.now()}`,
      name: '',
      relationship: 'child',
      allocation: 0,
      isKeyHolder: false
    }
    setHeirs([...heirs, newHeir])
  }

  const updateHeir = (index: number, field: keyof Heir, value: string | number | boolean) => {
    const newHeirs = [...heirs]
    newHeirs[index] = { ...newHeirs[index], [field]: value }
    setHeirs(newHeirs)
  }

  const removeHeir = (index: number) => {
    setHeirs(heirs.filter((_, i) => i !== index))
  }

  const handleSave = () => {
    updateHeirs(heirs)
    router.push('/dashboard')
  }

  const totalAllocation = heirs.reduce((sum, h) => sum + (h.allocation || 0), 0)

  return (
    <main className="nexus">
      <div className="nexus-container">
        <div className="nexus-title">KEEP NEXUS · update heirs</div>

        <div className="nexus-divider" />

        {/* Column Headers */}
        <div className="nexus-row text-xs text-zinc-500 uppercase tracking-wider mb-4">
          <span className="w-32">name</span>
          <span className="w-24">relationship</span>
          <span className="w-16 text-right">%</span>
          <span className="w-20 text-center">keyholder</span>
          <span className="w-8"></span>
        </div>

        {/* Heir Rows */}
        <div className="space-y-3">
          {heirs.map((heir, idx) => (
            <div key={heir.id} className="flex items-center gap-2">
              <input
                type="text"
                className="nexus-input w-32"
                value={heir.name}
                onChange={(e) => updateHeir(idx, 'name', e.target.value)}
                placeholder="Name"
              />
              <select
                className="nexus-select w-24"
                value={heir.relationship}
                onChange={(e) => updateHeir(idx, 'relationship', e.target.value)}
              >
                {RELATIONSHIP_OPTIONS.map(rel => (
                  <option key={rel} value={rel}>{rel}</option>
                ))}
              </select>
              <div className="w-16 flex items-center">
                <input
                  type="number"
                  className="nexus-input w-12 text-right"
                  value={heir.allocation || 0}
                  onChange={(e) => updateHeir(idx, 'allocation', parseInt(e.target.value) || 0)}
                  min={0}
                  max={100}
                />
                <span className="text-zinc-500 ml-1">%</span>
              </div>
              <div className="w-20 flex justify-center">
                <input
                  type="checkbox"
                  className="nexus-checkbox"
                  checked={heir.isKeyHolder || false}
                  onChange={(e) => updateHeir(idx, 'isKeyHolder', e.target.checked)}
                />
              </div>
              <button
                className="text-zinc-600 hover:text-zinc-400 w-8 text-center"
                onClick={() => removeHeir(idx)}
              >
                ×
              </button>
            </div>
          ))}
        </div>

        {/* Total */}
        {heirs.length > 0 && (
          <div className="mt-4 text-sm">
            <span className="text-zinc-500">total: </span>
            <span className={totalAllocation === 100 ? 'text-green-500' : 'text-yellow-500'}>
              {totalAllocation}%
            </span>
            {totalAllocation !== 100 && (
              <span className="text-zinc-600 ml-2">(should be 100%)</span>
            )}
          </div>
        )}

        <div className="nexus-divider" />

        <div className="nexus-actions">
          <button className="nexus-btn" onClick={addHeir}>[add heir]</button>
          <button className="nexus-btn-primary" onClick={handleSave}>[save]</button>
          <Link href="/dashboard" className="nexus-btn">[cancel]</Link>
        </div>
      </div>
    </main>
  )
}
