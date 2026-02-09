/**
 * Role-Scoped .keep File Export
 * Creates filtered copies of a LittleShardFile based on professional role.
 *
 * Scoping rules:
 *   Attorney — wallets (keyholders stripped of location), legal, governance_rules, charter,
 *              heirs (name + allocation only), thap, event_log summary (count only)
 *   CPA      — professionals.cpa, event_log, wallet summary (label + quorum),
 *              heir allocations (name + %), thap
 *   Advisor  — full shard MINUS keyholder locations
 *
 * All exports include: version, family_name, created_at, last_modified, thap, keep_score
 */

import {
  LittleShardFile,
  KeyHolder,
  Heir,
  Wallet,
} from '../keep-core/data-model'

export type ShareRole = 'attorney' | 'cpa' | 'advisor'

/** Fields included in every scoped export */
function baseFields(shard: LittleShardFile) {
  return {
    version: shard.version,
    family_name: shard.family_name,
    created_at: shard.created_at,
    last_modified: shard.last_modified,
    thap: shard.thap,
    keep_score: shard.keep_score,
  }
}

/** Strip `location` from every keyholder */
function stripKeyholderLocations(holders: KeyHolder[]): KeyHolder[] {
  return holders.map(({ location, ...rest }) => ({
    ...rest,
    location: '[redacted]',
  }))
}

/** Heir with only name + allocation (no contact info, no relationship details beyond name) */
function heirNameAndAllocation(heirs: Heir[]): Partial<Heir>[] {
  return heirs.map(h => ({
    id: h.id,
    name: h.name,
    allocation: h.allocation,
  }))
}

/** Wallet summary: label + quorum only */
function walletSummary(wallets: Wallet[]): Partial<Wallet>[] {
  return wallets.map(w => ({
    id: w.id,
    label: w.label,
    threshold: w.threshold,
    total_keys: w.total_keys,
  }))
}

function scopeAttorney(shard: LittleShardFile): Partial<LittleShardFile> {
  return {
    ...baseFields(shard),
    wallets: shard.wallets,
    keyholders: stripKeyholderLocations(shard.keyholders),
    legal: shard.legal,
    governance_rules: shard.governance_rules,
    charter: shard.charter,
    heirs: heirNameAndAllocation(shard.heirs) as Heir[],
    event_log: [{
      id: 'summary',
      timestamp: new Date().toISOString(),
      event_type: 'log.summary',
      description: `Event log contains ${shard.event_log.length} entries`,
    }],
  }
}

function scopeCpa(shard: LittleShardFile): Partial<LittleShardFile> {
  return {
    ...baseFields(shard),
    professionals: { cpa: shard.professionals.cpa },
    event_log: shard.event_log,
    wallets: walletSummary(shard.wallets) as Wallet[],
    heirs: heirNameAndAllocation(shard.heirs) as Heir[],
  }
}

function scopeAdvisor(shard: LittleShardFile): Partial<LittleShardFile> {
  return {
    ...shard,
    keyholders: stripKeyholderLocations(shard.keyholders),
  }
}

/**
 * Create a role-scoped export of a LittleShardFile.
 * The returned partial is safe to serialize and hand to the specified role.
 */
export function createScopedExport(
  shard: LittleShardFile,
  role: ShareRole,
  recipientName: string
): Partial<LittleShardFile> {
  let scoped: Partial<LittleShardFile>

  switch (role) {
    case 'attorney':
      scoped = scopeAttorney(shard)
      break
    case 'cpa':
      scoped = scopeCpa(shard)
      break
    case 'advisor':
      scoped = scopeAdvisor(shard)
      break
  }

  // Tag export metadata
  return {
    ...scoped,
    last_modified: new Date().toISOString(),
  }
}

/** Human-readable description of what each role can see */
export const ROLE_SCOPE_DESCRIPTIONS: Record<ShareRole, { included: string[]; excluded: string[] }> = {
  attorney: {
    included: [
      'Wallets (keyholders without locations)',
      'Legal documents',
      'Governance rules',
      'Family charter',
      'Heirs (names + allocations only)',
      'THAP integrity hash',
      'Event log summary (count only)',
      'KEEP Score',
    ],
    excluded: [
      'Keyholder locations',
      'Heir contact info',
      'Full event log',
      'Professionals network',
      'Drills & continuity config',
      'Education status',
      'Risk analysis',
    ],
  },
  cpa: {
    included: [
      'CPA professional contact',
      'Full event log',
      'Wallet summary (labels + quorum)',
      'Heir allocations (name + %)',
      'THAP integrity hash',
      'KEEP Score',
    ],
    excluded: [
      'Full wallet details & descriptors',
      'Keyholders',
      'Legal documents',
      'Governance rules',
      'Charter',
      'Heir contact info',
      'Drills & continuity config',
      'Education status',
      'Risk analysis',
    ],
  },
  advisor: {
    included: [
      'Full shard data',
      'All wallets & governance',
      'All heirs & estate info',
      'All professionals & continuity',
      'THAP integrity hash',
      'KEEP Score',
    ],
    excluded: [
      'Keyholder locations (redacted)',
    ],
  },
}
