'use client'

/**
 * Risk Simulator - Main Page
 * Interactive multisig risk analysis tool for Bitcoin estate planning advisors
 * RESTORED: Original functionality with FamilySetup context integration
 */

import { useState, useEffect } from 'react'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { ScenarioCards } from '@/components/risk-simulator/ScenarioCards'
import { MissionControlMinimal } from '@/components/risk-simulator/MissionControlMinimal'
import { ResilienceScore } from '@/components/risk-simulator/ResilienceScore'
import { ScenarioButtons } from '@/components/risk-simulator/ScenarioButtons'
import { KeyAvailabilitySelector } from '@/components/risk-simulator/KeyAvailabilitySelector'
import { RecoveryPath } from '@/components/risk-simulator/RecoveryPath'
import { SingleKeyConfig } from '@/components/risk-simulator/SingleKeyConfig'
import { SetupConfigPanel } from '@/components/risk-simulator/SetupConfigPanel'
import { FileExport } from '@/components/risk-simulator/FileExport'
import { FileImport } from '@/components/risk-simulator/FileImport'
import { PDFPacketExport } from '@/components/risk-simulator/PDFPacketExport'
import { MultisigSetup, Scenario, SimulationResult, ShardConfig, KeyType, KeyRole } from '@/lib/risk-simulator/types'
import { analyzeRisk, simulateScenario } from '@/lib/risk-simulator/engine'
import { PRESET_SCENARIOS } from '@/lib/risk-simulator/scenarios'
import { generateKeyAvailabilityScenarios } from '@/lib/risk-simulator/scenarios-simple'
import { KeepNexusFile } from '@/lib/risk-simulator/file-export'
import { useFamilySetup } from '@/lib/context/FamilySetup'

export default function RiskSimulatorPage() {
  // Use FamilySetup context instead of hardcoded data
  const { setup: contextSetup } = useFamilySetup()

  // Build MultisigSetup from context's wallets and keyholders
  const buildMultisigSetup = (): MultisigSetup => {
    const wallet = contextSetup.wallets[0]
    return {
      threshold: wallet?.threshold ?? 2,
      totalKeys: wallet?.total_keys ?? 3,
      keys: contextSetup.keyholders.map(kh => ({
        id: kh.id,
        holder: kh.name,
        role: kh.role as KeyRole | undefined,
        type: (kh.is_sharded ? 'sharded' : 'full') as KeyType,
        storage: kh.storage_type as any,
        location: kh.location,
      })),
      family: contextSetup.family_name,
      platform: wallet?.platform,
      createdAt: new Date(wallet?.created_at ?? contextSetup.created_at),
    }
  }

  const [setup, setSetup] = useState<MultisigSetup>(buildMultisigSetup())

  // Scenario mode: simple (key availability) or classic (prescriptive)
  const [scenarioMode, setScenarioMode] = useState<'simple' | 'classic'>('simple')

  // Scenarios to test
  const [scenarios] = useState<Scenario[]>(PRESET_SCENARIOS)

  // Selected scenarios for multi-scenario testing (empty = show all)
  const [selectedScenarioIds, setSelectedScenarioIds] = useState<string[]>([])

  // For simple mode - track unavailable keys
  const [unavailableKeyIds, setUnavailableKeyIds] = useState<string[]>([])

  // View mode toggle
  const [viewMode, setViewMode] = useState<'mission' | 'detailed'>('mission')

  // Simulation results
  const [results, setResults] = useState<SimulationResult[]>([])
  const [resilienceScore, setResilienceScore] = useState(0)

  // Sync with context when it changes
  useEffect(() => {
    setSetup(buildMultisigSetup())
  }, [contextSetup.wallets, contextSetup.keyholders])

  // Run simulation on mount and when setup changes
  useEffect(() => {
    if (scenarioMode === 'simple' && unavailableKeyIds.length > 0) {
      // In simple mode, create a single scenario from unavailable keys
      const simpleScenario: Scenario = {
        id: 'simple-test',
        name: `${unavailableKeyIds.length} Key${unavailableKeyIds.length !== 1 ? 's' : ''} Unavailable`,
        description: `Testing with selected keys unavailable`,
        unavailableHolders: unavailableKeyIds.map(id =>
          setup.keys.find(k => k.id === id)?.holder || ''
        ).filter(Boolean)
      }
      const result = simulateScenario(setup, simpleScenario)
      setResults([result])
      setResilienceScore(result.outcome === 'recoverable' ? 100 : 0)
    } else if (scenarioMode === 'classic') {
      // Classic mode - use prescriptive scenarios
      const analysis = analyzeRisk(setup, scenarios)
      setResults(analysis.results)
      setResilienceScore(analysis.resilienceScore)
    } else {
      // No selection - show default state
      setResults([])
      setResilienceScore(100)
    }
  }, [setup, scenarios, scenarioMode, unavailableKeyIds])

  // Filter scenarios and results based on selection
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
        affectedRoles: Array.from(
          new Set(
            displayScenarios.flatMap(s => s.affectedRoles || [])
          )
        ),
        affectedIndices: Array.from(
          new Set(
            displayScenarios.flatMap(s => s.affectedIndices || [])
          )
        ),
        affectedLocations: Array.from(
          new Set(
            displayScenarios.flatMap(s => s.affectedLocations || [])
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

  // Handle updating entire setup (local only for simulation)
  const handleUpdateSetup = (newSetup: MultisigSetup) => {
    setSetup(newSetup)
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
  }

  // Handle importing a .keepnexus file
  const handleImport = (file: KeepNexusFile) => {
    setSetup(file.setup)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="flex items-center text-gray-600 hover:text-gray-900">
                <ArrowLeft className="h-5 w-5 mr-1" />
                Back
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Risk Simulator</h1>
                <p className="text-sm text-gray-600 mt-1">Test your multisig resilience against real-world scenarios</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Setup Configuration Panel - Combined display */}
          <SetupConfigPanel setup={setup} onUpdate={handleUpdateSetup} />

          {/* Mode Selection - Simple vs Classic */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">Risk Analysis</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setScenarioMode('simple')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    scenarioMode === 'simple'
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Simple Mode
                </button>
                <button
                  onClick={() => setScenarioMode('classic')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    scenarioMode === 'classic'
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Classic Scenarios
                </button>
              </div>
            </div>

            {/* Mode description */}
            <p className="text-sm text-gray-600">
              {scenarioMode === 'simple'
                ? 'Test key availability by selecting which keys are inaccessible. Focus on technical recovery without prescriptive scenarios.'
                : 'Test your setup against predefined disaster scenarios like death, theft, or geographic risks.'}
            </p>
          </div>

          {/* Main Display - Conditional based on mode */}
          {scenarioMode === 'simple' ? (
            /* Simple Mode - Key Availability Testing */
            <KeyAvailabilitySelector
              setup={setup}
              onSelectionChange={setUnavailableKeyIds}
            />
          ) : (
            /* Classic Mode - Prescriptive Scenarios */
            <>
              {viewMode === 'mission' ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left Column - Scenario Selection */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Test Scenarios</h3>
                    <ScenarioButtons
                      scenarios={scenarios}
                      selectedIds={selectedScenarioIds}
                      onToggle={(id) => {
                        setSelectedScenarioIds(prev =>
                          prev.includes(id)
                            ? prev.filter(sid => sid !== id)
                            : [...prev, id]
                        )
                      }}
                      onClear={() => setSelectedScenarioIds([])}
                    />
                  </div>

                  {/* Right Column - Results */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Analysis Results</h3>
                    <MissionControlMinimal
                      results={results}
                      setup={setup}
                      resilienceScore={resilienceScore}
                      selectedScenarios={selectedScenarioIds}
                    />
                  </div>
                </div>
              ) : (
                <>
                  {/* Scenario Selection Buttons (only in detailed view) */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Test Specific Scenarios</h3>
                    <ScenarioButtons
                      scenarios={scenarios}
                      selectedIds={selectedScenarioIds}
                      onToggle={(id) => {
                        setSelectedScenarioIds(prev =>
                          prev.includes(id)
                            ? prev.filter(sid => sid !== id)
                            : [...prev, id]
                        )
                      }}
                      onClear={() => setSelectedScenarioIds([])}
                    />
                  </div>

                  {/* Scenario Analysis Cards */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Scenario Analysis</h3>
                    <ScenarioCards
                      results={displayResults}
                      setup={setup}
                      selectedIds={selectedScenarioIds}
                    />
                  </div>
                </>
              )}

              {/* View Mode Toggle for Classic Mode */}
              <div className="flex justify-center">
                <div className="flex gap-2">
                  <button
                    onClick={() => setViewMode('mission')}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                      viewMode === 'mission'
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Mission Control
                  </button>
                  <button
                    onClick={() => setViewMode('detailed')}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                      viewMode === 'detailed'
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Detailed View
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Combined Scenario Result (only in classic mode when multiple selected) */}
          {scenarioMode === 'classic' && combinedResult && selectedScenarioIds.length > 1 && (
            <div className="border border-gray-300 rounded p-4 bg-white">
              <h3 className="font-medium text-gray-900 mb-2">
                Combined Analysis ({selectedScenarioIds.length} scenarios)
              </h3>
              <div className="text-sm text-gray-700">
                <div>Keys Available: {combinedResult.availableKeys} of {setup.totalKeys}</div>
                <div>Threshold Required: {setup.threshold}</div>
                <div className="mt-2 font-medium">
                  Result: {combinedResult.outcome === 'recoverable' ? 'RECOVERABLE' : 'LOCKED'}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}