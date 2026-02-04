'use client'

/**
 * Share Page - Share shard with professionals
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ShareWizard } from '@/components/share/ShareWizard'
import { shareService, type ActiveShare } from '@/lib/shard/share'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Share2, Users, Plus } from 'lucide-react'
import Link from 'next/link'

export default function SharePage() {
  const router = useRouter()
  const [showWizard, setShowWizard] = useState(false)
  const [activeShares, setActiveShares] = useState<ActiveShare[]>(() =>
    shareService.getActiveShares()
  )

  const handleComplete = () => {
    setShowWizard(false)
    setActiveShares(shareService.getActiveShares())
  }

  const activeCount = activeShares.filter(s => s.status === 'pending' || s.status === 'accepted').length

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
              <Share2 className="h-6 w-6 text-orange-500" />
              Share with Professional
            </h1>
            <p className="text-gray-500 mt-1">
              Grant secure access to your inheritance plan for review and collaboration.
            </p>
          </div>

          {!showWizard && (
            <Button onClick={() => setShowWizard(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Share
            </Button>
          )}
        </div>
      </div>

      {/* Wizard */}
      {showWizard ? (
        <ShareWizard
          onComplete={handleComplete}
          onCancel={() => setShowWizard(false)}
        />
      ) : (
        <div className="space-y-6">
          {/* Quick stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
                    <Users className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{activeCount}</div>
                    <div className="text-sm text-gray-500">Active Shares</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                    <Share2 className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">
                      {activeShares.filter(s => s.status === 'accepted').length}
                    </div>
                    <div className="text-sm text-gray-500">Accepted</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                    <Users className="h-6 w-6 text-gray-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">
                      {activeShares.filter(s => s.status === 'expired' || s.status === 'revoked').length}
                    </div>
                    <div className="text-sm text-gray-500">Expired/Revoked</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent shares */}
          {activeShares.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Recent Shares</CardTitle>
                <CardDescription>
                  Your most recent professional shares. Manage all shares in the{' '}
                  <Link href="/dashboard/shares" className="text-orange-500 hover:underline">
                    Active Shares
                  </Link>{' '}
                  page.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="divide-y">
                  {activeShares.slice(0, 5).map((share) => (
                    <div
                      key={share.token_id}
                      className="py-4 flex items-center justify-between"
                    >
                      <div>
                        <div className="font-medium">{share.professional_email}</div>
                        <div className="text-sm text-gray-500 flex items-center gap-2">
                          <span className="capitalize">{share.professional_type}</span>
                          <span>•</span>
                          <span>
                            {share.status === 'pending' && 'Pending'}
                            {share.status === 'accepted' && 'Active'}
                            {share.status === 'expired' && 'Expired'}
                            {share.status === 'revoked' && 'Revoked'}
                          </span>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        Expires {new Date(share.expires_at).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>

                {activeShares.length > 5 && (
                  <div className="pt-4 border-t mt-4">
                    <Link
                      href="/dashboard/shares"
                      className="text-sm text-orange-500 hover:underline"
                    >
                      View all {activeShares.length} shares →
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Share2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No shares yet</h3>
                <p className="text-gray-500 mb-4">
                  Share your inheritance plan with an attorney, CPA, or advisor for professional review.
                </p>
                <Button onClick={() => setShowWizard(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Share
                </Button>
              </CardContent>
            </Card>
          )}

          {/* How it works */}
          <Card>
            <CardHeader>
              <CardTitle>How It Works</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-3">
                    <span className="text-lg font-bold text-orange-600">1</span>
                  </div>
                  <h4 className="font-medium mb-1">Generate Share Link</h4>
                  <p className="text-sm text-gray-500">
                    Create a secure, encrypted share link for your professional.
                  </p>
                </div>
                <div className="text-center">
                  <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-3">
                    <span className="text-lg font-bold text-orange-600">2</span>
                  </div>
                  <h4 className="font-medium mb-1">Professional Reviews</h4>
                  <p className="text-sm text-gray-500">
                    They import your shard into KEEP SYS and review your setup.
                  </p>
                </div>
                <div className="text-center">
                  <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-3">
                    <span className="text-lg font-bold text-orange-600">3</span>
                  </div>
                  <h4 className="font-medium mb-1">You Approve Changes</h4>
                  <p className="text-sm text-gray-500">
                    Any proposed changes come to your Inbox for approval.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
