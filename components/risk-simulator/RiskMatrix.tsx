/**
 * RiskMatrix - Main risk visualization table
 * Shows keys (rows) × scenarios (columns) with color-coded availability
 */

import { MultisigSetup, Scenario, SimulationResult, Key } from '@/lib/risk-simulator/types'
import { RiskCell } from './RiskCell'

interface RiskMatrixProps {
  setup: MultisigSetup
  scenarios: Scenario[]
  results: SimulationResult[]
  selectedScenarioIds?: string[]
}

export function RiskMatrix({ setup, scenarios, results, selectedScenarioIds = [] }: RiskMatrixProps) {

  /**
   * Check if a specific key is available in a specific scenario
   * Using role-based matching to work with any holder names
   */
  const isKeyAvailableInScenario = (key: Key, scenario: Scenario): boolean => {
    // Check if this key is affected by the scenario
    const isAffected = isKeyAffectedByScenario(key, scenario, setup.keys)

    if (isAffected) {
      // Check if key is sharded and can be reconstructed
      if (key.type === 'sharded' && key.shardConfig) {
        const availableShards = key.shardConfig.holders.filter(
          holder => !isHolderAffected(holder, scenario, setup.keys)
        )
        return availableShards.length >= key.shardConfig.k
      }
      return false // Key is affected and not sharded (or can't reconstruct)
    }

    // Check if compromised
    if (scenario.compromisedKeys?.includes(key.id)) {
      return false
    }

    return true // Key is available
  }

  /**
   * Check if a key is affected by a scenario
   * Uses multiple matching strategies for flexibility
   */
  const isKeyAffectedByScenario = (key: Key, scenario: Scenario, allKeys: Key[]): boolean => {
    // 1. Check by role (preferred method)
    if (scenario.affectedRoles && key.role) {
      if (scenario.affectedRoles.includes(key.role)) {
        return true
      }
    }

    // 2. Check by location (for geographic risks like House Fire)
    if (scenario.affectedLocations && scenario.affectedLocations.length > 0) {
      // Case-insensitive location matching
      const keyLocation = key.location.toLowerCase()
      for (const affectedLocation of scenario.affectedLocations) {
        if (keyLocation.includes(affectedLocation.toLowerCase())) {
          return true
        }
      }
    }

    // 3. Check by index
    if (scenario.affectedIndices) {
      const keyIndex = allKeys.indexOf(key)
      if (scenario.affectedIndices.includes(keyIndex)) {
        return true
      }
    }

    // 4. Legacy: Check by exact holder name (backward compatibility)
    if (scenario.unavailableHolders.includes(key.holder)) {
      return true
    }

    return false
  }

  /**
   * Check if a shard holder is affected by a scenario
   */
  const isHolderAffected = (holderName: string, scenario: Scenario, allKeys: Key[]): boolean => {
    const matchingKey = allKeys.find(k => k.holder === holderName)
    if (matchingKey) {
      return isKeyAffectedByScenario(matchingKey, scenario, allKeys)
    }
    return scenario.unavailableHolders.includes(holderName)
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="p-4 text-left text-sm font-medium text-gray-700">
                Key Holder
              </th>
              {scenarios.map((scenario) => {
                const isSelected = selectedScenarioIds.includes(scenario.id)
                return (
                  <th
                    key={scenario.id}
                    className={`p-4 text-center text-sm font-medium ${
                      isSelected
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-700'
                    }`}
                  >
                    <div className="whitespace-nowrap">{scenario.name}</div>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {setup.keys.map((key, keyIndex) => (
              <tr
                key={key.id}
                className={keyIndex < setup.keys.length - 1 ? 'border-b border-gray-100' : ''}
              >
                <td className="p-4 border-r border-gray-200">
                  <div className="font-medium text-gray-900">{key.holder}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {key.type === 'sharded' && key.shardConfig
                      ? `Sharded ${key.shardConfig.k}-of-${key.shardConfig.m}`
                      : `${key.storage} • ${key.location}`}
                  </div>
                </td>
                {scenarios.map((scenario) => {
                  const isAffected = isKeyAffectedByScenario(key, scenario, setup.keys) ||
                                     scenario.compromisedKeys?.includes(key.id) || false
                  const isAvailable = isKeyAvailableInScenario(key, scenario)
                  const isCompromised = scenario.compromisedKeys?.includes(key.id) || false

                  return (
                    <RiskCell
                      key={`${key.id}-${scenario.id}`}
                      isAvailable={isAvailable}
                      isCompromised={isCompromised}
                      isAffected={isAffected}
                    />
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary footer */}
      <div className="border-t-2 border-gray-900 bg-white px-4 py-3">
        <div className="flex items-center justify-between text-xs font-mono">
          <div className="text-gray-600">
            THRESHOLD: <span className="text-gray-900">{setup.threshold}/{setup.totalKeys}</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-gray-900 font-medium">✓</span>
              <span className="text-gray-600">AVAILABLE</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-900 font-medium">✗</span>
              <span className="text-gray-600">UNAVAILABLE</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-900 font-medium">⚠</span>
              <span className="text-gray-600">COMPROMISED</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
