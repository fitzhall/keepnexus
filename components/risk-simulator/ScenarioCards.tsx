/**
 * ScenarioCards - Cleaner alternative to the confusing matrix
 * Shows each scenario as a clear card with who's affected and the outcome
 */

import { Scenario, SimulationResult, MultisigSetup } from '@/lib/risk-simulator/types'
import { Check, X, AlertTriangle, Shield } from 'lucide-react'

interface ScenarioCardsProps {
  results: SimulationResult[]
  setup: MultisigSetup
  selectedIds?: string[]
}

export function ScenarioCards({ results, setup, selectedIds = [] }: ScenarioCardsProps) {

  // Only show results for selected scenarios (not all by default!)
  const displayResults = selectedIds.length > 0
    ? results.filter(r => selectedIds.includes(r.scenario.id))
    : []

  return (
    <div className="space-y-4">
      {displayResults.length === 0 ? (
        <div className="text-center text-gray-400 py-8">
          Select scenarios above to see detailed analysis
        </div>
      ) : (
        displayResults.map((result) => {
          const isRecoverable = result.outcome === 'recoverable'

          return (
            <div
              key={result.scenario.id}
              className="rounded-lg border border-gray-300 p-6 bg-white"
            >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {result.scenario.name}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {result.scenario.description}
                </p>
              </div>
              <div className="text-sm font-medium text-gray-900">
                {isRecoverable ? 'RECOVERABLE' : 'LOCKED'}
              </div>
            </div>

            {/* Key Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* Affected Keys */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Unavailable Keys:
                </h4>
                <div className="space-y-1">
                  {setup.keys.map(key => {
                    // Check if this key is affected by the scenario
                    const isAffected = isKeyAffected(key, result.scenario, setup)
                    if (!isAffected) return null

                    return (
                      <div key={key.id} className="flex items-center gap-2 text-sm">
                        <X className="w-4 h-4 text-red-600" />
                        <span className="text-gray-700">{key.holder}</span>
                        <span className="text-xs text-gray-500">({key.storage})</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Available Keys */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Available Keys:
                </h4>
                <div className="space-y-1">
                  {setup.keys.map(key => {
                    const isAffected = isKeyAffected(key, result.scenario, setup)
                    if (isAffected) return null

                    return (
                      <div key={key.id} className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-600" />
                        <span className="text-gray-700">{key.holder}</span>
                        <span className="text-xs text-gray-500">({key.storage})</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="border-t pt-4">
              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <span className="font-medium text-gray-700">Keys Available: </span>
                  <span className={`font-bold ${
                    isRecoverable ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {result.availableKeys} of {setup.totalKeys}
                  </span>
                </div>
                <div className="text-sm">
                  <span className="font-medium text-gray-700">Threshold: </span>
                  <span className="font-bold text-gray-900">{setup.threshold} required</span>
                </div>
              </div>

              {/* Recovery Path if recoverable */}
              {isRecoverable && result.recoveryPath && (
                <div className="mt-3 p-3 bg-white rounded border border-gray-200">
                  <div className="text-xs font-medium text-gray-700 mb-1">Recovery Path:</div>
                  <div className="flex flex-wrap gap-2">
                    {result.recoveryPath.map((holder, idx) => (
                      <span key={idx} className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                        {holder}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendation if locked */}
              {!isRecoverable && result.recommendation && (
                <div className="mt-3 p-3 bg-white rounded border border-gray-200">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-medium text-gray-700 mb-1">Fix Required:</div>
                      <div className="text-sm text-gray-600">{result.recommendation}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          )
        })
      )}
    </div>
  )
}

// Helper function to check if a key is affected by a scenario
function isKeyAffected(key: any, scenario: Scenario, setup: MultisigSetup): boolean {
  // Check by role
  if (scenario.affectedRoles && key.role) {
    if (scenario.affectedRoles.includes(key.role)) {
      return true
    }
  }

  // Check by location
  if (scenario.affectedLocations && key.location) {
    for (const location of scenario.affectedLocations) {
      if (key.location.toLowerCase().includes(location.toLowerCase())) {
        return true
      }
    }
  }

  // Check by holder name (legacy)
  if (scenario.unavailableHolders?.includes(key.holder)) {
    return true
  }

  return false
}