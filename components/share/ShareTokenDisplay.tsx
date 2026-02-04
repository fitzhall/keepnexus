'use client'

/**
 * ShareTokenDisplay - Display generated share token and copy options
 */

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { shareService, type ShareBundle, type ProfessionalType } from '@/lib/shard/share'
import {
  Copy,
  Check,
  Link2,
  Download,
  Mail,
  Shield,
  Clock,
  AlertCircle,
} from 'lucide-react'

interface ShareTokenDisplayProps {
  bundle: ShareBundle
  professionalEmail: string
  professionalType: ProfessionalType
}

export function ShareTokenDisplay({
  bundle,
  professionalEmail,
  professionalType,
}: ShareTokenDisplayProps) {
  const [copied, setCopied] = useState<'link' | 'token' | null>(null)

  const shareLink = shareService.generateShareLink(bundle)

  const copyToClipboard = async (text: string, type: 'link' | 'token') => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(type)
      setTimeout(() => setCopied(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const downloadBundle = () => {
    const bundleJson = JSON.stringify(bundle, null, 2)
    const blob = new Blob([bundleJson], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `shard-share-${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const sendEmail = () => {
    const subject = encodeURIComponent(`Your ${bundle.metadata.client_display_name || 'Client'} Shard Access`)
    const body = encodeURIComponent(
      `Hello,\n\nYou've been granted access to review a Bitcoin inheritance shard.\n\n` +
      `Click the link below to import the shard into KEEP SYS:\n\n${shareLink}\n\n` +
      `This link expires on ${new Date(bundle.metadata.expires_at).toLocaleDateString()}.\n\n` +
      `Best regards`
    )
    window.open(`mailto:${professionalEmail}?subject=${subject}&body=${body}`)
  }

  return (
    <div className="space-y-6">
      {/* Success header */}
      <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
        <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
          <Check className="h-5 w-5 text-green-600" />
        </div>
        <div>
          <h3 className="font-medium text-green-800">Share Link Generated</h3>
          <p className="text-sm text-green-600">
            Send this link to your {professionalType} to grant access.
          </p>
        </div>
      </div>

      {/* Share link */}
      <div className="space-y-2">
        <label className="text-sm font-medium flex items-center gap-2">
          <Link2 className="h-4 w-4" />
          Share Link
        </label>
        <div className="flex gap-2">
          <input
            readOnly
            value={shareLink}
            className="flex-1 font-mono text-sm px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => copyToClipboard(shareLink, 'link')}
          >
            {copied === 'link' ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
        <p className="text-xs text-gray-500">
          This link contains the encrypted shard. Only the recipient can decrypt it.
        </p>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="ghost"
          className="flex items-center gap-2"
          onClick={sendEmail}
        >
          <Mail className="h-4 w-4" />
          Send via Email
        </Button>
        <Button
          variant="ghost"
          className="flex items-center gap-2"
          onClick={downloadBundle}
        >
          <Download className="h-4 w-4" />
          Download Bundle
        </Button>
      </div>

      {/* Metadata */}
      <div className="p-4 bg-gray-50 rounded-lg space-y-3">
        <h4 className="font-medium text-sm">Share Details</h4>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <Mail className="h-4 w-4" />
            <span>{professionalEmail}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Shield className="h-4 w-4" />
            <span className="capitalize">{professionalType}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Clock className="h-4 w-4" />
            <span>Expires {new Date(bundle.metadata.expires_at).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Shield className="h-4 w-4" />
            <span>v{bundle.metadata.shard_version}</span>
          </div>
        </div>
      </div>

      {/* Security notice */}
      <div className="flex items-start gap-3 p-4 bg-orange-50 rounded-lg">
        <AlertCircle className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-orange-800">
          <strong>Security Note:</strong> This link grants access to your inheritance plan.
          Only share it with trusted professionals. You can revoke access anytime from the
          &quot;Active Shares&quot; page.
        </div>
      </div>
    </div>
  )
}
