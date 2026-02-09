'use client'

import { useState } from 'react'

export default function HomePage() {
  const [showForm, setShowForm] = useState(false)

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
          {!showForm ? (
            <button
              onClick={() => setShowForm(true)}
              className="nexus-btn-primary"
            >
              [request access]
            </button>
          ) : (
            <div className="w-full max-w-sm">
              <iframe
                data-tally-src="https://tally.so/embed/D4dz6p?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1"
                loading="lazy"
                width="100%"
                height="200"
                frameBorder={0}
                title="Request Access"
                className="border-0"
              />
              <script
                dangerouslySetInnerHTML={{
                  __html: `
                    var d=document,w="https://tally.so/widgets/embed.js";
                    if(!d.querySelector('script[src="'+w+'"]')){
                      var s=d.createElement("script");s.src=w;s.async=true;
                      d.head.appendChild(s);
                    }
                  `,
                }}
              />
            </div>
          )}
        </div>

        <div className="mt-4">
          <a href="/verify" className="text-zinc-600 text-xs font-mono hover:text-zinc-400 transition-colors">
            have an access code?
          </a>
        </div>

        <div className="mt-16 text-zinc-700 text-xs font-mono">
          by invitation only &middot; local-first &middot; no backend
        </div>
      </div>
    </main>
  )
}
