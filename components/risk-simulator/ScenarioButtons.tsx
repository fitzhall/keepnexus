/**
 * ScenarioButtons - Interactive disaster scenario selector
 * Allows selecting multiple scenarios to see combined risk analysis
 * Phase 2: Support for multi-scenario testing
 */

import { Scenario } from '@/lib/risk-simulator/types'

interface ScenarioButtonsProps {
  scenarios: Scenario[]
  selectedScenarioIds: string[]  // Array of selected scenario IDs (empty = show all)
  onSelectScenarios: (scenarioIds: string[]) => void
}

export function ScenarioButtons({ scenarios, selectedScenarioIds, onSelectScenarios }: ScenarioButtonsProps) {

  const toggleScenario = (scenarioId: string) => {
    if (selectedScenarioIds.includes(scenarioId)) {
      // Remove from selection
      onSelectScenarios(selectedScenarioIds.filter(id => id !== scenarioId))
    } else {
      // Add to selection
      onSelectScenarios([...selectedScenarioIds, scenarioId])
    }
  }

  const clearSelection = () => {
    onSelectScenarios([])
  }

  const getButtonStyle = (scenarioId: string) => {
    const isSelected = selectedScenarioIds.includes(scenarioId)

    if (isSelected) {
      return 'bg-gray-900 text-white hover:bg-gray-800 border-gray-900'
    }
    return 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-medium text-gray-900">
            Test Scenarios
          </h3>
          {selectedScenarioIds.length > 0 && (
            <p className="text-xs text-gray-500 mt-1">
              {selectedScenarioIds.length} scenario{selectedScenarioIds.length > 1 ? 's' : ''} selected • Combined analysis
            </p>
          )}
        </div>
        <button
          onClick={clearSelection}
          className={`text-xs px-3 py-1 rounded-md transition-colors ${
            selectedScenarioIds.length === 0
              ? 'bg-gray-900 text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          Show All
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {scenarios.map((scenario) => {
          const isSelected = selectedScenarioIds.includes(scenario.id)
          return (
            <button
              key={scenario.id}
              onClick={() => toggleScenario(scenario.id)}
              className={`p-4 rounded-lg text-left transition-all border-2 ${getButtonStyle(scenario.id)}`}
            >
              <div className="flex items-start gap-2">
                {/* Checkbox indicator */}
                <div className={`flex-shrink-0 w-4 h-4 rounded border-2 flex items-center justify-center mt-0.5 ${
                  isSelected
                    ? 'bg-white border-white'
                    : 'bg-white border-gray-300'
                }`}>
                  {isSelected && (
                    <svg className="w-3 h-3 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>

                <div className="flex-1">
                  <div className="font-medium text-sm mb-1">
                    {scenario.name}
                  </div>
                  <div className={`text-xs ${isSelected ? 'text-gray-300' : 'text-gray-500'}`}>
                    {scenario.unavailableHolders.length > 0
                      ? `${scenario.unavailableHolders.join(', ')} unavailable`
                      : 'All keys available'}
                  </div>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {selectedScenarioIds.length > 0 && (
        <div className="mt-4 p-3 bg-white border-2 border-gray-900">
          <div className="text-xs font-mono font-medium text-gray-900 mb-1">
            ⚠ COMBINED SCENARIO ANALYSIS
          </div>
          <div className="text-xs font-mono text-gray-600">
            Testing multiple disasters simultaneously. All unavailable holders from selected scenarios are combined.
          </div>
        </div>
      )}
    </div>
  )
}
