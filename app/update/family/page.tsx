'use client'

import { useState, useEffect } from 'react'
import { useFamilySetup } from '@/lib/context/FamilySetup'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function UpdateFamilyPage() {
  const router = useRouter()
  const { setup, updateFamilyName } = useFamilySetup()

  const [name, setName] = useState('')

  useEffect(() => {
    setName(setup.family_name || '')
  }, [setup.family_name])

  const handleSave = () => {
    if (name.trim()) {
      updateFamilyName(name.trim())
    }
    router.push('/dashboard')
  }

  return (
    <main className="nexus">
      <div className="nexus-container">
        <div className="nexus-title">KEEP NEXUS · update family</div>

        <div className="nexus-divider" />

        <div className="space-y-4">
          <div className="nexus-row">
            <span className="nexus-row-label">name</span>
            <input
              type="text"
              className="bg-transparent border-b border-zinc-700 text-zinc-200 focus:border-zinc-400 outline-none px-1 py-0.5 font-mono flex-1"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Family name"
              autoFocus
            />
          </div>

          <div className="text-sm text-zinc-600 mt-2">
            Displayed as &quot;{name || '...'} Reserve&quot; on the dashboard
          </div>
        </div>

        <div className="nexus-divider" />

        <div className="nexus-actions">
          <button className="nexus-btn-primary" onClick={handleSave}>[save]</button>
          <Link href="/update" className="nexus-btn">[cancel]</Link>
        </div>
      </div>
    </main>
  )
}
