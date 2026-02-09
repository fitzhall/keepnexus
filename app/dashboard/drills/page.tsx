'use client'

import { useState } from 'react'
import { ArrowLeft, Bell, PlayCircle, CheckCircle, AlertCircle, X } from 'lucide-react'
import Link from 'next/link'
import { useFamilySetup } from '@/lib/context/FamilySetup'

export default function DrillsPage() {
  // Use context instead of local state
  const { setup, updateContinuity } = useFamilySetup()
  const continuity = setup.continuity
  const drills = setup.drills

  const [showSettings, setShowSettings] = useState(false)

  // Local form state (will sync to context on save)
  const [frequency, setFrequency] = useState(continuity.drill_frequency)
  const [participants, setParticipants] = useState<string[]>([])
  const [notificationDays, setNotificationDays] = useState((continuity.notification_days ?? 7).toString())

  const handleSaveSettings = () => {
    // Save to context (will auto-persist to localStorage)
    updateContinuity({
      ...continuity,
      drill_frequency: frequency as 'monthly' | 'quarterly' | 'annual',
      notification_days: parseInt(notificationDays),
    })
    setShowSettings(false)
  }

  // Format date for display
  const formatDate = (date?: string) => {
    if (!date) return 'Not scheduled'
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  // Get result icon
  const getResultIcon = (success: boolean) => {
    if (success) {
      return <CheckCircle className="w-4 h-4 text-gray-600" />
    } else {
      return <AlertCircle className="w-4 h-4 text-red-600" />
    }
  }

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
                <p className="font-medium text-gray-900 lg:text-lg">
                  Next {continuity.drill_frequency.charAt(0).toUpperCase() + continuity.drill_frequency.slice(1)} Drill
                </p>
                <p className="text-sm text-gray-700 lg:text-base">{formatDate(continuity.next_drill_due)}</p>
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
              {drills.length === 0 ? (
                <div className="px-6 py-8 text-center text-gray-500 text-sm">
                  No drill history yet. Start your first drill to begin tracking.
                </div>
              ) : (
                drills.map((drill) => (
                  <div key={drill.id} className="px-6 py-3 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getResultIcon(drill.success)}
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {new Date(drill.timestamp).toLocaleDateString('en-US', { month: 'long' })} Drill
                          </p>
                          <p className="text-xs text-gray-600">{drill.notes || `${drill.participants.length} participants`}</p>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(drill.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Settings */}
          <div className="px-6 py-6 border-t border-gray-200 lg:border-0">
            <button
              onClick={() => setShowSettings(true)}
              className="w-full py-3 border border-gray-300 text-gray-900 text-sm hover:bg-gray-50 lg:py-4 lg:text-base"
            >
              Configure Drill Settings
            </button>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-gray-300 max-w-lg w-full shadow-lg">
            <div className="p-6 border-b border-gray-300">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-medium text-gray-900">Drill Configuration</h2>
                <button
                  onClick={() => setShowSettings(false)}
                  className="text-gray-400 hover:text-gray-900"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Drill Frequency
                </label>
                <select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value as 'monthly' | 'quarterly' | 'annual')}
                  className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-gray-900"
                >
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="annual">Annual</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Required Participants
                </label>
                <div className="space-y-2">
                  {setup.heirs.map((heir) => (
                    <label key={heir.id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={participants.includes(heir.name)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setParticipants([...participants, heir.name])
                          } else {
                            setParticipants(participants.filter(p => p !== heir.name))
                          }
                        }}
                        className="border-2 border-gray-900"
                      />
                      <span className="text-sm text-gray-900">{heir.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Notification Days Before
                </label>
                <input
                  type="number"
                  value={notificationDays}
                  onChange={(e) => setNotificationDays(e.target.value)}
                  min="1"
                  max="30"
                  className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-gray-900"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Send reminders {notificationDays} days before each drill
                </p>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Auto-Skip During
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="border-2 border-gray-900" />
                    <span className="text-sm text-gray-900">Holidays</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="border-2 border-gray-900" />
                    <span className="text-sm text-gray-900">Vacation periods</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-300 flex justify-end gap-3">
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 underline"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSettings}
                className="px-4 py-2 bg-gray-900 text-white text-sm hover:bg-gray-800"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
