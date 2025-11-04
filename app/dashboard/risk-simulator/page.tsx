'use client'

/**
 * Risk Simulator - Main Page
 * Interactive multisig risk analysis tool for Bitcoin estate planning advisors
 */

import { useState, useEffect } from 'react'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { RiskMatrix } from '@/components/risk-simulator/RiskMatrix'
import { ResilienceScore } from '@/components/risk-simulator/ResilienceScore'
import { ScenarioButtons } from '@/components/risk-simulator/ScenarioButtons'
import { RecoveryPath } from '@/components/risk-simulator/RecoveryPath'
import { ConfigPanel } from '@/components/risk-simulator/ConfigPanel'
import { SetupConfigPanel } from '@/components/risk-simulator/SetupConfigPanel'
import { FileExport } from '@/components/risk-simulator/FileExport'
import { FileImport } from '@/components/risk-simulator/FileImport'
import { PDFPacketExport } from '@/components/risk-simulator/PDFPacketExport'
import { MultisigSetup, Scenario, SimulationResult, ShardConfig, KeyType } from '@/lib/risk-simulator/types'
import { analyzeRisk, simulateScenario } from '@/lib/risk-simulator/engine'
import { PRESET_SCENARIOS } from '@/lib/risk-simulator/scenarios'
import { KeepNexusFile } from '@/lib/risk-simulator/file-export'
import { useFamilySetup } from '@/lib/context/FamilySetup'

export default function RiskSimulatorPage() {
  // Get setup from shared context (replaces hardcoded CHEN_FAMILY_SETUP)
  const { setup: contextSetup, updateMultisig, updateGovernanceRules, updateHeirs, updateTrust } = useFamilySetup()
  const [setup, setSetup] = useState<MultisigSetup>(contextSetup.multisig)

  // Scenarios to test
  const [scenarios] = useState<Scenario[]>(PRESET_SCENARIOS)

  // Selected scenarios for multi-scenario testing (empty = show all)
  const [selectedScenarioIds, setSelectedScenarioIds] = useState<string[]>([])

  // Simulation results
  const [results, setResults] = useState<SimulationResult[]>([])
  const [resilienceScore, setResilienceScore] = useState(0)

  // Sync with context when it changes (e.g., from Vault updates)
  useEffect(() => {
    setSetup(contextSetup.multisig)
  }, [contextSetup.multisig])

  // Run simulation on mount and when setup changes
  useEffect(() => {
    const analysis = analyzeRisk(setup, scenarios)
    setResults(analysis.results)
    setResilienceScore(analysis.resilienceScore)
  }, [setup, scenarios])

  // Filter scenarios and results based on selection
  // If multiple scenarios selected, show them all + a combined scenario
  const displayScenarios = selectedScenarioIds.length > 0
    ? scenarios.filter(s => selectedScenarioIds.includes(s.id))
    : scenarios

  const displayResults = selectedScenarioIds.length > 0
    ? results.filter(r => selectedScenarioIds.includes(r.scenario.id))
    : results

  // Create combined scenario when multiple selected
  const combinedScenario: Scenario | null = selectedScenarioIds.length > 1
    ? {
        id: 'combined',
        name: 'Combined Scenarios',
        description: `Testing ${selectedScenarioIds.length} scenarios simultaneously`,
        unavailableHolders: Array.from(
          new Set(
            displayScenarios.flatMap(s => s.unavailableHolders)
          )
        ),
        compromisedKeys: Array.from(
          new Set(
            displayScenarios.flatMap(s => s.compromisedKeys || [])
          )
        )
      }
    : null

  // Simulate combined scenario
  const combinedResult: SimulationResult | null = combinedScenario
    ? simulateScenario(setup, combinedScenario)
    : null

  // Count recoverable scenarios
  const recoverableCount = results.filter(r => r.outcome === 'recoverable').length

  // Handle updating entire setup (Phase 2: M-of-N configuration)
  const handleUpdateSetup = (newSetup: MultisigSetup) => {
    setSetup(newSetup)
    // Sync back to context so other pages can see the changes
    updateMultisig(newSetup)
  }

  // Handle toggling shard mode for a key
  const handleToggleShard = (keyId: string, enabled: boolean) => {
    const newSetup = {
      ...setup,
      keys: setup.keys.map(key =>
        key.id === keyId
          ? { ...key, type: (enabled ? 'sharded' : 'full') as KeyType }
          : key
      )
    }
    setSetup(newSetup)
    updateMultisig(newSetup)
  }

  // Handle updating shard configuration
  const handleUpdateShard = (keyId: string, config: ShardConfig) => {
    const newSetup = {
      ...setup,
      keys: setup.keys.map(key =>
        key.id === keyId
          ? { ...key, shardConfig: config }
          : key
      )
    }
    setSetup(newSetup)
    updateMultisig(newSetup)
  }

  // Handle importing a .keepnexus file
  const handleImport = (file: KeepNexusFile) => {
    // Load the setup from imported file
    setSetup(file.setup)
    updateMultisig(file.setup)

    // Load governance rules if present (Phase 5 complete!)
    if (file.governance?.rules) {
      updateGovernanceRules(file.governance.rules)
    }

    // Load heirs if present
    if (file.heirs) {
      updateHeirs(file.heirs)
    }

    // Load trust info if present
    if (file.trust) {
      updateTrust(file.trust)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="px-4 py-8 lg:px-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <Link href="/dashboard" className="lg:hidden">
                  <ArrowLeft className="w-6 h-6 text-gray-700" />
                </Link>
                <div>
                  <h1 className="text-3xl font-semibold text-gray-900">Risk Simulator</h1>
                  <p className="text-gray-600 mt-2">
                    Multisig vulnerability analysis and recovery planning
                  </p>
                </div>
              </div>

              <div className="hidden lg:flex items-center gap-3">
                <PDFPacketExport
                  setup={setup}
                  results={results}
                  scenarios={scenarios}
                  resilienceScore={resilienceScore}
                />
                <FileImport onImport={handleImport} />
                <FileExport
                  setup={setup}
                  analysis={{ results, resilienceScore }}
                />
                <Link
                  href="/dashboard"
                  className="px-5 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Back
                </Link>
              </div>
            </div>

            {/* Mobile file actions */}
            <div className="mt-4 lg:hidden flex flex-wrap items-center gap-2">
              <PDFPacketExport
                setup={setup}
                results={results}
                scenarios={scenarios}
                resilienceScore={resilienceScore}
              />
              <FileImport onImport={handleImport} />
              <FileExport
                setup={setup}
                analysis={{ results, resilienceScore }}
              />
            </div>

            {/* Family info */}
            <div className="mt-6 flex items-center gap-8">
              <div>
                <div className="text-sm text-gray-500">Family</div>
                <div className="text-lg font-medium text-gray-900">{setup.family}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Configuration</div>
                <div className="text-lg font-medium text-gray-900">
                  {setup.threshold}-of-{setup.totalKeys} Multisig
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Keys</div>
                <div className="text-lg font-medium text-gray-900">
                  {setup.keys.length} total
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-4 lg:px-8 py-8">
          {/* Setup Configuration Panel (Phase 2) */}
          <SetupConfigPanel
            setup={setup}
            onUpdateSetup={handleUpdateSetup}
          />

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

            {/* Left Column - Score */}
            <div className="lg:col-span-1">
              <ResilienceScore
                score={resilienceScore}
                totalScenarios={scenarios.length}
                recoverableScenarios={recoverableCount}
              />

              {/* Critical Risks */}
              <div className="mt-6 bg-white border-2 border-gray-900 p-4">
                <h3 className="text-xs font-mono uppercase text-gray-900 mb-3">
                  Critical Risks
                </h3>
                {results.filter(r => r.outcome === 'locked').length === 0 ? (
                  <p className="text-xs font-mono text-gray-600">
                    ✓ NONE DETECTED
                  </p>
                ) : (
                  <div className="space-y-2">
                    {results
                      .filter(r => r.outcome === 'locked')
                      .map((result) => (
                        <div
                          key={result.scenario.id}
                          className="text-xs font-mono p-2 bg-gray-100 border-l-4 border-gray-900"
                        >
                          <div className="text-gray-900">
                            ! {result.scenario.name}
                          </div>
                          <div className="text-gray-600 mt-1">
                            FUNDS LOCKED
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              {/* Key Configuration Panel */}
              <div className="mt-6">
                <ConfigPanel
                  setup={setup}
                  onToggleShard={handleToggleShard}
                  onUpdateShard={handleUpdateShard}
                />
              </div>
            </div>

            {/* Right Column - Risk Matrix */}
            <div className="lg:col-span-3">
              {/* Scenario Selector */}
              <ScenarioButtons
                scenarios={scenarios}
                selectedScenarioIds={selectedScenarioIds}
                onSelectScenarios={setSelectedScenarioIds}
              />

              {/* Risk Matrix */}
              <div className="mt-6">
                <RiskMatrix
                  setup={setup}
                  scenarios={displayScenarios}
                  results={displayResults}
                />
              </div>

              {/* Combined Scenario Analysis */}
              {combinedResult && (
                <div className="mt-6">
                  <div className="bg-gray-100 border-2 border-gray-900 p-4">
                    <h3 className="text-xs font-mono text-gray-900 mb-2">
                      ⚠ COMBINED SCENARIO RESULT
                    </h3>
                    <RecoveryPath result={combinedResult} />
                  </div>
                </div>
              )}

              {/* Recovery Details */}
              <div className="mt-6 space-y-4">
                <h3 className="text-sm font-medium text-gray-900">
                  {selectedScenarioIds.length > 0 ? 'Individual Scenario Analysis' : 'All Scenarios'}
                </h3>
                {displayResults.map((result) => (
                  <RecoveryPath key={result.scenario.id} result={result} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
