/**
 * KEEP Core Data Model v2.0
 * Unified type definitions for the .keep file format
 * This IS the file format AND the app's internal state.
 * Organized around the KEEP framework pillars:
 *   K — Key Governance
 *   E — Estate Integration
 *   E — Ensured Continuity
 *   P — Professional Stewardship
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
// K — Key Governance
// ============================================================================

export interface ShardConfiguration {
  threshold: number;      // k in k-of-m
  total: number;         // m in k-of-m
  holders: string[];     // IDs of shard holders
}

export interface KeyHolder {
  id: string;
  role: KeyRole;
  name: string;
  jurisdiction: string;
  storage_type: StorageType;
  location: string;
  key_age_days: number;
  is_sharded: boolean;
  shard_config?: ShardConfiguration;
  contact?: {
    email?: string;
    phone?: string;
    address?: string;
  };
  last_verified?: string;
}

export interface Wallet {
  id: string;
  descriptor: string;                  // Output descriptor (BIP380)
  threshold: number;                   // M in M-of-N
  total_keys: number;                  // N in M-of-N
  created_at: string;
  label?: string;
  platform?: string;                   // Theya, Casa, Unchained, Nunchuk, etc.
  balance_sats?: number;
}

export interface GovernanceRule {
  id: string;
  who: string;
  canDo: string;
  when: string;
  condition: string;
  status: 'active' | 'paused' | 'pending';
  risk?: 'low' | 'medium' | 'high';
  lastExecuted?: string;
  executions?: number;
}

export interface RedundancyMetrics {
  device_count: number;
  location_count: number;
  person_count: number;
  geographic_distribution: string[];
  passes_3_3_3_rule: boolean;
}

// ============================================================================
// E — Estate Integration
// ============================================================================

export interface Heir {
  id: string;
  name: string;
  relationship: string;
  allocation?: number;                 // Percentage of inheritance
  isKeyHolder?: boolean;
  contact?: {
    email?: string;
    phone?: string;
  };
}

export interface Charter {
  mission: string;
  principles: string[];
  reviewFrequency: 'quarterly' | 'annual';
  lastReviewed?: string;               // ISO 8601
}

export interface LegalDocuments {
  has_will: boolean;
  has_trust: boolean;
  has_letter_of_instruction: boolean;
  trust_name?: string;
  jurisdiction?: string;
  bitcoin_in_docs?: boolean;
  rufadaa_filed?: boolean;
  trustee_names?: string[];
  last_review: string;
  next_review: string;
  attorney_contact?: {
    name: string;
    firm: string;
    phone: string;
    email: string;
  };
}

// ============================================================================
// E — Ensured Continuity
// ============================================================================

export interface Drill {
  id: string;
  timestamp: string;
  type: DrillType;
  participants: string[];
  success: boolean;
  duration_minutes?: number;
  notes?: string;
  issues_found?: string[];
}

export interface ContinuityConfig {
  checkin_frequency: 'monthly' | 'quarterly' | 'annual';
  drill_frequency: 'monthly' | 'quarterly' | 'annual';
  last_checkin?: string;               // ISO 8601
  next_checkin_due?: string;           // ISO 8601
  last_drill?: string;                // ISO 8601
  next_drill_due?: string;            // ISO 8601
  life_event_triggers?: string[];
  notification_days?: number;
}

export interface KeyRotation {
  id: string;
  timestamp: string;
  keys_rotated: string[];
  reason: string;
  new_descriptor?: string;
}

// ============================================================================
// P — Professional Stewardship
// ============================================================================

export interface ProfessionalContact {
  name: string;
  firm?: string;
  email?: string;
  phone?: string;
}

export interface ProfessionalNetwork {
  advisor?: ProfessionalContact;
  attorney?: ProfessionalContact;
  cpa?: ProfessionalContact;
}

export interface EducationStatus {
  heirs_trained: boolean;
  last_training: string;
  next_review: string;
  training_materials_location?: string;
  trained_heirs: string[];
}

// ============================================================================
// Integrity (cross-cutting)
// ============================================================================

export interface ThapIntegrity {
  current_hash: string;
  history: { hash: string; timestamp: string; note?: string }[];
}

export interface EventLogEntry {
  id: string;
  timestamp: string;
  event_type: string;
  description: string;
  actor?: string;
  metadata?: Record<string, any>;
  hash?: string;                      // Hash of previous entry for tamper evidence
}

// ============================================================================
// Risk Analysis (optional, computed)
// ============================================================================

export interface ScenarioResult {
  scenario_id: string;
  scenario_name: string;
  outcome: ScenarioOutcome;
  available_keys: number;
  required_keys: number;
  recovery_path?: string[];
  mitigation?: string;
}

export interface RiskAnalysis {
  last_run: string;
  scenarios_tested: number;
  monte_carlo_iterations?: number;
  probability_of_recovery: number;
  critical_risks: string[];
  mitigation_applied: string[];
  scenario_results: ScenarioResult[];
}

// ============================================================================
// Main Little Shard™ File Format v2.0 — The .keep file
// ============================================================================

export interface LittleShardFile {
  // File metadata
  version: string;                    // "2.0.0"
  created_at: string;                 // ISO 8601
  last_modified: string;              // ISO 8601
  file_hash?: string;                 // SHA-256 hash for integrity

  // Family/entity
  family_name: string;

  // K — Key Governance
  wallets: Wallet[];
  keyholders: KeyHolder[];
  governance_rules: GovernanceRule[];
  redundancy: RedundancyMetrics;

  // E — Estate Integration
  heirs: Heir[];
  charter: Charter;
  legal: LegalDocuments;

  // E — Ensured Continuity
  drills: Drill[];
  continuity: ContinuityConfig;
  rotations: KeyRotation[];

  // P — Professional Stewardship
  professionals: ProfessionalNetwork;
  education: EducationStatus;

  // Integrity
  keep_score: KEEPScore;
  thap: ThapIntegrity;
  event_log: EventLogEntry[];

  // Risk assessment (optional, computed)
  risk_analysis?: RiskAnalysis;
}

// ============================================================================
// Scenario Definitions
// ============================================================================

export interface Scenario {
  id: string;
  name: string;
  description: string;
  category: 'death' | 'loss' | 'theft' | 'legal' | 'geographic' | 'technical';
  affected_roles?: KeyRole[];
  affected_indices?: number[];
  affected_locations?: string[];
  affected_key_ids?: string[];
  probability?: number;
  time_horizon_days?: number;
  cascading_failures?: string[];
}

// ============================================================================
// Mitigation Actions
// ============================================================================

export interface MitigationAction {
  id: string;
  name: string;
  description: string;
  fixes_scenarios: string[];
  score_impact: number;
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
  expected_improvement: number;
  effort: 'easy' | 'moderate' | 'complex';
}

export interface SimulationConfig {
  mode: 'deterministic' | 'monte-carlo';
  iterations?: number;
  time_horizon_days?: number;
  include_cascading_failures?: boolean;
  confidence_level?: number;
}
