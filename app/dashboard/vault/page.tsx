'use client'

import { useState, useEffect } from 'react'
import {
  ArrowLeft, Wallet, Shield, Key, RefreshCw,
  Download, Upload, Share2, AlertTriangle, CheckCircle, XCircle
} from 'lucide-react'
import Link from 'next/link'
import { shamirService, ShamirConfig } from '@/lib/bitcoin/shamir'

export default function VaultPage() {
  const [walletConnected] = useState(true)
  const [shamir, setShamir] = useState<ShamirConfig | null>(null)
  const [showShamir, setShowShamir] = useState(false)
  const [showBackup, setShowBackup] = useState(false)
  const [creatingShares, setCreatingShares] = useState(false)
  const [showRecovery, setShowRecovery] = useState(false)
  const [selectedShares, setSelectedShares] = useState<number[]>([])
  const [recovering, setRecovering] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [exportingBackup, setExportingBackup] = useState(false)
  const [restoringBackup, setRestoringBackup] = useState(false)
  const [schedulingRotation, setSchedulingRotation] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const balance = '0.21'
  const address = 'bc1q...fjhx0wlh'

  useEffect(() => {
    // Load existing Shamir config if available
    const config = shamirService.getConfig()
    if (config) {
      setShamir(config)
    }
  }, [])

  // Auto-dismiss success messages after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [successMessage])

  // Auto-dismiss error messages after 10 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null)
      }, 10000)
      return () => clearTimeout(timer)
    }
  }, [error])

  const handleCreateShares = async () => {
    setError(null)
    try {
      setCreatingShares(true)
      const config = await shamirService.createShares(3, 5)
      setShamir(config)
      setShowShamir(true)
      setShowConfirmDialog(false)
    } catch (err) {
      setError('Failed to create Shamir shares. Please try again.')
      console.error('Shamir creation error:', err)
    } finally {
      setCreatingShares(false)
    }
  }

  const handleRecover = async () => {
    if (selectedShares.length < 3) {
      setError('Need at least 3 shares to recover')
      return
    }

    setError(null)
    setRecovering(true)
    try {
      const success = await shamirService.recoverFromShares(selectedShares)
      if (success) {
        setShowRecovery(false)
        setSelectedShares([])
        // In production, this would decrypt and restore the keys
        alert('Recovery successful! Keys have been restored.')
      } else {
        setError('Recovery failed. Please verify your shares.')
      }
    } catch (err) {
      setError('Recovery failed. Please check your shares and try again.')
    } finally {
      setRecovering(false)
    }
  }

  const toggleShareSelection = (shareId: number) => {
    setSelectedShares(prev =>
      prev.includes(shareId)
        ? prev.filter(id => id !== shareId)
        : [...prev, shareId]
    )
  }

  const handleExportBackup = async () => {
    setError(null)
    setSuccessMessage(null)
    setExportingBackup(true)
    try {
      // Simulate backup export delay
      await new Promise(resolve => setTimeout(resolve, 1500))
      // In production, this would generate encrypted backup
      setSuccessMessage('Backup exported successfully. Store it in a secure location.')
      setShowBackup(false)
    } catch (err) {
      setError('Failed to export backup. Please try again.')
    } finally {
      setExportingBackup(false)
    }
  }

  const handleRestoreBackup = async () => {
    setError(null)
    setSuccessMessage(null)
    setRestoringBackup(true)
    try {
      // Simulate restore delay
      await new Promise(resolve => setTimeout(resolve, 2000))
      // In production, this would restore from encrypted backup
      setSuccessMessage('Backup restored successfully. Please verify your settings.')
    } catch (err) {
      setError('Failed to restore backup. Please verify the backup file.')
    } finally {
      setRestoringBackup(false)
    }
  }

  const handleScheduleRotation = async () => {
    setError(null)
    setSuccessMessage(null)
    setSchedulingRotation(true)
    try {
      // Simulate scheduling delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      setSuccessMessage('Key rotation scheduled for November 14, 2025')
    } catch (err) {
      setError('Failed to schedule rotation. Please try again.')
    } finally {
      setSchedulingRotation(false)
    }
  }

  return (
    <div className="min-h-screen bg-white lg:bg-gray-50">
      <div className="max-w-md mx-auto lg:max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200 lg:px-6 lg:py-6 lg:mb-6 lg:border-0">
          <Link href="/dashboard" className="lg:hidden">
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </Link>
          <h1 className="text-lg font-semibold text-gray-900 lg:text-2xl lg:font-bold">
            <span className="hidden lg:inline">Bitcoin </span>Vault
          </h1>
          <div className="w-6 lg:w-auto">
            <Link href="/dashboard" className="hidden lg:inline-flex px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium">
              ← Back to Dashboard
            </Link>
          </div>
        </div>

        <div className="lg:grid lg:grid-cols-2 lg:gap-6 lg:px-6">
          {/* Left Column */}
          <div className="space-y-0 lg:space-y-6">
            {/* Wallet Status */}
            <div className="px-6 py-6 border-b border-gray-100 lg:border lg:rounded-lg lg:bg-white lg:shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Wallet className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Wallet Connected</p>
                    <p className="text-xs text-gray-500">{address}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold">{balance} BTC</p>
                  <p className="text-xs text-gray-500">~$21,000</p>
                </div>
              </div>
              {walletConnected && (
                <button className="w-full py-2 text-sm text-gray-600 hover:text-gray-800">
                  Disconnect
                </button>
              )}
            </div>

            {/* Multisig Status */}
            <div className="px-6 py-6 border-b border-gray-100 lg:border lg:rounded-lg lg:bg-white lg:shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-5 h-5 text-green-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 lg:text-base">2-of-3 Multisig Active</p>
                  <p className="text-xs text-gray-500 lg:text-sm">Last rotation: Oct 18</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">You</span>
                  <span className="text-green-600">✓ Active</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Wife</span>
                  <span className="text-green-600">✓ Active</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Trusted Friend</span>
                  <span className="text-green-600">✓ Active</span>
                </div>
              </div>
            </div>

            {/* Rotation Schedule */}
            <div className="px-6 py-6 border-b border-gray-100 lg:border lg:rounded-lg lg:bg-white lg:shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <RefreshCw className="w-5 h-5 text-gray-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Next Key Rotation</p>
                  <p className="text-xs text-gray-500">November 14, 2025</p>
                </div>
              </div>
              <button
                onClick={handleScheduleRotation}
                disabled={schedulingRotation}
                className="w-full py-3 bg-gray-900 text-white rounded-lg text-sm hover:bg-gray-800 disabled:opacity-50"
              >
                {schedulingRotation ? 'Scheduling...' : 'Schedule Rotation'}
              </button>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-0 lg:space-y-6">
            {/* Shamir Shares */}
            <div className="px-6 py-6 border-b border-gray-100 lg:border lg:rounded-lg lg:bg-white lg:shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <Share2 className="w-5 h-5 text-gray-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Shamir Secret Shares</p>
                  <p className="text-xs text-gray-500">
                    {shamir ? `${shamir.threshold}-of-${shamir.totalShares} active` : 'Not configured'}
                  </p>
                </div>
              </div>

              {!shamir ? (
                <>
                  <button
                    onClick={() => setShowConfirmDialog(true)}
                    disabled={creatingShares}
                    className="w-full py-3 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 transition-colors duration-200"
                  >
                    {creatingShares ? 'Creating Shares...' : 'Create Shamir Shares'}
                  </button>

                  {/* Confirmation Dialog */}
                  {showConfirmDialog && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
                      <div className="bg-white rounded-lg max-w-md w-full p-6">
                        <div className="flex items-start gap-3 mb-4">
                          <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-1" />
                          <div>
                            <h3 className="font-semibold text-gray-900">Create Shamir Secret Shares?</h3>
                            <p className="text-sm text-gray-600 mt-2">
                              This will split your master key into 5 shares. You'll need any 3 shares to recover your keys.
                            </p>
                            <p className="text-sm text-gray-600 mt-2">
                              Make sure you're in a secure environment and ready to safely distribute the shares.
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <button
                            onClick={() => setShowConfirmDialog(false)}
                            className="flex-1 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleCreateShares}
                            disabled={creatingShares}
                            className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
                          >
                            {creatingShares ? 'Creating...' : 'Create Shares'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowShamir(!showShamir)}
                      className="flex-1 py-3 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
                    >
                      {showShamir ? 'Hide' : 'View'} Shares
                    </button>
                    <button
                      onClick={() => setShowRecovery(!showRecovery)}
                      className="flex-1 py-3 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
                    >
                      Recover Keys
                    </button>
                  </div>

                  {/* Error Display */}
                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg animate-in slide-in-from-top-2 fade-in duration-300">
                      <div className="flex items-start gap-2">
                        <XCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-xs text-red-700">{error}</p>
                          <button
                            onClick={() => setError(null)}
                            className="text-xs text-red-600 hover:text-red-800 underline mt-1"
                          >
                            Dismiss
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Success Display */}
                  {successMessage && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg animate-in slide-in-from-top-2 fade-in duration-300">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5 animate-pulse" />
                        <div className="flex-1">
                          <p className="text-xs text-green-700">{successMessage}</p>
                          <p className="text-xs text-green-600 opacity-60 mt-1">Will dismiss in a few seconds...</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* View Shares */}
                  {showShamir && (
                    <div className="space-y-2 pt-2 border-t">
                      {shamir.shares.map(share => (
                        <div key={share.id} className="flex items-center justify-between text-xs">
                          <span className="text-gray-600">Share #{share.id}: {share.holder}</span>
                          {share.status === 'distributed' ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-yellow-600" />
                          )}
                        </div>
                      ))}
                      <p className="text-xs text-gray-500 pt-2">
                        Need {shamir.threshold} shares to recover
                      </p>
                    </div>
                  )}

                  {/* Recovery Interface */}
                  {showRecovery && (
                    <div className="space-y-3 pt-2 border-t">
                      <p className="text-xs font-medium text-gray-700">Select shares to recover:</p>
                      {shamir.shares.map(share => (
                        <label key={share.id} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedShares.includes(share.id)}
                            onChange={() => toggleShareSelection(share.id)}
                            className="rounded border-gray-300"
                          />
                          <span className="text-xs text-gray-600">
                            Share #{share.id} ({share.holder})
                          </span>
                        </label>
                      ))}
                      <p className="text-xs text-gray-500">
                        Selected: {selectedShares.length}/{shamir.threshold} required
                      </p>
                      <button
                        onClick={handleRecover}
                        disabled={recovering || selectedShares.length < shamir.threshold}
                        className="w-full py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 disabled:opacity-50"
                      >
                        {recovering ? 'Recovering...' : 'Recover Keys'}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Backup & Recovery */}
            <div className="px-6 py-6 lg:border lg:rounded-lg lg:bg-white lg:shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <Key className="w-5 h-5 text-gray-600" />
                <p className="text-sm font-medium text-gray-900">Backup & Recovery</p>
              </div>
              <div className="space-y-3">
                <button
                  onClick={() => setShowBackup(!showBackup)}
                  className="w-full py-3 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export Backup
                </button>

                {showBackup && (
                  <div className="space-y-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-medium text-yellow-800">Security Warning</p>
                        <p className="text-xs text-yellow-700 mt-1">
                          Store backup in multiple secure locations. Never share complete backup online.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleExportBackup}
                      disabled={exportingBackup}
                      className="w-full py-2 bg-yellow-600 text-white rounded text-xs hover:bg-yellow-700 disabled:opacity-50"
                    >
                      {exportingBackup ? 'Exporting...' : 'Download Encrypted Backup'}
                    </button>
                  </div>
                )}

                <button
                  onClick={handleRestoreBackup}
                  disabled={restoringBackup}
                  className="w-full py-3 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Upload className="w-4 h-4" />
                  {restoringBackup ? 'Restoring...' : 'Restore from Backup'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Security Recommendations */}
        <div className="px-6 py-6 border-t border-gray-200 lg:border-0 lg:mt-6">
          <div className="lg:bg-white lg:rounded-lg lg:shadow-sm lg:border lg:border-gray-200 lg:p-6">
            <p className="text-sm font-semibold text-gray-900 mb-3 lg:text-base">Security Recommendations</p>
            <div className="space-y-2">
              {shamirService.getRecommendations().map((rec, index) => (
                <div key={index} className="flex items-start gap-2">
                  <span className="text-yellow-600 text-xs">•</span>
                  <p className="text-xs text-gray-600 lg:text-sm">{rec}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}