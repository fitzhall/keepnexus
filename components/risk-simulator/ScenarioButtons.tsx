/**
 * ScenarioButtons - Interactive disaster scenario selector
 * Allows selecting multiple scenarios to see combined risk analysis
 * Simplified version that just handles selection
 */

import { Scenario } from '@/lib/risk-simulator/types'
import {
  Home,
  Users,
  Shield,
  AlertTriangle,
  Building,
  UserX
} from 'lucide-react'

interface ScenarioButtonsProps {
  scenarios: Scenario[]
  selectedIds?: string[]  // Array of selected scenario IDs (empty = show all)
  onToggle?: (scenarioId: string) => void
  onClear?: () => void
}

export function ScenarioButtons({ scenarios, selectedIds = [], onToggle, onClear }: ScenarioButtonsProps) {

  const toggleScenario = (scenarioId: string) => {
    if (onToggle) {
      onToggle(scenarioId)
    }
  }

  const clearSelection = () => {
    if (onClear) {
      onClear()
    }
  }

  const getButtonStyle = (scenarioId: string) => {
    const isSelected = selectedIds.includes(scenarioId)

    if (isSelected) {
      return 'bg-gray-900 text-white hover:bg-gray-800 border-gray-900'
    }

    return 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'
  }

  // Get icon for scenario type
  const getScenarioIcon = (scenarioId: string) => {
    if (scenarioId.includes('both') || scenarioId.includes('primary')) {
      return <Users className="w-4 h-4" />
    }
    if (scenarioId.includes('house') || scenarioId.includes('fire')) {
      return <Home className="w-4 h-4" />
    }
    if (scenarioId.includes('theft') || scenarioId.includes('key')) {
      return <Shield className="w-4 h-4" />
    }
    if (scenarioId.includes('divorce')) {
      return <UserX className="w-4 h-4" />
    }
    if (scenarioId.includes('custodian') || scenarioId.includes('attorney')) {
      return <Building className="w-4 h-4" />
    }
    return <AlertTriangle className="w-4 h-4" />
  }

  // Group scenarios by category for better organization
  const categories = {
    'Death & Injury': scenarios.filter(s =>
      s.id.includes('die') || s.id.includes('memory') || s.id.includes('accident')
    ),
    'Geographic Risk': scenarios.filter(s =>
      s.id.includes('house') || s.id.includes('natural') || s.id.includes('bank')
    ),
    'Relationship Risk': scenarios.filter(s =>
      s.id.includes('divorce') || s.id.includes('estranged') || s.id.includes('custodian')
    ),
    'Security Risk': scenarios.filter(s =>
      s.id.includes('theft') || s.id.includes('cyber') || s.id.includes('kidnap') ||
      s.id.includes('government') || s.id.includes('hardware')
    ),
    'Access Risk': scenarios.filter(s =>
      s.id.includes('pandemic') || !['die', 'memory', 'accident', 'house', 'natural', 'bank',
        'divorce', 'estranged', 'custodian', 'theft', 'cyber', 'kidnap', 'government', 'hardware'].some(term => s.id.includes(term))
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">
          {selectedIds.length > 0 ? (
            <span>{selectedIds.length} selected</span>
          ) : (
            <span>Select scenarios to test</span>
          )}
        </div>
        {selectedIds.length > 0 && (
          <button
            onClick={clearSelection}
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
        {scenarios.slice(0, 12).map((scenario) => (
          <button
            key={scenario.id}
            onClick={() => toggleScenario(scenario.id)}
            className={`
              text-left px-3 py-2 rounded border transition-all text-sm
              ${selectedIds.includes(scenario.id)
                ? 'bg-gray-900 text-white border-gray-900'
                : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
              }
            `}
          >
            <div className="font-medium truncate">
              {scenario.name}
            </div>
          </button>
        ))}
      </div>

      {scenarios.length > 12 && (
        <details className="text-sm">
          <summary className="cursor-pointer text-gray-600 hover:text-gray-900">
            Show {scenarios.length - 12} more scenarios...
          </summary>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 mt-2">
            {scenarios.slice(12).map((scenario) => (
              <button
                key={scenario.id}
                onClick={() => toggleScenario(scenario.id)}
                className={`
                  text-left px-3 py-2 rounded border transition-all text-sm
                  ${selectedIds.includes(scenario.id)
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                  }
                `}
              >
                <div className="font-medium truncate">
                  {scenario.name}
                </div>
              </button>
            ))}
          </div>
        </details>
      )}
    </div>
  )
}