'use client'

import { useState } from 'react'
import { ArrowLeft, Infinity, Lock, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

export default function ForeverPage() {
  const [isLocked, setIsLocked] = useState(true)

  return (
    <div className="min-h-screen bg-white lg:bg-gray-50">
      <div className="max-w-md mx-auto lg:max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200 lg:px-6 lg:py-6 lg:mb-6 lg:border-0">
          <Link href="/dashboard" className="lg:hidden">
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </Link>
          <h1 className="text-lg font-semibold text-gray-900 lg:text-2xl lg:font-bold">Forever Mode</h1>
          <Infinity className="w-6 h-6 text-gray-700 lg:hidden" />
          <div className="hidden lg:block">
            <Link href="/dashboard" className="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-900 text-sm font-medium">
              ← Back to Dashboard
            </Link>
          </div>
        </div>

        <div className="lg:px-6">
          {/* Current Status */}
          <div className="px-6 py-8 border-b border-gray-100 text-center lg:bg-white lg:rounded-lg lg:shadow-sm lg:border lg:border-gray-200 lg:mb-6 lg:py-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4 lg:w-24 lg:h-24">
              <Lock className="w-10 h-10 text-gray-700 lg:w-12 lg:h-12" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2 lg:text-2xl">Forever Mode Active</h2>
            <p className="text-sm text-gray-700 lg:text-base">
              Your Bitcoin is locked until inheritance conditions are met
            </p>
          </div>

          {/* Lock Settings */}
          <div className="flex-1 px-6 py-6 lg:bg-white lg:rounded-lg lg:shadow-sm lg:border lg:border-gray-200 lg:mb-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4 lg:text-lg">Lock Conditions</h3>

            <div className="space-y-4 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">
              <div className="border border-gray-200 rounded-lg p-4 lg:p-5">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-gray-900 lg:text-lg">Time Lock</p>
                  <span className="text-sm text-green-600 lg:text-base">Active</span>
                </div>
                <p className="text-sm text-gray-700 lg:text-base">
                  No transactions until Jan 1, 2035
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg p-4 lg:p-5">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-gray-900 lg:text-lg">Dead Man&apos;s Switch</p>
                  <span className="text-sm text-green-600 lg:text-base">Active</span>
                </div>
                <p className="text-sm text-gray-700 lg:text-base">
                  Auto-unlock if no activity for 365 days
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg p-4 lg:p-5">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-gray-900 lg:text-lg">Multi-sig Override</p>
                  <span className="text-sm text-green-600 lg:text-base">Active</span>
                </div>
                <p className="text-sm text-gray-700 lg:text-base">
                  3-of-3 signatures can unlock
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg p-4 lg:p-5">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-gray-900 lg:text-lg">Price Target</p>
                  <span className="text-sm text-gray-400 lg:text-base">Inactive</span>
                </div>
                <p className="text-sm text-gray-700 lg:text-base">
                  Unlock when BTC reaches $1M
                </p>
              </div>
            </div>
          </div>

          {/* Warning */}
          <div className="px-6 py-4 bg-yellow-50 border-t border-yellow-200 lg:border lg:rounded-lg lg:shadow-sm lg:mb-6 lg:py-5">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5 lg:w-6 lg:h-6" />
              <div>
                <p className="text-sm font-medium text-yellow-800 lg:text-base">
                  Forever Mode is irreversible
                </p>
                <p className="text-xs text-yellow-700 mt-1 lg:text-sm">
                  Ensure all heirs understand unlock conditions
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="px-6 py-6 border-t border-gray-200 lg:border-0">
            <button
              onClick={() => setIsLocked(!isLocked)}
              disabled={isLocked}
              className="w-full py-3 bg-gray-300 text-gray-500 rounded-lg text-sm cursor-not-allowed lg:py-4 lg:text-base"
            >
              {isLocked ? 'Locked Forever' : 'Deactivate Forever Mode'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}