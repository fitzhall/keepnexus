'use client'

import { useState, useEffect } from 'react'
import {
  Home, Users, Shield, Bell, Calendar, Settings, BarChart3,
  Lock, Wallet, CheckCircle, AlertTriangle, XCircle, Zap, Activity, FileDown, FileText
} from 'lucide-react'
import Link from 'next/link'
import { walletService, WalletStatus } from '@/lib/bitcoin/wallet'
import { multisigService, MultisigConfig, PendingApproval } from '@/lib/bitcoin/multisig'
import { useFamilySetup } from '@/lib/context/FamilySetup'
import { FileImport } from '@/components/risk-simulator/FileImport'
import { FileExport } from '@/components/risk-simulator/FileExport'
import { KeepNexusFile } from '@/lib/risk-simulator/file-export'
import { FirstRunModal } from '@/components/FirstRunModal'
import { PDFPlaybookGenerator } from '@/lib/risk-simulator/pdf-generator'
import { PRESET_SCENARIOS } from '@/lib/risk-simulator/scenarios'
import { simulateScenario } from '@/lib/risk-simulator/engine'
import { KEEPScoreWidget } from '@/components/dashboard/KEEPScoreWidget'

// Main dashboard component
export default function DashboardPage() {
  // Use context for file import/export
  const { setup, loadFromFile, resetToDefault } = useFamilySetup()
  const [wallet, setWallet] = useState<WalletStatus>({ connected: false })
  const [connecting, setConnecting] = useState(false)
  const [multisig, setMultisig] = useState<MultisigConfig | null>(null)
  const [pendingApprovals, setPendingApprovals] = useState<PendingApproval[]>([])
  const [settingUpMultisig, setSettingUpMultisig] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [approvingId, setApprovingId] = useState<string | null>(null)
  const [keepScore, setKeepScore] = useState({ value: 0, k: 0, e1: 0, e2: 0, p: 0 })

  // First-run experience state
  const [showFirstRun, setShowFirstRun] = useState(false)
  const [showFileImport, setShowFileImport] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Navigation items for mobile view and quick nav
  const navItems = [
    { icon: Home, label: 'Vault', route: '/dashboard/vault' },
    { icon: Users, label: 'Heirs', route: '/dashboard/heirs' },
    { icon: Shield, label: 'Trust', route: '/dashboard/trust' },
    { icon: Bell, label: 'Drills', route: '/dashboard/drills' },
    { icon: Calendar, label: 'Next rotation:\nNov 14', route: '/dashboard/schedule' },
    { icon: Settings, label: 'Captain', route: '/dashboard/captain' },
    { icon: AlertTriangle, label: 'Risk\nSimulator', route: '/dashboard/risk-simulator' },
    { icon: BarChart3, label: 'Tax CSV\nready', route: '/dashboard/tax' },
    { icon: Zap, label: 'Governator™', route: '/dashboard/governator' }
  ]

  // Detect first-time users on mount
  useEffect(() => {
    setMounted(true) // Fix hydration error for timestamp
    const hasSetup = localStorage.getItem('familySetup')
    const dismissed = localStorage.getItem('firstRunDismissed')

    if (!hasSetup && !dismissed) {
      setShowFirstRun(true)
    }
  }, [])

  const handleConnectWallet = async () => {
    setError(null)
    setConnecting(true)
    try {
      const status = await walletService.connect()
      setWallet(status)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect wallet')
      console.error('Wallet connection error:', err)
    } finally {
      setConnecting(false)
    }
  }

  const handleDisconnect = async () => {
    setError(null)
    try {
      await walletService.disconnect()
      setWallet({ connected: false })
      setMultisig(null)
      setPendingApprovals([])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to disconnect wallet')
      console.error('Wallet disconnection error:', err)
    }
  }

  const handleSetupMultisig = async () => {
    setError(null)
    setSettingUpMultisig(true)
    try {
      const signers = multisigService.getDefaultSigners()
      const config = await multisigService.setupMultisig(signers)
      setMultisig(config)
      setPendingApprovals(multisigService.getPendingApprovals())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to setup multisig')
      console.error('Multisig setup error:', err)
    } finally {
      setSettingUpMultisig(false)
    }
  }

  const handleApprove = async (approvalId: string) => {
    setError(null)
    setApprovingId(approvalId)
    try {
      await multisigService.approve(approvalId)
      setPendingApprovals(multisigService.getPendingApprovals())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve transaction')
      console.error('Approval error:', err)
    } finally {
      setApprovingId(null)
    }
  }

  // Handle importing a .keepnexus file from dashboard
  const handleImport = (file: KeepNexusFile) => {
    // Use the loadFromFile method which loads ALL data into context
    loadFromFile({
      familyName: file.family,
      multisig: file.setup,
      heirs: file.heirs || [],
      trust: file.trust || {},
      governanceRules: file.governance?.rules || [],
      scheduleEvents: file.schedule || [],
      drillHistory: file.drills?.history || [],
      drillSettings: file.drills?.settings || {
        frequency: 'monthly',
        participants: [],
        notificationDays: 7,
        autoReminder: true
      },
      vaultSettings: file.vault || {
        rotationFrequency: 90,
        backupLocations: []
      },
      taxSettings: file.tax || {
        reportingFrequency: 'quarterly',
        autoGenerate: false
      },
      captainSettings: file.captain || {
        serviceTier: 'diy'
      },
      foreverSettings: file.forever || {
        archivalEnabled: false,
        redundantLocations: []
      },
      lastUpdated: new Date(),
      createdAt: file.created
    })

    console.log('✅ Complete configuration imported from dashboard')
  }

  // First-run modal handlers
  const handleFirstRunDismiss = () => {
    localStorage.setItem('firstRunDismissed', 'true')
    setShowFirstRun(false)
  }

  const handleFirstRunImport = () => {
    setShowFileImport(true) // Open file import modal
  }

  const handleFirstRunStartFresh = () => {
    resetToDefault() // Load default Chen Family demo
    console.log('✅ Started fresh with demo configuration')
  }

  const handleKeepScoreUpdate = (score: { value: number; k: number; e1: number; e2: number; p: number }) => {
    setKeepScore(score)
  }

  const getStatusIcon = (status: 'green' | 'yellow' | 'red') => {
    switch (status) {
      case 'green':
        return <CheckCircle className="w-4 h-4 text-green-600 inline ml-2" />
      case 'yellow':
        return <AlertTriangle className="w-4 h-4 text-yellow-600 inline ml-2" />
      case 'red':
        return <XCircle className="w-4 h-4 text-red-600 inline ml-2" />
    }
  }

  const generatePDF = async () => {
    try {
      // Create multisig setup from context data
      const multisigSetup = {
        name: setup.familyName,
        threshold: setup.multisig?.threshold || 2,
        totalKeys: setup.multisig?.keys.length || 3,
        keys: setup.multisig?.keys.map((key, index) => ({
          id: `key-${index}`,
          holder: key.holder,
          storage: key.storage,
          location: key.location || 'Not specified',
          role: key.role || 'signer',
          type: 'standard' as const
        })) || []
      }

      // Get scenarios and run simulations
      const scenarios = PRESET_SCENARIOS
      const results = scenarios.map(scenario => simulateScenario(multisigSetup, scenario))
      const resilienceScore = Math.round(results.filter(r => r.canRecover).length / results.length * 100)

      // Generate PDF
      const generator = new PDFPlaybookGenerator()
      const blob = await generator.generatePlaybook({
        setup: multisigSetup,
        results,
        scenarios,
        resilienceScore,
        governanceRules: setup.governanceRules
      })

      // Download the PDF
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${setup.familyName.replace(/\s+/g, '-')}-recovery-playbook-${new Date().toISOString().split('T')[0]}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to generate PDF:', error)
      alert('Failed to generate PDF. Please try again.')
    }
  }

  const allGreen = wallet.connected && multisig && pendingApprovals.filter(a => a.status === 'pending').length === 0

  return (
    <>
      {/* Mobile View - Only shows on small screens */}
      <div className="block lg:hidden min-h-screen bg-white flex flex-col">
        {/* Header */}
        <div className="text-center px-6 pt-4 pb-6">
          <h1 className="text-3xl font-bold tracking-wide mb-2">KEEP NEXUS</h1>
          <p className="text-gray-600">{setup.familyName}</p>
          <div className="flex items-center justify-center gap-2 mt-2">
            <Lock className="w-4 h-4 text-gray-500" />
            <span className="text-gray-500 text-sm">Locked Forever</span>
          </div>
        </div>

        {/* Score Display */}
        <div className="text-center py-8">
          <div className="text-8xl font-light text-gray-900">{keepScore.value}</div>
        </div>

        {/* I'm Alive Button */}
        <div className="px-6 mb-8">
          <button className="w-full py-4 border border-gray-300 text-gray-900 text-lg font-medium hover:bg-gray-50 transition-colors">
            I&apos;M ALIVE
          </button>
        </div>

        {/* Navigation Grid - 3x3 for 9 tiles */}
        <div className="grid grid-cols-3 gap-4 px-6 mb-8">
          {navItems.map((item, index) => (
            <Link
              key={index}
              href={item.route}
              className="flex flex-col items-center justify-center py-3 hover:bg-gray-50 transition-colors"
            >
              <item.icon className="w-8 h-8 mb-2 text-gray-700" />
              <span className="text-xs text-center text-gray-600 whitespace-pre-line">
                {item.label}
              </span>
            </Link>
          ))}
        </div>


        {/* Footer */}
        <div className="mt-auto border-t border-gray-200 py-4">
          <div className="text-center text-xs text-gray-500">
            keep.chen.com
          </div>
        </div>
      </div>

      {/* Desktop View - Only shows on large screens */}
      <div className="hidden lg:block min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          {/* Header - Compact */}
          <div className="bg-white border border-gray-300 mb-6">
            <div className="px-6 py-4 border-b border-gray-300">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">KEEP NEXUS</h1>
                  <p className="text-sm text-gray-600">{setup.familyName}</p>
                </div>
                <div className="flex items-center gap-3">
                  <FileImport onImport={handleImport} />
                  <FileExport
                    setup={setup.multisig}
                    analysis={undefined}
                  />
                  <button
                    onClick={() => {
                      resetToDefault()
                      console.log('✅ Demo data loaded (Chen Family)')
                    }}
                    className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 text-sm rounded-lg"
                  >
                    Load Demo
                  </button>
                  <button className="px-4 py-2 bg-gray-900 text-white hover:bg-gray-800 text-sm">
                    I&apos;m Alive
                  </button>
                </div>
              </div>
            </div>

            {/* Wallet Status Row */}
            <div className="px-6 py-3">
              {wallet.connected ? (
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-gray-600" />
                    <span className="text-gray-900">
                      {wallet.address?.slice(0, 8)}...{wallet.address?.slice(-6)}
                    </span>
                    <span className="text-gray-500">·</span>
                    <span className="text-gray-900">
                      {wallet.balance ? walletService.formatBTC(wallet.balance) : '0'} BTC
                    </span>
                  </div>
                  <button
                    onClick={handleDisconnect}
                    className="text-gray-600 hover:text-gray-900 underline text-xs"
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleConnectWallet}
                  disabled={connecting}
                  className="w-full py-2 bg-gray-900 text-white hover:bg-gray-800 text-sm disabled:bg-gray-400"
                >
                  {connecting ? 'Connecting...' : 'Connect Wallet'}
                </button>
              )}
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-300">
              <div className="flex items-start gap-2">
                <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-800">Error</p>
                  <p className="text-sm text-red-700">{error}</p>
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


          {/* Pending Approvals */}
          {pendingApprovals.filter(a => a.status === 'pending').length > 0 && (
            <div className="bg-white border border-gray-300 mb-6">
              <div className="px-6 py-3 border-b border-gray-300">
                <h3 className="text-sm font-semibold text-gray-900">Pending Approvals</h3>
              </div>
              <table className="w-full text-sm">
                <tbody className="divide-y divide-gray-300">
                  {pendingApprovals.map((approval) => (
                    <tr key={approval.id} className="hover:bg-gray-50">
                      <td className="px-6 py-3 text-gray-900">{approval.description}</td>
                      <td className="px-6 py-3 text-gray-600">
                        {approval.currentSigners}/{approval.requiredSigners} signatures
                      </td>
                      <td className="px-6 py-3 text-right">
                        {approval.status === 'pending' ? (
                          <button
                            onClick={() => handleApprove(approval.id)}
                            disabled={approvingId === approval.id}
                            className="text-xs bg-gray-900 text-white px-3 py-1 hover:bg-gray-800 transition-colors disabled:opacity-50"
                          >
                            {approvingId === approval.id ? 'Approving...' : 'Approve'}
                          </button>
                        ) : (
                          <span className="text-xs text-green-600">✓ Approved</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Two column layout for score and framework */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* KEEP Score Widget */}
            <div className="lg:col-span-1">
              <KEEPScoreWidget onScoreUpdate={handleKeepScoreUpdate} />
            </div>

            {/* Security Framework Table */}
            <div className="lg:col-span-2 bg-white border border-gray-300">
              <div className="px-6 py-3 border-b border-gray-300">
                <h2 className="text-sm font-semibold text-gray-900">Security Framework</h2>
              </div>
              <div className="p-6">
                <table className="w-full text-sm">
                  <thead className="text-gray-900 font-semibold border-b border-gray-300">
                    <tr>
                      <th className="text-left py-2">Component</th>
                      <th className="text-left py-2">Status</th>
                      <th className="text-left py-2">Action Required</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <td className="py-3 font-semibold text-gray-900">K - Keep Secure</td>
                      <td className="py-3">{getStatusIcon(keepScore.k >= 80 ? 'green' : keepScore.k >= 40 ? 'yellow' : 'red')}</td>
                      <td className="py-3 text-gray-700">
                        {keepScore.k < 80 ? 'Add hardware wallets, rotate keys' : 'Maintain current security'}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 font-semibold text-gray-900">E - Establish Legal</td>
                      <td className="py-3">{getStatusIcon(keepScore.e1 >= 80 ? 'green' : keepScore.e1 >= 40 ? 'yellow' : 'red')}</td>
                      <td className="py-3 text-gray-700">
                        {keepScore.e1 < 80 ? 'Complete trust documents' : 'Review annually'}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 font-semibold text-gray-900">E - Ensure Access</td>
                      <td className="py-3">{getStatusIcon(keepScore.e2 >= 80 ? 'green' : keepScore.e2 >= 40 ? 'yellow' : 'red')}</td>
                      <td className="py-3 text-gray-700">
                        {keepScore.e2 < 80 ? 'Run recovery drills' : 'Continue monthly drills'}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 font-semibold text-gray-900">P - Plan Future</td>
                      <td className="py-3">{getStatusIcon(keepScore.p >= 80 ? 'green' : keepScore.p >= 40 ? 'yellow' : 'red')}</td>
                      <td className="py-3 text-gray-700">
                        {keepScore.p < 80 ? 'Train heirs on recovery' : 'Update beneficiaries'}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Quick Navigation - Compact Grid */}
          <div className="bg-white border border-gray-300">
            <div className="px-6 py-3 border-b border-gray-300">
              <h2 className="text-sm font-semibold text-gray-900">Quick Navigation</h2>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-3 gap-3">
                {navItems.map((item, index) => (
                  <Link
                    key={index}
                    href={item.route}
                    className="flex items-center gap-2 px-3 py-2 border border-gray-300 hover:bg-gray-50 transition-colors text-sm"
                  >
                    <item.icon className="w-4 h-4 text-gray-600" />
                    <span className="text-gray-900">
                      {item.label.split('\n')[0]}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white border border-gray-300 mt-6">
            <div className="px-6 py-3 border-b border-gray-300">
              <h2 className="text-sm font-semibold text-gray-900">Quick Actions</h2>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    // TODO: Implement send to lawyer
                    console.log('Send to lawyer clicked')
                    alert('Send to Lawyer feature coming soon')
                  }}
                  className="px-3 py-2 border border-gray-300 hover:bg-gray-50 transition-colors text-sm text-gray-900 flex items-center justify-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Send to Lawyer
                </button>
                <Link
                  href="/dashboard/drills"
                  className="px-3 py-2 border border-gray-300 hover:bg-gray-50 transition-colors text-sm text-gray-900 text-center flex items-center justify-center gap-2"
                >
                  <Activity className="w-4 h-4" />
                  Run Drill Tonight
                </Link>
                <button
                  onClick={() => {
                    // Generate a simple text report
                    const report = `KEEP NEXUS REPORT\n${new Date().toLocaleDateString()}\n\nFamily: ${setup.familyName}\n\nMultisig Configuration:\n- Threshold: ${setup.multisig.threshold} of ${setup.multisig.totalKeys}\n- Keys: ${setup.multisig.keys.map(k => k.holder).join(', ')}\n\nStatus: ALL SYSTEMS OPERATIONAL`

                    // Create downloadable file
                    const blob = new Blob([report], { type: 'text/plain' })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = `keep-report-${new Date().toISOString().split('T')[0]}.txt`
                    a.click()
                    URL.revokeObjectURL(url)
                  }}
                  className="px-3 py-2 border border-gray-300 hover:bg-gray-50 transition-colors text-sm text-gray-900 flex items-center justify-center gap-2"
                >
                  <BarChart3 className="w-4 h-4" />
                  Generate Report
                </button>
                <button
                  onClick={generatePDF}
                  className="px-3 py-2 border border-gray-300 hover:bg-gray-50 transition-colors text-sm text-gray-900 flex items-center justify-center gap-2"
                >
                  <FileDown className="w-4 h-4" />
                  Export PDF
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500">
              keep.chen.com{mounted && ` · Updated ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Questions? Contact support@keep.co or call 1-800-KEEP-BTC
            </p>
          </div>
        </div>
      </div>

      {/* First-Run Welcome Modal */}
      <FirstRunModal
        isOpen={showFirstRun}
        onDismiss={handleFirstRunDismiss}
        onImport={handleFirstRunImport}
        onStartFresh={handleFirstRunStartFresh}
      />

      {/* FileImport triggered from FirstRunModal */}
      <FileImport
        onImport={handleImport}
        externalIsOpen={showFileImport}
        onClose={() => setShowFileImport(false)}
      />
    </>
  )
}