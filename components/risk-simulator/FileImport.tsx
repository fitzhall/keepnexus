/**
 * FileImport - Import encrypted .keepnexus configuration file
 * Bitcoin ethos: Portable, self-sovereign data
 */

'use client'

import { useState, useRef } from 'react'
import { Upload, Lock, AlertCircle, FileText } from 'lucide-react'
import { MultisigSetup } from '@/lib/risk-simulator/types'
import { keepNexusFileService, KeepNexusFile } from '@/lib/risk-simulator/file-export'
import { m } from 'framer-motion'

interface FileImportProps {
  onImport: (file: KeepNexusFile) => void
  externalIsOpen?: boolean  // Optional external control
  onClose?: () => void       // Optional close callback
}

export function FileImport({ onImport, externalIsOpen, onClose }: FileImportProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false)
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen
  const setIsOpen = onClose || setInternalIsOpen
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [password, setPassword] = useState('')
  const [isImporting, setIsImporting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fileMetadata, setFileMetadata] = useState<any>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (file: File) => {
    setError(null)
    setSelectedFile(file)

    // Try to read file metadata (unencrypted)
    try {
      const blob = new Blob([file])
      const text = await blob.text()
      const data = JSON.parse(text)

      setFileMetadata({
        family: data.family,
        version: data.version,
        created: new Date(data.created),
        modified: new Date(data.modified)
      })
    } catch (err) {
      setError('Invalid .keepnexus file format')
      setSelectedFile(null)
    }
  }

  const handleImport = async () => {
    if (!selectedFile || !password) return

    setError(null)
    setIsImporting(true)

    try {
      // Read the file as blob
      const blob = new Blob([selectedFile])

      // Import the encrypted file structure
      const encryptedFile = await keepNexusFileService.importFromBlob(blob)

      // Decrypt the file
      const decryptedFile = await keepNexusFileService.decryptFile(encryptedFile, password)

      // Pass to parent
      onImport(decryptedFile)

      // Success - close modal
      setIsOpen(false)
      setSelectedFile(null)
      setPassword('')
      setFileMetadata(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import file')
    } finally {
      setIsImporting(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.name.endsWith('.keepnexus')) {
      handleFileSelect(file)
    } else {
      setError('Please upload a .keepnexus file')
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  return (
    <>
      {/* Import Button - only show if not externally controlled */}
      {externalIsOpen === undefined && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Upload className="w-4 h-4" />
          Import Configuration
        </button>
      )}

      {/* Import Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <m.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg max-w-md w-full p-6"
          >
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                <Upload className="w-5 h-5 text-gray-700" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Import Configuration
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Load a previously saved .keepnexus file
                </p>
              </div>
            </div>

            {/* File Upload Area */}
            {!selectedFile ? (
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-colors mb-4"
              >
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-600 mb-1">
                  Drag & drop your .keepnexus file here
                </p>
                <p className="text-xs text-gray-500">
                  or click to browse
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".keepnexus"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleFileSelect(file)
                  }}
                  className="hidden"
                />
              </div>
            ) : (
              <>
                {/* File Info */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="flex items-start gap-3">
                    <FileText className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 text-sm mb-2">
                        {selectedFile.name}
                      </div>
                      {fileMetadata && (
                        <div className="text-xs space-y-1 text-gray-600">
                          <div className="flex justify-between">
                            <span>Family:</span>
                            <span className="font-medium text-gray-900">{fileMetadata.family}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Version:</span>
                            <span className="font-medium text-gray-900">{fileMetadata.version}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Modified:</span>
                            <span className="font-medium text-gray-900">
                              {fileMetadata.modified.toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        setSelectedFile(null)
                        setFileMetadata(null)
                        setPassword('')
                      }}
                      className="text-gray-400 hover:text-gray-600 text-sm"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {/* Security Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                  <div className="flex gap-2">
                    <Lock className="w-4 h-4 text-blue-700 flex-shrink-0 mt-0.5" />
                    <div className="text-xs text-blue-800">
                      <strong>Encrypted file detected.</strong> Enter the password you used when
                      exporting this configuration.
                    </div>
                  </div>
                </div>

                {/* Password Field */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Decryption Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter file password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 bg-white text-gray-900"
                    disabled={isImporting}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && password) {
                        handleImport()
                      }
                    }}
                  />
                </div>
              </>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex gap-2">
                  <AlertCircle className="w-4 h-4 text-red-700 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setIsOpen(false)
                  setSelectedFile(null)
                  setPassword('')
                  setFileMetadata(null)
                  setError(null)
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={isImporting}
              >
                Cancel
              </button>
              <button
                onClick={handleImport}
                disabled={isImporting || !selectedFile || !password}
                className="flex-1 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isImporting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Decrypting...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Import File
                  </>
                )}
              </button>
            </div>

            {/* Warning */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex gap-2">
                <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0" />
                <p className="text-xs text-gray-600">
                  <strong>Warning:</strong> Importing will replace your current configuration.
                  Export your current setup first if you want to keep it.
                </p>
              </div>
            </div>
          </m.div>
        </div>
      )}
    </>
  )
}
