'use client'

import { useState } from 'react'
import { ArrowLeft, UserPlus, AlertCircle, CheckCircle, Users } from 'lucide-react'
import Link from 'next/link'

export default function HeirsPage() {
  const [heirs] = useState([
    { name: 'Wife', allocation: '60%', status: 'trained', lastDrill: 'Oct 18' },
    { name: 'Kid16', allocation: '30%', status: 'trained', lastDrill: 'Oct 18' },
    { name: 'D', allocation: '10%', status: 'pending', lastDrill: 'Never' }
  ])

  return (
    <div className="min-h-screen bg-white lg:bg-gray-50">
      <div className="max-w-md mx-auto lg:max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200 lg:px-6 lg:py-6 lg:mb-6 lg:border-0">
          <Link href="/dashboard" className="lg:hidden">
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </Link>
          <h1 className="text-lg font-semibold text-gray-900 lg:text-2xl lg:font-bold">
            <span className="hidden lg:inline">Beneficiary </span>Heirs
          </h1>
          <UserPlus className="w-6 h-6 text-gray-700 lg:hidden" />
          <div className="hidden lg:flex gap-3">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
              + Add Heir
            </button>
            <Link href="/dashboard" className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium">
              ← Back to Dashboard
            </Link>
          </div>
        </div>

        <div className="lg:px-6">
          {/* Summary */}
          <div className="px-6 py-6 border-b border-gray-100 lg:bg-white lg:rounded-lg lg:shadow-sm lg:border lg:border-gray-200 lg:mb-6">
            <div className="flex items-center justify-between lg:justify-start lg:gap-12">
              <div>
                <p className="text-sm text-gray-700 lg:text-base">Total Heirs</p>
                <p className="text-2xl font-semibold text-gray-900 lg:text-3xl">{heirs.length}</p>
              </div>
              <div className="text-right lg:text-left">
                <p className="text-sm text-gray-700 lg:text-base">Trained</p>
                <p className="text-2xl font-semibold text-green-600 lg:text-3xl">
                  {heirs.filter(h => h.status === 'trained').length}/{heirs.length}
                </p>
              </div>
              <div className="hidden lg:block flex-1">
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full transition-all"
                      style={{ width: `${(heirs.filter(h => h.status === 'trained').length / heirs.length) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-700">
                    {Math.round((heirs.filter(h => h.status === 'trained').length / heirs.length) * 100)}%
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-2">Training completion rate</p>
              </div>
            </div>
          </div>

          {/* Heirs List */}
          <div className="flex-1 lg:bg-white lg:rounded-lg lg:shadow-sm lg:border lg:border-gray-200 lg:mb-6">
            <div className="hidden lg:block px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-gray-600" />
                Beneficiary Management
              </h2>
            </div>
            {heirs.map((heir, index) => (
              <div key={index} className="px-6 py-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900 lg:text-lg">{heir.name}</p>
                      {heir.status === 'trained' ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-yellow-600" />
                      )}
                    </div>
                    <div className="lg:flex lg:gap-6 lg:items-center lg:mt-2">
                      <p className="text-sm text-gray-700 mt-1 lg:mt-0">
                        <span className="hidden lg:inline">Allocation: </span>
                        <span className="font-medium">{heir.allocation}</span>
                      </p>
                      <p className="text-xs text-gray-500 mt-1 lg:text-sm lg:mt-0">
                        Last drill: {heir.lastDrill}
                      </p>
                      {heir.status === 'trained' ? (
                        <span className="hidden lg:inline-flex px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                          ✓ Fully Trained
                        </span>
                      ) : (
                        <span className="hidden lg:inline-flex px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                          ⚠ Training Pending
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="text-sm text-blue-600 hover:text-blue-700 lg:px-3 lg:py-1 lg:border lg:border-blue-600 lg:rounded lg:hover:bg-blue-50">
                      Edit
                    </button>
                    <button className="hidden lg:block text-sm text-red-600 hover:text-red-700 px-3 py-1 border border-red-600 rounded hover:bg-red-50">
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="px-6 py-6 space-y-3 border-t border-gray-200 lg:border-0 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">
            <div className="lg:bg-white lg:rounded-lg lg:shadow-sm lg:border lg:border-gray-200 lg:p-6">
              <h3 className="hidden lg:block text-lg font-semibold text-gray-900 mb-4">Training & Drills</h3>
              <button className="w-full py-3 bg-gray-900 text-white rounded-lg text-sm hover:bg-gray-800 lg:py-4 lg:text-base">
                🎮 Run Inheritance Drill
              </button>
              <p className="hidden lg:block text-xs text-gray-500 mt-3">
                Test heirs' ability to access funds in a simulated scenario
              </p>
            </div>
            <div className="lg:bg-white lg:rounded-lg lg:shadow-sm lg:border lg:border-gray-200 lg:p-6">
              <h3 className="hidden lg:block text-lg font-semibold text-gray-900 mb-4">Communication</h3>
              <button className="w-full py-3 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 lg:py-4 lg:text-base">
                📚 Send Training Materials
              </button>
              <p className="hidden lg:block text-xs text-gray-500 mt-3">
                Share educational resources and recovery instructions
              </p>
            </div>
          </div>

          {/* Mobile Add Button */}
          <div className="px-6 pb-6 lg:hidden">
            <button className="w-full py-3 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
              + Add New Heir
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}