/**
 * MissionControlEnhanced - SpaceX-style GO/NO-GO dashboard with risk details
 * Shows clear risk articulation while maintaining simplicity
 * First principles: Can you recover? Who's at risk? What's the impact?
 */

import { SimulationResult, MultisigSetup } from '@/lib/risk-simulator/types'
import { CheckCircle2, XCircle, AlertTriangle, ChevronDown, ChevronUp, Users, Key } from 'lucide-react'
import { useState } from 'react'

interface MissionControlEnhancedProps {
  results: SimulationResult[]
  setup: MultisigSetup
  resilienceScore: number
}

export function MissionControlEnhanced({ results, setup, resilienceScore }: MissionControlEnhancedProps) {
  const [expandedScenario, setExpandedScenario] = useState<string | null>(null)

  // System status based on resilience
  const systemStatus = resilienceScore === 100 ? 'FULLY SECURE' :
                       resilienceScore >= 80 ? 'OPERATIONAL' :
                       resilienceScore >= 60 ? 'AT RISK' :
                       'CRITICAL'

  // Group scenarios by risk level
  const criticalScenarios = results.filter(r => r.outcome !== 'recoverable')
  const warningScenarios = results.filter(r => r.outcome === 'recoverable' && r.availableKeys === setup.threshold)
  const safeScenarios = results.filter(r => r.outcome === 'recoverable' && r.availableKeys > setup.threshold)

  return (
    <div className="space-y-6">
      {/* Main Status Display */}
      <div className="bg-gray-900 text-white rounded-lg p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Overall Status */}
          <div className="text-center md:text-left">
            <div className="text-sm uppercase tracking-wider mb-2 text-gray-400">
              System Status
            </div>
            <div className={`text-3xl font-bold ${
              resilienceScore === 100 ? 'text-green-400' :
              resilienceScore >= 80 ? 'text-green-400' :
              resilienceScore >= 60 ? 'text-amber-400' :
              'text-red-400'
            }`}>
              {systemStatus}
            </div>
            <div className="text-xl mt-1 text-gray-300">
              {resilienceScore}% Resilient
            </div>
          </div>

          {/* Risk Summary */}
          <div className="text-center">
            <div className="text-sm uppercase tracking-wider mb-2 text-gray-400">
              Risk Assessment
            </div>
            <div className="flex justify-center gap-4 mt-3">
              {criticalScenarios.length > 0 && (
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-red-400">{criticalScenarios.length} Critical</span>
                </div>
              )}
              {warningScenarios.length > 0 && (
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-amber-500 rounded-full" />
                  <span className="text-amber-400">{warningScenarios.length} Warning</span>
                </div>
              )}
              {safeScenarios.length > 0 && (
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-green-500 rounded-full" />
                  <span className="text-green-400">{safeScenarios.length} Safe</span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="text-center md:text-right">
            <div className="text-sm uppercase tracking-wider mb-2 text-gray-400">
              Configuration
            </div>
            <div className="text-2xl font-light text-gray-300">
              {setup.threshold}-of-{setup.totalKeys} Multisig
            </div>
            <div className="text-sm mt-1 text-gray-500">
              {setup.keys.length} Key Holders
            </div>
          </div>
        </div>
      </div>

      {/* Scenario Risk Analysis */}
      <div className="space-y-4">
        {/* Critical Risks First */}
        {criticalScenarios.length > 0 && (
          <div className="border-2 border-red-200 rounded-lg overflow-hidden">
            <div className="bg-red-50 px-4 py-2 border-b border-red-200">
              <h3 className="font-medium text-red-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Critical Risks - Immediate Action Required
              </h3>
            </div>
            <div className="divide-y divide-red-100">
              {criticalScenarios.map(result => (
                <ScenarioRiskCard
                  key={result.scenario.id}
                  result={result}
                  setup={setup}
                  expanded={expandedScenario === result.scenario.id}
                  onToggle={() => setExpandedScenario(
                    expandedScenario === result.scenario.id ? null : result.scenario.id
                  )}
                />
              ))}
            </div>
          </div>
        )}

        {/* Warning Scenarios */}
        {warningScenarios.length > 0 && (
          <div className="border-2 border-amber-200 rounded-lg overflow-hidden">
            <div className="bg-amber-50 px-4 py-2 border-b border-amber-200">
              <h3 className="font-medium text-amber-900">
                Warning - Minimal Redundancy
              </h3>
            </div>
            <div className="divide-y divide-amber-100">
              {warningScenarios.map(result => (
                <ScenarioRiskCard
                  key={result.scenario.id}
                  result={result}
                  setup={setup}
                  expanded={expandedScenario === result.scenario.id}
                  onToggle={() => setExpandedScenario(
                    expandedScenario === result.scenario.id ? null : result.scenario.id
                  )}
                />
              ))}
            </div>
          </div>
        )}

        {/* Safe Scenarios */}
        {safeScenarios.length > 0 && (
          <div className="border-2 border-green-200 rounded-lg overflow-hidden">
            <div className="bg-green-50 px-4 py-2 border-b border-green-200">
              <h3 className="font-medium text-green-900">
                Safe - Full Redundancy
              </h3>
            </div>
            <div className="divide-y divide-green-100">
              {safeScenarios.map(result => (
                <ScenarioRiskCard
                  key={result.scenario.id}
                  result={result}
                  setup={setup}
                  expanded={expandedScenario === result.scenario.id}
                  onToggle={() => setExpandedScenario(
                    expandedScenario === result.scenario.id ? null : result.scenario.id
                  )}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Individual scenario card with expandable risk details
function ScenarioRiskCard({
  result,
  setup,
  expanded,
  onToggle
}: {
  result: SimulationResult
  setup: MultisigSetup
  expanded: boolean
  onToggle: () => void
}) {
  const isGo = result.outcome === 'recoverable'
  const riskLevel = !isGo ? 'critical' :
                    result.availableKeys === setup.threshold ? 'warning' :
                    'safe'

  // Identify affected keys
  const affectedKeys = setup.keys.filter(key => {
    // Check by role
    if (result.scenario.affectedRoles?.includes(key.role!)) return true
    // Check by location
    if (result.scenario.affectedLocations?.some(loc =>
      key.location.toLowerCase().includes(loc.toLowerCase())
    )) return true
    // Check by name
    if (result.scenario.unavailableHolders?.includes(key.holder)) return true
    return false
  })

  const availableKeys = setup.keys.filter(key =>
    !affectedKeys.some(affected => affected.id === key.id)
  )

  return (
    <div className={`${
      riskLevel === 'critical' ? 'bg-red-50' :
      riskLevel === 'warning' ? 'bg-amber-50' :
      'bg-green-50'
    }`}>
      {/* Main Row */}
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          {isGo ? (
            <CheckCircle2 className={`w-6 h-6 ${
              riskLevel === 'warning' ? 'text-amber-600' : 'text-green-600'
            }`} />
          ) : (
            <XCircle className="w-6 h-6 text-red-600" />
          )}
          <div className="text-left">
            <div className="font-medium text-gray-900">
              {result.scenario.name}
            </div>
            <div className="text-xs text-gray-600 mt-0.5">
              {affectedKeys.length} key{affectedKeys.length !== 1 ? 's' : ''} affected •
              {' '}{result.availableKeys}/{setup.totalKeys} available
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className={`text-sm font-bold ${
            isGo ? 'text-green-700' : 'text-red-700'
          }`}>
            {isGo ? 'RECOVERABLE' : 'LOCKED'}
          </div>
          {expanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </div>
      </button>

      {/* Expanded Details */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-gray-200 mt-2 pt-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Affected Keys */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                <Users className="w-4 h-4" />
                Keys at Risk:
              </h4>
              <div className="space-y-1">
                {affectedKeys.map(key => (
                  <div key={key.id} className="flex items-center gap-2 text-sm">
                    <XCircle className="w-4 h-4 text-red-500" />
                    <span className="text-gray-700">{key.holder}</span>
                    <span className="text-xs text-gray-500">({key.storage})</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Available for Recovery */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                <Key className="w-4 h-4" />
                Available for Recovery:
              </h4>
              <div className="space-y-1">
                {availableKeys.map(key => (
                  <div key={key.id} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span className="text-gray-700">{key.holder}</span>
                    <span className="text-xs text-gray-500">({key.storage})</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Risk Impact */}
          <div className="mt-4 p-3 bg-white rounded-lg border border-gray-200">
            <div className="text-sm font-medium text-gray-700 mb-1">Risk Impact:</div>
            <div className="text-sm text-gray-600">
              {result.details || `${result.availableKeys} of ${setup.totalKeys} keys remain available. ${
                isGo ? `Recovery possible with ${setup.threshold} keys.` :
                `Need ${setup.threshold} keys but only ${result.availableKeys} available.`
              }`}
            </div>
            {result.recommendation && (
              <div className="mt-2 text-sm text-amber-700 font-medium">
                Recommendation: {result.recommendation}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}