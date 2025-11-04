/**
 * ShardConfig - Configuration panel for sharding keys
 * Allows toggling shard mode and configuring k-of-m distribution
 */

import { Key, ShardConfig as ShardConfigType } from '@/lib/risk-simulator/types'

interface ShardConfigProps {
  keyData: Key
  onToggleShard: (keyId: string, enabled: boolean) => void
  onUpdateShard: (keyId: string, config: ShardConfigType) => void
  availableHolders: string[]  // List of potential shard holders
}

export function ShardConfig({ keyData, onToggleShard, onUpdateShard, availableHolders }: ShardConfigProps) {

  const isSharded = keyData.type === 'sharded'
  const shardConfig = keyData.shardConfig

  // Handle enable/disable sharding
  const handleToggle = (enabled: boolean) => {
    if (enabled && !shardConfig) {
      // Initialize with default 2-of-3 config
      const defaultHolders = availableHolders.slice(0, 3)
      onUpdateShard(keyData.id, {
        k: 2,
        m: 3,
        holders: defaultHolders
      })
    }
    onToggleShard(keyData.id, enabled)
  }

  // Update threshold (k)
  const handleUpdateK = (k: number) => {
    if (shardConfig) {
      onUpdateShard(keyData.id, { ...shardConfig, k })
    }
  }

  // Update total shards (m)
  const handleUpdateM = (m: number) => {
    if (shardConfig) {
      // Adjust holders array to match new m
      const newHolders = [...shardConfig.holders]
      while (newHolders.length < m) {
        const nextHolder = availableHolders.find(h => !newHolders.includes(h))
        if (nextHolder) newHolders.push(nextHolder)
      }
      while (newHolders.length > m) {
        newHolders.pop()
      }

      onUpdateShard(keyData.id, {
        ...shardConfig,
        m,
        k: Math.min(shardConfig.k, m), // Ensure k <= m
        holders: newHolders
      })
    }
  }

  // Update a specific shard holder
  const handleUpdateHolder = (index: number, holder: string) => {
    if (shardConfig) {
      const newHolders = [...shardConfig.holders]
      newHolders[index] = holder
      onUpdateShard(keyData.id, { ...shardConfig, holders: newHolders })
    }
  }

  return (
    <div className="border-t border-gray-200 pt-3 mt-2">
      {/* Toggle Checkbox */}
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={isSharded}
          onChange={(e) => handleToggle(e.target.checked)}
          className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-900"
        />
        <span className="text-sm text-gray-700">
          Shard this key?
        </span>
      </label>

      {/* Shard Configuration (shown when enabled) */}
      {isSharded && shardConfig && (
        <div className="mt-3 pl-6 space-y-3">
          {/* K-of-M Selector */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">
                Threshold (k)
              </label>
              <select
                value={shardConfig.k}
                onChange={(e) => handleUpdateK(Number(e.target.value))}
                className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-gray-900 focus:border-gray-900 bg-white text-gray-900"
              >
                {Array.from({ length: shardConfig.m }, (_, i) => i + 1).map(num => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">
                Total Shards (m)
              </label>
              <select
                value={shardConfig.m}
                onChange={(e) => handleUpdateM(Number(e.target.value))}
                className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-gray-900 focus:border-gray-900 bg-white text-gray-900"
              >
                {[2, 3, 4, 5].map(num => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Shard Holders */}
          <div>
            <label className="block text-xs text-gray-600 mb-2">
              Shard Holders ({shardConfig.k} needed to reconstruct)
            </label>
            <div className="space-y-2">
              {shardConfig.holders.map((holder, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="text-xs font-medium text-gray-700 w-16">Shard {index + 1}:</span>
                  <select
                    value={holder}
                    onChange={(e) => handleUpdateHolder(index, e.target.value)}
                    className="flex-1 text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-gray-900 focus:border-gray-900 bg-white text-gray-900 font-medium"
                  >
                    {availableHolders.map(h => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>

          {/* Visual Explanation */}
          <div className="text-xs text-gray-500 bg-gray-50 rounded p-2">
            ℹ️ If <strong>{keyData.holder}</strong> is unavailable, any <strong>{shardConfig.k}</strong> of these shard holders can reconstruct the key.
          </div>
        </div>
      )}
    </div>
  )
}
