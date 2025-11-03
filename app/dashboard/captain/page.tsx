'use client'

import { ArrowLeft, Settings, Monitor } from 'lucide-react'
import Link from 'next/link'

export default function CaptainPage() {
  return (
    <div className="min-h-screen bg-white lg:bg-gray-50">
      <div className="max-w-md mx-auto lg:max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200 lg:px-6 lg:py-6 lg:mb-6 lg:border-0">
          <Link href="/dashboard" className="lg:hidden">
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </Link>
          <h1 className="text-lg font-semibold text-gray-900 lg:text-2xl lg:font-bold">Captain Mode</h1>
          <Settings className="w-6 h-6 text-gray-700 lg:hidden" />
          <div className="hidden lg:block">
            <Link href="/dashboard" className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium">
              ← Back to Dashboard
            </Link>
          </div>
        </div>

        <div className="lg:px-6 lg:grid lg:grid-cols-2 lg:gap-6">
          {/* Advanced Settings */}
          <div className="flex-1 px-6 py-6 lg:px-0 lg:py-0 lg:col-span-2">
            <div className="space-y-4 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-6">
              <div className="border border-gray-200 rounded-lg p-4 lg:bg-white lg:shadow-sm lg:p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-gray-900 lg:text-lg">Desktop View</p>
                  <Monitor className="w-5 h-5 text-gray-600 lg:w-6 lg:h-6" />
                </div>
                <p className="text-sm text-gray-700 mb-3 lg:text-base">
                  Advanced dashboard with full metrics
                </p>
                <button className="text-sm text-blue-600 hover:text-blue-700 lg:text-base">
                  Switch to Desktop →
                </button>
              </div>

              <div className="border border-gray-200 rounded-lg p-4 lg:bg-white lg:shadow-sm lg:p-6">
                <p className="font-medium text-gray-900 mb-2 lg:text-lg">Security Settings</p>
                <div className="space-y-2 text-sm text-gray-700 lg:text-base lg:space-y-3">
                  <label className="flex items-center justify-between">
                    <span>2FA Authentication</span>
                    <input type="checkbox" checked className="rounded" readOnly />
                  </label>
                  <label className="flex items-center justify-between">
                    <span>Biometric Lock</span>
                    <input type="checkbox" checked className="rounded" readOnly />
                  </label>
                  <label className="flex items-center justify-between">
                    <span>Auto-lock (5 min)</span>
                    <input type="checkbox" checked className="rounded" readOnly />
                  </label>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4 lg:bg-white lg:shadow-sm lg:p-6">
                <p className="font-medium text-gray-900 mb-2 lg:text-lg">Notification Settings</p>
                <div className="space-y-2 text-sm text-gray-700 lg:text-base lg:space-y-3">
                  <label className="flex items-center justify-between">
                    <span>Drill Reminders</span>
                    <input type="checkbox" checked className="rounded" readOnly />
                  </label>
                  <label className="flex items-center justify-between">
                    <span>Security Alerts</span>
                    <input type="checkbox" checked className="rounded" readOnly />
                  </label>
                  <label className="flex items-center justify-between">
                    <span>Tax Deadlines</span>
                    <input type="checkbox" checked className="rounded" readOnly />
                  </label>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4 lg:bg-white lg:shadow-sm lg:p-6">
                <p className="font-medium text-gray-900 mb-2 lg:text-lg">API Access</p>
                <p className="text-sm text-gray-700 mb-3 lg:text-base">
                  Connect third-party services
                </p>
                <button className="text-sm text-blue-600 hover:text-blue-700 lg:text-base">
                  Manage API Keys →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}