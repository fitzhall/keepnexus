'use client'

import { useState } from 'react'
import { ArrowLeft, Plus, X } from 'lucide-react'
import Link from 'next/link'
import { useFamilySetup } from '@/lib/context/FamilySetup'
import { ScheduleEvent } from '@/lib/risk-simulator/file-export'

export default function SchedulePage() {
  // Use context instead of local state
  const { setup, addScheduleEvent, removeScheduleEvent, updateScheduleEvents } = useFamilySetup()
  const events = setup.scheduleEvents

  const [showAddModal, setShowAddModal] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    type: 'custom' as const
  })

  const handleAddEvent = () => {
    if (!formData.title || !formData.date) return

    const newEvent: ScheduleEvent = {
      id: Date.now().toString(),
      title: formData.title,
      description: formData.description,
      date: formData.date,
      type: formData.type,
      completed: false,
      createdAt: new Date()
    }

    // Add to context (will auto-save to localStorage)
    addScheduleEvent(newEvent)

    // Sort events by date
    const sortedEvents = [...events, newEvent].sort((a, b) =>
      new Date(a.date).getTime() - new Date(b.date).getTime()
    )
    updateScheduleEvents(sortedEvents)

    setShowAddModal(false)
    setFormData({ title: '', description: '', date: '', type: 'custom' })
  }

  const handleRemoveEvent = (id: string) => {
    if (confirm('Remove this event from schedule?')) {
      removeScheduleEvent(id)
    }
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <div className="min-h-screen bg-white lg:bg-gray-50">
      <div className="max-w-md mx-auto lg:max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200 lg:px-6 lg:py-6 lg:mb-6 lg:border-0">
          <Link href="/dashboard" className="lg:hidden">
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </Link>
          <h1 className="text-lg font-semibold text-gray-900 lg:text-2xl lg:font-bold">Schedule</h1>
          <button onClick={() => setShowAddModal(true)} className="lg:hidden">
            <Plus className="w-6 h-6 text-gray-700" />
          </button>
          <div className="hidden lg:flex gap-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-gray-900 text-white hover:bg-gray-800 text-sm font-medium"
            >
              + Add Event
            </button>
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
              {events.map((event) => (
                <div key={event.id} className="px-6 py-3 hover:bg-gray-50 transition-colors group">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{event.title}</p>
                      <p className="text-xs text-gray-600">{event.description}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="text-xs text-gray-500">{formatDate(event.date)}</p>
                      <button
                        onClick={() => handleRemoveEvent(event.id)}
                        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-600 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Add Event Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-gray-300 max-w-md w-full shadow-lg">
            <div className="p-6 border-b border-gray-300">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-medium text-gray-900">Add Schedule Event</h2>
                <button
                  onClick={() => {
                    setShowAddModal(false)
                    setFormData({ title: '', description: '', date: '', type: 'custom' })
                  }}
                  className="text-gray-400 hover:text-gray-900"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Event Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Key Rotation"
                  className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Description
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g., Quarterly security rotation"
                  className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-gray-900"
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-300 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowAddModal(false)
                  setFormData({ title: '', description: '', date: '', type: 'custom' })
                }}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 underline"
              >
                Cancel
              </button>
              <button
                onClick={handleAddEvent}
                disabled={!formData.title || !formData.date}
                className="px-4 py-2 bg-gray-900 text-white text-sm hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Add Event
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}