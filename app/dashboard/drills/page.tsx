'use client'

import { ArrowLeft, Bell, PlayCircle, CheckCircle, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default function DrillsPage() {
  return (
    <div className="min-h-screen bg-white lg:bg-gray-50">
      <div className="max-w-md mx-auto lg:max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200 lg:px-6 lg:py-6 lg:mb-6 lg:border-0">
          <Link href="/dashboard" className="lg:hidden">
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </Link>
          <h1 className="text-lg font-semibold text-gray-900 lg:text-2xl lg:font-bold">Inheritance Drills</h1>
          <Bell className="w-6 h-6 text-gray-700 lg:hidden" />
          <div className="hidden lg:block">
            <Link href="/dashboard" className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium">
              ← Back to Dashboard
            </Link>
          </div>
        </div>

        <div className="lg:px-6">
          {/* Next Drill */}
          <div className="px-6 py-6 border-b border-gray-100 bg-blue-50 lg:bg-white lg:rounded-lg lg:shadow-sm lg:border lg:border-blue-200 lg:mb-6">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-medium text-gray-900 lg:text-lg">Next Monthly Drill</p>
                <p className="text-sm text-gray-700 lg:text-base">November 18, 2025</p>
              </div>
              <PlayCircle className="w-8 h-8 text-blue-600 lg:w-10 lg:h-10" />
            </div>
            <button className="w-full py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 lg:py-3 lg:text-base">
              Start Drill Now
            </button>
          </div>

          {/* Drill History */}
          <div className="flex-1 px-6 py-6 lg:bg-white lg:rounded-lg lg:shadow-sm lg:border lg:border-gray-200 lg:mb-6">
            <h2 className="text-sm font-semibold text-gray-900 mb-4 lg:text-lg">History</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 lg:p-4 lg:border lg:border-gray-200 lg:rounded-lg lg:hover:bg-gray-50 lg:transition-colors">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 lg:w-6 lg:h-6" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 lg:text-base">October Drill</p>
                    <p className="text-xs text-gray-500 lg:text-sm">All heirs passed</p>
                  </div>
                </div>
                <span className="text-xs text-gray-500 lg:text-sm">Oct 18</span>
              </div>

              <div className="flex items-center justify-between py-2 lg:p-4 lg:border lg:border-gray-200 lg:rounded-lg lg:hover:bg-gray-50 lg:transition-colors">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 lg:w-6 lg:h-6" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 lg:text-base">September Drill</p>
                    <p className="text-xs text-gray-500 lg:text-sm">2/3 heirs passed</p>
                  </div>
                </div>
                <span className="text-xs text-gray-500 lg:text-sm">Sep 18</span>
              </div>

              <div className="flex items-center justify-between py-2 lg:p-4 lg:border lg:border-gray-200 lg:rounded-lg lg:hover:bg-gray-50 lg:transition-colors">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 lg:w-6 lg:h-6" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 lg:text-base">August Drill</p>
                    <p className="text-xs text-gray-500 lg:text-sm">Skipped - vacation</p>
                  </div>
                </div>
                <span className="text-xs text-gray-500 lg:text-sm">Aug 18</span>
              </div>
            </div>
          </div>

          {/* Settings */}
          <div className="px-6 py-6 border-t border-gray-200 lg:border-0">
            <button className="w-full py-3 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 lg:py-4 lg:text-base">
              Configure Drill Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}