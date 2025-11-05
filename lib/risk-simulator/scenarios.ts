/**
 * Risk Simulator - Preset Scenarios
 * Common disaster scenarios for testing multisig resilience
 * Now using role-based matching to work with any holder names
 */

import { Scenario } from './types'

/**
 * Standard disaster scenarios every setup should test against
 * Using roles allows these to work with any user-defined names
 */
export const PRESET_SCENARIOS: Scenario[] = [
  {
    id: 'both-primaries-die',
    name: 'Both Primaries Die',
    description: 'Primary holder and spouse both become unavailable (death, incapacitation, or simultaneous accident)',
    affectedRoles: ['primary', 'spouse'],
    unavailableHolders: [] // Empty - using roles instead
  },
  {
    id: 'one-primary-dies',
    name: 'One Primary Dies',
    description: 'Primary holder becomes unavailable, spouse continues',
    affectedRoles: ['primary'],
    unavailableHolders: []
  },
  {
    id: 'house-fire',
    name: 'House Fire',
    description: 'Geographic co-location risk: affects all keys stored at home location',
    affectedLocations: ['Home', 'House', 'Residence'], // Location-based matching
    affectedIndices: [], // Will be determined dynamically based on location
    unavailableHolders: []
  },
  {
    id: 'key-theft',
    name: 'Key Theft',
    description: 'One key is compromised by attacker, but holder still has access',
    affectedIndices: [0], // Primary key most likely target
    unavailableHolders: [],
    compromisedKeys: [] // Will be set dynamically
  },
  {
    id: 'divorce',
    name: 'Divorce',
    description: 'Legal dispute makes spouse\'s key inaccessible or contested',
    affectedRoles: ['spouse'],
    unavailableHolders: []
  },
  {
    id: 'custodian-unavailable',
    name: 'Custodian Unavailable',
    description: 'Third-party custodian or attorney becomes unreachable',
    affectedRoles: ['attorney', 'custodian'],
    unavailableHolders: []
  },
  {
    id: 'bank-failure',
    name: 'Bank/Safe Deposit Failure',
    description: 'Bank or safe deposit box becomes inaccessible (closure, seizure, or access restrictions)',
    affectedLocations: ['Bank', 'Safe Deposit', 'Vault'],
    unavailableHolders: []
  },
  {
    id: 'travel-accident',
    name: 'Travel Accident',
    description: 'Primary and child traveling together become unavailable',
    affectedRoles: ['primary', 'child'],
    unavailableHolders: []
  },
  {
    id: 'memory-loss',
    name: 'Memory Loss',
    description: 'Primary holder loses cognitive ability (dementia, injury)',
    affectedRoles: ['primary'],
    unavailableHolders: []
  },
  {
    id: 'government-seizure',
    name: 'Government Seizure',
    description: 'Legal action freezes assets stored with professional custodians',
    affectedRoles: ['attorney', 'custodian'],
    affectedLocations: ['Bank', 'Office'],
    unavailableHolders: []
  },
  {
    id: 'natural-disaster',
    name: 'Natural Disaster',
    description: 'Regional disaster affects primary residence and local backup',
    affectedLocations: ['Home', 'House', 'Local', 'Nearby'],
    unavailableHolders: []
  },
  {
    id: 'hardware-failure',
    name: 'Hardware Wallet Failure',
    description: 'Hardware wallet malfunction or obsolescence',
    affectedIndices: [0], // Primary wallet most critical
    unavailableHolders: []
  },
  {
    id: 'child-estranged',
    name: 'Child Estranged',
    description: 'Family conflict makes child\'s key inaccessible',
    affectedRoles: ['child'],
    unavailableHolders: []
  },
  {
    id: 'pandemic-isolation',
    name: 'Pandemic/Isolation',
    description: 'Travel restrictions prevent physical access to distributed keys',
    affectedLocations: ['Remote', 'Offshore', 'International'],
    unavailableHolders: []
  },
  {
    id: 'cyberattack',
    name: 'Cyberattack',
    description: 'Digital storage compromised (cloud, encrypted files)',
    affectedLocations: ['Cloud', 'Digital', 'Online'],
    unavailableHolders: []
  },
  {
    id: 'kidnapping',
    name: 'Kidnapping/Coercion',
    description: 'Primary holder under duress, spouse maintains control',
    affectedRoles: ['primary'],
    compromisedKeys: [],
    unavailableHolders: []
  }
]

/**
 * Get scenario by ID
 */
export function getScenario(id: string): Scenario | undefined {
  return PRESET_SCENARIOS.find(s => s.id === id)
}

/**
 * Get all scenario IDs
 */
export function getScenarioIds(): string[] {
  return PRESET_SCENARIOS.map(s => s.id)
}
