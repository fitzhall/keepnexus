'use client'

/**
 * Approval Inbox - Review and manage change proposals from professionals
 *
 * Displays pending proposals with human-readable diffs.
 * Allows hodlers to approve or reject changes with review notes.
 */

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  proposalsService,
  type Proposal,
  type DiffItem,
  type RiskLevel,
} from '@/lib/shard/proposals'
import {
  ArrowLeft,
  Inbox,
  Check,
  X,
  AlertTriangle,
  AlertCircle,
  Clock,
  Scale,
  Calculator,
  Briefcase,
  ChevronDown,
  ChevronRight,
  Plus,
  Minus,
  Edit3,
  Shield,
  FileText,
  RefreshCw,
} from 'lucide-react'

// ============================================================================
// CONSTANTS
// ============================================================================

const PROFESSIONAL_ICONS = {
  attorney: Scale,
  cpa: Calculator,
  advisor: Briefcase,
}

const PROFESSIONAL_LABELS = {
  attorney: 'Attorney',
  cpa: 'CPA',
  advisor: 'Financial Advisor',
}

const RISK_STYLES: Record<RiskLevel, { bg: string; text: string; icon: typeof AlertCircle }> = {
  low: { bg: 'bg-green-100', text: 'text-green-800', icon: Check },
  medium: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: AlertCircle },
  high: { bg: 'bg-red-100', text: 'text-red-800', icon: AlertTriangle },
}

const CHANGE_TYPE_ICONS = {
  added: Plus,
  modified: Edit3,
  removed: Minus,
}

const CHANGE_TYPE_STYLES = {
  added: 'bg-green-50 border-green-200 text-green-700',
  modified: 'bg-blue-50 border-blue-200 text-blue-700',
  removed: 'bg-red-50 border-red-200 text-red-700',
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function InboxPage() {
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [expandedProposal, setExpandedProposal] = useState<string | null>(null)
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({})
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [recentAction, setRecentAction] = useState<{ id: string; action: 'approved' | 'rejected' } | null>(null)

  // Load proposals on mount
  useEffect(() => {
    loadProposals()
  }, [])

  const loadProposals = () => {
    setProposals(proposalsService.getProposals())
  }

  const pendingProposals = proposals.filter(p => p.status === 'pending')
  const reviewedProposals = proposals.filter(p => p.status !== 'pending')

  const handleApprove = async (id: string) => {
    setActionLoading(id)

    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 500))

    if (proposalsService.approveProposal(id, reviewNotes[id])) {
      setRecentAction({ id, action: 'approved' })
      loadProposals()

      // Clear the recent action after animation
      setTimeout(() => setRecentAction(null), 2000)
    }

    setActionLoading(null)
    setExpandedProposal(null)
  }

  const handleReject = async (id: string) => {
    setActionLoading(id)

    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 500))

    if (proposalsService.rejectProposal(id, reviewNotes[id])) {
      setRecentAction({ id, action: 'rejected' })
      loadProposals()

      // Clear the recent action after animation
      setTimeout(() => setRecentAction(null), 2000)
    }

    setActionLoading(null)
    setExpandedProposal(null)
  }

  const addMockData = () => {
    proposalsService.addMockProposals()
    loadProposals()
  }

  const toggleExpand = (id: string) => {
    setExpandedProposal(expandedProposal === id ? null : id)
  }

  const daysUntilExpiry = (expiresAt: string): number => {
    const diff = new Date(expiresAt).getTime() - Date.now()
    return Math.ceil(diff / (24 * 60 * 60 * 1000))
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Dashboard
        </Link>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Inbox className="h-6 w-6 text-orange-500" />
              Approval Inbox
            </h1>
            <p className="text-gray-500 mt-1">
              Review and approve changes proposed by your professional advisors.
            </p>
          </div>

          <Button variant="ghost" onClick={addMockData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Load Demo
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-orange-600">{pendingProposals.length}</div>
            <div className="text-sm text-gray-500">Pending Review</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">
              {pendingProposals.filter(p => p.diff.risk_level === 'high').length}
            </div>
            <div className="text-sm text-gray-500">High Risk</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-gray-600">
              {reviewedProposals.length}
            </div>
            <div className="text-sm text-gray-500">Reviewed</div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Proposals */}
      {pendingProposals.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-orange-500" />
            Awaiting Your Review
          </h2>

          <div className="space-y-4">
            {pendingProposals.map((proposal) => {
              const Icon = PROFESSIONAL_ICONS[proposal.professional_type]
              const riskStyle = RISK_STYLES[proposal.diff.risk_level]
              const RiskIcon = riskStyle.icon
              const isExpanded = expandedProposal === proposal.id
              const expiryDays = daysUntilExpiry(proposal.expires_at)
              const isExpiringSoon = expiryDays <= 7

              return (
                <Card
                  key={proposal.id}
                  className={`transition-all ${
                    recentAction?.id === proposal.id
                      ? recentAction.action === 'approved'
                        ? 'ring-2 ring-green-500 bg-green-50'
                        : 'ring-2 ring-red-500 bg-red-50'
                      : ''
                  }`}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                          <Icon className="h-5 w-5 text-orange-600" />
                        </div>
                        <div>
                          <CardTitle className="text-base flex items-center gap-2">
                            {proposal.professional_email}
                            <span className={`text-xs px-2 py-0.5 rounded-full ${riskStyle.bg} ${riskStyle.text}`}>
                              <RiskIcon className="h-3 w-3 inline mr-1" />
                              {proposal.diff.risk_level.toUpperCase()} RISK
                            </span>
                          </CardTitle>
                          <CardDescription className="mt-0.5">
                            {PROFESSIONAL_LABELS[proposal.professional_type]} • {proposal.sections_changed.join(', ')}
                          </CardDescription>
                        </div>
                      </div>

                      <div className="text-right">
                        <div
                          className={`text-sm flex items-center gap-1 ${
                            isExpiringSoon ? 'text-orange-600 font-medium' : 'text-gray-500'
                          }`}
                        >
                          <Clock className="h-3 w-3" />
                          {isExpiringSoon && '!!'} Expires in {expiryDays}d
                        </div>
                        <div className="text-xs text-gray-400">
                          v{proposal.from_version} → v{proposal.to_version}
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    {/* Summary */}
                    <p className="text-sm text-gray-700 mb-4">{proposal.change_summary}</p>

                    {/* Expand/Collapse Toggle */}
                    <button
                      onClick={() => toggleExpand(proposal.id)}
                      className="flex items-center gap-1 text-sm text-orange-600 hover:text-orange-700 mb-4"
                    >
                      {isExpanded ? (
                        <>
                          <ChevronDown className="h-4 w-4" />
                          Hide Details
                        </>
                      ) : (
                        <>
                          <ChevronRight className="h-4 w-4" />
                          View {proposal.diff.changes.length} Change{proposal.diff.changes.length !== 1 ? 's' : ''}
                        </>
                      )}
                    </button>

                    {/* Expanded Diff View */}
                    {isExpanded && (
                      <div className="space-y-4 mb-4">
                        {/* Changes List */}
                        <div className="border rounded-lg overflow-hidden">
                          <div className="bg-gray-50 px-4 py-2 border-b">
                            <h4 className="text-sm font-medium text-gray-700">Proposed Changes</h4>
                          </div>
                          <div className="divide-y">
                            {proposal.diff.changes.map((change, idx) => (
                              <DiffItemRow key={idx} item={change} />
                            ))}
                          </div>
                        </div>

                        {/* Review Notes */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Review Notes (optional)
                          </label>
                          <textarea
                            placeholder="Add notes about your decision..."
                            value={reviewNotes[proposal.id] || ''}
                            onChange={(e) =>
                              setReviewNotes((prev) => ({
                                ...prev,
                                [proposal.id]: e.target.value,
                              }))
                            }
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none resize-none"
                          />
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3">
                      <Button
                        onClick={() => handleApprove(proposal.id)}
                        disabled={actionLoading === proposal.id}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        {actionLoading === proposal.id ? (
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Check className="h-4 w-4 mr-2" />
                        )}
                        Approve
                      </Button>
                      <Button
                        onClick={() => handleReject(proposal.id)}
                        disabled={actionLoading === proposal.id}
                        variant="ghost"
                        className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                      >
                        {actionLoading === proposal.id ? (
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <X className="h-4 w-4 mr-2" />
                        )}
                        Reject
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {pendingProposals.length === 0 && reviewedProposals.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Inbox className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No proposals yet</h3>
            <p className="text-gray-500 mb-4">
              When professionals propose changes to your inheritance plan, they&apos;ll appear here.
            </p>
            <Button variant="ghost" onClick={addMockData}>
              Load Demo Proposals
            </Button>
          </CardContent>
        </Card>
      )}

      {/* All Caught Up */}
      {pendingProposals.length === 0 && reviewedProposals.length > 0 && (
        <Card className="mb-8">
          <CardContent className="py-8 text-center">
            <Check className="h-10 w-10 text-green-500 mx-auto mb-3" />
            <h3 className="text-lg font-medium mb-1">All caught up!</h3>
            <p className="text-gray-500">No pending proposals to review.</p>
          </CardContent>
        </Card>
      )}

      {/* Review History */}
      {reviewedProposals.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-gray-500" />
            Review History
          </h2>

          <Card>
            <CardContent className="py-0">
              <div className="divide-y">
                {reviewedProposals.map((proposal) => {
                  const _Icon = PROFESSIONAL_ICONS[proposal.professional_type]
                  const isApproved = proposal.status === 'approved'

                  return (
                    <div key={proposal.id} className="flex items-center justify-between py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`h-8 w-8 rounded-full flex items-center justify-center ${
                            isApproved ? 'bg-green-100' : 'bg-red-100'
                          }`}
                        >
                          {isApproved ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : (
                            <X className="h-4 w-4 text-red-600" />
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-medium flex items-center gap-2">
                            {proposal.professional_email}
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full ${
                                isApproved ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {isApproved ? 'Approved' : 'Rejected'}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500">
                            {proposal.sections_changed.join(', ')} • {proposal.diff.changes.length} change
                            {proposal.diff.changes.length !== 1 ? 's' : ''}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-500">
                          {proposal.reviewed_at && new Date(proposal.reviewed_at).toLocaleDateString()}
                        </div>
                        {proposal.review_notes && (
                          <div className="text-xs text-gray-400 max-w-xs truncate">
                            &ldquo;{proposal.review_notes}&rdquo;
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Security Info */}
      <Card className="mt-6">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-gray-600">
              <strong>How it works:</strong> When you approve a proposal, the changes are
              merged into your inheritance plan and a new version is created. Your
              professionals will be notified of your decision. Rejected proposals are
              archived but can be referenced later.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ============================================================================
// SUBCOMPONENTS
// ============================================================================

function DiffItemRow({ item }: { item: DiffItem }) {
  const Icon = CHANGE_TYPE_ICONS[item.change_type]
  const style = CHANGE_TYPE_STYLES[item.change_type]

  return (
    <div className={`px-4 py-3 ${style} border-l-4`}>
      <div className="flex items-start gap-2">
        <Icon className="h-4 w-4 mt-0.5 flex-shrink-0" />
        <div>
          <div className="text-sm font-medium">
            {item.section} → {item.field}
          </div>
          <div className="text-sm">
            {item.change_type === 'modified' && (
              <>
                <span className="line-through text-gray-500 mr-2">{String(item.old_value)}</span>
                <span className="font-medium">{String(item.new_value)}</span>
              </>
            )}
            {item.change_type === 'added' && (
              <span className="font-medium">+ {String(item.new_value)}</span>
            )}
            {item.change_type === 'removed' && (
              <span className="line-through">{String(item.old_value)}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
