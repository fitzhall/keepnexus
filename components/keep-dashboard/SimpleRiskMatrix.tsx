/**
 * Simple Risk Matrix Component
 * Terminal-style display with minimal design
 * Shows key availability across scenarios
 */

'use client'

import { LittleShardFile, Scenario, KeyHolder } from '@/lib/keep-core/data-model'
import { simulateScenario, simulateCombinedScenarios } from '@/lib/risk-engine/simulator'

interface SimpleRiskMatrixProps {
  data: LittleShardFile
  scenarios: Scenario[]
  selectedScenarios: string[]
}

export function SimpleRiskMatrix({ data, scenarios, selectedScenarios }: SimpleRiskMatrixProps) {
  // Debug logging to understand the issue
  console.log('[SimpleRiskMatrix] Data:', data)
  console.log('[SimpleRiskMatrix] Keyholders count:', data.keyholders?.length || 0)
  console.log('[SimpleRiskMatrix] Keyholders:', data.keyholders)
  console.log('[SimpleRiskMatrix] Scenarios count:', scenarios?.length || 0)

  // Helper to check if key is available in scenario
  const isKeyAvailable = (holder: KeyHolder, scenario: Scenario): boolean => {
    // Run simulation for this specific scenario
    const result = simulateScenario(data, scenario)

    // Check if this holder would be in the recovery path
    if (result.recovery_path) {
      return result.recovery_path.includes(holder.id)
    }

    // If no recovery path, check based on scenario affects
    if (scenario.affected_roles?.includes(holder.role)) return false
    if (scenario.affected_key_ids?.includes(holder.id)) return false
    if (scenario.affected_locations?.some(loc =>
      holder.location.toLowerCase().includes(loc.toLowerCase())
    )) return false

    return true
  }

  // Get combined scenario result if multiple selected
  const combinedResult = selectedScenarios.length > 1
    ? simulateCombinedScenarios(data, scenarios.filter(s => selectedScenarios.includes(s.id)))
    : null

  // Calculate column width based on longest scenario name
  const maxScenarioLength = Math.max(...scenarios.map(s => s.name.length), 10)
  const colWidth = Math.max(maxScenarioLength + 2, 12)

  return (
    <div className="font-mono text-xs overflow-x-auto text-gray-900">
      <table className="border-collapse bg-white">
        <thead>
          <tr>
            <th className="border border-gray-800 p-2 text-left bg-gray-100 text-gray-900">
              KEY HOLDER
            </th>
            {scenarios.map(scenario => (
              <th
                key={scenario.id}
                className={`border border-gray-800 p-2 text-center ${
                  selectedScenarios.includes(scenario.id) ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-900'
                }`}
                style={{ minWidth: `${colWidth}ch` }}
              >
                <div className="truncate">{scenario.name.toUpperCase()}</div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.keyholders.map(holder => (
            <tr key={holder.id}>
              <td className="border border-gray-800 p-2 bg-white">
                <div className="text-gray-900">{holder.name}</div>
                <div className="text-gray-600">
                  {holder.storage_type} • {holder.location}
                </div>
              </td>
              {scenarios.map(scenario => {
                const available = isKeyAvailable(holder, scenario)
                return (
                  <td
                    key={`${holder.id}-${scenario.id}`}
                    className={`border border-gray-800 p-2 text-center ${
                      available ? '' : 'bg-gray-100'
                    }`}
                  >
                    <span className={available ? 'text-green-600' : 'text-red-600'}>
                      {available ? '✓' : '✗'}
                    </span>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Summary */}
      <div className="mt-4 p-2 border border-gray-800 bg-white">
        <div className="flex items-center justify-between text-gray-900">
          <span>
            THRESHOLD: {data.wallets[0]?.threshold || 0}/{data.wallets[0]?.total_keys || 0}
          </span>
          <span>
            {combinedResult ? (
              <span className={combinedResult.outcome === 'recoverable' ? 'text-green-600' : 'text-red-600'}>
                COMBINED: {combinedResult.available_keys} KEYS AVAILABLE - {combinedResult.outcome.toUpperCase()}
              </span>
            ) : (
              <span className="text-gray-600">SELECT SCENARIOS TO TEST</span>
            )}
          </span>
        </div>
      </div>
    </div>
  )
}