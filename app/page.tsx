import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="nexus min-h-screen flex items-center">
      <div className="nexus-container">
        <div className="text-zinc-500 text-xs font-mono tracking-widest mb-12">
          KEEP NEXUS
        </div>

        <div className="text-amber-500/60 text-4xl mb-8" aria-hidden="true">
          ₿
        </div>

        <h1 className="text-zinc-200 text-xl sm:text-2xl font-light leading-relaxed max-w-sm">
          Your Bitcoin lives on —
          <br />
          for the people you love.
        </h1>

        <div className="nexus-divider" />

        <p className="text-zinc-500 text-sm font-mono leading-relaxed max-w-sm">
          A living Bitcoin legacy system your family can actually use. No third party. Just you.
        </p>

        <div className="mt-12">
          <Link
            href="/dashboard"
            className="inline-block px-6 py-3 text-sm font-mono bg-amber-600/90 text-zinc-950 hover:bg-amber-500 transition-colors"
          >
            [build your shard]
          </Link>
        </div>

        <div className="mt-6">
          <a
            href="https://backed-x-bitcoin.gitbook.io/keep-protocol/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-600 text-xs font-mono hover:text-zinc-400 transition-colors"
          >
            [read the docs]
          </a>
        </div>

        <div className="mt-12 text-zinc-700 text-xs font-mono">
          local-first &middot; no backend &middot; sovereign
        </div>
      </div>
    </main>
  )
}
