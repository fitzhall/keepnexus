/**
 * Shard Adapter - Converts between KeepNexus and Shard v2.1.0 formats
 *
 * This adapter enables interoperability between:
 * - Keep Nexus (.keepnexus files) - Hodler's local command center
 * - KEEP SYS (Shard v2.1.0) - Professional dashboard
 *
 * The adapter supports bidirectional conversion with minimal data loss.
 */

import type {
  KeepNexusFile,
  ScheduleEvent,
  DrillRecord,
  DrillSettings,
  VaultSettings,
  TaxSettings,
  CaptainSettings,
  ForeverSettings,
  AuditEntry,
} from '../risk-simulator/file-export'
import type { MultisigSetup, Key, KeyRole } from '../risk-simulator/types'
import type { GovernanceRule, Heir } from '../context/FamilySetup'
import type { TrustInfo } from '../risk-simulator/file-export'

// ============================================================================
// SHARD V2.1.0 TYPES (Copied from KEEP SYS for standalone operation)
// ============================================================================

export const SHARD_VERSION = '2.1.0'

export type Mode = 'active' | 'degraded' | 'maintenance' | 'recovery' | 'dormant'

export type RoleType =
  | 'holder'
  | 'operator'
  | 'trustee'
  | 'attorney'
  | 'cpa'
  | 'keyholder'
  | 'beneficiary'
  | 'protector'
  | 'other'

export type AlertSeverity = 'info' | 'warning' | 'critical'
export type CheckinFrequency = 'monthly' | 'quarterly' | 'annual'
export type LifeEventTrigger =
  | 'move'
  | 'device_change'
  | 'role_change'
  | 'marriage'
  | 'divorce'
  | 'birth'
  | 'death'
  | 'incapacity'
  | 'legal_update'
export type ThapTriggerCondition = 'incapacity' | 'death' | 'court_order' | 'trustee_change'
export type CheckpointReason = 'scheduled' | 'life_event' | 'role_change' | 'drill' | 'emergency'

export interface Shard {
  shard_id: string
  schema_version: string
  shard_version: string

  canonical_state: CanonicalState
  operational_state?: OperationalState
  knowledge_pack?: KnowledgePack
}

export interface CanonicalState {
  canonical_hash: string
  created_at: string
  updated_at: string

  client: {
    client_id: string
    client_name: string
    matter_number: string
    firm: {
      name: string
      type: 'attorney' | 'cpa' | 'hybrid'
    }
  }

  roles: RoleDef[]
  policies: PolicyDef
  thap_map: ThapMap

  vault_policy: {
    platform: string
    descriptor_hash: string
    quorum: { required: number; total: number }
    last_verified: string
  }

  legal: {
    jurisdiction: string
    trust_present: boolean
    bitcoin_mentioned_in_docs: boolean
    rufadaa_compliant: boolean
    documents: LegalDocument[]
  }

  heirs: ShardHeir[]

  professionals: {
    attorney?: Professional
    cpa?: Professional
    advisor?: Professional
  }

  checkpoint_history: CheckpointAnchor[]

  proofs?: {
    bip322_signatures?: BIP322Signature[]
    timestamps?: TimestampProof[]
    charter_hash?: string
    anchored_to_block?: number
  }
}

export interface OperationalState {
  is_informational_only: true
  not_for_legal_reliance: true

  current_mode: Mode
  last_boot_at?: string
  boot_count?: number

  deadman: {
    armed: boolean
    state: 'ok' | 'due' | 'overdue' | 'triggered'
    last_checkin_at?: string
    due_at?: string
  }

  scores?: {
    keep_score: number
    continuity_score: number
    pillars: {
      security: PillarScore
      legal: PillarScore
      access: PillarScore
      maintenance: PillarScore
    }
  }

  continuity?: {
    devices_registered: number
    devices_ready: number
    artifacts_verified: number
    last_checkin: string
    last_drill: string
    open_exceptions: number
    health_trend: 'improving' | 'stable' | 'declining'
  }

  last_attestation_at?: string
  alerts_open_count: number
  highest_severity: AlertSeverity
  pending_actions_count: number

  alerts?: ShardAlert[]
}

export interface KnowledgePack {
  pack_id: string
  pack_version: string
  encryption?: {
    algo: 'age' | 'pgp' | 'none'
    key_ref?: string
  }
  artifacts: KnowledgeArtifact[]
  limits: {
    max_embedded_artifact_bytes: number
    max_total_embedded_bytes: number
  }
}

export interface RoleDef {
  role_id: string
  role_type: RoleType
  display_name: string
  allowed_actions: string[]
  forbidden_actions: string[]
  role_packet_ref?: ArtifactRef
}

export interface PolicyDef {
  checkin: {
    freq: CheckinFrequency
    grace_days: number
  }
  drills: {
    poc_l1_freq: CheckinFrequency
    poc_l2_freq?: 'quarterly' | 'annual'
    poc_l3_freq?: 'annual'
  }
  life_event_triggers: LifeEventTrigger[]
  escalation: {
    notify_roles: RoleType[]
    overdue_days_to_trigger: number
  }
}

export interface ThapMap {
  legal_authority_roles: RoleType[]
  execution_sequence: string[]
  required_artifacts: ArtifactRef[]
  trigger_conditions: ThapTriggerCondition[]
}

export interface CheckpointAnchor {
  ts: string
  version: string
  canonical_hash: string
  reason: CheckpointReason
  approved_by: {
    actor_id: string
    role_type: RoleType
  }
  prior_hash?: string
}

export interface ShardAlert {
  severity: AlertSeverity
  code: string
  message: string
  created_at: string
  resolved_at?: string
}

export interface PillarScore {
  score: number
  label: string
  status: 'excellent' | 'good' | 'needs_attention' | 'critical'
  issues: string[]
}

export interface ShardHeir {
  name: string
  relationship: string
  allocation?: number
  is_keyholder: boolean
}

export interface LegalDocument {
  name: string
  hash_sha256: string
  dated?: string
}

export interface Professional {
  name: string
  firm: string
  email?: string
  phone?: string
}

export interface BIP322Signature {
  address: string
  message: string
  signature: string
  created_at: string
}

export interface TimestampProof {
  type: 'OpenTimestamps' | 'TXAnchor'
  evidence: string
  created_at: string
}

export interface KnowledgeArtifact {
  artifact_id: string
  type: 'handbook' | 'runbook' | 'role_packet' | 'seed_map' | 'contact_sheet' | 'checklist' | 'template' | 'policy_appendix' | 'other'
  other_label?: string
  format: 'md' | 'pdf' | 'txt' | 'json'
  sha256: string
  size_bytes: number
  required_for_offline: boolean
  storage: ArtifactStorage
  last_updated_at: string
}

export type ArtifactStorage =
  | { kind: 'embedded_base64_gzip'; data_b64: string }
  | { kind: 'external_ref'; refs: ExternalReference[] }

export interface ExternalReference {
  type: 'file_path' | 'usb_label' | 'cloud_folder' | 'vault_location'
  location: string
  instructions?: string
}

export interface ArtifactRef {
  artifact_id: string
  sha256: string
}

// ============================================================================
// KEEP NEXUS EXTENSION TYPES (for preserving data during round-trip)
// ============================================================================

/**
 * Extended Shard with Keep Nexus-specific data
 * This allows round-trip conversion without losing Keep Nexus features
 */
export interface ExtendedShard extends Shard {
  _keepnexus_extension?: {
    version: string
    schedule_events?: ScheduleEvent[]
    drill_history?: DrillRecord[]
    drill_settings?: DrillSettings
    vault_settings?: VaultSettings
    tax_settings?: TaxSettings
    captain_settings?: CaptainSettings
    forever_settings?: ForeverSettings
    governance_rules?: GovernanceRule[]
    multisig_setup?: MultisigSetup
    analysis?: {
      resilienceScore: number
      timestamp: Date
    }
  }
}

// ============================================================================
// ADAPTER CLASS
// ============================================================================

export class ShardAdapter {
  /**
   * Convert KeepNexusFile to Shard v2.1.0 format
   */
  static toShard(keepNexus: KeepNexusFile): ExtendedShard {
    const now = new Date().toISOString()
    const shardId = this.generateShardId(keepNexus.family)

    // Build canonical state
    const canonicalState = this.buildCanonicalState(keepNexus, now)

    // Calculate canonical hash
    canonicalState.canonical_hash = this.calculateHash(canonicalState)

    // Build operational state
    const operationalState = this.buildOperationalState(keepNexus, now)

    // Build knowledge pack (empty for now, can be extended)
    const knowledgePack = this.buildKnowledgePack(shardId)

    const shard: ExtendedShard = {
      shard_id: shardId,
      schema_version: SHARD_VERSION,
      shard_version: '1',

      canonical_state: canonicalState,
      operational_state: operationalState,
      knowledge_pack: knowledgePack,

      // Preserve Keep Nexus-specific data for round-trip
      _keepnexus_extension: {
        version: keepNexus.version,
        schedule_events: keepNexus.schedule,
        drill_history: keepNexus.drills?.history,
        drill_settings: keepNexus.drills?.settings,
        vault_settings: keepNexus.vault,
        tax_settings: keepNexus.tax,
        captain_settings: keepNexus.captain,
        forever_settings: keepNexus.forever,
        governance_rules: keepNexus.governance?.rules,
        multisig_setup: keepNexus.setup,
        analysis: keepNexus.analysis ? {
          resilienceScore: keepNexus.analysis.resilienceScore,
          timestamp: keepNexus.analysis.timestamp,
        } : undefined,
      },
    }

    return shard
  }

  /**
   * Convert Shard v2.1.0 back to KeepNexusFile format
   */
  static fromShard(shard: ExtendedShard): KeepNexusFile {
    const ext = shard._keepnexus_extension
    const now = new Date()

    // Reconstruct MultisigSetup from shard or extension
    const setup = ext?.multisig_setup || this.rebuildMultisigSetup(shard)

    const keepNexus: KeepNexusFile = {
      version: ext?.version || '1.2.0',
      created: new Date(shard.canonical_state.created_at),
      modified: now,
      family: shard.canonical_state.client.client_name,

      // Core estate planning data
      setup,
      analysis: ext?.analysis ? {
        results: [], // Can't fully reconstruct without original data
        resilienceScore: ext.analysis.resilienceScore,
        timestamp: ext.analysis.timestamp,
      } : undefined,
      governance: ext?.governance_rules ? {
        rules: ext.governance_rules,
      } : this.rebuildGovernanceRules(shard),
      heirs: this.rebuildHeirs(shard),
      trust: this.rebuildTrust(shard),

      // Page-specific data (from extension or defaults)
      schedule: ext?.schedule_events || [],
      drills: {
        history: ext?.drill_history || [],
        settings: ext?.drill_settings || this.defaultDrillSettings(),
      },
      vault: ext?.vault_settings || this.defaultVaultSettings(setup),
      tax: ext?.tax_settings || this.defaultTaxSettings(shard),
      captain: ext?.captain_settings || this.rebuildCaptainSettings(shard),
      forever: ext?.forever_settings || this.defaultForeverSettings(),

      // Audit trail from checkpoint history
      auditTrail: this.rebuildAuditTrail(shard),
    }

    return keepNexus
  }

  // ==========================================================================
  // CANONICAL STATE BUILDERS
  // ==========================================================================

  private static buildCanonicalState(keepNexus: KeepNexusFile, now: string): CanonicalState {
    const { setup, heirs, trust, governance, captain } = keepNexus

    return {
      canonical_hash: '', // Calculated after assembly
      created_at: keepNexus.created.toISOString(),
      updated_at: now,

      client: {
        client_id: this.generateClientId(keepNexus.family),
        client_name: keepNexus.family,
        matter_number: `KN-${Date.now().toString(36).toUpperCase()}`,
        firm: {
          name: captain?.advisorFirm || 'Self-Custody',
          type: 'hybrid' as const, // Keep Nexus files default to hybrid (self-custody with optional professional support)
        },
      },

      roles: this.buildRoles(setup, heirs || []),
      policies: this.buildPolicies(keepNexus),
      thap_map: this.buildThapMap(governance?.rules || []),

      vault_policy: {
        platform: 'keepnexus',
        descriptor_hash: this.hashMultisigSetup(setup),
        quorum: {
          required: setup.threshold,
          total: setup.totalKeys,
        },
        last_verified: now,
      },

      legal: {
        jurisdiction: 'US', // Default; can be extended
        trust_present: !!trust?.trustName,
        bitcoin_mentioned_in_docs: false,
        rufadaa_compliant: false,
        documents: trust?.documentIds?.map(id => ({
          name: id,
          hash_sha256: '0'.repeat(64),
        })) || [],
      },

      heirs: (heirs || []).map(h => ({
        name: h.name,
        relationship: h.relationship,
        allocation: h.allocation,
        is_keyholder: h.isKeyHolder || false,
      })),

      professionals: {
        attorney: captain?.professionalNetwork?.attorney ? {
          name: captain.professionalNetwork.attorney,
          firm: captain.professionalNetwork.attorney,
        } : undefined,
        cpa: captain?.professionalNetwork?.cpa ? {
          name: captain.professionalNetwork.cpa,
          firm: captain.professionalNetwork.cpa,
        } : undefined,
        advisor: captain?.advisorName ? {
          name: captain.advisorName,
          firm: captain.advisorFirm || '',
          email: captain.advisorEmail,
          phone: captain.advisorPhone,
        } : undefined,
      },

      checkpoint_history: this.buildCheckpointHistory(keepNexus),
    }
  }

  private static buildRoles(setup: MultisigSetup, heirs: Heir[]): RoleDef[] {
    const roles: RoleDef[] = []

    // Add key holders as roles
    for (const key of setup.keys) {
      roles.push({
        role_id: key.id,
        role_type: this.mapKeyRoleToRoleType(key.role),
        display_name: key.holder,
        allowed_actions: this.deriveAllowedActions(key),
        forbidden_actions: [],
      })
    }

    // Add heirs that aren't already key holders
    for (const heir of heirs) {
      if (!roles.find(r => r.display_name === heir.name)) {
        roles.push({
          role_id: heir.id,
          role_type: 'beneficiary',
          display_name: heir.name,
          allowed_actions: ['view_balance', 'receive_distributions'],
          forbidden_actions: [],
        })
      }
    }

    return roles
  }

  private static buildPolicies(keepNexus: KeepNexusFile): PolicyDef {
    const drillSettings = keepNexus.drills?.settings
    const freq = drillSettings?.frequency || 'quarterly'

    return {
      checkin: {
        freq: freq === 'weekly' ? 'monthly' : freq as CheckinFrequency,
        grace_days: drillSettings?.notificationDays || 14,
      },
      drills: {
        poc_l1_freq: freq === 'weekly' ? 'monthly' : freq as CheckinFrequency,
        poc_l2_freq: 'quarterly',
        poc_l3_freq: 'annual',
      },
      life_event_triggers: ['death', 'incapacity', 'marriage', 'divorce'],
      escalation: {
        notify_roles: ['protector', 'attorney'],
        overdue_days_to_trigger: 30,
      },
    }
  }

  private static buildThapMap(rules: GovernanceRule[]): ThapMap {
    const triggerConditions: ThapTriggerCondition[] = ['incapacity', 'death']

    // Derive execution sequence from governance rules
    const executionSequence = rules
      .filter(r => r.status === 'active')
      .map(r => `${r.who} ${r.canDo} ${r.when}: ${r.condition}`)
      .slice(0, 5)

    if (executionSequence.length === 0) {
      executionSequence.push(
        '1. Verify trigger condition',
        '2. Notify key holders',
        '3. Execute transfers per allocation',
      )
    }

    return {
      legal_authority_roles: ['trustee', 'attorney', 'protector'],
      execution_sequence: executionSequence,
      required_artifacts: [],
      trigger_conditions: triggerConditions,
    }
  }

  private static buildCheckpointHistory(keepNexus: KeepNexusFile): CheckpointAnchor[] {
    return keepNexus.auditTrail.slice(-10).map((entry, index) => ({
      ts: entry.timestamp instanceof Date ? entry.timestamp.toISOString() : String(entry.timestamp),
      version: String(index + 1),
      canonical_hash: '0'.repeat(64), // Would be calculated properly in production
      reason: this.mapAuditActionToReason(entry.action),
      approved_by: {
        actor_id: entry.user || 'hodler',
        role_type: 'holder' as RoleType,
      },
    }))
  }

  // ==========================================================================
  // OPERATIONAL STATE BUILDERS
  // ==========================================================================

  private static buildOperationalState(keepNexus: KeepNexusFile, now: string): OperationalState {
    const drills = keepNexus.drills
    const lastDrill = drills?.history[drills.history.length - 1]
    const lastDrillDate = lastDrill?.date instanceof Date ? lastDrill.date.toISOString() : 'never'

    // Calculate scores
    const pillars = this.calculatePillars(keepNexus)
    const keepScore = this.calculateKeepScore(pillars)
    const continuityScore = this.calculateContinuityScore(keepNexus)

    // Determine deadman state based on last drill
    const deadmanState = this.determineDeadmanState(drills?.settings?.lastDrillDate)

    return {
      is_informational_only: true,
      not_for_legal_reliance: true,

      current_mode: 'active',
      last_boot_at: now,
      boot_count: 1,

      deadman: {
        armed: true,
        state: deadmanState,
        last_checkin_at: drills?.settings?.lastDrillDate?.toISOString(),
        due_at: drills?.settings?.nextDrillDate?.toISOString(),
      },

      scores: {
        keep_score: keepScore,
        continuity_score: continuityScore,
        pillars,
      },

      continuity: {
        devices_registered: keepNexus.setup.keys.length,
        devices_ready: keepNexus.setup.keys.filter(k => k.storage === 'hardware-wallet').length,
        artifacts_verified: 0,
        last_checkin: drills?.settings?.lastDrillDate?.toISOString() || 'never',
        last_drill: lastDrillDate,
        open_exceptions: 0,
        health_trend: this.calculateHealthTrend(drills?.history || []),
      },

      alerts_open_count: 0,
      highest_severity: 'info',
      pending_actions_count: 0,
    }
  }

  private static buildKnowledgePack(shardId: string): KnowledgePack {
    return {
      pack_id: `pack-${shardId}`,
      pack_version: '1',
      artifacts: [],
      limits: {
        max_embedded_artifact_bytes: 1_000_000,
        max_total_embedded_bytes: 5_000_000,
      },
    }
  }

  // ==========================================================================
  // REVERSE CONVERSION HELPERS
  // ==========================================================================

  private static rebuildMultisigSetup(shard: Shard): MultisigSetup {
    const { vault_policy, roles } = shard.canonical_state

    const keys: Key[] = roles
      .filter(r => r.role_type !== 'beneficiary')
      .map(r => ({
        id: r.role_id,
        holder: r.display_name,
        role: this.mapRoleTypeToKeyRole(r.role_type),
        type: 'full' as const,
        storage: 'hardware-wallet' as const,
        location: 'Unknown',
      }))

    return {
      threshold: vault_policy.quorum.required,
      totalKeys: vault_policy.quorum.total,
      keys,
      family: shard.canonical_state.client.client_name,
      createdAt: new Date(shard.canonical_state.created_at),
    }
  }

  private static rebuildGovernanceRules(shard: Shard): { rules: GovernanceRule[] } {
    const rules: GovernanceRule[] = shard.canonical_state.thap_map.execution_sequence.map((step, i) => ({
      id: String(i + 1).padStart(3, '0'),
      who: 'System',
      canDo: step,
      when: 'As specified',
      condition: 'Per governance rules',
      status: 'active' as const,
      risk: 'medium' as const,
      executions: 0,
    }))

    return { rules }
  }

  private static rebuildHeirs(shard: Shard): Heir[] {
    return shard.canonical_state.heirs.map((h, i) => ({
      id: String(i + 1),
      name: h.name,
      relationship: h.relationship,
      allocation: h.allocation,
      isKeyHolder: h.is_keyholder,
    }))
  }

  private static rebuildTrust(shard: Shard): TrustInfo {
    const { legal } = shard.canonical_state

    return {
      trustName: legal.trust_present ? `${shard.canonical_state.client.client_name} Trust` : undefined,
      documentIds: legal.documents.map(d => d.name),
    }
  }

  private static rebuildCaptainSettings(shard: Shard): CaptainSettings {
    const { professionals } = shard.canonical_state

    return {
      advisorName: professionals.advisor?.name,
      advisorEmail: professionals.advisor?.email,
      advisorPhone: professionals.advisor?.phone,
      advisorFirm: professionals.advisor?.firm,
      serviceTier: 'nexus',
      professionalNetwork: {
        attorney: professionals.attorney?.name,
        cpa: professionals.cpa?.name,
      },
    }
  }

  private static rebuildAuditTrail(shard: Shard): AuditEntry[] {
    return shard.canonical_state.checkpoint_history.map(cp => ({
      timestamp: new Date(cp.ts),
      action: this.mapReasonToAuditAction(cp.reason),
      user: cp.approved_by.actor_id,
      details: `Version ${cp.version}`,
    }))
  }

  // ==========================================================================
  // DEFAULT VALUE FACTORIES
  // ==========================================================================

  private static defaultDrillSettings(): DrillSettings {
    return {
      frequency: 'quarterly',
      participants: [],
      notificationDays: 7,
      autoReminder: true,
    }
  }

  private static defaultVaultSettings(setup: MultisigSetup): VaultSettings {
    return {
      walletType: 'hardware',
      rotationFrequency: 90,
      backupLocations: setup.keys.map(k => k.location),
      testTransactionCompleted: false,
    }
  }

  private static defaultTaxSettings(shard: Shard): TaxSettings {
    const cpa = shard.canonical_state.professionals.cpa
    return {
      reportingFrequency: 'annually',
      cpaEmail: cpa?.email,
      cpaName: cpa?.name,
      autoGenerate: false,
      taxStrategy: 'hodl',
    }
  }

  private static defaultForeverSettings(): ForeverSettings {
    return {
      archivalEnabled: false,
      redundantLocations: [],
    }
  }

  // ==========================================================================
  // UTILITY METHODS
  // ==========================================================================

  private static generateShardId(family: string): string {
    const timestamp = Date.now().toString(36)
    const random = Math.random().toString(36).substring(2, 8)
    const sanitized = family.replace(/[^a-zA-Z0-9]/g, '').toLowerCase().substring(0, 8)
    return `shard-${sanitized}-${timestamp}-${random}`
  }

  private static generateClientId(family: string): string {
    const sanitized = family.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()
    return `client-${sanitized}-${Date.now().toString(36)}`
  }

  private static mapKeyRoleToRoleType(role?: KeyRole): RoleType {
    const mapping: Record<KeyRole, RoleType> = {
      primary: 'holder',
      spouse: 'keyholder',
      child: 'beneficiary',
      attorney: 'attorney',
      custodian: 'operator',
      'trusted-friend': 'protector',
      other: 'other',
    }
    return role ? mapping[role] : 'other'
  }

  private static mapRoleTypeToKeyRole(roleType: RoleType): KeyRole {
    const mapping: Record<RoleType, KeyRole> = {
      holder: 'primary',
      operator: 'custodian',
      trustee: 'attorney',
      attorney: 'attorney',
      cpa: 'other',
      keyholder: 'spouse',
      beneficiary: 'child',
      protector: 'trusted-friend',
      other: 'other',
    }
    return mapping[roleType]
  }

  private static deriveAllowedActions(key: Key): string[] {
    const actions: string[] = ['sign_psbt']

    if (key.role === 'primary') {
      actions.push('initiate_transactions', 'approve_transactions', 'emergency_freeze')
    } else if (key.role === 'attorney') {
      actions.push('trigger_succession', 'approve_transactions')
    } else if (key.role === 'custodian') {
      actions.push('approve_transactions')
    }

    return actions
  }

  private static mapAuditActionToReason(action: string): CheckpointReason {
    const mapping: Record<string, CheckpointReason> = {
      created: 'scheduled',
      modified: 'scheduled',
      exported: 'scheduled',
      imported: 'scheduled',
      drill: 'drill',
      emergency: 'emergency',
    }
    return mapping[action] || 'scheduled'
  }

  private static mapReasonToAuditAction(reason: CheckpointReason): string {
    const mapping: Record<CheckpointReason, string> = {
      scheduled: 'modified',
      life_event: 'modified',
      role_change: 'modified',
      drill: 'drill',
      emergency: 'emergency',
    }
    return mapping[reason]
  }

  private static hashMultisigSetup(setup: MultisigSetup): string {
    const content = JSON.stringify({
      threshold: setup.threshold,
      totalKeys: setup.totalKeys,
      keys: setup.keys.map(k => ({ id: k.id, holder: k.holder, role: k.role })),
    })

    // Simple hash for browser environment
    let hash = 0
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash
    }
    return Math.abs(hash).toString(16).padStart(64, '0')
  }

  private static calculateHash(state: CanonicalState): string {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { canonical_hash: _, ...stateCopy } = state

    const content = JSON.stringify(stateCopy, Object.keys(stateCopy).sort())

    let hash = 0
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash
    }
    return Math.abs(hash).toString(16).padStart(64, '0')
  }

  private static calculatePillars(keepNexus: KeepNexusFile): {
    security: PillarScore
    legal: PillarScore
    access: PillarScore
    maintenance: PillarScore
  } {
    const { setup, trust, drills, vault } = keepNexus

    // Security: Based on multisig quorum
    const securityScore = Math.min(100, (setup.threshold / setup.totalKeys) * 100 + 50)
    const securityIssues: string[] = []
    if (setup.threshold < 2) securityIssues.push('Single signature wallet')
    if (setup.keys.some(k => k.storage === 'digital')) securityIssues.push('Hot wallet detected')

    // Legal: Based on trust presence
    const legalScore = trust?.trustName ? 80 : 30
    const legalIssues: string[] = []
    if (!trust?.trustName) legalIssues.push('No trust established')
    if (!trust?.lastReviewed) legalIssues.push('Trust not reviewed recently')

    // Access: Based on key distribution and drills
    const accessScore = drills?.history.length ? 70 : 40
    const accessIssues: string[] = []
    if (!drills?.history.length) accessIssues.push('No drills completed')
    if (setup.keys.length < 3) accessIssues.push('Limited key redundancy')

    // Maintenance: Based on drill and rotation schedules
    const maintenanceScore = vault?.testTransactionCompleted ? 80 : 50
    const maintenanceIssues: string[] = []
    if (!vault?.testTransactionCompleted) maintenanceIssues.push('Test transaction not completed')

    const getStatus = (score: number): PillarScore['status'] => {
      if (score >= 85) return 'excellent'
      if (score >= 70) return 'good'
      if (score >= 50) return 'needs_attention'
      return 'critical'
    }

    return {
      security: { score: Math.round(securityScore), label: 'Security', status: getStatus(securityScore), issues: securityIssues },
      legal: { score: Math.round(legalScore), label: 'Legal', status: getStatus(legalScore), issues: legalIssues },
      access: { score: Math.round(accessScore), label: 'Access', status: getStatus(accessScore), issues: accessIssues },
      maintenance: { score: Math.round(maintenanceScore), label: 'Maintenance', status: getStatus(maintenanceScore), issues: maintenanceIssues },
    }
  }

  private static calculateKeepScore(pillars: {
    security: PillarScore
    legal: PillarScore
    access: PillarScore
    maintenance: PillarScore
  }): number {
    const weights = { security: 0.30, legal: 0.25, access: 0.25, maintenance: 0.20 }
    return Math.round(
      pillars.security.score * weights.security +
      pillars.legal.score * weights.legal +
      pillars.access.score * weights.access +
      pillars.maintenance.score * weights.maintenance
    )
  }

  private static calculateContinuityScore(keepNexus: KeepNexusFile): number {
    let score = 50 // Base score

    // Drills add points
    const drillCount = keepNexus.drills?.history.length || 0
    score += Math.min(20, drillCount * 5)

    // Hardware wallets add points
    const hardwareWallets = keepNexus.setup.keys.filter(k => k.storage === 'hardware-wallet').length
    score += Math.min(20, hardwareWallets * 5)

    // Backup locations add points
    const backupCount = keepNexus.vault?.backupLocations?.length || 0
    score += Math.min(10, backupCount * 3)

    return Math.min(100, score)
  }

  private static determineDeadmanState(lastCheckin?: Date): 'ok' | 'due' | 'overdue' | 'triggered' {
    if (!lastCheckin) return 'due'

    const daysSince = Math.floor((Date.now() - lastCheckin.getTime()) / (1000 * 60 * 60 * 24))

    if (daysSince < 30) return 'ok'
    if (daysSince < 60) return 'due'
    if (daysSince < 90) return 'overdue'
    return 'triggered'
  }

  private static calculateHealthTrend(drillHistory: DrillRecord[]): 'improving' | 'stable' | 'declining' {
    if (drillHistory.length < 2) return 'stable'

    const recent = drillHistory.slice(-3)
    const passedCount = recent.filter(d => d.result === 'passed').length

    if (passedCount === recent.length) return 'improving'
    if (passedCount === 0) return 'declining'
    return 'stable'
  }
}

// ============================================================================
// CONVENIENCE EXPORTS
// ============================================================================

export const toShard = ShardAdapter.toShard.bind(ShardAdapter)
export const fromShard = ShardAdapter.fromShard.bind(ShardAdapter)
