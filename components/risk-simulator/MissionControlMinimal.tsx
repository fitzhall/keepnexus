/**
 * MissionControlMinimal - Simplified, timeless risk dashboard
 * Clean text-based design that could survive as long as Bitcoin
 */

import { SimulationResult, MultisigSetup } from '@/lib/risk-simulator/types'
import { CheckCircle2, XCircle, AlertTriangle } from 'lucide-react'

interface MissionControlMinimalProps {
  results: SimulationResult[]
  setup: MultisigSetup
  resilienceScore: number
  selectedScenarios?: string[]
}

export function MissionControlMinimal({
  results,
  setup,
  resilienceScore,
  selectedScenarios = []
}: MissionControlMinimalProps) {

  // System status based on resilience
  const systemStatus = resilienceScore === 100 ? 'SECURE' :
                       resilienceScore >= 80 ? 'OPERATIONAL' :
                       resilienceScore >= 60 ? 'AT RISK' :
                       'CRITICAL'

  // Filter results to only show selected scenarios
  const displayResults = selectedScenarios.length > 0
    ? results.filter(r => selectedScenarios.includes(r.scenario.id))
    : []

  // Group scenarios by outcome (only from selected scenarios)
  const failures = displayResults.filter(r => r.outcome !== 'recoverable')
  const warnings = displayResults.filter(r =>
    r.outcome === 'recoverable' && r.availableKeys === setup.threshold
  )
  const safe = displayResults.filter(r =>
    r.outcome === 'recoverable' && r.availableKeys > setup.threshold
  )

  // Calculate overall resilience based on ALL scenarios (for header display)
  const allFailures = results.filter(r => r.outcome !== 'recoverable')

  return (
    <div className="space-y-8">
      {/* Status Header - Simple and Clean */}
      <div className="text-center space-y-2">
        <div className="text-sm text-gray-500 uppercase tracking-wider">
          System Status
        </div>
        <div className={`text-4xl font-light ${
          resilienceScore === 100 ? 'text-green-600' :
          resilienceScore >= 80 ? 'text-green-600' :
          resilienceScore >= 60 ? 'text-amber-600' :
          'text-red-600'
        }`}>
          {systemStatus}
        </div>
        <div className="text-2xl text-gray-700">
          {resilienceScore}% Resilient
        </div>
        <div className="text-sm text-gray-500">
          {setup.threshold} of {setup.totalKeys} keys required
        </div>
      </div>

      {/* Only show detailed view when scenarios are selected */}
      {selectedScenarios.length > 0 && (
        <div className="border-t pt-6">
          <h3 className="text-sm uppercase tracking-wider text-gray-500 mb-4">
            Scenario Analysis
          </h3>

          {/* Critical Failures */}
          {failures.length > 0 && (
            <div className="mb-6">
              <div className="font-medium text-gray-900 mb-2">
                RECOVERY NOT POSSIBLE
              </div>
              <div className="space-y-1 text-sm text-gray-700">
                {failures.map(r => (
                  <div key={r.scenario.id}>
                    • {r.scenario.name}: {r.availableKeys} of {setup.threshold} keys available
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Warnings */}
          {warnings.length > 0 && (
            <div className="mb-6">
              <div className="font-medium text-gray-900 mb-2">
                MINIMAL REDUNDANCY
              </div>
              <div className="space-y-1 text-sm text-gray-700">
                {warnings.map(r => (
                  <div key={r.scenario.id}>
                    • {r.scenario.name}: Exactly {setup.threshold} keys remain
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Safe */}
          {safe.length > 0 && (
            <div className="mb-6">
              <div className="font-medium text-gray-900 mb-2">
                FULLY RECOVERABLE
              </div>
              <div className="space-y-1 text-sm text-gray-700">
                {safe.map(r => (
                  <div key={r.scenario.id}>
                    • {r.scenario.name}: {r.availableKeys} of {setup.totalKeys} keys available
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Show hint when no scenarios selected */}
      {selectedScenarios.length === 0 && (
        <div className="text-center text-sm text-gray-400 pt-8">
          Select scenarios above to test your resilience
        </div>
      )}

      {/* Critical Alert - Only for failures in SELECTED scenarios */}
      {selectedScenarios.length > 0 && failures.length > 0 && (
        <div className="border-t pt-6">
          <div className="text-red-600 text-sm">
            <strong>Action Required:</strong> Your current setup cannot survive {failures.length} selected scenario{failures.length > 1 ? 's' : ''}.
            Consider adding redundancy or adjusting your threshold.
          </div>
        </div>
      )}
    </div>
  )
}