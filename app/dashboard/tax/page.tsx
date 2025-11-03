'use client'

import { ArrowLeft, BarChart3, Download, FileText } from 'lucide-react'
import Link from 'next/link'

export default function TaxPage() {
  return (
    <div className="min-h-screen bg-white lg:bg-gray-50">
      <div className="max-w-md mx-auto lg:max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200 lg:px-6 lg:py-6 lg:mb-6 lg:border-0">
          <Link href="/dashboard" className="lg:hidden">
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </Link>
          <h1 className="text-lg font-semibold text-gray-900 lg:text-2xl lg:font-bold">Tax Reports</h1>
          <BarChart3 className="w-6 h-6 text-gray-700 lg:hidden" />
          <div className="hidden lg:block">
            <Link href="/dashboard" className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium">
              ← Back to Dashboard
            </Link>
          </div>
        </div>

        <div className="lg:px-6">
          {/* Current Year Status */}
          <div className="px-6 py-6 border-b border-gray-100 bg-green-50 lg:bg-white lg:rounded-lg lg:shadow-sm lg:border lg:border-green-200 lg:mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900 lg:text-lg">2025 Tax Report</p>
                <p className="text-sm text-gray-700 lg:text-base">Ready for download</p>
              </div>
              <Download className="w-6 h-6 text-green-600 lg:w-8 lg:h-8" />
            </div>
          </div>

          {/* Reports */}
          <div className="flex-1 px-6 py-6 lg:bg-white lg:rounded-lg lg:shadow-sm lg:border lg:border-gray-200 lg:mb-6">
            <h2 className="text-sm font-semibold text-gray-900 mb-4 lg:text-lg">Available Reports</h2>

            <div className="space-y-3">
              <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer lg:p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-gray-600 lg:w-6 lg:h-6" />
                    <div>
                      <p className="font-medium text-gray-900 lg:text-lg">Transaction History</p>
                      <p className="text-xs text-gray-500 lg:text-sm">2025 YTD • CSV</p>
                    </div>
                  </div>
                  <Download className="w-5 h-5 text-gray-600 lg:w-6 lg:h-6" />
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer lg:p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-gray-600 lg:w-6 lg:h-6" />
                    <div>
                      <p className="font-medium text-gray-900 lg:text-lg">Capital Gains</p>
                      <p className="text-xs text-gray-500 lg:text-sm">Form 8949 • PDF</p>
                    </div>
                  </div>
                  <Download className="w-5 h-5 text-gray-600 lg:w-6 lg:h-6" />
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer lg:p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-gray-600 lg:w-6 lg:h-6" />
                    <div>
                      <p className="font-medium text-gray-900 lg:text-lg">Trust Income</p>
                      <p className="text-xs text-gray-500 lg:text-sm">Schedule K-1 • PDF</p>
                    </div>
                  </div>
                  <Download className="w-5 h-5 text-gray-600 lg:w-6 lg:h-6" />
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer lg:p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-gray-600 lg:w-6 lg:h-6" />
                    <div>
                      <p className="font-medium text-gray-900 lg:text-lg">Estate Valuation</p>
                      <p className="text-xs text-gray-500 lg:text-sm">Form 706 • PDF</p>
                    </div>
                  </div>
                  <Download className="w-5 h-5 text-gray-600 lg:w-6 lg:h-6" />
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="px-6 py-6 border-t border-gray-200 lg:border-0">
            <button className="w-full py-3 bg-gray-900 text-white rounded-lg text-sm hover:bg-gray-800 lg:py-4 lg:text-base">
              Send to CPA
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}