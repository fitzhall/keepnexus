// Security Score Calculation
// Calculates threat score based on various security factors

import { walletService } from '@/lib/bitcoin/wallet'
import { multisigService } from '@/lib/bitcoin/multisig'
import { shamirService } from '@/lib/bitcoin/shamir'

export interface SecurityFactor {
  name: string
  status: 'good' | 'warning' | 'critical'
  weight: number // 1-5, how important this factor is
  message: string
}

export interface SecurityScore {
  threatScore: number // 0-100, 0 is best
  factors: SecurityFactor[]
  overallStatus: 'secure' | 'attention' | 'critical'
}

export class SecurityScoreService {
  private lastRotationDate: Date = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days ago default
  private heirTrainingStatus: 'good' | 'warning' | 'critical' = 'good'
  private documentReviewStatus: 'good' | 'warning' | 'critical' = 'warning'
  private backupStatus: 'good' | 'warning' | 'critical' = 'good'

  // Set test states for demonstration
  setTestStates(states: {
    daysSinceRotation?: number
    heirTraining?: 'good' | 'warning' | 'critical'
    documentReview?: 'good' | 'warning' | 'critical'
    backupStatus?: 'good' | 'warning' | 'critical'
  }) {
    if (states.daysSinceRotation !== undefined) {
      this.lastRotationDate = new Date(Date.now() - states.daysSinceRotation * 24 * 60 * 60 * 1000)
    }
    if (states.heirTraining) {
      this.heirTrainingStatus = states.heirTraining
    }
    if (states.documentReview) {
      this.documentReviewStatus = states.documentReview
    }
    if (states.backupStatus) {
      this.backupStatus = states.backupStatus
    }
  }

  // Calculate overall security score
  calculateScore(): SecurityScore {
    const factors: SecurityFactor[] = []

    // Check wallet connection
    const wallet = walletService.getStatus()
    if (!wallet.connected) {
      factors.push({
        name: 'Wallet Connection',
        status: 'warning',
        weight: 3,
        message: 'No wallet connected'
      })
    } else {
      factors.push({
        name: 'Wallet Connection',
        status: 'good',
        weight: 3,
        message: 'Wallet connected securely'
      })
    }

    // Check multisig setup
    const multisig = multisigService.getConfig()
    if (!multisig || !multisig.isActive) {
      factors.push({
        name: 'Multisig Protection',
        status: 'critical',
        weight: 5,
        message: 'No multisig protection'
      })
    } else {
      const pending = multisigService.getPendingApprovals()
      if (pending.filter(p => p.status === 'pending').length > 0) {
        factors.push({
          name: 'Multisig Protection',
          status: 'warning',
          weight: 5,
          message: 'Pending approvals need attention'
        })
      } else {
        factors.push({
          name: 'Multisig Protection',
          status: 'good',
          weight: 5,
          message: '2-of-3 multisig active'
        })
      }
    }

    // Check Shamir shares
    const shamir = shamirService.getConfig()
    if (!shamir) {
      factors.push({
        name: 'Key Recovery',
        status: 'warning',
        weight: 4,
        message: 'No Shamir shares created'
      })
    } else {
      const pending = shamir.shares.filter(s => s.status === 'pending').length
      if (pending > 0) {
        factors.push({
          name: 'Key Recovery',
          status: 'warning',
          weight: 4,
          message: `${pending} shares not distributed`
        })
      } else {
        factors.push({
          name: 'Key Recovery',
          status: 'good',
          weight: 4,
          message: `${shamir.threshold}-of-${shamir.totalShares} Shamir active`
        })
      }
    }

    // Check key rotation
    const daysSinceRotation = Math.floor((Date.now() - this.lastRotationDate.getTime()) / (1000 * 60 * 60 * 24))
    if (daysSinceRotation > 90) {
      factors.push({
        name: 'Key Rotation',
        status: 'critical',
        weight: 3,
        message: `Overdue for key rotation (${daysSinceRotation} days)`
      })
    } else if (daysSinceRotation > 60) {
      factors.push({
        name: 'Key Rotation',
        status: 'warning',
        weight: 3,
        message: `Key rotation due soon (${daysSinceRotation} days)`
      })
    } else {
      factors.push({
        name: 'Key Rotation',
        status: 'good',
        weight: 3,
        message: `Keys recently rotated (${daysSinceRotation} days ago)`
      })
    }

    // Check heir training
    const heirMessages = {
      good: 'All heirs trained',
      warning: 'Heir training needs update',
      critical: 'Heirs not trained'
    }
    factors.push({
      name: 'Heir Preparedness',
      status: this.heirTrainingStatus,
      weight: 2,
      message: heirMessages[this.heirTrainingStatus]
    })

    // Check legal documents
    const docMessages = {
      good: 'Documents up to date',
      warning: 'Annual review needed',
      critical: 'Documents outdated'
    }
    factors.push({
      name: 'Legal Documents',
      status: this.documentReviewStatus,
      weight: 2,
      message: docMessages[this.documentReviewStatus]
    })

    // Check backups
    const backupMessages = {
      good: 'Backups current',
      warning: 'Backup verification needed',
      critical: 'No recent backups'
    }
    factors.push({
      name: 'Backup Status',
      status: this.backupStatus,
      weight: 3,
      message: backupMessages[this.backupStatus]
    })

    // Calculate threat score
    const threatScore = this.calculateThreatScore(factors)

    // Determine overall status
    let overallStatus: 'secure' | 'attention' | 'critical' = 'secure'
    if (threatScore > 50) {
      overallStatus = 'critical'
    } else if (threatScore > 20) {
      overallStatus = 'attention'
    }

    return {
      threatScore,
      factors,
      overallStatus
    }
  }

  private calculateThreatScore(factors: SecurityFactor[]): number {
    let totalWeight = 0
    let weightedScore = 0

    factors.forEach(factor => {
      totalWeight += factor.weight

      let factorScore = 0
      if (factor.status === 'warning') {
        factorScore = 50
      } else if (factor.status === 'critical') {
        factorScore = 100
      }

      weightedScore += factorScore * factor.weight
    })

    // Return 0-100 score, 0 being best
    return Math.round(weightedScore / totalWeight)
  }

  // Get actionable recommendations
  getRecommendations(): string[] {
    const score = this.calculateScore()
    const recommendations: string[] = []

    score.factors.forEach(factor => {
      if (factor.status !== 'good') {
        recommendations.push(factor.message)
      }
    })

    return recommendations
  }
}

export const securityScoreService = new SecurityScoreService()