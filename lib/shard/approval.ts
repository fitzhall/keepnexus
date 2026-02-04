/**
 * Shard Approval Service - Handle proposal approvals/rejections in Keep Nexus
 *
 * This service manages the approval workflow for proposals submitted by professionals
 * via KEEP SYS. When a hodler approves a proposal, the changes are merged into
 * their local shard with proper versioning and checkpoint creation.
 *
 * Flow:
 * 1. Professional submits proposal via KEEP SYS → stored in shard_proposals table
 * 2. Hodler sees proposal in Keep Nexus inbox (polling or notification)
 * 3. Hodler reviews diff and approves/rejects
 * 4. On approval: merge changes → increment version → create checkpoint
 * 5. Updated shard reflected in next share to professionals
 */

import type { KeepNexusFile } from '../risk-simulator/file-export'
import type { ExtendedShard, CheckpointAnchor, Shard as _Shard, CanonicalState, OperationalState as _OperationalState } from './adapter'
import { ShardAdapter, SHARD_VERSION as _SHARD_VERSION } from './adapter'

// ============================================================================
// TYPES
// ============================================================================

export type ProposalStatus = 'pending' | 'approved' | 'rejected' | 'expired' | 'withdrawn'

/**
 * Inbound proposal from KEEP SYS (professional-submitted changes)
 */
export interface InboundProposal {
  proposal_id: string
  professional_email: string
  professional_type: 'attorney' | 'cpa' | 'advisor'

  // Proposed changes (decrypted on client-side)
  proposed_shard: ExtendedShard

  // Change metadata
  change_summary: string
  sections_changed: string[]

  // Calculated locally
  diff?: DiffItem[]
  risk_level?: 'low' | 'medium' | 'high'

  // Status
  status: ProposalStatus
  created_at: string
  expires_at: string
  reviewed_at?: string
  review_notes?: string
}

/**
 * Diff item representing a single change
 */
export interface DiffItem {
  section: string
  field: string
  change_type: 'added' | 'modified' | 'removed'
  old_value?: string | number | boolean | null
  new_value?: string | number | boolean | null
  description: string
}

/**
 * Result of an approval operation
 */
export interface ApprovalResult {
  success: boolean
  new_version?: string
  checkpoint?: CheckpointAnchor
  error?: string
}

/**
 * Result of a rejection operation
 */
export interface RejectionResult {
  success: boolean
  error?: string
}

/**
 * Stored proposals in local storage
 */
interface StoredProposals {
  proposals: InboundProposal[]
  last_polled_at?: string
}

// ============================================================================
// CONSTANTS
// ============================================================================

const PROPOSALS_STORAGE_KEY = 'keepnexus_proposals'
const SHARD_STORAGE_KEY = 'keepnexus_current_shard'
const KEEPNEXUS_FILE_STORAGE_KEY = 'keepnexus_file_data'

// High-risk sections that require extra confirmation
const HIGH_RISK_SECTIONS = ['vault_policy', 'thap_map', 'roles']
const MEDIUM_RISK_SECTIONS = ['heirs', 'legal', 'professionals']

// ============================================================================
// APPROVAL SERVICE
// ============================================================================

export class ApprovalService {
  /**
   * Get all pending proposals from local storage
   */
  getProposals(): InboundProposal[] {
    const stored = localStorage.getItem(PROPOSALS_STORAGE_KEY)
    if (!stored) return []

    const data: StoredProposals = JSON.parse(stored)

    // Filter out expired proposals
    const now = new Date()
    return data.proposals.filter(p => {
      if (p.status === 'pending' && new Date(p.expires_at) < now) {
        p.status = 'expired'
      }
      return p.status === 'pending'
    })
  }

  /**
   * Get proposal history (approved/rejected)
   */
  getProposalHistory(): InboundProposal[] {
    const stored = localStorage.getItem(PROPOSALS_STORAGE_KEY)
    if (!stored) return []

    const data: StoredProposals = JSON.parse(stored)
    return data.proposals.filter(p => p.status !== 'pending')
  }

  /**
   * Add a new proposal (called when polling KEEP SYS or receiving notification)
   */
  addProposal(proposal: InboundProposal): void {
    const stored = localStorage.getItem(PROPOSALS_STORAGE_KEY)
    const data: StoredProposals = stored
      ? JSON.parse(stored)
      : { proposals: [] }

    // Check for duplicates
    if (!data.proposals.find(p => p.proposal_id === proposal.proposal_id)) {
      // Calculate diff if current shard exists
      const currentShard = this.getCurrentShard()
      if (currentShard && proposal.proposed_shard) {
        proposal.diff = this.calculateDiff(currentShard, proposal.proposed_shard)
        proposal.risk_level = this.calculateRiskLevel(proposal.sections_changed)
      }

      data.proposals.push(proposal)
      localStorage.setItem(PROPOSALS_STORAGE_KEY, JSON.stringify(data))
    }
  }

  /**
   * Approve a proposal - merge changes into local shard
   */
  async approveProposal(
    proposalId: string,
    reviewNotes?: string
  ): Promise<ApprovalResult> {
    const stored = localStorage.getItem(PROPOSALS_STORAGE_KEY)
    if (!stored) {
      return { success: false, error: 'No proposals found' }
    }

    const data: StoredProposals = JSON.parse(stored)
    const proposal = data.proposals.find(p => p.proposal_id === proposalId)

    if (!proposal) {
      return { success: false, error: 'Proposal not found' }
    }

    if (proposal.status !== 'pending') {
      return { success: false, error: `Proposal already ${proposal.status}` }
    }

    // Get current shard
    const currentShard = this.getCurrentShard()
    if (!currentShard) {
      return { success: false, error: 'No current shard found' }
    }

    try {
      // Merge the proposed changes
      const mergedShard = this.mergeShards(currentShard, proposal.proposed_shard)

      // Increment version
      const newVersion = this.incrementVersion(currentShard.shard_version)
      mergedShard.shard_version = newVersion

      // Create checkpoint
      const checkpoint = this.createCheckpoint(
        mergedShard,
        currentShard.canonical_state.canonical_hash,
        proposal
      )

      // Add checkpoint to history
      mergedShard.canonical_state.checkpoint_history.push(checkpoint)

      // Recalculate canonical hash
      mergedShard.canonical_state.canonical_hash = await this.calculateCanonicalHash(
        mergedShard.canonical_state
      )
      mergedShard.canonical_state.updated_at = new Date().toISOString()

      // Save merged shard
      this.saveCurrentShard(mergedShard)

      // Update KeepNexus file if it exists
      this.updateKeepNexusFile(mergedShard)

      // Update proposal status
      proposal.status = 'approved'
      proposal.reviewed_at = new Date().toISOString()
      proposal.review_notes = reviewNotes
      localStorage.setItem(PROPOSALS_STORAGE_KEY, JSON.stringify(data))

      return {
        success: true,
        new_version: newVersion,
        checkpoint,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error during approval',
      }
    }
  }

  /**
   * Reject a proposal
   */
  rejectProposal(proposalId: string, reviewNotes?: string): RejectionResult {
    const stored = localStorage.getItem(PROPOSALS_STORAGE_KEY)
    if (!stored) {
      return { success: false, error: 'No proposals found' }
    }

    const data: StoredProposals = JSON.parse(stored)
    const proposal = data.proposals.find(p => p.proposal_id === proposalId)

    if (!proposal) {
      return { success: false, error: 'Proposal not found' }
    }

    if (proposal.status !== 'pending') {
      return { success: false, error: `Proposal already ${proposal.status}` }
    }

    proposal.status = 'rejected'
    proposal.reviewed_at = new Date().toISOString()
    proposal.review_notes = reviewNotes
    localStorage.setItem(PROPOSALS_STORAGE_KEY, JSON.stringify(data))

    return { success: true }
  }

  /**
   * Get current shard from local storage
   */
  getCurrentShard(): ExtendedShard | null {
    const stored = localStorage.getItem(SHARD_STORAGE_KEY)
    if (!stored) return null
    return JSON.parse(stored)
  }

  /**
   * Save current shard to local storage
   */
  saveCurrentShard(shard: ExtendedShard): void {
    localStorage.setItem(SHARD_STORAGE_KEY, JSON.stringify(shard))
  }

  /**
   * Initialize shard from KeepNexusFile (called on app load)
   */
  initializeFromKeepNexusFile(file: KeepNexusFile): ExtendedShard {
    const shard = ShardAdapter.toShard(file)
    this.saveCurrentShard(shard)
    return shard
  }

  /**
   * Clear all proposals
   */
  clearProposals(): void {
    localStorage.removeItem(PROPOSALS_STORAGE_KEY)
  }

  // ==========================================================================
  // DIFF CALCULATION
  // ==========================================================================

  /**
   * Calculate diff between current and proposed shard
   */
  calculateDiff(current: ExtendedShard, proposed: ExtendedShard): DiffItem[] {
    const diffs: DiffItem[] = []

    // Compare heirs
    this.diffHeirs(current, proposed, diffs)

    // Compare vault policy
    this.diffVaultPolicy(current, proposed, diffs)

    // Compare legal
    this.diffLegal(current, proposed, diffs)

    // Compare roles
    this.diffRoles(current, proposed, diffs)

    // Compare policies
    this.diffPolicies(current, proposed, diffs)

    // Compare professionals
    this.diffProfessionals(current, proposed, diffs)

    return diffs
  }

  private diffHeirs(current: ExtendedShard, proposed: ExtendedShard, diffs: DiffItem[]): void {
    const currentHeirs = current.canonical_state.heirs || []
    const proposedHeirs = proposed.canonical_state.heirs || []

    // Check for modified/removed heirs
    for (const currentHeir of currentHeirs) {
      const proposedHeir = proposedHeirs.find(h => h.name === currentHeir.name)

      if (!proposedHeir) {
        diffs.push({
          section: 'heirs',
          field: currentHeir.name,
          change_type: 'removed',
          old_value: `${currentHeir.allocation || 0}%`,
          description: `Removed heir: ${currentHeir.name}`,
        })
      } else if (proposedHeir.allocation !== currentHeir.allocation) {
        diffs.push({
          section: 'heirs',
          field: `${currentHeir.name}.allocation`,
          change_type: 'modified',
          old_value: `${currentHeir.allocation || 0}%`,
          new_value: `${proposedHeir.allocation || 0}%`,
          description: `${currentHeir.name}'s allocation: ${currentHeir.allocation || 0}% → ${proposedHeir.allocation || 0}%`,
        })
      }
    }

    // Check for added heirs
    for (const proposedHeir of proposedHeirs) {
      const currentHeir = currentHeirs.find(h => h.name === proposedHeir.name)
      if (!currentHeir) {
        diffs.push({
          section: 'heirs',
          field: proposedHeir.name,
          change_type: 'added',
          new_value: `${proposedHeir.allocation || 0}%`,
          description: `Added heir: ${proposedHeir.name} (${proposedHeir.allocation || 0}%)`,
        })
      }
    }
  }

  private diffVaultPolicy(current: ExtendedShard, proposed: ExtendedShard, diffs: DiffItem[]): void {
    const cv = current.canonical_state.vault_policy
    const pv = proposed.canonical_state.vault_policy

    if (cv.quorum.required !== pv.quorum.required) {
      diffs.push({
        section: 'vault_policy',
        field: 'quorum.required',
        change_type: 'modified',
        old_value: cv.quorum.required,
        new_value: pv.quorum.required,
        description: `Quorum requirement: ${cv.quorum.required} → ${pv.quorum.required}`,
      })
    }

    if (cv.quorum.total !== pv.quorum.total) {
      diffs.push({
        section: 'vault_policy',
        field: 'quorum.total',
        change_type: 'modified',
        old_value: cv.quorum.total,
        new_value: pv.quorum.total,
        description: `Total keys: ${cv.quorum.total} → ${pv.quorum.total}`,
      })
    }

    if (cv.platform !== pv.platform) {
      diffs.push({
        section: 'vault_policy',
        field: 'platform',
        change_type: 'modified',
        old_value: cv.platform,
        new_value: pv.platform,
        description: `Vault platform: ${cv.platform} → ${pv.platform}`,
      })
    }
  }

  private diffLegal(current: ExtendedShard, proposed: ExtendedShard, diffs: DiffItem[]): void {
    const cl = current.canonical_state.legal
    const pl = proposed.canonical_state.legal

    if (cl.jurisdiction !== pl.jurisdiction) {
      diffs.push({
        section: 'legal',
        field: 'jurisdiction',
        change_type: 'modified',
        old_value: cl.jurisdiction,
        new_value: pl.jurisdiction,
        description: `Jurisdiction: ${cl.jurisdiction} → ${pl.jurisdiction}`,
      })
    }

    if (cl.trust_present !== pl.trust_present) {
      diffs.push({
        section: 'legal',
        field: 'trust_present',
        change_type: 'modified',
        old_value: cl.trust_present,
        new_value: pl.trust_present,
        description: `Trust: ${cl.trust_present ? 'Present' : 'None'} → ${pl.trust_present ? 'Present' : 'None'}`,
      })
    }

    if (cl.rufadaa_compliant !== pl.rufadaa_compliant) {
      diffs.push({
        section: 'legal',
        field: 'rufadaa_compliant',
        change_type: 'modified',
        old_value: cl.rufadaa_compliant,
        new_value: pl.rufadaa_compliant,
        description: `RUFADAA compliant: ${cl.rufadaa_compliant} → ${pl.rufadaa_compliant}`,
      })
    }
  }

  private diffRoles(current: ExtendedShard, proposed: ExtendedShard, diffs: DiffItem[]): void {
    const currentRoles = current.canonical_state.roles
    const proposedRoles = proposed.canonical_state.roles

    // Check for removed/modified roles
    for (const role of currentRoles) {
      const proposedRole = proposedRoles.find(r => r.role_id === role.role_id)

      if (!proposedRole) {
        diffs.push({
          section: 'roles',
          field: role.display_name,
          change_type: 'removed',
          description: `Removed role: ${role.display_name} (${role.role_type})`,
        })
      } else if (proposedRole.role_type !== role.role_type) {
        diffs.push({
          section: 'roles',
          field: `${role.display_name}.type`,
          change_type: 'modified',
          old_value: role.role_type,
          new_value: proposedRole.role_type,
          description: `${role.display_name}'s role: ${role.role_type} → ${proposedRole.role_type}`,
        })
      }
    }

    // Check for added roles
    for (const role of proposedRoles) {
      if (!currentRoles.find(r => r.role_id === role.role_id)) {
        diffs.push({
          section: 'roles',
          field: role.display_name,
          change_type: 'added',
          new_value: role.role_type,
          description: `Added role: ${role.display_name} (${role.role_type})`,
        })
      }
    }
  }

  private diffPolicies(current: ExtendedShard, proposed: ExtendedShard, diffs: DiffItem[]): void {
    const cp = current.canonical_state.policies
    const pp = proposed.canonical_state.policies

    if (cp.checkin.freq !== pp.checkin.freq) {
      diffs.push({
        section: 'policies',
        field: 'checkin.freq',
        change_type: 'modified',
        old_value: cp.checkin.freq,
        new_value: pp.checkin.freq,
        description: `Check-in frequency: ${cp.checkin.freq} → ${pp.checkin.freq}`,
      })
    }

    if (cp.checkin.grace_days !== pp.checkin.grace_days) {
      diffs.push({
        section: 'policies',
        field: 'checkin.grace_days',
        change_type: 'modified',
        old_value: cp.checkin.grace_days,
        new_value: pp.checkin.grace_days,
        description: `Grace period: ${cp.checkin.grace_days} → ${pp.checkin.grace_days} days`,
      })
    }

    if (cp.escalation.overdue_days_to_trigger !== pp.escalation.overdue_days_to_trigger) {
      diffs.push({
        section: 'policies',
        field: 'escalation.overdue_days',
        change_type: 'modified',
        old_value: cp.escalation.overdue_days_to_trigger,
        new_value: pp.escalation.overdue_days_to_trigger,
        description: `Escalation trigger: ${cp.escalation.overdue_days_to_trigger} → ${pp.escalation.overdue_days_to_trigger} days overdue`,
      })
    }
  }

  private diffProfessionals(current: ExtendedShard, proposed: ExtendedShard, diffs: DiffItem[]): void {
    const cp = current.canonical_state.professionals
    const pp = proposed.canonical_state.professionals

    const roles = ['attorney', 'cpa', 'advisor'] as const
    for (const role of roles) {
      const curr = cp[role]
      const prop = pp[role]

      if (!curr && prop) {
        diffs.push({
          section: 'professionals',
          field: role,
          change_type: 'added',
          new_value: prop.name,
          description: `Added ${role}: ${prop.name} (${prop.firm})`,
        })
      } else if (curr && !prop) {
        diffs.push({
          section: 'professionals',
          field: role,
          change_type: 'removed',
          old_value: curr.name,
          description: `Removed ${role}: ${curr.name}`,
        })
      } else if (curr && prop && curr.name !== prop.name) {
        diffs.push({
          section: 'professionals',
          field: role,
          change_type: 'modified',
          old_value: curr.name,
          new_value: prop.name,
          description: `${role}: ${curr.name} → ${prop.name}`,
        })
      }
    }
  }

  /**
   * Calculate risk level based on sections changed
   */
  calculateRiskLevel(sectionsChanged: string[]): 'low' | 'medium' | 'high' {
    if (sectionsChanged.some(s => HIGH_RISK_SECTIONS.includes(s))) {
      return 'high'
    }
    if (sectionsChanged.some(s => MEDIUM_RISK_SECTIONS.includes(s))) {
      return 'medium'
    }
    return 'low'
  }

  // ==========================================================================
  // MERGE LOGIC
  // ==========================================================================

  /**
   * Merge proposed shard changes into current shard
   */
  private mergeShards(current: ExtendedShard, proposed: ExtendedShard): ExtendedShard {
    // Deep clone current
    const merged: ExtendedShard = JSON.parse(JSON.stringify(current))

    // Merge canonical state sections
    const mc = merged.canonical_state
    const pc = proposed.canonical_state

    // Merge heirs
    mc.heirs = [...pc.heirs]

    // Merge vault policy (only certain fields)
    mc.vault_policy = { ...mc.vault_policy, ...pc.vault_policy }

    // Merge legal
    mc.legal = { ...mc.legal, ...pc.legal }

    // Merge roles
    mc.roles = [...pc.roles]

    // Merge policies
    mc.policies = { ...mc.policies, ...pc.policies }

    // Merge professionals
    mc.professionals = { ...mc.professionals, ...pc.professionals }

    // Merge THAP map
    mc.thap_map = { ...mc.thap_map, ...pc.thap_map }

    // Preserve Keep Nexus extension data
    if (current._keepnexus_extension) {
      merged._keepnexus_extension = { ...current._keepnexus_extension }
    }

    return merged
  }

  // ==========================================================================
  // VERSION & CHECKPOINT
  // ==========================================================================

  /**
   * Increment shard version
   */
  private incrementVersion(currentVersion: string): string {
    const version = parseInt(currentVersion, 10) || 0
    return String(version + 1)
  }

  /**
   * Create a checkpoint anchor for the approval
   */
  private createCheckpoint(
    shard: ExtendedShard,
    priorHash: string,
    _proposal: InboundProposal
  ): CheckpointAnchor {
    return {
      ts: new Date().toISOString(),
      version: shard.shard_version,
      canonical_hash: '', // Will be calculated
      reason: 'scheduled' as const, // Proposal approval is treated as a scheduled update
      approved_by: {
        actor_id: 'hodler',
        role_type: 'holder' as const,
      },
      prior_hash: priorHash,
    }
  }

  /**
   * Calculate canonical hash for a state
   */
  private async calculateCanonicalHash(state: CanonicalState): Promise<string> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { canonical_hash: _, ...stateCopy } = state
    const content = JSON.stringify(stateCopy, Object.keys(stateCopy).sort())

    // Use Web Crypto API for proper SHA-256
    const encoder = new TextEncoder()
    const data = encoder.encode(content)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }

  // ==========================================================================
  // KEEPNEXUS FILE SYNC
  // ==========================================================================

  /**
   * Update KeepNexusFile in local storage after approval
   */
  private updateKeepNexusFile(shard: ExtendedShard): void {
    const storedFile = localStorage.getItem(KEEPNEXUS_FILE_STORAGE_KEY)
    if (!storedFile) return

    try {
      const file: KeepNexusFile = JSON.parse(storedFile)

      // Convert shard back to KeepNexusFile format
      const updatedFile = ShardAdapter.fromShard(shard)

      // Preserve existing audit trail and merge
      updatedFile.auditTrail = [
        ...file.auditTrail,
        {
          timestamp: new Date(),
          action: 'proposal_approved',
          details: `Approved professional proposal. New version: ${shard.shard_version}`,
        },
      ]

      localStorage.setItem(KEEPNEXUS_FILE_STORAGE_KEY, JSON.stringify(updatedFile))
    } catch (error) {
      console.error('Failed to update KeepNexusFile:', error)
    }
  }
}

// ============================================================================
// SINGLETON
// ============================================================================

export const approvalService = new ApprovalService()

// ============================================================================
// POLLING UTILITIES
// ============================================================================

/**
 * Mock function to poll for proposals from KEEP SYS
 * In production, this would call the KEEP SYS API
 */
export async function pollForProposals(
  _shardId: string,
  _shareTokenHash: string
): Promise<InboundProposal[]> {
  // TODO: Implement actual API call to KEEP SYS
  // For now, return empty array - proposals are added manually or via webhook
  return []
}

/**
 * Format a proposal for display
 */
export function formatProposalSummary(proposal: InboundProposal): string {
  const riskEmoji = {
    low: '🟢',
    medium: '🟡',
    high: '🔴',
  }

  return `${riskEmoji[proposal.risk_level || 'low']} ${proposal.change_summary || 'Changes proposed'}`
}

/**
 * Get human-readable time since creation
 */
export function getProposalAge(createdAt: string): string {
  const created = new Date(createdAt)
  const now = new Date()
  const diffMs = now.getTime() - created.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))

  if (diffDays > 0) {
    return `${diffDays}d ago`
  }
  if (diffHours > 0) {
    return `${diffHours}h ago`
  }
  return 'Just now'
}
