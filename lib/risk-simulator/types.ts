/**
 * Risk Simulator - Type Definitions
 * Core data structures for multisig risk analysis
 */

export type KeyType = 'full' | 'sharded'
export type StorageType = 'hardware-wallet' | 'paper' | 'vault' | 'digital' | 'custodian'
export type OutcomeType = 'recoverable' | 'locked' | 'stolen' | 'degraded'

/**
 * Role-based key holder types for flexible scenario matching
 * Allows scenarios to work with any holder names
 */
export type KeyRole =
  | 'primary'        // Main estate owner (often first key)
  | 'spouse'         // Spouse or life partner
  | 'child'          // Children or heirs
  | 'attorney'       // Legal representative
  | 'custodian'      // Third-party service (bank, company)
  | 'trusted-friend' // Friend or business partner
  | 'other'          // Custom/unspecified role

/**
 * Shard configuration for Shamir's Secret Sharing
 * k-of-m: need k shards to reconstruct the key
 */
export interface ShardConfig {
  k: number              // Threshold for reconstruction (e.g., 2)
  m: number              // Total number of shards (e.g., 3)
  holders: string[]      // Who holds each shard (length = m)
}

/**
 * A single key in the multisig setup
 */
export interface Key {
  id: string
  holder: string         // Free text: ANY name the user types
  role?: KeyRole         // Standardized role for scenario matching
  type: KeyType
  shardConfig?: ShardConfig
  storage: StorageType
  location: string       // Free text: ANY location the user types
}

/**
 * Complete multisig configuration
 */
export interface MultisigSetup {
  threshold: number      // M in M-of-N (e.g., 3)
  totalKeys: number      // N in M-of-N (e.g., 5)
  keys: Key[]
  family: string         // "Chen Family"
  createdAt: Date
}

/**
 * A disaster scenario to simulate
 * Supports multiple ways to specify affected keys for flexibility
 */
export interface Scenario {
  id: string
  name: string                   // "Both Primaries Die"
  description: string            // Full description

  // Flexible matching (checked in priority order):
  affectedRoles?: KeyRole[]     // e.g., ['primary', 'spouse'] - works with any names
  affectedIndices?: number[]    // e.g., [0, 1] - first two keys
  affectedLocations?: string[]  // e.g., ['Home', 'House'] - location-based risks

  // Legacy/backward compatibility:
  unavailableHolders: string[]   // Exact name match (deprecated)
  compromisedKeys?: string[]     // Keys attacker has (optional)
}

/**
 * Result of simulating a scenario
 */
export interface SimulationResult {
  scenario: Scenario
  availableKeys: number          // How many keys are accessible
  requiredKeys: number           // Threshold needed
  outcome: OutcomeType
  recoveryPath?: string[]        // Which key holders would be used
  recommendation?: string        // How to fix if locked
  details?: string              // Additional explanation
}

/**
 * Full simulation state for all scenarios
 */
export interface RiskAnalysis {
  setup: MultisigSetup
  scenarios: Scenario[]
  results: SimulationResult[]
  resilienceScore: number        // 0-100 percentage
  criticalRisks: string[]        // List of critical issues
}
