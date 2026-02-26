'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { IS_DESKTOP } from '@/lib/platform'

const GATE_KEY = 'keepnexus-email-submitted'

export default function GatePage() {
  const router = useRouter()
  const [submitted, setSubmitted] = useState(false)

  // Desktop skips the gate entirely
  useEffect(() => {
    if (IS_DESKTOP) {
      router.replace('/dashboard')
      return
    }
    if (localStorage.getItem(GATE_KEY) === 'true') {
      router.replace('/dashboard')
    }
  }, [router])

  // Listen for Tally form submission
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data?.event === 'Tally.FormSubmitted') {
        localStorage.setItem(GATE_KEY, 'true')
        setSubmitted(true)
      }
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  return (
    <main className="nexus min-h-screen flex items-center">
      <div className="nexus-container">
        <div className="text-zinc-500 text-xs font-mono tracking-widest mb-8">
          KEEP NEXUS
        </div>

        {!submitted ? (
          <>
            <h2 className="text-zinc-200 text-lg font-light leading-relaxed mb-2">
              Enter your email to access the portal.
            </h2>
            <p className="text-zinc-500 text-xs font-mono mb-6">
              Free access. No spam. Just updates on the protocol.
            </p>

            <div className="nexus-divider" />

            <div className="w-full max-w-sm">
              <iframe
                src="https://tally.so/embed/D4dz6p?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1"
                width="100%"
                height="200"
                frameBorder={0}
                title="Get Access"
                style={{ background: 'transparent' }}
              />
            </div>

            <div className="nexus-divider" />

            <Link href="/" className="text-zinc-600 text-xs font-mono hover:text-zinc-400 transition-colors">
              &larr; back
            </Link>
          </>
        ) : (
          <>
            <h2 className="text-zinc-200 text-lg font-light leading-relaxed mb-4">
              You&rsquo;re in.
            </h2>

            <Link
              href="/dashboard"
              className="inline-block px-6 py-3 text-sm font-mono bg-amber-600/90 text-zinc-950 hover:bg-amber-500 transition-colors"
            >
              [enter the portal]
            </Link>
          </>
        )}
      </div>
    </main>
  )
}
