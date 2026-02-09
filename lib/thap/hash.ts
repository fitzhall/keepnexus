/**
 * THAP (Trust Hash Amendment Protocol) - Hash Calculator
 * Produces a deterministic SHA-256 hash of canonical family setup fields.
 * Used for drift detection and change tracking.
 */

import type { FamilySetupData } from '@/lib/context/FamilySetup'

/**
 * Extract canonical fields and produce a deterministic SHA-256 hex string.
 * Uses Web Crypto API (available in all modern browsers).
 */
export async function calculateThapHash(setup: FamilySetupData): Promise<string> {
  // Canonical fields only — order matters for determinism
  const canonical = {
    familyName: setup.familyName,
    vaults: setup.vaults.map(v => ({
      id: v.id,
      label: v.label,
      multisig: {
        threshold: v.multisig.threshold,
        totalKeys: v.multisig.totalKeys,
        keys: v.multisig.keys.map(k => ({
          id: k.id,
          holder: k.holder,
          role: k.role,
          storage: k.storage,
          location: k.location,
        })),
        platform: v.multisig.platform,
      },
    })),
    multisig: {
      threshold: setup.multisig.threshold,
      totalKeys: setup.multisig.totalKeys,
      keys: setup.multisig.keys.map(k => ({
        id: k.id,
        holder: k.holder,
        role: k.role,
        storage: k.storage,
        location: k.location,
      })),
      platform: setup.multisig.platform,
    },
    heirs: setup.heirs.map(h => ({
      id: h.id,
      name: h.name,
      relationship: h.relationship,
      allocation: h.allocation,
      isKeyHolder: h.isKeyHolder,
    })),
    charter: {
      mission: setup.charter.mission,
      principles: setup.charter.principles,
      reviewFrequency: setup.charter.reviewFrequency,
    },
    trust: {
      trustName: setup.trust.trustName,
      trusteeNames: setup.trust.trusteeNames,
      jurisdiction: setup.trust.jurisdiction,
      bitcoinInDocs: setup.trust.bitcoinInDocs,
      rufadaaFiled: setup.trust.rufadaaFiled,
    },
    governanceRules: setup.governanceRules.map(r => ({
      id: r.id,
      who: r.who,
      canDo: r.canDo,
      when: r.when,
      condition: r.condition,
      status: r.status,
    })),
    roles: {
      advisorName: setup.captainSettings?.advisorName || '',
      advisorFirm: setup.captainSettings?.advisorFirm || '',
      advisorEmail: setup.captainSettings?.advisorEmail || '',
      attorney: setup.captainSettings?.professionalNetwork?.attorney || '',
      cpa: setup.captainSettings?.professionalNetwork?.cpa || '',
      custodian: setup.captainSettings?.professionalNetwork?.custodian || '',
    },
    drillSettings: {
      frequency: setup.drillSettings?.frequency || '',
    },
    taxSettings: {
      cpaName: setup.taxSettings?.cpaName || '',
      cpaEmail: setup.taxSettings?.cpaEmail || '',
      reportingFrequency: setup.taxSettings?.reportingFrequency || '',
    },
  }

  const json = JSON.stringify(canonical)
  const encoded = new TextEncoder().encode(json)
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoded)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}
