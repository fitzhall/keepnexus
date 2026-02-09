/**
 * Risk Simulator Engine 2.0
 * Core simulation logic with proper combined scenario handling
 * Supports both deterministic and Monte Carlo simulation modes
 */

import {
  LittleShardFile,
  Scenario,
  ScenarioResult,
  ScenarioOutcome,
  KeyHolder,
  RiskAnalysis,
  SimulationConfig
} from '../keep-core/data-model';

import { combineScenarios } from './scenarios';

// ============================================================================
// Main Simulation Functions
// ============================================================================

/**
 * Run risk analysis on a setup with given scenarios
 */
export function runRiskAnalysis(
  data: LittleShardFile,
  scenarios: Scenario[],
  config: SimulationConfig = { mode: 'deterministic' }
): RiskAnalysis {

  const results: ScenarioResult[] = [];

  // Run simulation for each scenario
  for (const scenario of scenarios) {
    const result = simulateScenario(data, scenario);
    results.push(result);
  }

  // Calculate overall probability of recovery
  const recoverableCount = results.filter(r => r.outcome === 'recoverable').length;
  const probability_of_recovery = recoverableCount / scenarios.length;

  // Identify critical risks
  const critical_risks = results
    .filter(r => r.outcome === 'locked')
    .map(r => r.scenario_name);

  // Get mitigation suggestions
  const mitigation_applied = getMitigationHistory(data);

  return {
    last_run: new Date().toISOString(),
    scenarios_tested: scenarios.length,
    monte_carlo_iterations: config.mode === 'monte-carlo' ? config.iterations : undefined,
    probability_of_recovery,
    critical_risks,
    mitigation_applied,
    scenario_results: results
  };
}

/**
 * Simulate a single scenario against the setup
 */
export function simulateScenario(
  data: LittleShardFile,
  scenario: Scenario
): ScenarioResult {

  // Get the primary wallet (assuming first wallet is primary)
  const wallet = data.wallets[0];
  if (!wallet) {
    return {
      scenario_id: scenario.id,
      scenario_name: scenario.name,
      outcome: 'locked',
      available_keys: 0,
      required_keys: 0,
      mitigation: 'Configure a multisig wallet first'
    };
  }

  // Check each key holder's availability
  const availableKeyHolders = data.keyholders.filter(holder =>
    isKeyHolderAvailable(holder, scenario, data)
  );

  const available_keys = availableKeyHolders.length;
  const required_keys = wallet.threshold;

  // Determine outcome
  let outcome: ScenarioOutcome;
  if (available_keys >= required_keys) {
    outcome = 'recoverable';
  } else if (available_keys >= required_keys - 1) {
    outcome = 'at-risk';
  } else {
    outcome = 'locked';
  }

  // Generate recovery path if recoverable
  const recovery_path = outcome === 'recoverable'
    ? availableKeyHolders.slice(0, required_keys).map(h => h.id)
    : undefined;

  // Generate mitigation suggestion if not recoverable
  const mitigation = outcome !== 'recoverable'
    ? generateMitigation(data, scenario, available_keys, required_keys)
    : undefined;

  return {
    scenario_id: scenario.id,
    scenario_name: scenario.name,
    outcome,
    available_keys,
    required_keys,
    recovery_path,
    mitigation
  };
}

/**
 * Simulate multiple scenarios combined (union of affects)
 */
export function simulateCombinedScenarios(
  data: LittleShardFile,
  scenarios: Scenario[]
): ScenarioResult {
  // Combine scenarios using proper merging logic
  const combined = combineScenarios(scenarios);
  return simulateScenario(data, combined);
}

// ============================================================================
// Key Availability Logic
// ============================================================================

/**
 * Check if a key holder is available in a given scenario
 * This is the core logic that determines if a key can be used
 */
function isKeyHolderAvailable(
  holder: KeyHolder,
  scenario: Scenario,
  data: LittleShardFile
): boolean {

  // Check if holder is affected by the scenario
  if (isHolderAffected(holder, scenario, data)) {
    // If the key is sharded, check if it can be reconstructed
    if (holder.is_sharded && holder.shard_config) {
      return canReconstructShard(holder, scenario, data);
    }
    // Key is affected and not sharded (or can't reconstruct)
    return false;
  }

  // Holder is not affected by the scenario
  return true;
}

/**
 * Check if a holder is affected by a scenario
 * Uses multiple matching strategies for maximum flexibility
 */
function isHolderAffected(
  holder: KeyHolder,
  scenario: Scenario,
  data: LittleShardFile
): boolean {

  // 1. Check by role (most common)
  if (scenario.affected_roles && scenario.affected_roles.length > 0) {
    if (scenario.affected_roles.includes(holder.role)) {
      return true;
    }
  }

  // 2. Check by specific key ID
  if (scenario.affected_key_ids && scenario.affected_key_ids.length > 0) {
    if (scenario.affected_key_ids.includes(holder.id)) {
      return true;
    }
  }

  // 3. Check by index in the keyholders array
  if (scenario.affected_indices && scenario.affected_indices.length > 0) {
    const holderIndex = data.keyholders.findIndex(h => h.id === holder.id);
    if (scenario.affected_indices.includes(holderIndex)) {
      return true;
    }
  }

  // 4. Check by location (for geographic risks)
  if (scenario.affected_locations && scenario.affected_locations.length > 0) {
    const holderLocation = holder.location.toLowerCase();
    for (const affectedLocation of scenario.affected_locations) {
      if (holderLocation.includes(affectedLocation.toLowerCase())) {
        return true;
      }
    }
  }

  // 5. Check by storage type (for technology failures)
  if (scenario.id === 'technology_failure') {
    if (holder.storage_type === 'hardware-wallet' || holder.storage_type === 'digital') {
      // 30% chance of hardware/digital failure affecting this key
      return Math.random() < 0.3;
    }
  }

  return false;
}

/**
 * Check if a sharded key can be reconstructed
 */
function canReconstructShard(
  holder: KeyHolder,
  scenario: Scenario,
  data: LittleShardFile
): boolean {

  if (!holder.shard_config) return false;

  // Count available shard holders
  let availableShardHolders = 0;

  for (const shardHolderId of holder.shard_config.holders) {
    // Find the shard holder in the keyholders list
    const shardHolder = data.keyholders.find(h => h.id === shardHolderId || h.name === shardHolderId);

    if (shardHolder && !isHolderAffected(shardHolder, scenario, data)) {
      availableShardHolders++;
    }
  }

  // Can reconstruct if we have at least k shards available
  return availableShardHolders >= holder.shard_config.threshold;
}

// ============================================================================
// Monte Carlo Simulation
// ============================================================================

/**
 * Run Monte Carlo simulation for probabilistic analysis
 */
export function runMonteCarloSimulation(
  data: LittleShardFile,
  scenarios: Scenario[],
  iterations: number = 1000
): RiskAnalysis {

  const results: Map<string, number> = new Map();
  let totalRecoverable = 0;

  for (let i = 0; i < iterations; i++) {
    // Randomly select scenarios based on their probabilities
    const activeScenarios = scenarios.filter(s => {
      const probability = s.probability || 0.01;
      return Math.random() < probability;
    });

    if (activeScenarios.length === 0) {
      // No scenarios triggered, funds are recoverable
      totalRecoverable++;
      continue;
    }

    // Simulate combined scenarios
    const result = simulateCombinedScenarios(data, activeScenarios);

    if (result.outcome === 'recoverable') {
      totalRecoverable++;
    }

    // Track individual scenario outcomes
    for (const scenario of activeScenarios) {
      const key = scenario.id;
      results.set(key, (results.get(key) || 0) + 1);
    }
  }

  // Calculate statistics
  const probability_of_recovery = totalRecoverable / iterations;

  // Find most common failure scenarios
  const critical_risks: string[] = [];
  for (const [scenarioId, count] of results.entries()) {
    if (count > iterations * 0.1) { // Occurs in >10% of simulations
      const scenario = scenarios.find(s => s.id === scenarioId);
      if (scenario) {
        critical_risks.push(scenario.name);
      }
    }
  }

  // Create scenario results for most likely scenarios
  const scenario_results: ScenarioResult[] = scenarios
    .filter(s => (s.probability || 0) > 0.01) // >1% probability
    .map(s => simulateScenario(data, s));

  return {
    last_run: new Date().toISOString(),
    scenarios_tested: scenarios.length,
    monte_carlo_iterations: iterations,
    probability_of_recovery,
    critical_risks,
    mitigation_applied: getMitigationHistory(data),
    scenario_results
  };
}

// ============================================================================
// Mitigation Generation
// ============================================================================

/**
 * Generate mitigation suggestion for a failed scenario
 */
function generateMitigation(
  data: LittleShardFile,
  scenario: Scenario,
  availableKeys: number,
  requiredKeys: number
): string {

  const deficit = requiredKeys - availableKeys;

  // Specific mitigations by scenario type
  if (scenario.category === 'death') {
    if (deficit === 1) {
      return `Add one more key holder or shard a critical key to ensure recovery`;
    } else {
      return `Add ${deficit} more key holders or implement sharding for primary keys`;
    }
  }

  if (scenario.category === 'geographic') {
    return `Distribute keys across more geographic locations to avoid co-location risk`;
  }

  if (scenario.category === 'theft') {
    return `Implement time-locks or additional authentication for high-value transactions`;
  }

  if (scenario.category === 'legal') {
    return `Consider using a professional custodian or attorney as neutral key holder`;
  }

  if (scenario.category === 'technical') {
    return `Use diverse storage methods (hardware, paper, vault) to avoid single-point failure`;
  }

  // Generic mitigation
  if (deficit === 1) {
    const unshardedKeys = data.keyholders.filter(h => !h.is_sharded);
    if (unshardedKeys.length > 0) {
      return `Shard ${unshardedKeys[0].name}'s key between multiple trusted parties`;
    }
    return `Add one more key holder to achieve redundancy`;
  }

  return `Add ${deficit} more key holders or implement key sharding to improve resilience`;
}

/**
 * Get history of applied mitigations
 */
function getMitigationHistory(data: LittleShardFile): string[] {
  const mitigations: string[] = [];

  // Check for sharded keys
  const shardedCount = data.keyholders.filter(h => h.is_sharded).length;
  if (shardedCount > 0) {
    mitigations.push(`${shardedCount} keys sharded for redundancy`);
  }

  // Check for geographic distribution
  if (data.redundancy.geographic_distribution.length >= 3) {
    mitigations.push(`Keys distributed across ${data.redundancy.geographic_distribution.length} locations`);
  }

  // Check for 3-3-3 rule
  if (data.redundancy.passes_3_3_3_rule) {
    mitigations.push('3-3-3 redundancy rule achieved');
  }

  // Check for custodian
  const hasCustodian = data.keyholders.some(h => h.role === 'custodian');
  if (hasCustodian) {
    mitigations.push('Professional custodian added');
  }

  // Check for legal documentation
  if (data.legal.has_will && data.legal.has_trust) {
    mitigations.push('Legal documents (will & trust) in place');
  }

  return mitigations;
}

// ============================================================================
// Export Functions
// ============================================================================

export {
  isKeyHolderAvailable as checkKeyAvailability,
  canReconstructShard as checkShardReconstruction
};