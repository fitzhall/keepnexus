/**
 * FirstRunModal - Welcome new users to the file-first system
 * Shows on first dashboard load, explains .keepnexus file architecture
 * Bitcoin ethos: Your file, your data, your control
 */

'use client'

import { FileText, Upload, Sparkles, X } from 'lucide-react'
import { m } from 'framer-motion'

interface FirstRunModalProps {
  isOpen: boolean
  onDismiss: () => void
  onImport: () => void
  onStartFresh: () => void
}

export function FirstRunModal({ isOpen, onDismiss, onImport, onStartFresh }: FirstRunModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <m.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg max-w-lg w-full p-6 lg:p-8"
      >
        {/* Header */}
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
            <FileText className="w-6 h-6 text-gray-900" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Welcome to KeepNexus
            </h2>
            <p className="text-sm text-gray-600">
              Your self-sovereign Bitcoin estate planning platform
            </p>
          </div>
          <button
            onClick={onDismiss}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Explanation */}
        <div className="mb-6 space-y-4">
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              File-First Architecture
            </h3>
            <p className="text-sm text-gray-700 mb-3">
              KeepNexus uses <strong>.keepnexus</strong> files as your source of truth.
              Think "Git for Bitcoin Estate Planning."
            </p>
            <ul className="text-sm text-gray-600 space-y-1.5">
              <li className="flex items-start gap-2">
                <span className="text-gray-900">•</span>
                <span><strong>Your file, your data</strong> - You own it completely</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gray-900">•</span>
                <span><strong>Works offline forever</strong> - No server dependency</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gray-900">•</span>
                <span><strong>Portable & encrypted</strong> - AES-256-GCM security</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gray-900">•</span>
                <span><strong>Zero lock-in</strong> - Take your config anywhere</span>
              </li>
            </ul>
          </div>

          <p className="text-sm text-gray-600">
            To get started, you can either import an existing .keepnexus file or start fresh
            with our demo configuration (Chen Family example).
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => {
              onImport()
              onDismiss()
            }}
            className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
          >
            <Upload className="w-5 h-5" />
            Import Existing File
          </button>

          <button
            onClick={() => {
              onStartFresh()
              onDismiss()
            }}
            className="w-full flex items-center justify-center gap-3 px-4 py-3.5 border-2 border-gray-300 text-gray-900 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            <Sparkles className="w-5 h-5" />
            Start Fresh with Demo
          </button>
        </div>

        {/* Footer Note */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            You can always import/export .keepnexus files from the dashboard header.
            This welcome screen won't show again.
          </p>
        </div>
      </m.div>
    </div>
  )
}
