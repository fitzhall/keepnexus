import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="nexus min-h-screen flex items-center">
      <div className="nexus-container">
        <div className="text-zinc-500 text-xs font-mono tracking-widest mb-12">
          KEEP NEXUS
        </div>

        <h1 className="text-zinc-200 text-xl sm:text-2xl font-light leading-relaxed max-w-md">
          The people you love will be able to access what you built —
          <br />
          even if you&rsquo;re not there to explain it.
        </h1>

        <div className="nexus-divider" />

        <p className="text-zinc-500 text-sm font-mono leading-relaxed max-w-sm">
          A portable Bitcoin inheritance plan your family can actually use. No backend. No third party. Just you.
        </p>

        <div className="mt-12">
          <Link href="/dashboard" className="nexus-btn-primary">
            [start your plan]
          </Link>
        </div>

        <div className="mt-16 text-zinc-700 text-xs font-mono">
          local-first &middot; no backend &middot; sovereign
        </div>
      </div>
    </main>
  )
}
