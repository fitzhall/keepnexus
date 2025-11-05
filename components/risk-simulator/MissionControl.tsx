/**
 * MissionControl - SpaceX-style GO/NO-GO dashboard
 * Dead simple: Can you recover your Bitcoin? YES or NO.
 * Inspired by Elon's first principles approach
 */

import { SimulationResult, MultisigSetup } from '@/lib/risk-simulator/types'
import { CheckCircle2, XCircle, AlertTriangle } from 'lucide-react'

interface MissionControlProps {
  results: SimulationResult[]
  setup: MultisigSetup
  resilienceScore: number
}

export function MissionControl({ results, setup, resilienceScore }: MissionControlProps) {

  // System status based on resilience
  const systemStatus = resilienceScore === 100 ? 'FULLY SECURE' :
                       resilienceScore >= 80 ? 'OPERATIONAL' :
                       resilienceScore >= 60 ? 'AT RISK' :
                       'CRITICAL'

  const statusColor = resilienceScore === 100 ? 'text-green-600' :
                     resilienceScore >= 80 ? 'text-green-600' :
                     resilienceScore >= 60 ? 'text-amber-600' :
                     'text-red-600'

  return (
    <div className="space-y-6">
      {/* Main Status Display */}
      <div className="bg-gray-900 text-white rounded-lg p-8 text-center">
        <div className="text-sm uppercase tracking-wider mb-2 text-gray-400">
          Bitcoin Recovery Status
        </div>
        <div className={`text-5xl font-bold mb-4 ${
          resilienceScore === 100 ? 'text-green-400' :
          resilienceScore >= 80 ? 'text-green-400' :
          resilienceScore >= 60 ? 'text-amber-400' :
          'text-red-400'
        }`}>
          {systemStatus}
        </div>
        <div className="text-3xl font-light">
          {resilienceScore}% Resilient
        </div>
        <div className="text-sm mt-2 text-gray-400">
          {results.filter(r => r.outcome === 'recoverable').length} of {results.length} scenarios pass
        </div>
      </div>

      {/* GO/NO-GO Checklist */}
      <div className="bg-white rounded-lg border-2 border-gray-900 p-6">
        <h3 className="text-sm uppercase tracking-wider text-gray-600 mb-4">
          System Checks
        </h3>
        <div className="space-y-3">
          {results.map((result) => {
            const isGo = result.outcome === 'recoverable'
            const keysText = `${result.availableKeys}/${setup.totalKeys} keys`

            return (
              <div
                key={result.scenario.id}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  isGo
                    ? 'bg-green-50 border-green-200'
                    : 'bg-red-50 border-red-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  {isGo ? (
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-600" />
                  )}
                  <div>
                    <div className="font-medium text-gray-900">
                      {result.scenario.name}
                    </div>
                    <div className="text-xs text-gray-600 mt-0.5">
                      {result.scenario.description}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-bold ${
                    isGo ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {isGo ? 'GO' : 'NO GO'}
                  </div>
                  <div className="text-xs text-gray-600">
                    {keysText}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Critical Failures Alert */}
      {resilienceScore < 100 && (
        <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-gray-900 mb-2">
                Action Required
              </h3>
              <div className="text-sm text-gray-700 space-y-1">
                {results
                  .filter(r => r.outcome !== 'recoverable')
                  .map(r => (
                    <div key={r.scenario.id}>
                      • <strong>{r.scenario.name}:</strong> {r.recommendation || 'Add redundancy to protect against this scenario'}
                    </div>
                  ))
                }
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Stats Bar */}
      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="bg-gray-100 rounded-lg p-4">
          <div className="text-2xl font-bold text-gray-900">
            {setup.threshold}/{setup.totalKeys}
          </div>
          <div className="text-xs text-gray-600 mt-1">
            Multisig Setup
          </div>
        </div>
        <div className="bg-gray-100 rounded-lg p-4">
          <div className="text-2xl font-bold text-gray-900">
            {setup.keys.length}
          </div>
          <div className="text-xs text-gray-600 mt-1">
            Key Holders
          </div>
        </div>
        <div className="bg-gray-100 rounded-lg p-4">
          <div className={`text-2xl font-bold ${statusColor}`}>
            {results.filter(r => r.outcome === 'recoverable').length}
          </div>
          <div className="text-xs text-gray-600 mt-1">
            Scenarios Pass
          </div>
        </div>
      </div>
    </div>
  )
}