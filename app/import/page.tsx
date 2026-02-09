'use client'

import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useFamilySetup } from '@/lib/context/FamilySetup'

export default function ImportPage() {
  const router = useRouter()
  const { loadFromFile } = useFamilySetup()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const processFile = useCallback((file: File) => {
    setError(null)
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string
        const data = JSON.parse(text)

        // Validate required fields
        if (!data.familyName || typeof data.familyName !== 'string') {
          setError('Invalid file: missing familyName')
          return
        }
        if (!data.multisig || typeof data.multisig !== 'object') {
          setError('Invalid file: missing multisig configuration')
          return
        }
        if (!Array.isArray(data.heirs)) {
          setError('Invalid file: missing heirs array')
          return
        }

        loadFromFile(data)
        router.push('/dashboard')
      } catch {
        setError('Invalid file: could not parse JSON')
      }
    }
    reader.onerror = () => setError('Failed to read file')
    reader.readAsText(file)
  }, [loadFromFile, router])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) processFile(file)
  }, [processFile])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
  }, [processFile])

  return (
    <main className="nexus">
      <div className="nexus-container">
        <div className="nexus-title">KEEP NEXUS</div>
        <div className="nexus-family">Import Shard</div>

        <div className="nexus-divider" />

        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`border border-dashed p-8 text-center transition-colors ${
            isDragging
              ? 'border-zinc-500 text-zinc-300'
              : 'border-zinc-700 text-zinc-500 hover:border-zinc-500'
          }`}
        >
          <p className="text-sm mb-4">Drop .keepnexus file here</p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="nexus-btn"
          >
            [browse]
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".keepnexus,.json"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {error && (
          <p className="text-red-500 text-sm mt-4">{error}</p>
        )}

        <div className="nexus-divider" />

        <div className="nexus-actions">
          <Link href="/dashboard" className="nexus-btn">[cancel]</Link>
        </div>
      </div>
    </main>
  )
}
