/**
 * Risk Simulator - Simplified Key Availability Scenarios
 * Focus on technical key availability rather than prescriptive situations
 * Universal, timeless, and non-morbid approach
 */

import { Scenario, MultisigSetup, KeyRole } from './types'

/**
 * Generate key availability scenarios based on the current setup
 * No prescriptive situations - just technical key availability testing
 */
export function generateKeyAvailabilityScenarios(setup: MultisigSetup): Scenario[] {
  const scenarios: Scenario[] = []

  // Single Key Scenarios - Test each key individually
  setup.keys.forEach((key, index) => {
    scenarios.push({
      id: `key-${index + 1}-unavailable`,
      name: `Key ${index + 1} Unavailable`,
      description: `Testing resilience when ${key.holder} cannot access their key`,
      affectedIndices: [index],
      unavailableHolders: [key.holder]
    })
  })

  // Critical Pairs - Test threshold-breaking combinations
  if (setup.totalKeys >= setup.threshold + 1) {
    // Test all pairs that would break threshold
    for (let i = 0; i < setup.keys.length; i++) {
      for (let j = i + 1; j < setup.keys.length; j++) {
        if (setup.totalKeys - 2 < setup.threshold) {
          scenarios.push({
            id: `keys-${i + 1}-${j + 1}-unavailable`,
            name: `Keys ${i + 1} & ${j + 1} Unavailable`,
            description: `Testing when two specific keys are inaccessible`,
            affectedIndices: [i, j],
            unavailableHolders: [setup.keys[i].holder, setup.keys[j].holder]
          })
        }
      }
    }
  }

  // Role-Based Scenarios - Group by role
  const roleGroups = new Map<string, number[]>()
  setup.keys.forEach((key, index) => {
    if (key.role) {
      if (!roleGroups.has(key.role)) {
        roleGroups.set(key.role, [])
      }
      roleGroups.get(key.role)!.push(index)
    }
  })

  roleGroups.forEach((indices, role) => {
    if (indices.length > 1) {
      scenarios.push({
        id: `role-${role}-unavailable`,
        name: `All ${role.charAt(0).toUpperCase() + role.slice(1)} Keys Unavailable`,
        description: `Testing when all keys with ${role} role are inaccessible`,
        affectedRoles: [role as KeyRole],
        unavailableHolders: indices.map(i => setup.keys[i].holder)
      })
    }
  })

  // Location-Based Scenarios - Group by location
  const locationGroups = new Map<string, number[]>()
  setup.keys.forEach((key, index) => {
    if (key.location) {
      if (!locationGroups.has(key.location)) {
        locationGroups.set(key.location, [])
      }
      locationGroups.get(key.location)!.push(index)
    }
  })

  locationGroups.forEach((indices, location) => {
    if (indices.length > 1) {
      scenarios.push({
        id: `location-${location.toLowerCase().replace(/\s+/g, '-')}-unavailable`,
        name: `${location} Keys Unavailable`,
        description: `Testing geographic risk for keys stored at ${location}`,
        affectedLocations: [location],
        unavailableHolders: indices.map(i => setup.keys[i].holder)
      })
    }
  })

  // Threshold Tests - Critical scenarios
  scenarios.push({
    id: 'threshold-test',
    name: `Threshold Test (${setup.threshold} Keys)`,
    description: `Testing exact threshold - any ${setup.totalKeys - setup.threshold + 1} keys unavailable`,
    affectedIndices: Array.from({ length: setup.totalKeys - setup.threshold + 1 }, (_, i) => i),
    unavailableHolders: setup.keys.slice(0, setup.totalKeys - setup.threshold + 1).map(k => k.holder)
  })

  // Worst Case - Maximum keys unavailable while still recoverable
  if (setup.totalKeys > setup.threshold) {
    scenarios.push({
      id: 'worst-case',
      name: `Worst Case (${setup.totalKeys - setup.threshold} Keys Lost)`,
      description: `Maximum keys unavailable while maintaining recovery ability`,
      affectedIndices: Array.from({ length: setup.totalKeys - setup.threshold }, (_, i) => i),
      unavailableHolders: setup.keys.slice(0, setup.totalKeys - setup.threshold).map(k => k.holder)
    })
  }

  return scenarios
}

/**
 * Generate simple test patterns for quick testing
 */
export const QUICK_TEST_PATTERNS = [
  {
    id: 'any-1-key',
    name: 'Any 1 Key',
    description: 'Test with any single key unavailable',
    count: 1
  },
  {
    id: 'any-2-keys',
    name: 'Any 2 Keys',
    description: 'Test with any two keys unavailable',
    count: 2
  },
  {
    id: 'threshold-minus-1',
    name: 'Threshold - 1',
    description: 'Test with just below threshold available',
    count: -1 // Special case: calculated based on threshold
  },
  {
    id: 'exactly-threshold',
    name: 'Exactly Threshold',
    description: 'Test with exactly threshold keys available',
    count: 0 // Special case: exactly at threshold
  }
]