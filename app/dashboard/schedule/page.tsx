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
            <Link href="/dashboard" className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium">
              ← Back to Dashboard
            </Link>
          </div>
        </div>

        <div className="lg:px-6">
          {/* Upcoming Events */}
          <div className="flex-1 px-6 py-6 lg:bg-white lg:rounded-lg lg:shadow-sm lg:border lg:border-gray-200">
            <h2 className="text-sm font-semibold text-gray-900 mb-4 lg:text-lg">Upcoming Events</h2>

            <div className="space-y-4">
              <div className="border-l-4 border-red-500 pl-4 py-2 lg:pl-6 lg:py-4 lg:bg-red-50 lg:rounded-r-lg">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500 lg:w-5 lg:h-5" />
                  <p className="text-xs text-gray-500 lg:text-sm">Nov 14, 2025</p>
                </div>
                <p className="font-medium text-gray-900 mt-1 lg:text-lg lg:mt-2">Key Rotation</p>
                <p className="text-sm text-gray-700 lg:text-base">Quarterly security rotation</p>
              </div>

              <div className="border-l-4 border-blue-500 pl-4 py-2 lg:pl-6 lg:py-4 lg:bg-blue-50 lg:rounded-r-lg">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500 lg:w-5 lg:h-5" />
                  <p className="text-xs text-gray-500 lg:text-sm">Nov 18, 2025</p>
                </div>
                <p className="font-medium text-gray-900 mt-1 lg:text-lg lg:mt-2">Monthly Drill</p>
                <p className="text-sm text-gray-700 lg:text-base">Inheritance simulation</p>
              </div>

              <div className="border-l-4 border-yellow-500 pl-4 py-2 lg:pl-6 lg:py-4 lg:bg-yellow-50 lg:rounded-r-lg">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500 lg:w-5 lg:h-5" />
                  <p className="text-xs text-gray-500 lg:text-sm">Dec 1, 2025</p>
                </div>
                <p className="font-medium text-gray-900 mt-1 lg:text-lg lg:mt-2">Trust Review</p>
                <p className="text-sm text-gray-700 lg:text-base">Annual document review</p>
              </div>

              <div className="border-l-4 border-green-500 pl-4 py-2 lg:pl-6 lg:py-4 lg:bg-green-50 lg:rounded-r-lg">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500 lg:w-5 lg:h-5" />
                  <p className="text-xs text-gray-500 lg:text-sm">Dec 31, 2025</p>
                </div>
                <p className="font-medium text-gray-900 mt-1 lg:text-lg lg:mt-2">Tax Report</p>
                <p className="text-sm text-gray-700 lg:text-base">Auto-generated CSV</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}