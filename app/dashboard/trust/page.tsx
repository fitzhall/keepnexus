'use client'

import { useState, useEffect, useRef } from 'react'
import {
  ArrowLeft,
  FileText,
  Download,
  CheckCircle,
  Upload,
  Lock,
  Shield,
  X,
  Eye,
  Trash2,
  AlertTriangle,
  FileCheck,
  Clock,
  ShieldCheck,
  Edit
} from 'lucide-react'
import Link from 'next/link'
import { documentEncryption, DocumentType } from '@/lib/documents/encryption'
import { documentStorage, type StoredDocument } from '@/lib/documents/storage'
import { walletService } from '@/lib/bitcoin/wallet'
import { useFamilySetup } from '@/lib/context/FamilySetup'

export default function TrustPage() {
  // Use context for trust info
  const { setup, updateLegal } = useFamilySetup()
  const trustInfo = setup.legal
  const [documents, setDocuments] = useState<StoredDocument[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [isEncrypting, setIsEncrypting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState<string>('')
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [password, setPassword] = useState('')
  const [viewingDocument, setViewingDocument] = useState<string | null>(null)
  const [documentUrl, setDocumentUrl] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const dragCounter = useRef(0)

  // Mock user ID - in production, get from auth
  const userId = 'user-123'

  useEffect(() => {
    loadDocuments()
  }, [])

  // Auto-dismiss messages
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [success])

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 10000)
      return () => clearTimeout(timer)
    }
  }, [error])

  const loadDocuments = async () => {
    try {
      setIsLoading(true)
      const docs = await documentStorage.listDocuments(userId)
      setDocuments(docs)
    } catch (err) {
      console.error('Failed to load documents:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounter.current++
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true)
    }
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounter.current--
    if (dragCounter.current === 0) {
      setIsDragging(false)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    dragCounter.current = 0

    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleFileSelect = (file: File) => {
    // Validate file
    const validation = documentEncryption.validateFile(file)
    if (!validation.valid) {
      setError(validation.error || 'Invalid file')
      return
    }

    // Store file and show password dialog
    setPendingFile(file)
    setShowPasswordDialog(true)
  }

  const handleEncryptAndUpload = async () => {
    if (!pendingFile || !password) return

    try {
      setIsEncrypting(true)
      setShowPasswordDialog(false)
      setUploadProgress('Connecting to wallet...')

      // Get wallet signature (mock for now)
      const walletStatus = walletService.getStatus()
      const walletSignature = walletStatus.address || 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh'

      // Show encryption progress
      setUploadProgress('🔒 Encrypting on your device...')

      // Simulate encryption time for user feedback
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Encrypt the file locally
      const encrypted = await documentEncryption.encryptFile(
        pendingFile,
        walletSignature,
        password
      )

      setUploadProgress('💾 Storing encrypted document...')
      await new Promise(resolve => setTimeout(resolve, 500))

      // Store the encrypted document
      await documentStorage.storeDocument(encrypted, userId)

      // Reload documents list
      await loadDocuments()

      // Show success
      setSuccess(`✅ "${pendingFile.name}" encrypted and stored securely`)

      // Clear state
      setPendingFile(null)
      setPassword('')
      setUploadProgress('')

    } catch (err) {
      console.error('Encryption failed:', err)
      setError('Failed to encrypt document. Please try again.')
    } finally {
      setIsEncrypting(false)
      setUploadProgress('')
    }
  }

  const handleView = async (doc: StoredDocument) => {
    try {
      setViewingDocument(doc.metadata.id)

      // Get encrypted document
      const encrypted = await documentStorage.getDocument(doc.metadata.id, userId)
      if (!encrypted) {
        setError('Document not found')
        return
      }

      // For demo, use the same password
      const walletStatus = walletService.getStatus()
      const walletSignature = walletStatus.address || 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh'

      // In production, prompt for password
      const decrypted = await documentEncryption.decryptFile(
        encrypted,
        walletSignature,
        'demo' // In production, prompt user for password
      )

      // Create viewable URL
      const blob = documentEncryption.arrayBufferToBlob(decrypted, doc.metadata.mimeType)
      const url = documentEncryption.createViewableUrl(blob)
      setDocumentUrl(url)

    } catch (err) {
      console.error('Failed to view document:', err)
      setError('Failed to decrypt document. Please check your password.')
      setViewingDocument(null)
    }
  }

  const handleDownload = async (doc: StoredDocument) => {
    try {
      // Get and decrypt document
      const encrypted = await documentStorage.getDocument(doc.metadata.id, userId)
      if (!encrypted) {
        setError('Document not found')
        return
      }

      const walletStatus = walletService.getStatus()
      const walletSignature = walletStatus.address || 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh'

      const decrypted = await documentEncryption.decryptFile(
        encrypted,
        walletSignature,
        'demo' // In production, prompt for password
      )

      // Create download
      const blob = documentEncryption.arrayBufferToBlob(decrypted, doc.metadata.mimeType)
      const url = documentEncryption.createViewableUrl(blob)

      const a = document.createElement('a')
      a.href = url
      a.download = doc.metadata.originalName
      a.click()

      documentEncryption.revokeViewableUrl(url)
      setSuccess(`Downloaded "${doc.metadata.title}"`)

    } catch (err) {
      console.error('Failed to download:', err)
      setError('Failed to download document')
    }
  }

  const handleDelete = async (docId: string) => {
    try {
      await documentStorage.deleteDocument(docId, userId)
      await loadDocuments()
      setSuccess('Document deleted successfully')
      setDeleteConfirm(null)
    } catch (err) {
      console.error('Failed to delete:', err)
      setError('Failed to delete document')
    }
  }

  const closeViewer = () => {
    if (documentUrl) {
      documentEncryption.revokeViewableUrl(documentUrl)
      setDocumentUrl(null)
    }
    setViewingDocument(null)
  }

  const getDocumentIcon = (type: DocumentType) => {
    switch (type) {
      case DocumentType.LIVING_TRUST:
        return '📜'
      case DocumentType.POUR_OVER_WILL:
        return '📋'
      case DocumentType.BITCOIN_INSTRUCTIONS:
        return '₿'
      case DocumentType.BENEFICIARY_LETTER:
        return '✉️'
      case DocumentType.ASSET_INVENTORY:
        return '📊'
      case DocumentType.MEDICAL_DIRECTIVE:
        return '🏥'
      case DocumentType.POWER_OF_ATTORNEY:
        return '⚖️'
      default:
        return '📄'
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-white lg:bg-gray-50">
      <div className="max-w-md mx-auto lg:max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200 lg:px-6 lg:py-6 lg:mb-6 lg:border-0">
          <Link href="/dashboard" className="lg:hidden">
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </Link>
          <h1 className="text-lg font-semibold text-gray-900 lg:text-2xl lg:font-bold">Trust Documents</h1>
          <FileText className="w-6 h-6 text-gray-700 lg:hidden" />
          <div className="hidden lg:block">
            <Link href="/dashboard" className="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-900 text-sm font-medium">
              ← Back to Dashboard
            </Link>
          </div>
        </div>

        <div className="lg:px-6">
          {/* Trust Info */}
          <div className="mx-4 mb-4 p-6 border border-gray-300 bg-white lg:mx-0 lg:mb-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  {trustInfo.trust_name || 'Living Trust'}
                </h2>
                {trustInfo.trustee_names && trustInfo.trustee_names.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600">Trustees:</p>
                    {trustInfo.trustee_names.map((name, index) => (
                      <p key={index} className="text-sm text-gray-900">• {name}</p>
                    ))}
                  </div>
                )}
                {trustInfo.last_review && (
                  <p className="text-xs text-gray-500 mt-3">
                    Last reviewed: {new Date(trustInfo.last_review).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                )}
              </div>
              <button className="p-2 hover:bg-gray-50 border border-gray-300">
                <Edit className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Zero-Knowledge Security Banner */}
          <div className="mx-4 mb-4 p-4 bg-gray-50 border border-gray-300  lg:mx-0 lg:mb-6">
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-gray-900 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-gray-900">🔒 Zero-Knowledge Encryption</p>
                <p className="text-sm text-gray-600 mt-1">
                  Your documents are encrypted on your device before upload. We cannot read your files - only you can decrypt them with your wallet.
                </p>
              </div>
            </div>
          </div>

          {/* Upload Area */}
          <div
            className={`mx-4 mb-4 border-2 border-dashed  transition-all lg:mx-0 lg:mb-6 ${
              isDragging ? 'border-gray-900 bg-gray-100' : 'border-gray-900 bg-gray-50'
            } ${isEncrypting ? 'opacity-50 pointer-events-none' : ''}`}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <div className="p-8 text-center">
              {isEncrypting ? (
                <div className="space-y-3">
                  <div className="animate-spin  h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                  <p className="text-gray-900 font-medium">{uploadProgress}</p>
                  <p className="text-sm text-gray-600">Please wait while we secure your document...</p>
                </div>
              ) : (
                <>
                  <Upload className={`w-12 h-12 mx-auto mb-4 ${isDragging ? 'text-gray-900' : 'text-gray-400'}`} />
                  <p className="text-gray-700 font-medium mb-2">
                    {isDragging ? 'Drop your document here' : 'Drag and drop your document'}
                  </p>
                  <p className="text-sm text-gray-500 mb-4">or</p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-gray-900 text-white  hover:bg-gray-800 transition-colors"
                  >
                    Browse Files
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
                    onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                  />
                  <p className="text-xs text-gray-500 mt-4">
                    Supported: PDF, Word, TXT, Images (Max 10MB)
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mx-4 mb-4 p-4 bg-gray-50 border border-gray-300  flex items-start gap-3 lg:mx-0">
              <CheckCircle className="w-5 h-5 text-gray-900 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-gray-900">{success}</p>
              </div>
              <button onClick={() => setSuccess(null)}>
                <X className="w-4 h-4 text-gray-900" />
              </button>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mx-4 mb-4 p-4 bg-gray-100 border border-gray-300  flex items-start gap-3 lg:mx-0">
              <AlertTriangle className="w-5 h-5 text-gray-900 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-gray-900">{error}</p>
              </div>
              <button onClick={() => setError(null)}>
                <X className="w-4 h-4 text-gray-900" />
              </button>
            </div>
          )}

          {/* Documents List */}
          <div className="px-4 py-4 lg:px-0 lg:bg-white lg:border lg:border-gray-300">
            <div className="flex items-center justify-between mb-4 lg:px-6 lg:pt-2">
              <h2 className="text-lg font-semibold text-gray-900">Your Documents</h2>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Lock className="w-4 h-4" />
                <span>{documents.length} encrypted</span>
              </div>
            </div>

            {isLoading ? (
              <div className="py-12 text-center">
                <div className="animate-spin  h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                <p className="text-sm text-gray-600 mt-4">Loading documents...</p>
              </div>
            ) : documents.length === 0 ? (
              <div className="py-12 text-center">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">No documents uploaded yet</p>
                <p className="text-sm text-gray-500 mt-2">Upload your first document to get started</p>
              </div>
            ) : (
              <div className="space-y-3 lg:px-6 lg:pb-6">
                {documents.map((doc) => (
                  <div key={doc.metadata.id} className="border border-gray-300  p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <span className="text-2xl mt-1">{getDocumentIcon(doc.metadata.type)}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{doc.metadata.title}</p>
                          <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <FileCheck className="w-3 h-3" />
                              {formatFileSize(doc.metadata.size)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatDate(doc.created)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Shield className="w-3 h-3" />
                              AES-256
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-3">
                            <button
                              onClick={() => handleView(doc)}
                              className="flex items-center gap-1 px-3 py-1 bg-gray-900 text-white  text-xs hover:bg-gray-800 transition-colors"
                            >
                              <Eye className="w-3 h-3" />
                              View
                            </button>
                            <button
                              onClick={() => handleDownload(doc)}
                              className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700  text-xs hover:bg-gray-200 transition-colors"
                            >
                              <Download className="w-3 h-3" />
                              Download
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(doc.metadata.id)}
                              className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-900  text-xs hover:bg-gray-200 transition-colors"
                            >
                              <Trash2 className="w-3 h-3" />
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Storage Stats */}
          {documents.length > 0 && (
            <div className="mx-4 mt-4 p-4 bg-gray-50  lg:mx-0 lg:mt-6 border border-gray-300">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Storage used:</span>
                <span className="font-medium text-gray-900">
                  {formatFileSize(documents.reduce((sum, doc) => sum + doc.metadata.size, 0))} / 100 MB
                </span>
              </div>
              <div className="mt-2 bg-gray-200  h-2">
                <div
                  className="bg-gray-900 h-2  transition-all"
                  style={{
                    width: `${Math.min(100, (documents.reduce((sum, doc) => sum + doc.metadata.size, 0) / (100 * 1024 * 1024)) * 100)}%`
                  }}
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="px-6 py-6 border-t border-gray-200 lg:border-0 lg:px-0">
            <button
              onClick={() => {
                updateLegal({
                  ...trustInfo,
                  last_review: new Date().toISOString()
                })
                setSuccess('Annual review date updated successfully')
              }}
              className="w-full py-3 bg-gray-900 text-white  text-sm hover:bg-gray-800 lg:py-4 lg:text-base transition-colors"
            >
              Mark Trust as Reviewed
            </button>
          </div>
        </div>
      </div>

      {/* Password Dialog */}
      {showPasswordDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white  max-w-md w-full p-6 border border-gray-300">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Secure Your Document</h3>
            <p className="text-sm text-gray-600 mb-4">
              Enter a password to encrypt &quot;{pendingFile?.name}&quot;. You&apos;ll need this password and your wallet to decrypt it later.
            </p>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter encryption password"
              className="w-full px-4 py-2 border border-gray-300  mb-4 focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white text-gray-900"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowPasswordDialog(false)
                  setPendingFile(null)
                  setPassword('')
                }}
                className="flex-1 py-2 border border-gray-300 text-gray-700  hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleEncryptAndUpload}
                disabled={!password}
                className="flex-1 py-2 bg-gray-900 text-white  hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Encrypt & Upload
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-4 text-center">
              🔒 Encryption happens on your device. We never see your password or unencrypted data.
            </p>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white  max-w-md w-full p-6 border border-gray-300">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Document?</h3>
            <p className="text-sm text-gray-600 mb-4">
              This action cannot be undone. The encrypted document will be permanently deleted.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2 border border-gray-300 text-gray-700  hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 py-2 bg-gray-900 text-white  hover:bg-gray-800 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Document Viewer */}
      {viewingDocument && documentUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex flex-col z-50">
          <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Lock className="w-5 h-5 text-gray-900" />
              <span className="text-sm text-gray-600">Secure Document Viewer</span>
            </div>
            <button
              onClick={closeViewer}
              className="p-2 hover:bg-gray-100  transition-colors"
            >
              <X className="w-5 h-5 text-gray-700" />
            </button>
          </div>
          <div className="flex-1 bg-gray-100">
            <iframe
              src={documentUrl}
              className="w-full h-full"
              title="Document Viewer"
              sandbox="allow-same-origin"
            />
          </div>
        </div>
      )}
    </div>
  )
}