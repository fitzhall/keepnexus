'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useFamilySetup } from '@/lib/context/FamilySetup'

type Role = 'attorney' | 'cpa' | 'advisor'
type Expiry = '24h' | '7d' | '30d'

export default function SharePage() {
  const router = useRouter()
  const { setup } = useFamilySetup()
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [expiry, setExpiry] = useState<Expiry>('7d')
  const [shareUrl, setShareUrl] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const selectRole = (role: Role) => {
    setSelectedRole(role)
    const cs = setup.captainSettings
    if (role === 'attorney') {
      setName(cs?.professionalNetwork?.attorney || '')
      setEmail('')
    } else if (role === 'cpa') {
      setName(setup.taxSettings?.cpaName || '')
      setEmail(setup.taxSettings?.cpaEmail || '')
    } else if (role === 'advisor') {
      setName(cs?.advisorName || '')
      setEmail(cs?.advisorEmail || '')
    }
  }

  const handleGenerate = () => {
    if (!email || !selectedRole) return
    const randomId = Math.random().toString(36).substring(2, 10)
    const url = `https://keep.nexus/share/${randomId}?expires=${expiry}`
    setShareUrl(url)
  }

  const handleCopy = () => {
    if (!shareUrl) return
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Success state
  if (shareUrl) {
    return (
      <main className="nexus">
        <div className="nexus-container">
          <div className="nexus-title">KEEP NEXUS</div>
          <div className="nexus-family">Share Link Ready</div>

          <div className="nexus-divider" />

          <p className="text-sm text-zinc-400 mb-2">
            Send this link to your {selectedRole}:
          </p>

          <div className="border border-zinc-700 p-3 text-sm text-zinc-300 break-all font-mono">
            {shareUrl}
          </div>

          <div className="nexus-actions">
            <button onClick={handleCopy} className="nexus-btn">
              {copied ? '[copied]' : '[copy]'}
            </button>
            <Link href="/dashboard" className="nexus-btn">[done]</Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="nexus">
      <div className="nexus-container">
        <div className="nexus-title">KEEP NEXUS</div>
        <div className="nexus-family">Share Shard</div>

        <div className="nexus-divider" />

        {!selectedRole ? (
          <>
            <p className="text-sm text-zinc-400 mb-4">Share shard with:</p>
            <div className="nexus-actions">
              <button onClick={() => selectRole('attorney')} className="nexus-btn">[attorney]</button>
              <button onClick={() => selectRole('cpa')} className="nexus-btn">[cpa]</button>
              <button onClick={() => selectRole('advisor')} className="nexus-btn">[advisor]</button>
            </div>
          </>
        ) : (
          <>
            <p className="text-sm text-zinc-400 mb-4">
              Sharing with: <span className="text-zinc-200">{selectedRole}</span>
            </p>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-zinc-500 block mb-1">name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Name or firm"
                  className="nexus-input w-full"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-500 block mb-1">email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@firm.com"
                  className="nexus-input w-full"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-500 block mb-1">expires</label>
                <div className="flex gap-2">
                  {(['24h', '7d', '30d'] as Expiry[]).map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setExpiry(opt)}
                      className={`px-3 py-1 text-sm border transition-colors ${
                        expiry === opt
                          ? 'border-zinc-400 text-zinc-200'
                          : 'border-zinc-700 text-zinc-500 hover:border-zinc-500'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="nexus-actions">
              <button
                onClick={handleGenerate}
                disabled={!email}
                className={`nexus-btn-primary ${!email ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                [generate link]
              </button>
              <Link href="/dashboard" className="nexus-btn">[cancel]</Link>
            </div>
          </>
        )}
      </div>
    </main>
  )
}
