/**
 * Proposals Service - Manage change proposals from professionals
 *
 * This service handles incoming proposals from professionals in KEEP SYS.
 * Proposals are encrypted and stored locally until reviewed by the hodler.
 */

import type { ExtendedShard } from './adapter'

// ============================================================================
// TYPES
// ============================================================================

export type ProposalStatus = 'pending' | 'approved' | 'rejected' | 'expired'
export type ProfessionalType = 'attorney' | 'cpa' | 'advisor'
export type RiskLevel = 'low' | 'medium' | 'high'

/**
 * Human-readable diff item
 */
export interface DiffItem {
  section: string // e.g., 'heirs', 'vault_policy', 'legal'
  field: string // e.g., 'allocation', 'quorum.required'
  change_type: 'added' | 'modified' | 'removed'
  old_value?: string | number | boolean
  new_value?: string | number | boolean
  description: string // Human-readable description
}

/**
 * Shard diff for review
 */
export interface ShardDiff {
  proposal_id: string
  from_version: string
  to_version: string
  from_hash: string
  to_hash: string
  changes: DiffItem[]
  summary: string
  risk_level: RiskLevel
}

/**
 * Proposal from a professional
 */
export interface Proposal {
  id: string
  share_token_id: string
  professional_email: string
  professional_type: ProfessionalType

  // Shard reference
  shard_id: string
  from_version: string
  to_version: string

  // Changes
  change_summary: string
  sections_changed: string[]
  diff: ShardDiff

  // Encrypted proposed shard (decrypted on view)
  encrypted_proposed_shard?: string
  proposed_shard?: ExtendedShard

  // Status
  status: ProposalStatus

  // Timestamps
  created_at: string
  expires_at: string
  reviewed_at?: string

  // Review
  review_notes?: string
}

// ============================================================================
// CONSTANTS
// ============================================================================

const PROPOSALS_STORAGE_KEY = 'keepnexus_proposals'

// High-risk sections that affect vault security
const HIGH_RISK_SECTIONS = ['vault_policy', 'thap_map', 'roles']
const MEDIUM_RISK_SECTIONS = ['heirs', 'legal', 'professionals']

// ============================================================================
// PROPOSALS SERVICE
// ============================================================================

export class ProposalsService {
  /**
   * Get all proposals
   */
  getProposals(): Proposal[] {
    if (typeof window === 'undefined') return []

    const stored = localStorage.getItem(PROPOSALS_STORAGE_KEY)
    if (!stored) return []

    const proposals: Proposal[] = JSON.parse(stored)

    // Update expired statuses
    const now = new Date()
    for (const proposal of proposals) {
      if (proposal.status === 'pending' && new Date(proposal.expires_at) < now) {
        proposal.status = 'expired'
      }
    }

    // Save updated statuses
    localStorage.setItem(PROPOSALS_STORAGE_KEY, JSON.stringify(proposals))

    return proposals
  }

  /**
   * Get pending proposals only
   */
  getPendingProposals(): Proposal[] {
    return this.getProposals().filter(p => p.status === 'pending')
  }

  /**
   * Get a single proposal by ID
   */
  getProposal(id: string): Proposal | undefined {
    return this.getProposals().find(p => p.id === id)
  }

  /**
   * Add a new proposal (from webhook or manual import)
   */
  addProposal(proposal: Omit<Proposal, 'id' | 'created_at'>): Proposal {
    const proposals = this.getProposals()

    const newProposal: Proposal = {
      ...proposal,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
    }

    proposals.push(newProposal)
    localStorage.setItem(PROPOSALS_STORAGE_KEY, JSON.stringify(proposals))

    return newProposal
  }

  /**
   * Approve a proposal
   */
  approveProposal(id: string, notes?: string): boolean {
    const proposals = this.getProposals()
    const proposal = proposals.find(p => p.id === id)

    if (!proposal || proposal.status !== 'pending') return false

    proposal.status = 'approved'
    proposal.reviewed_at = new Date().toISOString()
    proposal.review_notes = notes

    localStorage.setItem(PROPOSALS_STORAGE_KEY, JSON.stringify(proposals))
    return true
  }

  /**
   * Reject a proposal
   */
  rejectProposal(id: string, notes?: string): boolean {
    const proposals = this.getProposals()
    const proposal = proposals.find(p => p.id === id)

    if (!proposal || proposal.status !== 'pending') return false

    proposal.status = 'rejected'
    proposal.reviewed_at = new Date().toISOString()
    proposal.review_notes = notes

    localStorage.setItem(PROPOSALS_STORAGE_KEY, JSON.stringify(proposals))
    return true
  }

  /**
   * Clear all proposals
   */
  clearAllProposals(): void {
    localStorage.removeItem(PROPOSALS_STORAGE_KEY)
  }

  /**
   * Calculate risk level from sections changed
   */
  calculateRiskLevel(sectionsChanged: string[]): RiskLevel {
    if (sectionsChanged.some(s => HIGH_RISK_SECTIONS.includes(s))) {
      return 'high'
    }
    if (sectionsChanged.some(s => MEDIUM_RISK_SECTIONS.includes(s))) {
      return 'medium'
    }
    return 'low'
  }

  /**
   * Generate human-readable change description
   */
  describeChange(diff: DiffItem): string {
    switch (diff.change_type) {
      case 'added':
        return `Added ${diff.field} in ${diff.section}: ${diff.new_value}`
      case 'removed':
        return `Removed ${diff.field} from ${diff.section}`
      case 'modified':
        return `Changed ${diff.field} in ${diff.section}: ${diff.old_value} → ${diff.new_value}`
      default:
        return diff.description
    }
  }

  // ==========================================================================
  // MOCK DATA (for testing - remove in production)
  // ==========================================================================

  /**
   * Add mock proposals for testing the inbox UI
   */
  addMockProposals(): void {
    const mockProposals: Omit<Proposal, 'id' | 'created_at'>[] = [
      {
        share_token_id: 'token-1',
        professional_email: 'attorney@lawfirm.com',
        professional_type: 'attorney',
        shard_id: 'shard-001',
        from_version: '1.0.0',
        to_version: '1.1.0',
        change_summary: 'Updated trust documentation and added RUFADAA compliance provisions',
        sections_changed: ['legal', 'heirs'],
        diff: {
          proposal_id: 'mock-1',
          from_version: '1.0.0',
          to_version: '1.1.0',
          from_hash: 'abc123',
          to_hash: 'def456',
          summary: 'Legal document updates for RUFADAA compliance',
          risk_level: 'medium',
          changes: [
            {
              section: 'legal',
              field: 'rufadaa_compliant',
              change_type: 'modified',
              old_value: false,
              new_value: true,
              description: 'RUFADAA compliance flag: false → true'
            },
            {
              section: 'legal',
              field: 'documents',
              change_type: 'added',
              new_value: 'Digital Asset Addendum v2',
              description: 'Added new document: Digital Asset Addendum v2'
            },
            {
              section: 'heirs',
              field: 'emma.allocation',
              change_type: 'modified',
              old_value: '60%',
              new_value: '55%',
              description: "Emma's allocation: 60% → 55%"
            },
            {
              section: 'heirs',
              field: 'liam.allocation',
              change_type: 'modified',
              old_value: '40%',
              new_value: '45%',
              description: "Liam's allocation: 40% → 45%"
            }
          ]
        },
        status: 'pending',
        expires_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        share_token_id: 'token-2',
        professional_email: 'cpa@taxfirm.com',
        professional_type: 'cpa',
        shard_id: 'shard-001',
        from_version: '1.1.0',
        to_version: '1.2.0',
        change_summary: 'Added professional network contacts for tax planning coordination',
        sections_changed: ['professionals'],
        diff: {
          proposal_id: 'mock-2',
          from_version: '1.1.0',
          to_version: '1.2.0',
          from_hash: 'def456',
          to_hash: 'ghi789',
          summary: 'Professional network updates',
          risk_level: 'low',
          changes: [
            {
              section: 'professionals',
              field: 'cpa',
              change_type: 'added',
              new_value: 'Sarah Miller, CPA',
              description: 'Added CPA: Sarah Miller, CPA (Miller Tax Advisory)'
            }
          ]
        },
        status: 'pending',
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        share_token_id: 'token-3',
        professional_email: 'advisor@wealthmgmt.com',
        professional_type: 'advisor',
        shard_id: 'shard-001',
        from_version: '1.2.0',
        to_version: '1.3.0',
        change_summary: 'Updated vault policy to require 3-of-5 quorum and modified THAP triggers',
        sections_changed: ['vault_policy', 'thap_map'],
        diff: {
          proposal_id: 'mock-3',
          from_version: '1.2.0',
          to_version: '1.3.0',
          from_hash: 'ghi789',
          to_hash: 'jkl012',
          summary: 'Critical vault security changes',
          risk_level: 'high',
          changes: [
            {
              section: 'vault_policy',
              field: 'quorum.required',
              change_type: 'modified',
              old_value: 2,
              new_value: 3,
              description: 'Quorum requirement: 2-of-4 → 3-of-5'
            },
            {
              section: 'vault_policy',
              field: 'quorum.total',
              change_type: 'modified',
              old_value: 4,
              new_value: 5,
              description: 'Total signers: 4 → 5'
            },
            {
              section: 'thap_map',
              field: 'trigger.inactivity_days',
              change_type: 'modified',
              old_value: 90,
              new_value: 60,
              description: 'THAP trigger period: 90 days → 60 days'
            }
          ]
        },
        status: 'pending',
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      }
    ]

    // Clear and add mock proposals
    this.clearAllProposals()
    for (const proposal of mockProposals) {
      this.addProposal(proposal)
    }
  }
}

// ============================================================================
// SINGLETON
// ============================================================================

export const proposalsService = new ProposalsService()
