'use client'

import { useState } from 'react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setIsLoading(true)

    // TODO: Integrate with NextAuth magic link
    // await signIn('email', { email, redirect: false })

    // Simulate API call for now
    await new Promise(resolve => setTimeout(resolve, 1000))

    setIsLoading(false)
    setIsSubmitted(true)
  }

  if (isSubmitted) {
    return (
      <main className="dark-vault min-h-screen flex items-center justify-center">
        <div className="text-center space-y-6 px-6">
          <h1 className="text-xs font-medium tracking-widest uppercase text-zinc-500">
            KEEP NEXUS
          </h1>
          <div className="space-y-2">
            <p className="text-zinc-300">Check your email</p>
            <p className="text-sm text-zinc-500">
              We sent a login link to {email}
            </p>
          </div>
          <button
            onClick={() => setIsSubmitted(false)}
            className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            Use a different email
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="dark-vault min-h-screen flex items-center justify-center">
      <div className="w-full max-w-sm px-6">
        <form onSubmit={handleSubmit} className="space-y-8">
          <h1 className="text-center text-xs font-medium tracking-widest uppercase text-zinc-500">
            KEEP NEXUS
          </h1>

          <div className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              required
              autoComplete="email"
              autoFocus
              className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg
                         text-zinc-50 placeholder-zinc-600
                         focus:outline-none focus:ring-1 focus:ring-zinc-700 focus:border-zinc-700
                         transition-colors"
            />

            <button
              type="submit"
              disabled={isLoading || !email}
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg
                         text-zinc-300 font-medium
                         hover:bg-zinc-700 hover:border-zinc-600 hover:text-zinc-100
                         focus:outline-none focus:ring-1 focus:ring-zinc-600
                         disabled:opacity-50 disabled:cursor-not-allowed
                         transition-colors"
            >
              {isLoading ? 'Sending...' : 'Continue'}
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}
