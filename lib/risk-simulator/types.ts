/**
 * Risk Simulator - Type Definitions
 * Core data structures for multisig risk analysis
 */

export type KeyType = 'full' | 'sharded'
export type StorageType = 'hardware-wallet' | 'paper' | 'vault' | 'digital' | 'custodian'
export type OutcomeType = 'recoverable' | 'locked' | 'stolen' | 'degraded'

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
  holder: string         // "Dad", "Mom", "Child A", etc.
  type: KeyType
  shardConfig?: ShardConfig
  storage: StorageType
  location: string       // "Home safe", "Bank vault", etc.
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
 */
export interface Scenario {
  id: string
  name: string                   // "Both Primaries Die"
  description: string            // Full description
  unavailableHolders: string[]   // Who can't be reached
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
