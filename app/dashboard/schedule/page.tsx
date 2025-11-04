'use client'

import { ArrowLeft, Calendar, Clock } from 'lucide-react'
import Link from 'next/link'

export default function SchedulePage() {
  return (
    <div className="min-h-screen bg-white lg:bg-gray-50">
      <div className="max-w-md mx-auto lg:max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200 lg:px-6 lg:py-6 lg:mb-6 lg:border-0">
          <Link href="/dashboard" className="lg:hidden">
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </Link>
          <h1 className="text-lg font-semibold text-gray-900 lg:text-2xl lg:font-bold">Schedule</h1>
          <Calendar className="w-6 h-6 text-gray-700 lg:hidden" />
          <div className="hidden lg:block">
            <Link href="/dashboard" className="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-900 text-sm font-medium">
              ← Back to Dashboard
            </Link>
          </div>
        </div>

        <div className="lg:px-6">
          {/* Upcoming Events */}
          <div className="flex-1 lg:bg-white lg:border lg:border-gray-300">
            <div className="px-6 py-4 border-b border-gray-300">
              <h2 className="text-base font-semibold text-gray-900">Upcoming Events</h2>
            </div>

            <div className="divide-y divide-gray-300">
              <div className="px-6 py-3 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Key Rotation</p>
                    <p className="text-xs text-gray-600">Quarterly security rotation</p>
                  </div>
                  <p className="text-xs text-gray-500">Nov 14, 2025</p>
                </div>
              </div>

              <div className="px-6 py-3 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Monthly Drill</p>
                    <p className="text-xs text-gray-600">Inheritance simulation</p>
                  </div>
                  <p className="text-xs text-gray-500">Nov 18, 2025</p>
                </div>
              </div>

              <div className="px-6 py-3 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Trust Review</p>
                    <p className="text-xs text-gray-600">Annual document review</p>
                  </div>
                  <p className="text-xs text-gray-500">Dec 1, 2025</p>
                </div>
              </div>

              <div className="px-6 py-3 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Tax Report</p>
                    <p className="text-xs text-gray-600">Auto-generated CSV</p>
                  </div>
                  <p className="text-xs text-gray-500">Dec 31, 2025</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}