'use client'

import { CheckCircle, AlertTriangle, XCircle, Home } from 'lucide-react'

export default function SimpleDashboard() {
  const getStatusIcon = (status: 'green' | 'yellow' | 'red') => {
    switch (status) {
      case 'green':
        return <CheckCircle className="w-4 h-4 text-green-600 inline" />
      case 'yellow':
        return <AlertTriangle className="w-4 h-4 text-yellow-600 inline" />
      case 'red':
        return <XCircle className="w-4 h-4 text-red-600 inline" />
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <Home className="w-5 h-5 text-gray-600" />
            <h1 className="text-xl font-medium text-gray-900">KEEP NEXUS – Michael Saylor</h1>
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-600">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              All green ✅
            </span>
            <span>Last heartbeat 2h ago</span>
          </div>
        </div>

        {/* Status Sections */}
        <div className="space-y-8 mb-12">
          {/* K - Security */}
          <div className="border-l-2 border-gray-200 pl-4">
            <h2 className="text-base font-semibold text-gray-900 mb-2">
              K – SECURITY {getStatusIcon('green')}
            </h2>
            <div className="space-y-1 text-sm text-gray-600">
              <div className="pl-4">└ 3-3-3 live → auto-rotates Nov 14</div>
              <div className="pl-4">└ Treasure Map = 9 shards (safe, Steward, IPFS)</div>
            </div>
          </div>

          {/* E - Legal */}
          <div className="border-l-2 border-gray-200 pl-4">
            <h2 className="text-base font-semibold text-gray-900 mb-2">
              E – LEGAL {getStatusIcon('yellow')}
            </h2>
            <div className="space-y-1 text-sm text-gray-600">
              <div className="pl-4">└ Living Trust notarized 3 weeks ago</div>
              <div className="pl-4">└ Alice 60% · Bob 30% · Charity 10%</div>
              <div className="pl-4 text-yellow-600">└ ⚠️ Trust document needs annual review</div>
            </div>
          </div>

          {/* E - Access */}
          <div className="border-l-2 border-gray-200 pl-4">
            <h2 className="text-base font-semibold text-gray-900 mb-2">
              E – ACCESS {getStatusIcon('green')}
            </h2>
            <div className="space-y-1 text-sm text-gray-600">
              <div className="pl-4">└ Heirs finished 7-min course</div>
              <div className="pl-4">└ Fake inheritance ran Oct 18</div>
            </div>
          </div>

          {/* P - Future */}
          <div className="border-l-2 border-gray-200 pl-4">
            <h2 className="text-base font-semibold text-gray-900 mb-2">
              P – FUTURE {getStatusIcon('red')}
            </h2>
            <div className="space-y-1 text-sm text-gray-600">
              <div className="pl-4">└ CPA report emails itself in 12 days</div>
              <div className="pl-4 text-red-600">└ ⚠️ IRS rule flagged → one-click fix</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4">
          <button className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors">
            👋 I'M ALIVE
          </button>
          <button className="px-6 py-3 bg-white text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            📄 Send Lawyer
          </button>
          <button className="px-6 py-3 bg-white text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            🎮 Test Tonight
          </button>
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            keep.michael.com · Last updated: {new Date().toLocaleString()} · Support: help@keep.co
          </p>
        </div>
      </div>
    </div>
  )
}