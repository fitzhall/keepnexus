/**
 * SingleKeyConfig - Configuration panel for a single key holder
 * Allows configuring sharding for individual keys
 */

import { Key, ShardConfig as ShardConfigType } from '@/lib/risk-simulator/types'
import { ShardConfig } from './ShardConfig'

interface SingleKeyConfigProps {
  keyHolder: Key
  onToggleShard: (enabled: boolean) => void
  onUpdateShard: (config: ShardConfigType) => void
}

export function SingleKeyConfig({ keyHolder, onToggleShard, onUpdateShard }: SingleKeyConfigProps) {

  // Get all potential shard holders (common options)
  const availableHolders = [
    'Child A',
    'Child B',
    'Child C',
    'Trusted Friend',
    'Business Partner',
    'Accountant',
    'Bank Vault',
    'Safety Deposit Box'
  ]

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      {/* Key Info */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="font-medium text-gray-900">{keyHolder.holder}</div>
          <div className="text-xs text-gray-500 mt-0.5">
            {keyHolder.type === 'sharded' ? '🔐 Sharded' : '🔑 Full'} •
            {' '}{keyHolder.storage} • {keyHolder.location}
          </div>
        </div>
        <button
          onClick={() => onToggleShard(keyHolder.type !== 'sharded')}
          className={`text-xs px-2 py-1 rounded ${
            keyHolder.type === 'sharded'
              ? 'bg-blue-100 text-blue-700'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {keyHolder.type === 'sharded' ? 'Sharded' : 'Enable Sharding'}
        </button>
      </div>

      {/* Shard Configuration */}
      {keyHolder.type === 'sharded' && (
        <ShardConfig
          keyData={keyHolder}
          availableHolders={availableHolders}
          onToggleShard={(keyId, enabled) => onToggleShard(enabled)}
          onUpdateShard={(keyId, config) => onUpdateShard(config)}
        />
      )}
    </div>
  )
}