import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="nexus min-h-screen flex items-center justify-center">
      <div className="w-full max-w-3xl mx-auto px-4 py-12 sm:px-6">
        <div className="text-center mb-16">
          <div className="text-zinc-500 text-xs font-mono tracking-widest mb-8">
            KEEP NEXUS
          </div>

          <h1 className="text-zinc-200 text-lg sm:text-xl font-light leading-relaxed">
            The operations layer your Bitcoin custody is missing.
          </h1>
        </div>

        <div className="text-center mb-10">
          <p className="text-zinc-600 text-xs font-mono tracking-wider uppercase">
            I am a...
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
          {/* Bitcoin Holder Path */}
          <Link
            href="/dashboard"
            className="group border border-zinc-800 hover:border-zinc-600 p-6 sm:p-8 transition-all duration-300"
          >
            <div className="text-zinc-500 text-xs font-mono tracking-widest mb-4 group-hover:text-zinc-400 transition-colors">
              BITCOIN HOLDER
            </div>

            <p className="text-zinc-200 text-sm sm:text-base font-light leading-relaxed mb-6">
              Your Bitcoin. Your family.
              <br />
              Protected — even after you&rsquo;re gone.
            </p>

            <p className="text-zinc-500 text-xs font-mono leading-relaxed mb-8">
              Create a portable inheritance plan your family can actually use. No backend. No third party. Just you.
            </p>

            <span className="nexus-btn-primary inline-block group-hover:bg-zinc-200 transition-colors">
              [enter as holder]
            </span>
          </Link>

          {/* CPA / Advisor Path */}
          <Link
            href="/dashboard"
            className="group border border-zinc-800 hover:border-zinc-600 p-6 sm:p-8 transition-all duration-300"
          >
            <div className="text-zinc-500 text-xs font-mono tracking-widest mb-4 group-hover:text-zinc-400 transition-colors">
              CPA / ADVISOR
            </div>

            <p className="text-zinc-200 text-sm sm:text-base font-light leading-relaxed mb-6">
              Add Bitcoin estate planning to your practice.
              <br />
              No technical expertise required.
            </p>

            <p className="text-zinc-500 text-xs font-mono leading-relaxed mb-8">
              Turn Bitcoin-holding clients into your highest-value relationships with defensible, hash-verified documentation.
            </p>

            <span className="nexus-btn-primary inline-block group-hover:bg-zinc-200 transition-colors">
              [enter as advisor]
            </span>
          </Link>
        </div>

        <div className="mt-16 text-center text-zinc-700 text-xs font-mono">
          local-first &middot; no backend &middot; one product, two missions
        </div>
      </div>
    </main>
  )
}
