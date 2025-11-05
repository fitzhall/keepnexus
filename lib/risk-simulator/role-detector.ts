/**
 * Role Detector Utility
 * Intelligently assigns roles to keys based on position and naming patterns
 * This allows scenarios to work with any user-defined holder names
 */

import { Key, KeyRole } from './types'

/**
 * Detect the role of a key holder based on name patterns and position
 * Uses simple heuristics that work across languages and naming conventions
 */
export function detectKeyRole(holder: string, index: number): KeyRole {
  const lowerHolder = holder.toLowerCase()

  // Position-based defaults (most reliable)
  if (index === 0) {
    // First key is typically the primary holder
    return 'primary'
  }

  if (index === 1) {
    // Second key is often the spouse
    // Check for spouse indicators
    if (containsSpousePattern(lowerHolder)) {
      return 'spouse'
    }
    // Default second key to spouse if no other pattern matches
    return 'spouse'
  }

  // Pattern matching for specific roles
  if (containsSpousePattern(lowerHolder)) {
    return 'spouse'
  }

  if (containsChildPattern(lowerHolder)) {
    return 'child'
  }

  if (containsAttorneyPattern(lowerHolder)) {
    return 'attorney'
  }

  if (containsCustodianPattern(lowerHolder)) {
    return 'custodian'
  }

  if (containsFriendPattern(lowerHolder)) {
    return 'trusted-friend'
  }

  // Default for keys 3+ without clear patterns
  if (index === 2) {
    // Third key might be child or attorney
    return 'child'
  }

  if (index === 3) {
    // Fourth key often attorney or custodian
    return 'attorney'
  }

  if (index === 4) {
    // Fifth key often custodian service
    return 'custodian'
  }

  // Everything else
  return 'other'
}

/**
 * Check if holder name contains spouse-related patterns
 */
function containsSpousePattern(holder: string): boolean {
  const patterns = [
    'wife', 'husband', 'spouse', 'partner',
    'mom', 'mother', 'dad', 'father',
    'emma', 'maria', 'sarah', // Common spouse names in demo
    '妻', '夫', '配偶', // Chinese
    'esposa', 'esposo', // Spanish
    'épouse', 'époux', // French
  ]
  return patterns.some(p => holder.includes(p))
}

/**
 * Check if holder name contains child-related patterns
 */
function containsChildPattern(holder: string): boolean {
  const patterns = [
    'son', 'daughter', 'child', 'kid',
    'jr', 'junior', 'ii', 'iii',
    '息子', '娘', '子供', // Japanese
    '儿子', '女儿', // Chinese
    'hijo', 'hija', // Spanish
    'fils', 'fille', // French
  ]
  return patterns.some(p => holder.includes(p))
}

/**
 * Check if holder name contains attorney/legal patterns
 */
function containsAttorneyPattern(holder: string): boolean {
  const patterns = [
    'attorney', 'lawyer', 'legal', 'law',
    'esq', 'esquire', 'counsel',
    'harris', // Common attorney name in demos
    '律师', '法律', // Chinese
    'abogado', // Spanish
    'avocat', // French
  ]
  return patterns.some(p => holder.includes(p))
}

/**
 * Check if holder name contains custodian/service patterns
 */
function containsCustodianPattern(holder: string): boolean {
  const patterns = [
    'custodian', 'service', 'custody',
    'bank', 'trust', 'company', 'corp',
    'unchained', 'casa', 'anchor', // Common Bitcoin custodians
    'fidelity', 'schwab', 'vanguard',
    '托管', '银行', // Chinese
    'banco', // Spanish/Portuguese
    'banque', // French
  ]
  return patterns.some(p => holder.includes(p))
}

/**
 * Check if holder name contains friend/partner patterns
 */
function containsFriendPattern(holder: string): boolean {
  const patterns = [
    'friend', 'partner', 'business',
    'trusted', 'associate',
    '朋友', '伙伴', // Chinese
    'amigo', 'socio', // Spanish
    'ami', 'partenaire', // French
  ]
  return patterns.some(p => holder.includes(p))
}

/**
 * Apply roles to a set of keys
 * Enriches keys with detected roles if not already present
 */
export function enrichKeysWithRoles(keys: Key[]): Key[] {
  return keys.map((key, index) => {
    // Keep existing role if already defined
    if (key.role) {
      return key
    }

    // Detect and assign role
    return {
      ...key,
      role: detectKeyRole(key.holder, index)
    }
  })
}

/**
 * Get a human-readable label for a role
 */
export function getRoleLabel(role: KeyRole): string {
  const labels: Record<KeyRole, string> = {
    'primary': 'Primary',
    'spouse': 'Spouse',
    'child': 'Child',
    'attorney': 'Attorney',
    'custodian': 'Custodian',
    'trusted-friend': 'Friend',
    'other': 'Other'
  }
  return labels[role] || 'Other'
}

/**
 * Get role description for UI tooltips
 */
export function getRoleDescription(role: KeyRole): string {
  const descriptions: Record<KeyRole, string> = {
    'primary': 'Main estate owner, typically the first key holder',
    'spouse': 'Spouse or life partner who shares estate control',
    'child': 'Children or direct heirs',
    'attorney': 'Legal representative or estate attorney',
    'custodian': 'Third-party custodian service or institution',
    'trusted-friend': 'Trusted friend or business partner',
    'other': 'Other key holder without specific role'
  }
  return descriptions[role] || 'Custom role'
}