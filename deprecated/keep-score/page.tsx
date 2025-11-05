/**
 * KEEP Score & Risk Dashboard
 * Ultra-simple, text-based interface
 * The RIGHT implementation based on vision documents
 */

'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

import { ScoreDisplay } from '@/deprecated/components/ScoreDisplay'
import { SimpleRiskMatrix } from '@/components/keep-dashboard/SimpleRiskMatrix'

import { LittleShardFile, KeyRole } from '@/lib/keep-core/data-model'
import {
  createNewShardFile,
  downloadFile,
  loadFile,
  saveToLocalStorage,
  loadFromLocalStorage
} from '@/lib/keep-core/little-shard'
import { updateFileWithScore } from '@/lib/keep-core/keep-score-v2'
import { getDefaultTestSuite, RISK_SCENARIOS } from '@/lib/risk-engine/scenarios'
import { runRiskAnalysis } from '@/lib/risk-engine/simulator'

export default function KEEPScorePage() {
  // Initialize with demo file - avoid localStorage on first render for hydration
  const [shardFile, setShardFile] = useState<LittleShardFile>(() => {
    const demoFile = createNewShardFile('Demo Family')
    console.log('[KEEPScorePage] Initial demo file keyholders:', demoFile.keyholders?.length || 0)
    console.log('[KEEPScorePage] Initial keyholders:', demoFile.keyholders)
    return demoFile
  })
  const [isClient, setIsClient] = useState(false)

  // Selected scenarios for testing
  const [selectedScenarios, setSelectedScenarios] = useState<string[]>([])

  // View mode
  const [view, setView] = useState<'score' | 'risk' | 'data'>('score')

  // Wallet configuration
  const [walletType, setWalletType] = useState<'2-of-3' | '3-of-5' | 'custom'>('2-of-3')

  // Load from localStorage after mount (client-side only)
  useEffect(() => {
    setIsClient(true)
    const saved = loadFromLocalStorage()
    if (saved) {
      // Ensure keyholders and wallets arrays always exist
      const validSaved = {
        ...saved,
        keyholders: saved.keyholders || [],
        wallets: saved.wallets || []
      }
      console.log('[KEEPScorePage] Loaded from localStorage, keyholders:', validSaved.keyholders.length)
      setShardFile(validSaved)
    } else {
      console.log('[KEEPScorePage] No saved data in localStorage, using demo file')
    }
  }, [])

  // Update score whenever data changes (but only after client mount)
  useEffect(() => {
    if (!isClient) return

    console.log('[KEEPScorePage] Before score update, keyholders:', shardFile.keyholders?.length || 0)
    const updated = updateFileWithScore(shardFile)
    console.log('[KEEPScorePage] After score update, keyholders:', updated.keyholders?.length || 0)
    setShardFile(updated)
    saveToLocalStorage(updated)
  }, [
    isClient,
    shardFile.keyholders?.length || 0,
    shardFile.wallets?.length || 0,
    shardFile.drills?.length || 0,
    JSON.stringify(shardFile.legal_docs || {}),
    JSON.stringify(shardFile.education || {})
  ])

  // Run risk analysis
  useEffect(() => {
    console.log('[KEEPScorePage] Running risk analysis, keyholders:', shardFile.keyholders?.length || 0)
    const scenarios = getDefaultTestSuite()
    const analysis = runRiskAnalysis(shardFile, scenarios)
    setShardFile(prev => ({
      ...prev,
      risk_analysis: analysis
    }))
  }, [JSON.stringify(shardFile.keyholders || []), JSON.stringify(shardFile.wallets || [])])

  // Handle file export
  const handleExport = () => {
    downloadFile(shardFile)
  }

  // Handle file import
  const handleImport = async () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.shard,.json'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        try {
          const loaded = await loadFile(file)
          setShardFile(loaded)
          saveToLocalStorage(loaded)
        } catch (error) {
          console.error('Failed to load file:', error)
        }
      }
    }
    input.click()
  }

  // Toggle scenario selection
  const toggleScenario = (scenarioId: string) => {
    setSelectedScenarios(prev =>
      prev.includes(scenarioId)
        ? prev.filter(id => id !== scenarioId)
        : [...prev, scenarioId]
    )
  }

  // Update wallet configuration based on type
  const updateWalletType = (type: '2-of-3' | '3-of-5' | 'custom') => {
    setWalletType(type)

    let newWallet = { ...shardFile.wallets[0] }
    let newKeyholders = [...shardFile.keyholders]

    if (type === '2-of-3') {
      newWallet.threshold = 2
      newWallet.total_keys = 3
      // Ensure we have 3 keyholders
      if (newKeyholders.length < 3) {
        newKeyholders = [
          ...newKeyholders,
          ...Array(3 - newKeyholders.length).fill(null).map((_, i) => ({
            id: `kh${newKeyholders.length + i + 1}`,
            name: `Key Holder ${newKeyholders.length + i + 1}`,
            role: (i === 0 ? 'spouse' : 'other') as KeyRole,
            email: '',
            phone: '',
            location: 'TBD',
            jurisdiction: 'US',
            storage_type: 'hardware-wallet' as const,
            device_info: 'TBD',
            key_created: new Date().toISOString(),
            key_age_days: 0,
            last_drill_participation: null,
            is_active: true,
            is_sharded: false
          }))
        ]
      }
    } else if (type === '3-of-5') {
      newWallet.threshold = 3
      newWallet.total_keys = 5
      // Ensure we have 5 keyholders
      if (newKeyholders.length < 5) {
        newKeyholders = [
          ...newKeyholders,
          ...Array(5 - newKeyholders.length).fill(null).map((_, i) => ({
            id: `kh${newKeyholders.length + i + 1}`,
            name: `Key Holder ${newKeyholders.length + i + 1}`,
            role: 'other' as KeyRole,
            email: '',
            phone: '',
            location: 'TBD',
            jurisdiction: 'US',
            storage_type: 'hardware-wallet' as const,
            device_info: 'TBD',
            key_created: new Date().toISOString(),
            key_age_days: 0,
            last_drill_participation: null,
            is_active: true,
            is_sharded: false
          }))
        ]
      }
    }

    const updated = {
      ...shardFile,
      wallets: [newWallet],
      keyholders: newKeyholders.slice(0, newWallet.total_keys)
    }

    setShardFile(updated)
    saveToLocalStorage(updated)
  }

  return (
    <div className="min-h-screen bg-gray-50 font-mono text-gray-900">
      {/* Header */}
      <div className="bg-white border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="text-gray-700 hover:text-gray-900">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-xl font-bold text-gray-900">KEEP SCORE & RISK ENGINE</h1>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setView('score')}
                className={`px-3 py-1 border ${
                  view === 'score' ? 'bg-gray-800 text-white' : 'border-gray-800 text-gray-900 hover:bg-gray-100'
                }`}
              >
                [SCORE]
              </button>
              <button
                onClick={() => setView('risk')}
                className={`px-3 py-1 border ${
                  view === 'risk' ? 'bg-gray-800 text-white' : 'border-gray-800 text-gray-900 hover:bg-gray-100'
                }`}
              >
                [RISK]
              </button>
              <button
                onClick={() => setView('data')}
                className={`px-3 py-1 border ${
                  view === 'data' ? 'bg-gray-800 text-white' : 'border-gray-800 text-gray-900 hover:bg-gray-100'
                }`}
              >
                [DATA]
              </button>
              <button
                onClick={() => {
                  const fresh = createNewShardFile('Chen Family')
                  setShardFile(fresh)
                  saveToLocalStorage(fresh)
                  window.location.reload()
                }}
                className="px-3 py-1 border border-red-600 text-red-600 hover:bg-red-50"
              >
                [RESET]
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {view === 'score' && (
          <div className="space-y-6">
            <ScoreDisplay
              data={shardFile}
              onExport={handleExport}
              onImport={handleImport}
            />

            {/* Wallet Configuration */}
            <div className="border border-gray-800 p-4 bg-white">
              <div className="text-sm font-bold mb-3 text-gray-900">WALLET CONFIGURATION:</div>
              <div className="flex gap-2">
                <button
                  onClick={() => updateWalletType('2-of-3')}
                  className={`px-3 py-1 text-xs border ${
                    walletType === '2-of-3'
                      ? 'bg-gray-800 text-white border-gray-800'
                      : 'border-gray-800 text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  2-OF-3 MULTISIG
                </button>
                <button
                  onClick={() => updateWalletType('3-of-5')}
                  className={`px-3 py-1 text-xs border ${
                    walletType === '3-of-5'
                      ? 'bg-gray-800 text-white border-gray-800'
                      : 'border-gray-800 text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  3-OF-5 MULTISIG
                </button>
                <button
                  onClick={() => updateWalletType('custom')}
                  className={`px-3 py-1 text-xs border ${
                    walletType === 'custom'
                      ? 'bg-gray-800 text-white border-gray-800'
                      : 'border-gray-800 text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  CUSTOM
                </button>
              </div>
              <div className="mt-2 text-xs text-gray-600">
                Current: {shardFile.wallets[0]?.threshold || 0} of {shardFile.wallets[0]?.total_keys || 0} signatures required
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-4 gap-4">
              <div className="border border-gray-800 p-3 bg-white">
                <div className="text-xs text-gray-600">KEYS</div>
                <div className="text-2xl font-bold text-gray-900">{shardFile.keyholders.length}</div>
              </div>
              <div className="border border-gray-800 p-3 bg-white">
                <div className="text-xs text-gray-600">THRESHOLD</div>
                <div className="text-2xl font-bold text-gray-900">
                  {shardFile.wallets[0]?.threshold || 0}/{shardFile.wallets[0]?.total_keys || 0}
                </div>
              </div>
              <div className="border border-gray-800 p-3 bg-white">
                <div className="text-xs text-gray-600">DRILLS</div>
                <div className="text-2xl font-bold text-gray-900">{shardFile.drills.length}</div>
              </div>
              <div className="border border-gray-800 p-3 bg-white">
                <div className="text-xs text-gray-600">3-3-3 RULE</div>
                <div className="text-2xl font-bold text-gray-900">
                  {shardFile.redundancy.passes_3_3_3_rule ? '✓' : '✗'}
                </div>
              </div>
            </div>
          </div>
        )}

        {view === 'risk' && (
          <div className="space-y-6">
            {/* Scenario Selector */}
            <div className="border border-gray-800 p-4 bg-white">
              <div className="text-sm font-bold mb-3 text-gray-900">SELECT SCENARIOS TO TEST:</div>
              <div className="grid grid-cols-3 gap-2">
                {getDefaultTestSuite().map(scenario => (
                  <button
                    key={scenario.id}
                    onClick={() => toggleScenario(scenario.id)}
                    className={`px-3 py-2 text-xs border ${
                      selectedScenarios.includes(scenario.id)
                        ? 'bg-gray-800 text-white border-gray-800'
                        : 'border-gray-800 text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    [{selectedScenarios.includes(scenario.id) ? 'X' : ' '}] {scenario.name.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Risk Matrix */}
            <SimpleRiskMatrix
              data={shardFile}
              scenarios={getDefaultTestSuite()}
              selectedScenarios={selectedScenarios}
            />

            {/* Analysis Results */}
            {shardFile.risk_analysis && (
              <div className="border border-gray-800 p-4 bg-white">
                <div className="text-sm font-bold mb-2 text-gray-900">ANALYSIS RESULTS:</div>
                <div className="space-y-1 text-xs text-gray-900">
                  <div>Scenarios Tested: {shardFile.risk_analysis.scenarios_tested}</div>
                  <div>
                    Recovery Probability:{' '}
                    {Math.round(shardFile.risk_analysis.probability_of_recovery * 100)}%
                  </div>
                  <div>
                    Critical Risks:{' '}
                    {shardFile.risk_analysis.critical_risks.length > 0
                      ? shardFile.risk_analysis.critical_risks.join(', ')
                      : 'None'}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {view === 'data' && (
          <div className="space-y-6">
            {/* Data Editor */}
            <div className="border border-gray-800 p-4 bg-white">
              <div className="text-sm font-bold mb-3 text-gray-900">RAW DATA (LITTLE SHARD FILE):</div>
              <pre className="text-xs overflow-auto max-h-96 p-2 bg-gray-100 border border-gray-300 text-gray-900">
                {JSON.stringify(shardFile, null, 2)}
              </pre>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={handleExport}
                  className="px-3 py-1 text-xs border border-gray-800 text-gray-900 hover:bg-gray-100"
                >
                  [EXPORT FILE]
                </button>
                <button
                  onClick={handleImport}
                  className="px-3 py-1 text-xs border border-gray-800 text-gray-900 hover:bg-gray-100"
                >
                  [IMPORT FILE]
                </button>
                <button
                  onClick={() => {
                    const fresh = createNewShardFile('New Family')
                    setShardFile(fresh)
                    saveToLocalStorage(fresh)
                  }}
                  className="px-3 py-1 text-xs border border-gray-800 text-gray-900 hover:bg-gray-100"
                >
                  [NEW FILE]
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}