// Simple multisig management - keeping it minimal for MVP

export interface Signer {
  name: string
  email?: string
  hasApproved?: boolean
}

export interface MultisigConfig {
  type: '2-of-3' | '3-of-3' | '3-of-5'
  signers: Signer[]
  isActive: boolean
}

export interface PendingApproval {
  id: string
  description: string
  amount?: number // in sats
  requiredSigners: number
  currentSigners: number
  status: 'pending' | 'approved' | 'rejected'
}

export class MultisigService {
  private config: MultisigConfig = {
    type: '2-of-3',
    isActive: false,
    signers: []
  }

  private pendingApprovals: PendingApproval[] = []

  // Setup a basic 2-of-3 multisig (mock for MVP)
  async setupMultisig(signers: Signer[]): Promise<MultisigConfig> {
    // Validate input
    if (!signers || signers.length < 2) {
      throw new Error('At least 2 signers required for multisig setup')
    }

    if (signers.length > 5) {
      throw new Error('Maximum 5 signers allowed for multisig')
    }

    // Simulate setup delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Simulate random failure (10% chance) for testing
    if (Math.random() < 0.1) {
      throw new Error('Failed to connect to Bitcoin network. Please try again.')
    }

    this.config = {
      type: '2-of-3',
      isActive: true,
      signers: signers.slice(0, 3) // Limit to 3 for 2-of-3
    }

    // Add a mock pending approval
    this.pendingApprovals = [
      {
        id: '1',
        description: 'Monthly inheritance drill',
        requiredSigners: 2,
        currentSigners: 1,
        status: 'pending'
      }
    ]

    return this.config
  }

  getConfig(): MultisigConfig {
    return this.config
  }

  getPendingApprovals(): PendingApproval[] {
    // Return a new array copy to trigger React re-renders
    return [...this.pendingApprovals]
  }

  // Approve a pending transaction
  async approve(approvalId: string): Promise<void> {
    // Validate approval exists
    const approval = this.pendingApprovals.find(a => a.id === approvalId)
    if (!approval) {
      throw new Error('Approval request not found')
    }

    if (approval.status !== 'pending') {
      throw new Error('This approval has already been processed')
    }

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 500))

    // Simulate random failure (5% chance) for testing
    if (Math.random() < 0.05) {
      throw new Error('Network error. Please try again.')
    }

    // Create a new array to trigger React re-render
    this.pendingApprovals = this.pendingApprovals.map(approval => {
      if (approval.id === approvalId) {
        const updatedApproval = { ...approval }
        updatedApproval.currentSigners++
        if (updatedApproval.currentSigners >= updatedApproval.requiredSigners) {
          updatedApproval.status = 'approved'
        }
        return updatedApproval
      }
      return approval
    })
  }

  // Get default signers for quick setup
  getDefaultSigners(): Signer[] {
    return [
      { name: 'You', email: 'owner@example.com', hasApproved: true },
      { name: 'Trusted Friend', email: 'friend@example.com' },
      { name: 'Family Member', email: 'family@example.com' }
    ]
  }
}

export const multisigService = new MultisigService()