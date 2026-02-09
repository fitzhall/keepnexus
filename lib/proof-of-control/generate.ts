/**
 * Proof of Control — Packet Assembler
 * Assembles a structured proof packet from a LittleShardFile.
 * Proves custody structure WITHOUT exposing sensitive data:
 *   - No key locations or storage types
 *   - No amounts or balances
 *   - No attorney contact details
 *   - No personal contact information
 */

import { LittleShardFile } from '../keep-core/data-model'

// ============================================================================
// Types
// ============================================================================

export interface ProofSection {
  title: string
  rows: { label: string; value: string }[]
}

export interface ProofOfControlPacket {
  family_name: string
  generated_at: string
  thap_hash: string
  sections: ProofSection[]
}

// ============================================================================
// Assembler
// ============================================================================

export function assembleProofOfControl(shard: LittleShardFile): ProofOfControlPacket {
  const now = new Date().toISOString()

  const sections: ProofSection[] = [
    buildVaultSummary(shard),
    buildGovernanceSummary(shard),
    buildContinuityEvidence(shard),
    buildLegalSummary(shard),
    buildIntegritySeal(shard, now),
  ]

  return {
    family_name: shard.family_name,
    generated_at: now,
    thap_hash: shard.thap.current_hash || 'not calculated',
    sections,
  }
}

// ============================================================================
// Section Builders
// ============================================================================

function buildVaultSummary(shard: LittleShardFile): ProofSection {
  const rows = shard.wallets.map(w => ({
    label: w.label || w.id,
    value: [
      `${w.threshold}-of-${w.total_keys}`,
      w.platform || 'unknown platform',
    ].join(' | '),
  }))

  if (rows.length === 0) {
    rows.push({ label: 'wallets', value: 'none configured' })
  }

  return { title: 'Vault Summary', rows }
}

function buildGovernanceSummary(shard: LittleShardFile): ProofSection {
  const rows = shard.governance_rules.map(rule => ({
    label: rule.who,
    value: [
      rule.canDo,
      rule.condition ? `when: ${rule.condition}` : '',
      rule.status,
    ].filter(Boolean).join(' | '),
  }))

  if (rows.length === 0) {
    rows.push({ label: 'rules', value: 'none configured' })
  }

  return { title: 'Governance Summary', rows }
}

function buildContinuityEvidence(shard: LittleShardFile): ProofSection {
  const drillCount = shard.drills.length
  const lastDrill = drillCount > 0
    ? shard.drills[drillCount - 1].timestamp.split('T')[0]
    : 'none'

  return {
    title: 'Continuity Evidence',
    rows: [
      { label: 'drills completed', value: String(drillCount) },
      { label: 'last drill', value: lastDrill },
      { label: 'drill frequency', value: shard.continuity.drill_frequency || 'not set' },
      { label: 'check-in frequency', value: shard.continuity.checkin_frequency || 'not set' },
    ],
  }
}

function buildLegalSummary(shard: LittleShardFile): ProofSection {
  return {
    title: 'Legal Summary',
    rows: [
      { label: 'has trust', value: shard.legal.has_trust ? 'yes' : 'no' },
      { label: 'has will', value: shard.legal.has_will ? 'yes' : 'no' },
      { label: 'jurisdiction', value: shard.legal.jurisdiction || 'not specified' },
      { label: 'bitcoin in docs', value: shard.legal.bitcoin_in_docs ? 'yes' : 'no' },
      { label: 'RUFADAA filed', value: shard.legal.rufadaa_filed ? 'yes' : 'no' },
    ],
  }
}

function buildIntegritySeal(shard: LittleShardFile, generatedAt: string): ProofSection {
  const eventCount = shard.event_log?.length || 0
  const lastEvent = eventCount > 0
    ? shard.event_log[eventCount - 1].timestamp.split('T')[0]
    : 'none'

  return {
    title: 'Integrity Seal',
    rows: [
      { label: 'THAP hash', value: shard.thap.current_hash || 'not calculated' },
      { label: 'event log entries', value: String(eventCount) },
      { label: 'last event', value: lastEvent },
      { label: 'proof generated', value: generatedAt.split('T')[0] },
    ],
  }
}
