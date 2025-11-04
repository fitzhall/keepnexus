/**
 * FileExport - Export current configuration as encrypted .keepnexus file
 * Bitcoin ethos: Your configuration, your file, your control
 * NOW INCLUDES: Complete family plan with governance rules
 */

'use client'

import { useState } from 'react'
import { Download, Lock, AlertCircle } from 'lucide-react'
import { MultisigSetup, SimulationResult } from '@/lib/risk-simulator/types'
import { keepNexusFileService, AuditEntry } from '@/lib/risk-simulator/file-export'
import { useFamilySetup } from '@/lib/context/FamilySetup'
import { m } from 'framer-motion'

interface FileExportProps {
  setup: MultisigSetup
  analysis?: {
    results: SimulationResult[]
    resilienceScore: number
  }
  existingAuditTrail?: AuditEntry[]
}

export function FileExport({ setup, analysis, existingAuditTrail }: FileExportProps) {
  const { setup: contextSetup } = useFamilySetup()
  const [isOpen, setIsOpen] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isExporting, setIsExporting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleExport = async () => {
    setError(null)

    // Validation
    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setIsExporting(true)

    try {
      // Create the KeepNexus file WITH FULL CONTEXT (governance rules, heirs, trust)
      const file = keepNexusFileService.createFile(
        setup,
        analysis,
        contextSetup.governanceRules,
        contextSetup.heirs,
        contextSetup.trust,
        existingAuditTrail
      )

      // Encrypt the file
      const encryptedFile = await keepNexusFileService.encryptFile(file, password)

      // Convert to downloadable blob
      const blob = await keepNexusFileService.exportToBlob(encryptedFile)

      // Generate filename
      const filename = keepNexusFileService.generateFilename(setup.family)

      // Trigger download
      keepNexusFileService.downloadFile(blob, filename)

      // Success!
      setSuccess(true)
      setPassword('')
      setConfirmPassword('')

      setTimeout(() => {
        setSuccess(false)
        setIsOpen(false)
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export file')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <>
      {/* Export Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
      >
        <Download className="w-4 h-4" />
        Export Configuration
      </button>

      {/* Export Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <m.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg max-w-md w-full p-6"
          >
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                <Lock className="w-5 h-5 text-gray-700" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Export Configuration
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Create an encrypted backup of your multisig setup
                </p>
              </div>
            </div>

            {/* Configuration Summary */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Family:</span>
                  <span className="font-medium text-gray-900">{setup.family}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Configuration:</span>
                  <span className="font-medium text-gray-900">
                    {setup.threshold}-of-{setup.totalKeys}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Keys:</span>
                  <span className="font-medium text-gray-900">{setup.keys.length}</span>
                </div>
                {analysis && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Resilience:</span>
                    <span className="font-medium text-gray-900">{analysis.resilienceScore}%</span>
                  </div>
                )}
              </div>
            </div>

            {/* Security Info */}
            <div className="space-y-3 mb-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex gap-2">
                  <div className="text-green-700 flex-shrink-0 mt-0.5">🔒</div>
                  <div className="text-xs text-green-800">
                    <strong>Safe to store:</strong> This file contains NO private keys or seed phrases.
                    It&apos;s a configuration map showing WHO holds keys and WHERE they&apos;re stored.
                  </div>
                </div>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex gap-2">
                  <AlertCircle className="w-4 h-4 text-yellow-700 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-yellow-800">
                    <strong>Important:</strong> Choose a strong password. This file is encrypted
                    client-side - we cannot recover your password if lost.
                  </div>
                </div>
              </div>
            </div>

            {/* Password Fields */}
            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Encryption Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 bg-white text-gray-900"
                  disabled={isExporting || success}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 bg-white text-gray-900"
                  disabled={isExporting || success}
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-700">
                  ✓ File exported successfully!
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setIsOpen(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={isExporting}
              >
                Cancel
              </button>
              <button
                onClick={handleExport}
                disabled={isExporting || success || !password || !confirmPassword}
                className="flex-1 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isExporting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Encrypting...
                  </>
                ) : success ? (
                  '✓ Downloaded'
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Export File
                  </>
                )}
              </button>
            </div>

            {/* File Info */}
            <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
              <p className="text-xs text-gray-500 text-center">
                File will be saved as: <strong>{keepNexusFileService.generateFilename(setup.family)}</strong>
              </p>
              <div className="bg-blue-50 rounded p-2">
                <p className="text-xs text-blue-800 text-center">
                  💡 This file can only be opened by importing it back into KeepNexus. Store it safely like a Bitcoin wallet backup.
                </p>
              </div>
            </div>
          </m.div>
        </div>
      )}
    </>
  )
}
