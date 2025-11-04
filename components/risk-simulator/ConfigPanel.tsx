/**
 * ConfigPanel - Left sidebar for configuring multisig setup
 * Shows keys and allows sharding configuration
 */

import { MultisigSetup, ShardConfig as ShardConfigType } from '@/lib/risk-simulator/types'
import { ShardConfig } from './ShardConfig'

interface ConfigPanelProps {
  setup: MultisigSetup
  onToggleShard: (keyId: string, enabled: boolean) => void
  onUpdateShard: (keyId: string, config: ShardConfigType) => void
}

export function ConfigPanel({ setup, onToggleShard, onUpdateShard }: ConfigPanelProps) {

  // Get all potential shard holders (all key holders + common options)
  const availableHolders = [
    ...setup.keys.map(k => k.holder),
    'Child B',
    'Child C',
    'Trusted Friend',
    'Business Partner',
    'Accountant'
  ]

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="text-sm font-medium text-gray-900 mb-4">
        Key Configuration
      </h3>

      <div className="space-y-4">
        {setup.keys.map((key) => (
          <div key={key.id} className="pb-4 border-b border-gray-100 last:border-0 last:pb-0">
            {/* Key Info */}
            <div className="flex items-start justify-between mb-1">
              <div>
                <div className="font-medium text-gray-900">{key.holder}</div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {key.storage} • {key.location}
                </div>
              </div>
              {key.type === 'sharded' && key.shardConfig && (
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-medium flex items-center gap-1">
                  <span>✓</span>
                  <span>Sharded {key.shardConfig.k}-of-{key.shardConfig.m}</span>
                </span>
              )}
            </div>

            {/* Shard Configuration */}
            <ShardConfig
              keyData={key}
              onToggleShard={onToggleShard}
              onUpdateShard={onUpdateShard}
              availableHolders={availableHolders}
            />
          </div>
        ))}
      </div>

      {/* Help Text */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          💡 <strong>Tip:</strong> Shard keys held by co-located parties (like spouses) to eliminate single points of failure.
        </p>
      </div>
    </div>
  )
}
