'use client'

import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useFamilySetup } from '@/lib/context/FamilySetup'
import { IS_DESKTOP } from '@/lib/platform'
import { openFileNative } from '@/lib/desktop/file-ops'

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

        // Accept v2 format (family_name) or v1 format (familyName)
        if (!data.family_name && !data.familyName) {
          setError('Invalid file: missing family name')
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

  const handleNativeOpen = useCallback(async () => {
    setError(null)
    try {
      const text = await openFileNative()
      if (!text) return // user cancelled

      const data = JSON.parse(text)
      if (!data.family_name && !data.familyName) {
        setError('Invalid file: missing family name')
        return
      }

      loadFromFile(data)
      router.push('/dashboard')
    } catch {
      setError('Invalid file: could not parse JSON')
    }
  }, [loadFromFile, router])

  return (
    <main className="nexus">
      <div className="nexus-container">
        <div className="nexus-title">KEEP NEXUS</div>
        <div className="nexus-family">Import Keep File</div>

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
          <p className="text-sm mb-4">Drop .keep, .keepnexus, or .shard file here</p>
          <button
            onClick={IS_DESKTOP ? handleNativeOpen : () => fileInputRef.current?.click()}
            className="nexus-btn"
          >
            [browse]
          </button>
          {!IS_DESKTOP && (
            <input
              ref={fileInputRef}
              type="file"
              accept=".keep,.keepnexus,.shard,.json"
              onChange={handleFileSelect}
              className="hidden"
            />
          )}
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
