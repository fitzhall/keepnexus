/**
 * Risk Simulator - Preset Scenarios
 * Common disaster scenarios for testing multisig resilience
 */

import { Scenario } from './types'

/**
 * Standard disaster scenarios every setup should test against
 */
export const PRESET_SCENARIOS: Scenario[] = [
  {
    id: 'both-primaries-die',
    name: 'Both Primaries Die',
    description: 'Primary holder and spouse both become unavailable (death, incapacitation, or simultaneous accident)',
    unavailableHolders: ['Dad', 'Mom']
  },
  {
    id: 'one-primary-dies',
    name: 'One Primary Dies',
    description: 'Primary holder becomes unavailable, spouse continues',
    unavailableHolders: ['Dad']
  },
  {
    id: 'house-fire',
    name: 'House Fire',
    description: 'Geographic co-location risk: all keys stored at home are destroyed or inaccessible',
    unavailableHolders: ['Dad', 'Mom'] // Assumes both store keys at home
  },
  {
    id: 'key-theft',
    name: 'Key Theft',
    description: 'One key is compromised by attacker, but holder still has access',
    unavailableHolders: [],
    compromisedKeys: [] // Will be set dynamically
  },
  {
    id: 'divorce',
    name: 'Divorce',
    description: 'Legal dispute makes one party\'s key inaccessible or contested',
    unavailableHolders: ['Mom']
  },
  {
    id: 'custodian-unavailable',
    name: 'Custodian Unavailable',
    description: 'Third-party custodian (lawyer, bank, service) becomes unreachable or refuses access',
    unavailableHolders: ['Lawyer']
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
