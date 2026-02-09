'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useFamilySetup } from '@/lib/context/FamilySetup'
import { assembleProofOfControl } from '@/lib/proof-of-control/generate'
import { generateProofPDF } from '@/lib/proof-of-control/pdf'

export default function ProofPage() {
  const { setup, addEventLogEntry } = useFamilySetup()
  const [generated, setGenerated] = useState(false)

  const packet = assembleProofOfControl(setup)

  const handleGeneratePDF = () => {
    const doc = generateProofPDF(packet)
    const date = new Date().toISOString().split('T')[0]
    const filename = `${setup.family_name.toLowerCase().replace(/\s+/g, '-')}-proof-of-control-${date}.pdf`
    doc.save(filename)
    addEventLogEntry('proof.generated', 'Proof of Control PDF generated')
    setGenerated(true)
    setTimeout(() => setGenerated(false), 3000)
  }

  if (!setup.family_name) {
    return (
      <main className="nexus">
        <div className="nexus-container">
          <div className="nexus-title">KEEP NEXUS</div>
          <div className="nexus-family">Proof of Control</div>
          <div className="nexus-divider" />
          <p className="text-sm text-zinc-400">No shard loaded. Create or import a shard first.</p>
          <div className="nexus-actions mt-8">
            <Link href="/dashboard" className="nexus-btn">[back]</Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="nexus">
      <div className="nexus-container">
        <div className="nexus-title">KEEP NEXUS</div>
        <div className="nexus-family">Proof of Control</div>

        <div className="nexus-divider" />

        <p className="text-xs text-zinc-500 mb-4">
          Custody structure proof — no sensitive data included
        </p>

        {/* Header info */}
        <div className="space-y-1 mb-2">
          <div className="nexus-row">
            <span className="nexus-row-label">family</span>
            <span className="nexus-row-value">{packet.family_name}</span>
          </div>
          <div className="nexus-row">
            <span className="nexus-row-label">thap</span>
            <span className="nexus-row-value font-mono text-xs">
              {packet.thap_hash.length > 20
                ? packet.thap_hash.slice(0, 16) + '...'
                : packet.thap_hash}
            </span>
          </div>
          <div className="nexus-row">
            <span className="nexus-row-label">generated</span>
            <span className="nexus-row-value">{packet.generated_at.split('T')[0]}</span>
          </div>
        </div>

        <div className="nexus-divider" />

        {/* Section previews */}
        {packet.sections.map((section, idx) => (
          <div key={idx}>
            <div className="text-xs text-zinc-500 uppercase tracking-wider mb-2 mt-4">
              {section.title}
            </div>
            <div className="space-y-1">
              {section.rows.map((row, rowIdx) => (
                <div key={rowIdx} className="nexus-row">
                  <span className="nexus-row-label">{row.label}</span>
                  <span className="nexus-row-value">{row.value}</span>
                </div>
              ))}
            </div>
            {idx < packet.sections.length - 1 && <div className="nexus-divider" />}
          </div>
        ))}

        <div className="nexus-divider" />

        <div className="nexus-actions">
          <button
            className="nexus-btn-primary"
            onClick={handleGeneratePDF}
          >
            {generated ? '[downloaded]' : '[generate pdf]'}
          </button>
          <Link href="/dashboard" className="nexus-btn">[back]</Link>
        </div>
      </div>
    </main>
  )
}
