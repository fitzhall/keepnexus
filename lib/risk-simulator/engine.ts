/**
 * Risk Simulator - Simulation Engine
 * Core logic for calculating multisig recovery scenarios
 */

import { MultisigSetup, Scenario, SimulationResult, Key, RiskAnalysis } from './types'

/**
 * Simulate a single scenario against a multisig setup
 * Returns whether funds are recoverable and which keys would be used
 */
export function simulateScenario(
  setup: MultisigSetup,
  scenario: Scenario
): SimulationResult {

  // Check each key to see if it's available in this scenario
  const availableKeys: Key[] = []

  for (const key of setup.keys) {
    if (isKeyAvailable(key, scenario)) {
      availableKeys.push(key)
    }
  }

  const numAvailable = availableKeys.length
  const threshold = setup.threshold

  // Determine outcome
  if (numAvailable >= threshold) {
    return {
      scenario,
      availableKeys: numAvailable,
      requiredKeys: threshold,
      outcome: 'recoverable',
      recoveryPath: availableKeys.slice(0, threshold).map(k => k.holder),
      details: `${numAvailable} keys available, ${threshold} needed. Funds can be recovered.`
    }
  }

  // Not enough keys available
  return {
    scenario,
    availableKeys: numAvailable,
    requiredKeys: threshold,
    outcome: 'locked',
    recommendation: generateRecommendation(setup, scenario, numAvailable),
    details: `Only ${numAvailable} keys available, but ${threshold} needed. Funds are LOCKED.`
  }
}

/**
 * Check if a specific key is available in a scenario
 * Handles both full keys and sharded keys
 */
function isKeyAvailable(key: Key, scenario: Scenario): boolean {

  // If the key holder is unavailable
  if (scenario.unavailableHolders.includes(key.holder)) {

    // Check if this key is sharded and can be reconstructed
    if (key.type === 'sharded' && key.shardConfig) {
      // Count how many shard holders are available
      const availableShardHolders = key.shardConfig.holders.filter(
        holder => !scenario.unavailableHolders.includes(holder)
      )

      // Can we reconstruct? Need k out of m shards
      return availableShardHolders.length >= key.shardConfig.k
    }

    // Key holder unavailable and not sharded (or can't reconstruct)
    return false
  }

  // If key is compromised (for theft scenarios)
  if (scenario.compromisedKeys?.includes(key.id)) {
    // For now, treat compromised keys as unavailable
    // In future: could model as "degraded" security
    return false
  }

  // Key holder is available and key is not compromised
  return true
}

/**
 * Generate recommendation for how to fix a locked scenario
 */
function generateRecommendation(
  setup: MultisigSetup,
  scenario: Scenario,
  currentAvailable: number
): string {
  const needed = setup.threshold - currentAvailable

  if (needed === 1) {
    // Find which key(s) are unavailable and could be sharded
    const unavailableKeys = setup.keys.filter(
      key => scenario.unavailableHolders.includes(key.holder) && key.type !== 'sharded'
    )

    if (unavailableKeys.length > 0) {
      return `Shard ${unavailableKeys[0].holder}'s key between multiple trusted parties to ensure reconstruction.`
    }
  }

  if (needed > 1) {
    return `Consider sharding multiple keys or adding an additional custodian to increase resilience.`
  }

  return 'Review key distribution to eliminate single points of failure.'
}

/**
 * Run full risk analysis across all scenarios
 */
export function analyzeRisk(
  setup: MultisigSetup,
  scenarios: Scenario[]
): RiskAnalysis {

  // Run simulation for each scenario
  const results = scenarios.map(scenario => simulateScenario(setup, scenario))

  // Calculate resilience score (% of scenarios that are recoverable)
  const recoverableCount = results.filter(r => r.outcome === 'recoverable').length
  const resilienceScore = Math.round((recoverableCount / scenarios.length) * 100)

  // Identify critical risks (scenarios that lock funds)
  const criticalRisks = results
    .filter(r => r.outcome === 'locked')
    .map(r => r.scenario.name)

  return {
    setup,
    scenarios,
    results,
    resilienceScore,
    criticalRisks
  }
}

/**
 * Calculate resilience score (0-100)
 * Percentage of scenarios where funds are recoverable
 */
export function calculateResilienceScore(
  setup: MultisigSetup,
  scenarios: Scenario[]
): number {
  const results = scenarios.map(s => simulateScenario(setup, s))
  const recoverable = results.filter(r => r.outcome === 'recoverable').length
  return Math.round((recoverable / scenarios.length) * 100)
}
