/**
 * RiskMatrix - Main risk visualization table
 * Shows keys (rows) × scenarios (columns) with color-coded availability
 */

import { MultisigSetup, Scenario, SimulationResult } from '@/lib/risk-simulator/types'
import { RiskCell } from './RiskCell'

interface RiskMatrixProps {
  setup: MultisigSetup
  scenarios: Scenario[]
  results: SimulationResult[]
}

export function RiskMatrix({ setup, scenarios, results }: RiskMatrixProps) {

  /**
   * Check if a specific key is available in a specific scenario
   */
  const isKeyAvailableInScenario = (keyHolder: string, scenario: Scenario): boolean => {
    // Check if holder is unavailable in this scenario
    if (scenario.unavailableHolders.includes(keyHolder)) {
      // Check if key is sharded and can be reconstructed
      const key = setup.keys.find(k => k.holder === keyHolder)
      if (key?.type === 'sharded' && key.shardConfig) {
        const availableShards = key.shardConfig.holders.filter(
          h => !scenario.unavailableHolders.includes(h)
        )
        return availableShards.length >= key.shardConfig.k
      }
      return false
    }
    return true
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
              {scenarios.map((scenario) => (
                <th
                  key={scenario.id}
                  className="p-4 text-center text-sm font-medium text-gray-700"
                >
                  <div className="whitespace-nowrap">{scenario.name}</div>
                </th>
              ))}
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
                {scenarios.map((scenario) => (
                  <RiskCell
                    key={`${key.id}-${scenario.id}`}
                    isAvailable={isKeyAvailableInScenario(key.holder, scenario)}
                    isCompromised={scenario.compromisedKeys?.includes(key.id)}
                  />
                ))}
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
