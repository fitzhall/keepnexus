'use client'

/**
 * Active Shares Page - Manage existing shares with professionals
 */

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { shareService, type ActiveShare } from '@/lib/shard/share'
import {
  ArrowLeft,
  Shield,
  Users,
  Plus,
  Trash2,
  Clock,
  Mail,
  Scale,
  Calculator,
  Briefcase,
  AlertCircle,
  Check,
  X,
} from 'lucide-react'

const PROFESSIONAL_ICONS = {
  attorney: Scale,
  cpa: Calculator,
  advisor: Briefcase,
}

const STATUS_STYLES = {
  pending: 'bg-yellow-100 text-yellow-800',
  accepted: 'bg-green-100 text-green-800',
  expired: 'bg-gray-100 text-gray-600',
  revoked: 'bg-red-100 text-red-800',
}

export default function ActiveSharesPage() {
  const [shares, setShares] = useState<ActiveShare[]>([])
  const [revokeConfirm, setRevokeConfirm] = useState<string | null>(null)

  useEffect(() => {
    setShares(shareService.getActiveShares())
  }, [])

  const handleRevoke = (tokenId: string) => {
    if (shareService.revokeShare(tokenId)) {
      setShares(shareService.getActiveShares())
    }
    setRevokeConfirm(null)
  }

  const activeShares = shares.filter(s => s.status === 'pending' || s.status === 'accepted')
  const inactiveShares = shares.filter(s => s.status === 'expired' || s.status === 'revoked')

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
              <Users className="h-6 w-6 text-orange-500" />
              Active Shares
            </h1>
            <p className="text-gray-500 mt-1">
              Manage access granted to your professional advisors.
            </p>
          </div>

          <Link href="/dashboard/share">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Share
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{shares.length}</div>
            <div className="text-sm text-gray-500">Total Shares</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{activeShares.length}</div>
            <div className="text-sm text-gray-500">Active</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-600">
              {shares.filter(s => s.status === 'pending').length}
            </div>
            <div className="text-sm text-gray-500">Pending</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-gray-600">{inactiveShares.length}</div>
            <div className="text-sm text-gray-500">Inactive</div>
          </CardContent>
        </Card>
      </div>

      {/* Active Shares */}
      {activeShares.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Active Shares</CardTitle>
            <CardDescription>
              These professionals currently have access to your shard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeShares.map((share) => {
                const Icon = PROFESSIONAL_ICONS[share.professional_type]
                const isExpiringSoon =
                  new Date(share.expires_at).getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000

                return (
                  <div
                    key={share.token_id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                        <Icon className="h-5 w-5 text-orange-600" />
                      </div>
                      <div>
                        <div className="font-medium flex items-center gap-2">
                          {share.professional_email}
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${STATUS_STYLES[share.status]}`}
                          >
                            {share.status === 'pending' ? 'Pending' : 'Active'}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500 flex items-center gap-2">
                          <span className="capitalize">{share.professional_type}</span>
                          <span>•</span>
                          <span className="capitalize">{share.access_level.replace('_', ' ')}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div
                          className={`text-sm flex items-center gap-1 ${
                            isExpiringSoon ? 'text-orange-600' : 'text-gray-500'
                          }`}
                        >
                          <Clock className="h-3 w-3" />
                          {isExpiringSoon && '⚠️ '}
                          Expires {new Date(share.expires_at).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-400">
                          Shared {new Date(share.created_at).toLocaleDateString()}
                        </div>
                      </div>

                      {revokeConfirm === share.token_id ? (
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => handleRevoke(share.token_id)}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => setRevokeConfirm(null)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => setRevokeConfirm(share.token_id)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Revoke
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Inactive Shares */}
      {inactiveShares.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Inactive Shares</CardTitle>
            <CardDescription>
              These shares are no longer active.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {inactiveShares.map((share) => {
                const Icon = PROFESSIONAL_ICONS[share.professional_type]

                return (
                  <div
                    key={share.token_id}
                    className="flex items-center justify-between p-3 border rounded-lg opacity-60"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                        <Icon className="h-4 w-4 text-gray-500" />
                      </div>
                      <div>
                        <div className="text-sm font-medium flex items-center gap-2">
                          {share.professional_email}
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${STATUS_STYLES[share.status]}`}
                          >
                            {share.status === 'expired' ? 'Expired' : 'Revoked'}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">
                          {share.status === 'expired' ? 'Expired' : 'Revoked'}{' '}
                          {new Date(share.expires_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <Link href="/dashboard/share">
                      <Button size="sm" variant="ghost">
                        Re-share
                      </Button>
                    </Link>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {shares.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No shares yet</h3>
            <p className="text-gray-500 mb-4">
              You haven&apos;t shared your inheritance plan with any professionals.
            </p>
            <Link href="/dashboard/share">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create First Share
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Security Info */}
      <Card className="mt-6">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-gray-600">
              <strong>Security Information:</strong> All shares use end-to-end encryption.
              Professionals can only view your shard after decrypting with the share link.
              Revoking a share immediately invalidates the share token, but any data they&apos;ve
              already downloaded remains in their possession.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
