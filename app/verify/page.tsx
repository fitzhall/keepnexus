'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { grantAccess } from '@/lib/hooks/useAccessGate'

// Valid access codes — add codes here when you grant access
const VALID_CODES = new Set([
  'KEEP-VAULT-7X9M',
  'KEEP-NEXUS-4R2K',
  'KEEP-ALPHA-8W5J',
])

export default function VerifyPage() {
  const router = useRouter()
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [verifying, setVerifying] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setVerifying(true)

    const trimmed = code.trim().toUpperCase()

    // Simulate a brief verification delay for feel
    setTimeout(() => {
      if (VALID_CODES.has(trimmed)) {
        grantAccess(trimmed)
        router.push('/dashboard')
      } else {
        setError('invalid access code')
        setVerifying(false)
      }
    }, 800)
  }

  return (
    <main className="nexus min-h-screen flex items-center">
      <div className="nexus-container">
        <div className="text-zinc-500 text-xs font-mono tracking-widest mb-12">
          KEEP NEXUS
        </div>

        <h2 className="text-zinc-200 text-lg font-light mb-2">
          Enter access code
        </h2>
        <p className="text-zinc-600 text-xs font-mono mb-8">
          Check your email for your invitation code.
        </p>

        <div className="nexus-divider" />

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          <div>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="KEEP-XXXX-XXX"
              className="w-full max-w-xs bg-transparent border border-zinc-800 text-zinc-200 font-mono text-sm px-4 py-3 focus:border-zinc-500 focus:outline-none transition-colors placeholder:text-zinc-700 tracking-wider"
              autoFocus
              disabled={verifying}
            />
          </div>

          {error && (
            <p className="text-red-500/80 text-xs font-mono">{error}</p>
          )}

          <button
            type="submit"
            disabled={!code.trim() || verifying}
            className="nexus-btn disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {verifying ? '[verifying...]' : '[verify]'}
          </button>
        </form>

        <div className="nexus-divider" />

        <Link href="/" className="text-zinc-600 text-xs font-mono hover:text-zinc-400 transition-colors">
          &larr; back
        </Link>
      </div>
    </main>
  )
}
