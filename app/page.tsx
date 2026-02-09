import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="nexus min-h-screen flex items-center">
      <div className="nexus-container">
        <div className="text-zinc-500 text-xs font-mono tracking-widest mb-12">
          KEEP NEXUS
        </div>

        <h1 className="text-zinc-200 text-lg font-light leading-relaxed max-w-sm">
          The operations layer
          <br />
          your Bitcoin custody
          <br />
          is missing.
        </h1>

        <div className="nexus-divider" />

        <p className="text-zinc-500 text-sm font-mono leading-relaxed max-w-xs">
          Manage and verify your holdings across generations. Simple. Portable. Sovereign.
        </p>

        <div className="mt-12 flex gap-4">
          <Link href="/dashboard" className="nexus-btn-primary">[enter]</Link>
        </div>

        <div className="mt-16 text-zinc-700 text-xs font-mono">
          v2 &middot; local-first &middot; no backend
        </div>
      </div>
    </main>
  )
}
