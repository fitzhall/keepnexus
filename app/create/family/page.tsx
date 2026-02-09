'use client'

import { useState, useEffect } from 'react'
import { useFamilySetup } from '@/lib/context/FamilySetup'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function CreateFamilyPage() {
  const router = useRouter()
  const { setup, updateFamilyName } = useFamilySetup()
  const [name, setName] = useState('')

  useEffect(() => {
    if (setup.familyName && setup.familyName !== 'Chen Family') {
      setName(setup.familyName)
    }
  }, [setup.familyName])

  const handleNext = () => {
    if (!name.trim()) return
    updateFamilyName(name.trim())
    router.push('/create/vault')
  }

  return (
    <main className="nexus">
      <div className="nexus-container">
        <div className="nexus-title">KEEP NEXUS · create · 1/7</div>

        <div className="nexus-divider" />

        <div className="space-y-4">
          <label className="text-sm text-zinc-500 block">family name</label>
          <input
            type="text"
            className="bg-transparent border-b border-zinc-700 text-zinc-200 focus:border-zinc-400 outline-none px-1 py-0.5 font-mono w-full text-lg"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Chen Family"
            autoFocus
          />
        </div>

        <div className="nexus-divider" />

        <div className="nexus-actions">
          <Link href="/create" className="nexus-btn">[back]</Link>
          <button
            className="nexus-btn-primary"
            onClick={handleNext}
            disabled={!name.trim()}
          >
            [next]
          </button>
          <Link href="/dashboard" className="nexus-btn">[cancel]</Link>
        </div>
      </div>
    </main>
  )
}
