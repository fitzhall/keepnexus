/**
 * KEEP Core Data Model
 * Complete type definitions for the Little Shard™ file format
 * This is the sovereign data model that powers both the Score Engine and Risk Simulator
 */

// ============================================================================
// Core Types
// ============================================================================

export type KeyRole = 'primary' | 'spouse' | 'child' | 'attorney' | 'custodian' | 'friend' | 'other';
export type StorageType = 'hardware-wallet' | 'paper' | 'vault' | 'digital' | 'custodian' | 'mobile';
export type ScenarioOutcome = 'recoverable' | 'at-risk' | 'locked';
export type TrendDirection = 'improving' | 'stable' | 'declining';
export type DrillType = 'recovery' | 'signing' | 'verification' | 'education';

// ============================================================================
// Score Components
// ============================================================================

export interface KEEPScoreComponents {
  security: number;       // 0-100: Key storage quality, encryption, etc.
  redundancy: number;     // 0-100: Geographic/device/person distribution
  liveness: number;       // 0-100: Recent drills, active monitoring
  legal_readiness: number; // 0-100: Will/trust status, documentation
  education: number;      // 0-100: Heir training, knowledge transfer
}

export interface KEEPScore {
  value: number;                    // 0-100 overall score
  calculated_at: string;            // ISO 8601 timestamp
  components: KEEPScoreComponents;
  trend: TrendDirection;
  recommendations: string[];        // Top 3 improvement suggestions
}

// ============================================================================
// Wallet & Key Configuration
// ============================================================================

export interface ShardConfiguration {
  threshold: number;      // k in k-of-m
  total: number;         // m in k-of-m
  holders: string[];     // IDs of shard holders
}

export interface KeyHolder {
  id: string;                          // Unique identifier (e.g., "kh_001")
  role: KeyRole;
  name: string;                        // Display name
  jurisdiction: string;                // Country/state for legal purposes
  storage_type: StorageType;
  location: string;                    // Physical location description
  key_age_days: number;               // Days since key creation/rotation
  is_sharded: boolean;
  shard_config?: ShardConfiguration;
  contact?: {
    email?: string;
    phone?: string;
    address?: string;
  };
  last_verified?: string;              // Last verification date
}

export interface Wallet {
  id: string;
  descriptor: string;                  // Output descriptor (BIP380)
  threshold: number;                   // M in M-of-N
  total_keys: number;                  // N in M-of-N
  created_at: string;
  label?: string;                      // Human-readable name
  balance_sats?: number;               // Optional balance tracking
}

// ============================================================================
// Redundancy & Distribution
// ============================================================================

export interface RedundancyMetrics {
  device_count: number;               // Unique devices holding keys
  location_count: number;             // Unique physical locations
  person_count: number;               // Unique people with access
  geographic_distribution: string[];  // List of cities/regions
  passes_3_3_3_rule: boolean;        // 3 devices, 3 locations, 3 people minimum
}

// ============================================================================
// Activity & Drills
// ============================================================================

export interface Drill {
  id: string;
  timestamp: string;
  type: DrillType;
  participants: string[];              // KeyHolder IDs who participated
  success: boolean;
  duration_minutes?: number;
  notes?: string;
  issues_found?: string[];
}

export interface KeyRotation {
  id: string;
  timestamp: string;
  keys_rotated: string[];             // KeyHolder IDs that were rotated
  reason: string;
  new_descriptor?: string;            // New wallet descriptor if changed
}

// ============================================================================
// Legal & Education
// ============================================================================

export interface LegalDocuments {
  has_will: boolean;
  has_trust: boolean;
  has_letter_of_instruction: boolean;
  last_review: string;                // ISO 8601 date
  next_review: string;                // ISO 8601 date
  attorney_contact?: {
    name: string;
    firm: string;
    phone: string;
    email: string;
  };
}

export interface EducationStatus {
  heirs_trained: boolean;
  last_training: string;              // ISO 8601 date
  next_review: string;                // ISO 8601 date
  training_materials_location?: string;
  trained_heirs: string[];            // KeyHolder IDs of trained heirs
}

// ============================================================================
// Risk Analysis
// ============================================================================

export interface ScenarioResult {
  scenario_id: string;
  scenario_name: string;
  outcome: ScenarioOutcome;
  available_keys: number;
  required_keys: number;
  recovery_path?: string[];           // KeyHolder IDs that would be used
  mitigation?: string;                // Suggested fix if not recoverable
}

export interface RiskAnalysis {
  last_run: string;                   // ISO 8601 timestamp
  scenarios_tested: number;           // Number of scenarios tested
  monte_carlo_iterations?: number;    // If probabilistic simulation was used
  probability_of_recovery: number;    // 0-1 probability
  critical_risks: string[];           // List of critical scenario names
  mitigation_applied: string[];       // List of mitigations already applied
  scenario_results: ScenarioResult[];
}

// ============================================================================
// Main Little Shard™ File Format
// ============================================================================

export interface LittleShardFile {
  // File metadata
  version: string;                    // Format version (e.g., "1.0.0")
  created_at: string;                 // ISO 8601 timestamp
  last_modified: string;              // ISO 8601 timestamp
  file_hash?: string;                 // SHA-256 hash for integrity

  // Family/entity information
  family_name: string;                // e.g., "Chen Family"

  // Core components
  keep_score: KEEPScore;
  wallets: Wallet[];
  keyholders: KeyHolder[];
  redundancy: RedundancyMetrics;

  // Activity tracking
  drills: Drill[];
  rotations: KeyRotation[];

  // Legal & education
  legal_docs: LegalDocuments;
  education: EducationStatus;

  // Risk assessment
  risk_analysis: RiskAnalysis;

  // Optional governance rules (for future Governator integration)
  governance_rules?: {
    version: string;
    rules: any[];                    // To be defined in Governator module
  };

  // Append-only event log
  event_log?: EventLogEntry[];
}

// ============================================================================
// Event Log (Append-Only)
// ============================================================================

export interface EventLogEntry {
  id: string;
  timestamp: string;
  event_type: string;
  description: string;
  actor?: string;                     // Who performed the action
  metadata?: Record<string, any>;
  hash?: string;                      // Hash of previous entry for tamper evidence
}

// ============================================================================
// Scenario Definitions
// ============================================================================

export interface Scenario {
  id: string;
  name: string;
  description: string;
  category: 'death' | 'loss' | 'theft' | 'legal' | 'geographic' | 'technical';

  // Multiple ways to specify affected keys for flexibility
  affected_roles?: KeyRole[];         // e.g., ['primary', 'spouse']
  affected_indices?: number[];        // e.g., [0, 1] for first two keys
  affected_locations?: string[];      // e.g., ['home', 'office']
  affected_key_ids?: string[];        // Specific KeyHolder IDs

  // Optional parameters for simulation
  probability?: number;                // 0-1 probability of occurrence
  time_horizon_days?: number;         // When this might occur
  cascading_failures?: string[];      // Other scenarios this triggers
}

// ============================================================================
// Mitigation Actions
// ============================================================================

export interface MitigationAction {
  id: string;
  name: string;
  description: string;
  fixes_scenarios: string[];          // Scenario IDs this helps with
  score_impact: number;               // Expected KEEP Score improvement
  implementation_steps: string[];
  estimated_cost?: string;
  estimated_time?: string;
}

// ============================================================================
// File Operations
// ============================================================================

export interface FileMetadata {
  filename: string;
  size_bytes: number;
  encrypted: boolean;
  compression?: 'gzip' | 'none';
  created_by?: string;
  application_version?: string;
}

// ============================================================================
// Validation
// ============================================================================

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  version_compatible: boolean;
}

// ============================================================================
// Helper Types
// ============================================================================

export interface ScoreRecommendation {
  priority: 'high' | 'medium' | 'low';
  category: keyof KEEPScoreComponents;
  action: string;
  expected_improvement: number;       // Points added to score
  effort: 'easy' | 'moderate' | 'complex';
}

export interface SimulationConfig {
  mode: 'deterministic' | 'monte-carlo';
  iterations?: number;                // For Monte Carlo
  time_horizon_days?: number;
  include_cascading_failures?: boolean;
  confidence_level?: number;          // e.g., 0.95 for 95% confidence
}