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
            <Link href="/dashboard" className="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-900 text-sm font-medium">
              ← Back to Dashboard
            </Link>
          </div>
        </div>

        <div className="lg:px-6">
          {/* Next Drill */}
          <div className="px-6 py-6 border-b border-gray-100 bg-gray-50 lg:bg-white lg:border lg:border-gray-300 lg:mb-6">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-medium text-gray-900 lg:text-lg">Next Monthly Drill</p>
                <p className="text-sm text-gray-700 lg:text-base">November 18, 2025</p>
              </div>
              <PlayCircle className="w-8 h-8 text-gray-900 lg:w-10 lg:h-10" />
            </div>
            <button className="w-full py-2 bg-gray-900 text-white  text-sm hover:bg-gray-800 lg:py-3 lg:text-base">
              Start Drill Now
            </button>
          </div>

          {/* Drill History */}
          <div className="flex-1 lg:bg-white lg:border lg:border-gray-300 lg:mb-6">
            <div className="px-6 py-4 border-b border-gray-300">
              <h2 className="text-base font-semibold text-gray-900">History</h2>
            </div>

            <div className="divide-y divide-gray-300">
              <div className="px-6 py-3 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-4 h-4 text-gray-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">October Drill</p>
                      <p className="text-xs text-gray-600">All heirs passed</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">Oct 18</span>
                </div>
              </div>

              <div className="px-6 py-3 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-4 h-4 text-gray-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">September Drill</p>
                      <p className="text-xs text-gray-600">2/3 heirs passed</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">Sep 18</span>
                </div>
              </div>

              <div className="px-6 py-3 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-4 h-4 text-gray-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">August Drill</p>
                      <p className="text-xs text-gray-600">Skipped - vacation</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">Aug 18</span>
                </div>
              </div>
            </div>
          </div>

          {/* Settings */}
          <div className="px-6 py-6 border-t border-gray-200 lg:border-0">
            <button className="w-full py-3 border border-gray-300  text-sm hover:bg-gray-50 lg:py-4 lg:text-base">
              Configure Drill Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}