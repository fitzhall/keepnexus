/**
 * KEEP Score calculation v2
 * Pillar completeness report + legacy stub exports.
 */

import { LittleShardFile } from './data-model'

// ============================================================================
// Pillar Report Types
// ============================================================================

export interface PillarItem {
  label: string
  done: boolean
  /** Update page path for this item (used by readiness page) */
  href?: string
}

export interface PillarReport {
  configured: boolean
  items: PillarItem[]
}

export interface KEEPPillarReport {
  K: PillarReport
  E_estate: PillarReport
  E_continuity: PillarReport
  P: PillarReport
}

// ============================================================================
// Pillar Report Calculation
// ============================================================================

export function calculatePillarReport(shard: LittleShardFile): KEEPPillarReport {
  // K -- Key Governance
  const kItems: PillarItem[] = [
    { label: 'wallets configured', done: shard.wallets.length > 0, href: '/update/vault' },
    { label: 'keyholders assigned', done: shard.keyholders.length > 0, href: '/update/roles' },
    { label: 'governance rules set', done: shard.governance_rules.length > 0, href: '/update/policies' },
    { label: 'owner designated', done: shard.keyholders.some(k => k.functional_role === 'owner'), href: '/update/roles' },
    { label: 'protector designated', done: shard.keyholders.some(k => k.functional_role === 'protector'), href: '/update/roles' },
  ]

  // E -- Estate Integration
  const eEstateItems: PillarItem[] = [
    { label: 'heirs designated', done: shard.heirs.length > 0, href: '/update/heirs' },
    {
      label: 'trust or will documented',
      done: shard.legal.has_trust || shard.legal.has_will,
      href: '/update/legal',
    },
    { label: 'charter mission defined', done: (shard.charter.mission ?? '') !== '', href: '/update/charter' },
  ]

  // E -- Ensured Continuity
  const eContinuityItems: PillarItem[] = [
    { label: 'drills recorded', done: shard.drills.length > 0, href: '/update/continuity' },
    {
      label: 'drill frequency set',
      done: !!shard.continuity.drill_frequency,
      href: '/update/policies',
    },
    { label: 'last drill completed', done: !!shard.continuity.last_drill, href: '/update/continuity' },
  ]

  // P -- Professional Stewardship
  const pItems: PillarItem[] = [
    { label: 'advisor assigned', done: !!shard.professionals.advisor?.name, href: '/update/roles' },
    { label: 'attorney assigned', done: !!shard.professionals.attorney?.name, href: '/update/roles' },
    { label: 'CPA assigned', done: !!shard.professionals.cpa?.name, href: '/update/roles' },
  ]

  return {
    K: { configured: kItems.every(i => i.done), items: kItems },
    E_estate: { configured: eEstateItems.every(i => i.done), items: eEstateItems },
    E_continuity: { configured: eContinuityItems.every(i => i.done), items: eContinuityItems },
    P: { configured: pItems.every(i => i.done), items: pItems },
  }
}

// ============================================================================
// Legacy Stub Exports (for deprecated components)
// ============================================================================

export interface KEEPScore {
  total: number
  k: number
  e1: number
  e2: number
  p: number
  value: number
  calculated_at: string
  recommendations: string[]
}

export function calculateKEEPScore(data: LittleShardFile): KEEPScore {
  return {
    total: 0,
    k: 0,
    e1: 0,
    e2: 0,
    p: 0,
    value: 0,
    calculated_at: new Date().toISOString(),
    recommendations: []
  }
}

export function formatScoreForDisplay(score: KEEPScore): string {
  return `${score.total}%`
}

export function updateFileWithScore(file: LittleShardFile): LittleShardFile {
  return file
}
