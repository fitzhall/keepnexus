'use client'

import { useState, useEffect } from 'react'
import {
  Home, Users, Shield, Bell, Calendar, Settings, BarChart3,
  Lock, Wallet, CheckCircle, AlertTriangle, XCircle, Zap, Activity
} from 'lucide-react'
import Link from 'next/link'
import { walletService, WalletStatus } from '@/lib/bitcoin/wallet'
import { multisigService, MultisigConfig, PendingApproval } from '@/lib/bitcoin/multisig'
import { securityScoreService } from '@/lib/security/score'

export default function DashboardPage() {
  const [threatScore, setThreatScore] = useState(0)
  const [wallet, setWallet] = useState<WalletStatus>({ connected: false })
  const [connecting, setConnecting] = useState(false)
  const [multisig, setMultisig] = useState<MultisigConfig | null>(null)
  const [pendingApprovals, setPendingApprovals] = useState<PendingApproval[]>([])
  const [settingUpMultisig, setSettingUpMultisig] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [approvingId, setApprovingId] = useState<string | null>(null)

  // Navigation items for mobile view and quick nav
  const navItems = [
    { icon: Home, label: 'Vault', route: '/dashboard/vault' },
    { icon: Users, label: 'Heirs', route: '/dashboard/heirs' },
    { icon: Shield, label: 'Trust', route: '/dashboard/trust' },
    { icon: Bell, label: 'Drills', route: '/dashboard/drills' },
    { icon: Calendar, label: 'Next rotation:\nNov 14', route: '/dashboard/schedule' },
    { icon: Settings, label: 'Captain', route: '/dashboard/captain' },
    { icon: BarChart3, label: 'Tax CSV\nready', route: '/dashboard/tax' },
    { icon: Zap, label: 'Governator™', route: '/dashboard/governator' },
    { icon: Activity, label: 'Risk\nAnalyzer', route: '/dashboard/risk-simulator' }
  ]

  // Calculate threat score on mount and when security factors change
  useEffect(() => {
    const score = securityScoreService.calculateScore()
    setThreatScore(score.threatScore)
  }, [wallet, multisig, pendingApprovals])

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

  const allGreen = wallet.connected && multisig && pendingApprovals.filter(a => a.status === 'pending').length === 0

  return (
    <>
      {/* Mobile View - Only shows on small screens */}
      <div className="block lg:hidden min-h-screen bg-white flex flex-col">
        {/* Status Bar (simulated) */}
        <div className="flex justify-between items-center px-4 py-2 text-xs text-gray-600">
          <span>9:41</span>
          <span>5G</span>
        </div>

        {/* Header */}
        <div className="text-center px-6 pt-4 pb-6">
          <h1 className="text-3xl font-bold tracking-wide mb-2">KEEP NEXUS</h1>
          <p className="text-gray-600">Chen Family · Threat Score {threatScore}</p>
          <div className="flex items-center justify-center gap-2 mt-2">
            <Lock className="w-4 h-4 text-gray-500" />
            <span className="text-gray-500 text-sm">Locked Forever</span>
          </div>
        </div>

        {/* Threat Score Display */}
        <div className="text-center py-8">
          <div className="text-8xl font-light text-gray-900">{threatScore}</div>
          <p className="text-gray-600 mt-2">Threats detected</p>
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
                  <p className="text-sm text-gray-600">Chen Family · {threatScore} threats detected</p>
                </div>
                <button className="px-4 py-2 bg-gray-900 text-white hover:bg-gray-800 text-sm">
                  I&apos;m Alive
                </button>
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

          {/* KEEP Status - Table Format */}
          <div className="bg-white border border-gray-300 mb-6">
            <div className="px-6 py-3 border-b border-gray-300">
              <h2 className="text-sm font-semibold text-gray-900">System Status</h2>
            </div>
            <table className="w-full text-sm">
              <thead className="border-b border-gray-300">
                <tr className="bg-gray-50">
                  <th className="px-6 py-2 text-left font-medium text-gray-700">Component</th>
                  <th className="px-6 py-2 text-left font-medium text-gray-700">Status</th>
                  <th className="px-6 py-2 text-left font-medium text-gray-700">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-300">
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-3 text-gray-900">K – Keep it Secure</td>
                  <td className="px-6 py-3">
                    {wallet.connected ? (
                      <span className="text-green-600">✓ Active</span>
                    ) : (
                      <span className="text-yellow-600">⚠ Pending</span>
                    )}
                  </td>
                  <td className="px-6 py-3 text-gray-600">
                    {wallet.connected
                      ? `${multisig ? `${multisig.type} multisig` : 'Single sig'} · Key rotation: Nov 14`
                      : 'Connect wallet to enable'
                    }
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-3 text-gray-900">E – Establish Legal Protection</td>
                  <td className="px-6 py-3">
                    <span className="text-yellow-600">⚠ Review</span>
                  </td>
                  <td className="px-6 py-3 text-gray-600">Trust notarized 3 weeks ago · Annual review needed</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-3 text-gray-900">E – Ensure Access</td>
                  <td className="px-6 py-3">
                    <span className="text-green-600">✓ Active</span>
                  </td>
                  <td className="px-6 py-3 text-gray-600">All heirs trained · Last drill: Oct 18 (all passed)</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-3 text-gray-900">P – Plan for the Future</td>
                  <td className="px-6 py-3">
                    <span className="text-red-600">✗ Action Required</span>
                  </td>
                  <td className="px-6 py-3 text-gray-600">CPA report in 12 days · IRS regulation update required</td>
                </tr>
              </tbody>
            </table>
          </div>

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
              <div className="grid grid-cols-3 gap-3">
                <button className="px-3 py-2 border border-gray-300 hover:bg-gray-50 transition-colors text-sm text-gray-900">
                  Send to Lawyer
                </button>
                <button className="px-3 py-2 border border-gray-300 hover:bg-gray-50 transition-colors text-sm text-gray-900">
                  Run Drill Tonight
                </button>
                <button className="px-3 py-2 border border-gray-300 hover:bg-gray-50 transition-colors text-sm text-gray-900">
                  Generate Report
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500">
              keep.chen.com · Updated {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Questions? Contact support@keep.co or call 1-800-KEEP-BTC
            </p>
          </div>
        </div>
      </div>
    </>
  )
}