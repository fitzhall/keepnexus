/**
 * KeyAvailabilitySelector - Simple key availability testing interface
 * Click keys to mark them as unavailable and test recovery scenarios
 * Minimalist, timeless design focused on technical testing
 */

import { useState, useEffect } from 'react'
import { MultisigSetup } from '@/lib/risk-simulator/types'

interface KeyAvailabilitySelectorProps {
  setup: MultisigSetup
  onSelectionChange: (unavailableKeyIds: string[]) => void
}

export function KeyAvailabilitySelector({ setup, onSelectionChange }: KeyAvailabilitySelectorProps) {
  const [unavailableKeys, setUnavailableKeys] = useState<Set<string>>(new Set())
  const [testMode, setTestMode] = useState<'manual' | 'quick'>('manual')

  // Notify parent of selection changes
  useEffect(() => {
    onSelectionChange(Array.from(unavailableKeys))
  }, [unavailableKeys, onSelectionChange])

  const toggleKey = (keyId: string) => {
    setUnavailableKeys(prev => {
      const newSet = new Set(prev)
      if (newSet.has(keyId)) {
        newSet.delete(keyId)
      } else {
        newSet.add(keyId)
      }
      return newSet
    })
  }

  const clearSelection = () => {
    setUnavailableKeys(new Set())
  }

  // Quick test functions
  const testAnyNKeys = (n: number) => {
    // Select first n keys as unavailable
    const keysToMark = setup.keys.slice(0, n).map(k => k.id)
    setUnavailableKeys(new Set(keysToMark))
  }

  const testThreshold = () => {
    // Test with exactly threshold keys available (mark others unavailable)
    const keysToMark = setup.keys.slice(setup.threshold).map(k => k.id)
    setUnavailableKeys(new Set(keysToMark))
  }

  const testWorstCase = () => {
    // Maximum keys unavailable while still recoverable
    const maxUnavailable = setup.totalKeys - setup.threshold
    const keysToMark = setup.keys.slice(0, maxUnavailable).map(k => k.id)
    setUnavailableKeys(new Set(keysToMark))
  }

  const testBeyondThreshold = () => {
    // One more than worst case - should fail
    const keysToMark = setup.keys.slice(0, setup.totalKeys - setup.threshold + 1).map(k => k.id)
    setUnavailableKeys(new Set(keysToMark))
  }

  // Calculate recovery status
  const availableCount = setup.totalKeys - unavailableKeys.size
  const canRecover = availableCount >= setup.threshold
  const statusText = unavailableKeys.size === 0
    ? 'Select keys to test availability'
    : canRecover
      ? `RECOVERABLE: ${availableCount} of ${setup.threshold} keys available`
      : `LOCKED: Only ${availableCount} of ${setup.threshold} required keys available`

  return (
    <div className="space-y-6">
      {/* Mode Toggle */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Test Key Availability</h3>
        <div className="flex gap-2 text-sm">
          <button
            onClick={() => setTestMode('manual')}
            className={`px-3 py-1 rounded border transition-all ${
              testMode === 'manual'
                ? 'border-gray-900 bg-gray-900 text-white'
                : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
            }`}
          >
            Manual Selection
          </button>
          <button
            onClick={() => setTestMode('quick')}
            className={`px-3 py-1 rounded border transition-all ${
              testMode === 'quick'
                ? 'border-gray-900 bg-gray-900 text-white'
                : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
            }`}
          >
            Quick Tests
          </button>
        </div>
      </div>

      {testMode === 'manual' ? (
        <>
          {/* Individual Key Selection */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-gray-600">
                Click keys to mark them as unavailable
              </p>
              {unavailableKeys.size > 0 && (
                <button
                  onClick={clearSelection}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Clear All
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {setup.keys.map((key, index) => {
                const isUnavailable = unavailableKeys.has(key.id)
                return (
                  <button
                    key={key.id}
                    onClick={() => toggleKey(key.id)}
                    className={`p-3 rounded border transition-all ${
                      isUnavailable
                        ? 'border-gray-900 bg-gray-900 text-white'
                        : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    <div className="text-lg font-light">Key {index + 1}</div>
                    <div className="text-xs mt-1 opacity-75">{key.holder}</div>
                    {key.location && (
                      <div className="text-xs opacity-50">{key.location}</div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Group Selection Options */}
          <div>
            <p className="text-sm text-gray-600 mb-3">Select by Group</p>
            <div className="flex flex-wrap gap-2">
              {/* Role-based selection */}
              {Array.from(new Set(setup.keys.map(k => k.role).filter(Boolean))).map(role => {
                const roleKeys = setup.keys.filter(k => k.role === role)
                if (roleKeys.length === 0) return null

                return (
                  <button
                    key={role}
                    onClick={() => {
                      const roleKeyIds = roleKeys.map(k => k.id)
                      setUnavailableKeys(new Set(roleKeyIds))
                    }}
                    className="px-3 py-1 text-sm border border-gray-300 rounded hover:border-gray-400 bg-white text-gray-700"
                  >
                    All {role} ({roleKeys.length})
                  </button>
                )
              })}

              {/* Location-based selection */}
              {Array.from(new Set(setup.keys.map(k => k.location).filter(Boolean))).map(location => {
                const locationKeys = setup.keys.filter(k => k.location === location)
                if (locationKeys.length <= 1) return null

                return (
                  <button
                    key={location}
                    onClick={() => {
                      const locationKeyIds = locationKeys.map(k => k.id)
                      setUnavailableKeys(new Set(locationKeyIds))
                    }}
                    className="px-3 py-1 text-sm border border-gray-300 rounded hover:border-gray-400 bg-white text-gray-700"
                  >
                    {location} ({locationKeys.length})
                  </button>
                )
              })}
            </div>
          </div>
        </>
      ) : (
        /* Quick Test Mode */
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Run predefined tests to quickly assess your setup&apos;s resilience
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button
              onClick={() => testAnyNKeys(1)}
              className="p-3 border border-gray-300 rounded hover:border-gray-400 bg-white text-gray-700 text-center"
            >
              <div className="font-medium">Any 1 Key</div>
              <div className="text-xs text-gray-500 mt-1">Test single key loss</div>
            </button>

            <button
              onClick={() => testAnyNKeys(2)}
              className="p-3 border border-gray-300 rounded hover:border-gray-400 bg-white text-gray-700 text-center"
            >
              <div className="font-medium">Any 2 Keys</div>
              <div className="text-xs text-gray-500 mt-1">Test double key loss</div>
            </button>

            <button
              onClick={testThreshold}
              className="p-3 border border-gray-300 rounded hover:border-gray-400 bg-white text-gray-700 text-center"
            >
              <div className="font-medium">At Threshold</div>
              <div className="text-xs text-gray-500 mt-1">Exactly {setup.threshold} keys</div>
            </button>

            <button
              onClick={testWorstCase}
              className="p-3 border border-gray-300 rounded hover:border-gray-400 bg-white text-gray-700 text-center"
            >
              <div className="font-medium">Worst Case</div>
              <div className="text-xs text-gray-500 mt-1">Maximum survivable loss</div>
            </button>

            <button
              onClick={testBeyondThreshold}
              className="p-3 border border-gray-300 rounded hover:border-gray-400 bg-white text-gray-700 text-center"
            >
              <div className="font-medium">Beyond Threshold</div>
              <div className="text-xs text-gray-500 mt-1">Test failure scenario</div>
            </button>

            {setup.keys.filter(k => k.role === 'primary').length >= 2 && (
              <button
                onClick={() => {
                  const primaryKeys = setup.keys.filter(k => k.role === 'primary').map(k => k.id)
                  setUnavailableKeys(new Set(primaryKeys))
                }}
                className="p-3 border border-gray-300 rounded hover:border-gray-400 bg-white text-gray-700 text-center"
              >
                <div className="font-medium">Primary Keys</div>
                <div className="text-xs text-gray-500 mt-1">Test primary holder loss</div>
              </button>
            )}

            <button
              onClick={clearSelection}
              className="p-3 border border-gray-300 rounded hover:border-gray-400 bg-white text-gray-700 text-center"
            >
              <div className="font-medium">Reset</div>
              <div className="text-xs text-gray-500 mt-1">Clear selection</div>
            </button>
          </div>
        </div>
      )}

      {/* Status Display */}
      <div className={`p-4 rounded border text-center ${
        unavailableKeys.size === 0
          ? 'border-gray-300 bg-white'
          : canRecover
            ? 'border-gray-400 bg-white'
            : 'border-gray-900 bg-white'
      }`}>
        <div className={`text-lg font-light ${
          unavailableKeys.size === 0
            ? 'text-gray-400'
            : canRecover
              ? 'text-gray-900'
              : 'text-gray-900 font-medium'
        }`}>
          {statusText}
        </div>
        {unavailableKeys.size > 0 && (
          <div className="text-sm text-gray-600 mt-2">
            {unavailableKeys.size} key{unavailableKeys.size !== 1 ? 's' : ''} marked as unavailable
          </div>
        )}
      </div>
    </div>
  )
}