/**
 * Risk Scenarios Definition
 * Complete set of adversity scenarios from vision documents
 * Includes death, loss, theft, legal, geographic, and technical scenarios
 */

import { Scenario } from '../keep-core/data-model';

// ============================================================================
// Preset Scenarios (from vision documents)
// ============================================================================

export const RISK_SCENARIOS: Scenario[] = [
  // Death Scenarios
  {
    id: 'both_primaries_die',
    name: 'Both Primaries Die',
    description: 'Primary holder and spouse both become unavailable (death, incapacitation, or simultaneous accident)',
    category: 'death',
    affected_roles: ['primary', 'spouse'],
    probability: 0.001, // 0.1% annual probability
    time_horizon_days: 365,
    cascading_failures: []
  },
  {
    id: 'one_primary_dies',
    name: 'One Primary Dies',
    description: 'Primary holder becomes unavailable, spouse continues',
    category: 'death',
    affected_roles: ['primary'],
    probability: 0.01, // 1% annual probability
    time_horizon_days: 365,
    cascading_failures: []
  },
  {
    id: 'spouse_dies',
    name: 'Spouse Dies',
    description: 'Spouse becomes unavailable, primary continues',
    category: 'death',
    affected_roles: ['spouse'],
    probability: 0.01, // 1% annual probability
    time_horizon_days: 365,
    cascading_failures: []
  },

  // Loss Scenarios
  {
    id: 'key_loss',
    name: 'Key Loss',
    description: 'One or more keys are permanently lost (forgotten password, destroyed device)',
    category: 'loss',
    affected_indices: [0], // Primary key most likely
    probability: 0.05, // 5% annual probability
    time_horizon_days: 365,
    cascading_failures: []
  },
  {
    id: 'multiple_key_loss',
    name: 'Multiple Key Loss',
    description: 'Two keys are lost simultaneously',
    category: 'loss',
    affected_indices: [0, 1], // First two keys
    probability: 0.005, // 0.5% annual probability
    time_horizon_days: 365,
    cascading_failures: []
  },

  // Theft Scenarios
  {
    id: 'key_theft',
    name: 'Key Theft',
    description: 'One key is compromised by attacker, but holder still has access',
    category: 'theft',
    affected_indices: [0], // Primary key most likely target
    probability: 0.02, // 2% annual probability
    time_horizon_days: 365,
    cascading_failures: []
  },
  {
    id: 'insider_threat',
    name: 'Insider Threat / Rogue Custodian',
    description: 'Trusted custodian or insider attempts unauthorized access',
    category: 'theft',
    affected_roles: ['custodian'],
    probability: 0.01, // 1% annual probability
    time_horizon_days: 365,
    cascading_failures: []
  },
  {
    id: 'coercion_5_dollar_wrench',
    name: 'Coercion ($5 Wrench Attack)',
    description: 'Physical coercion forces key holder to reveal credentials',
    category: 'theft',
    affected_roles: ['primary', 'spouse'], // Both primaries vulnerable
    probability: 0.001, // 0.1% annual probability
    time_horizon_days: 365,
    cascading_failures: ['key_theft'] // Often results in theft
  },

  // Legal Scenarios
  {
    id: 'divorce',
    name: 'Divorce',
    description: 'Legal dispute makes spouse\'s key inaccessible or contested',
    category: 'legal',
    affected_roles: ['spouse'],
    probability: 0.03, // 3% annual probability (based on statistics)
    time_horizon_days: 365,
    cascading_failures: []
  },
  {
    id: 'legal_freeze',
    name: 'Legal Freeze / Asset Freeze',
    description: 'Court order or legal action freezes access to keys',
    category: 'legal',
    affected_roles: ['primary', 'spouse'],
    probability: 0.005, // 0.5% annual probability
    time_horizon_days: 365,
    cascading_failures: []
  },

  // Geographic Scenarios
  {
    id: 'house_fire',
    name: 'House Fire',
    description: 'Geographic co-location risk: affects all keys stored at home location',
    category: 'geographic',
    affected_locations: ['home', 'house', 'residence'],
    probability: 0.003, // 0.3% annual probability
    time_horizon_days: 365,
    cascading_failures: ['key_loss']
  },
  {
    id: 'natural_disaster',
    name: 'Natural Disaster',
    description: 'Earthquake, flood, hurricane affects geographic region',
    category: 'geographic',
    affected_locations: ['home', 'office', 'local'], // All local locations
    probability: 0.01, // 1% annual probability (varies by region)
    time_horizon_days: 365,
    cascading_failures: ['key_loss', 'custodian_unavailable']
  },
  {
    id: 'geographic_loss',
    name: 'Geographic Loss',
    description: 'Complete loss of access to a geographic location',
    category: 'geographic',
    affected_locations: ['bank', 'vault', 'safe-deposit'],
    probability: 0.002, // 0.2% annual probability
    time_horizon_days: 365,
    cascading_failures: []
  },

  // Technical/Service Scenarios
  {
    id: 'custodian_unavailable',
    name: 'Custodian Unavailable',
    description: 'Third-party custodian or attorney becomes unreachable (bankruptcy, death, etc.)',
    category: 'technical',
    affected_roles: ['attorney', 'custodian'],
    probability: 0.02, // 2% annual probability
    time_horizon_days: 365,
    cascading_failures: []
  },
  {
    id: 'custodian_bankruptcy',
    name: 'Custodian Bankruptcy',
    description: 'Custodial service goes bankrupt or ceases operations',
    category: 'technical',
    affected_roles: ['custodian'],
    probability: 0.01, // 1% annual probability
    time_horizon_days: 365,
    cascading_failures: ['custodian_unavailable']
  },
  {
    id: 'technology_failure',
    name: 'Technology Failure',
    description: 'Hardware wallet failure, software obsolescence, or platform shutdown',
    category: 'technical',
    affected_indices: [], // Will be determined based on storage type
    probability: 0.03, // 3% annual probability
    time_horizon_days: 365,
    cascading_failures: ['key_loss']
  }
];

// ============================================================================
// Scenario Combinations
// ============================================================================

/**
 * Common scenario combinations that should be tested together
 */
export const SCENARIO_COMBINATIONS = [
  {
    name: 'Simultaneous Death & Fire',
    description: 'Both primaries die in house fire',
    scenario_ids: ['both_primaries_die', 'house_fire']
  },
  {
    name: 'Divorce & Custody Battle',
    description: 'Divorce leads to legal freeze of assets',
    scenario_ids: ['divorce', 'legal_freeze']
  },
  {
    name: 'Natural Disaster & Service Outage',
    description: 'Natural disaster affects local custodians',
    scenario_ids: ['natural_disaster', 'custodian_unavailable']
  },
  {
    name: 'Coercion & Theft',
    description: '$5 wrench attack leads to key theft',
    scenario_ids: ['coercion_5_dollar_wrench', 'key_theft']
  },
  {
    name: 'Technology & Human Failure',
    description: 'Hardware failure combined with lost backup',
    scenario_ids: ['technology_failure', 'key_loss']
  }
];

// ============================================================================
// Scenario Helpers
// ============================================================================

/**
 * Get scenario by ID
 */
export function getScenario(id: string): Scenario | undefined {
  return RISK_SCENARIOS.find(s => s.id === id);
}

/**
 * Get scenarios by category
 */
export function getScenariosByCategory(category: string): Scenario[] {
  return RISK_SCENARIOS.filter(s => s.category === category);
}

/**
 * Get high-risk scenarios (probability > 2%)
 */
export function getHighRiskScenarios(): Scenario[] {
  return RISK_SCENARIOS.filter(s => (s.probability || 0) > 0.02);
}

/**
 * Combine multiple scenarios into one (for multi-scenario testing)
 * This properly merges ALL properties - fixing the bug from the old implementation
 */
export function combineScenarios(scenarios: Scenario[]): Scenario {
  if (scenarios.length === 0) {
    throw new Error('No scenarios to combine');
  }

  if (scenarios.length === 1) {
    return scenarios[0];
  }

  // Properly merge ALL affected properties (this was the bug!)
  const combined: Scenario = {
    id: 'combined_' + scenarios.map(s => s.id).join('_'),
    name: 'Combined: ' + scenarios.map(s => s.name).join(' + '),
    description: `Testing ${scenarios.length} scenarios simultaneously: ${scenarios.map(s => s.name).join(', ')}`,
    category: 'death', // Default category for combined

    // Merge all role-based affects
    affected_roles: Array.from(new Set(
      scenarios.flatMap(s => s.affected_roles || [])
    )),

    // Merge all index-based affects
    affected_indices: Array.from(new Set(
      scenarios.flatMap(s => s.affected_indices || [])
    )),

    // Merge all location-based affects
    affected_locations: Array.from(new Set(
      scenarios.flatMap(s => s.affected_locations || [])
    )),

    // Merge specific key IDs if any
    affected_key_ids: Array.from(new Set(
      scenarios.flatMap(s => s.affected_key_ids || [])
    )),

    // Calculate combined probability (assuming independence)
    probability: scenarios.reduce((prob, s) => {
      return prob * (1 - (s.probability || 0));
    }, 1),

    // Use shortest time horizon
    time_horizon_days: Math.min(...scenarios.map(s => s.time_horizon_days || 365)),

    // Merge all cascading failures
    cascading_failures: Array.from(new Set(
      scenarios.flatMap(s => s.cascading_failures || [])
    ))
  };

  return combined;
}

// ============================================================================
// Default Test Suite
// ============================================================================

/**
 * Get the default set of scenarios every setup should test
 */
export function getDefaultTestSuite(): Scenario[] {
  return [
    'both_primaries_die',
    'one_primary_dies',
    'house_fire',
    'key_theft',
    'divorce',
    'custodian_unavailable',
    'natural_disaster',
    'coercion_5_dollar_wrench'
  ].map(id => getScenario(id)!);
}

/**
 * Get comprehensive test suite (all scenarios)
 */
export function getComprehensiveTestSuite(): Scenario[] {
  return RISK_SCENARIOS;
}