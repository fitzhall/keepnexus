/**
 * THAP (Trust Hash Amendment Protocol) - Hash Calculator v2.0
 * Produces a deterministic SHA-256 hash of canonical LittleShardFile fields.
 * Used for drift detection and change tracking.
 */

import type { LittleShardFile } from '@/lib/keep-core/data-model'

/**
 * Extract canonical fields and produce a deterministic SHA-256 hex string.
 * Uses Web Crypto API (available in all modern browsers).
 */
export async function calculateThapHash(shard: LittleShardFile): Promise<string> {
  const canonical = {
    familyName: shard.family_name,
    wallets: shard.wallets.map(w => ({
      id: w.id,
      label: w.label,
      threshold: w.threshold,
      total_keys: w.total_keys,
      platform: w.platform,
      tier: w.tier || null,
    })),
    keyholders: shard.keyholders.map(k => ({
      id: k.id,
      name: k.name,
      role: k.role,
      storage_type: k.storage_type,
      location: k.location,
      functional_role: k.functional_role || null,
    })),
    heirs: shard.heirs.map(h => ({
      id: h.id,
      name: h.name,
      relationship: h.relationship,
      allocation: h.allocation,
      isKeyHolder: h.isKeyHolder,
    })),
    charter: {
      mission: shard.charter.mission,
      principles: shard.charter.principles,
      reviewFrequency: shard.charter.reviewFrequency,
    },
    legal: {
      trust_name: shard.legal.trust_name,
      jurisdiction: shard.legal.jurisdiction,
      bitcoin_in_docs: shard.legal.bitcoin_in_docs,
      rufadaa_filed: shard.legal.rufadaa_filed,
      trustee_names: shard.legal.trustee_names,
    },
    governance_rules: shard.governance_rules.map(r => ({
      id: r.id,
      who: r.who,
      canDo: r.canDo,
      when: r.when,
      condition: r.condition,
      status: r.status,
    })),
    professionals: {
      advisor: shard.professionals.advisor?.name || '',
      advisorFirm: shard.professionals.advisor?.firm || '',
      advisorEmail: shard.professionals.advisor?.email || '',
      attorney: shard.professionals.attorney?.name || '',
      cpa: shard.professionals.cpa?.name || '',
    },
    continuity: {
      drill_frequency: shard.continuity.drill_frequency,
      checkin_frequency: shard.continuity.checkin_frequency,
    },
  }

  const json = JSON.stringify(canonical)
  const encoded = new TextEncoder().encode(json)
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoded)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}
