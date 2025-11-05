'use client'

import { useState } from 'react'
import { ArrowLeft, UserPlus, AlertCircle, CheckCircle, Users, X, Activity } from 'lucide-react'
import Link from 'next/link'
import { useFamilySetup, Heir } from '@/lib/context/FamilySetup'

export default function HeirsPage() {
  // Use context instead of local state
  const { setup, updateHeirs } = useFamilySetup()
  const heirs = setup.heirs

  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingHeir, setEditingHeir] = useState<Heir | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    relationship: '',
    allocation: '',
    email: '',
    phone: '',
    isKeyHolder: false
  })

  const handleAddHeir = () => {
    if (!formData.name || !formData.allocation) return

    const newHeir: Heir = {
      id: Date.now().toString(),
      name: formData.name,
      relationship: formData.relationship,
      allocation: parseInt(formData.allocation) || 0,
      email: formData.email || undefined,
      phone: formData.phone || undefined,
      isKeyHolder: formData.isKeyHolder
    }

    // Update context (auto-saves to localStorage)
    updateHeirs([...heirs, newHeir])
    setShowAddModal(false)
    setFormData({ name: '', relationship: '', allocation: '', email: '', phone: '', isKeyHolder: false })
  }

  const handleEditHeir = () => {
    if (!editingHeir || !formData.name || !formData.allocation) return

    updateHeirs(heirs.map(heir =>
      heir.id === editingHeir.id
        ? {
            ...heir,
            name: formData.name,
            relationship: formData.relationship,
            allocation: parseInt(formData.allocation) || 0,
            email: formData.email || undefined,
            phone: formData.phone || undefined,
            isKeyHolder: formData.isKeyHolder
          }
        : heir
    ))
    setShowEditModal(false)
    setEditingHeir(null)
    setFormData({ name: '', relationship: '', allocation: '', email: '', phone: '', isKeyHolder: false })
  }

  const handleRemoveHeir = (id: string) => {
    if (confirm('Are you sure you want to remove this heir?')) {
      updateHeirs(heirs.filter(heir => heir.id !== id))
    }
  }

  const openEditModal = (heir: Heir) => {
    setEditingHeir(heir)
    setFormData({
      name: heir.name,
      relationship: heir.relationship,
      allocation: heir.allocation?.toString() || '',
      email: heir.email || '',
      phone: heir.phone || '',
      isKeyHolder: heir.isKeyHolder || false
    })
    setShowEditModal(true)
  }

  // Check if heir has participated in recent drills
  const isHeirTrained = (heirName: string) => {
    return setup.drillHistory.some(drill =>
      drill.participants.includes(heirName) && drill.result === 'passed'
    )
  }

  // Get last drill date for heir
  const getLastDrill = (heirName: string) => {
    const drills = setup.drillHistory
      .filter(drill => drill.participants.includes(heirName))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    if (drills.length === 0) return 'Never'
    return new Date(drills[0].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

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
          <button onClick={() => setShowAddModal(true)} className="lg:hidden">
            <UserPlus className="w-6 h-6 text-gray-700" />
          </button>
          <div className="hidden lg:flex gap-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-gray-900 text-white  hover:bg-gray-800 text-sm font-medium"
            >
              + Add Heir
            </button>
            <Link href="/dashboard" className="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-900 text-sm font-medium">
              ← Back to Dashboard
            </Link>
          </div>
        </div>

        <div className="lg:px-6">
          {/* Summary */}
          <div className="px-6 py-6 border-b border-gray-100 lg:bg-white lg:bg-white lg:border lg:border-gray-300 lg:mb-6">
            <div className="flex items-center justify-between lg:justify-start lg:gap-12">
              <div>
                <p className="text-sm text-gray-700 lg:text-base">Total Heirs</p>
                <p className="text-2xl font-semibold text-gray-900 lg:text-3xl">{heirs.length}</p>
              </div>
              <div className="text-right lg:text-left">
                <p className="text-sm text-gray-700 lg:text-base">Trained</p>
                <p className="text-2xl font-semibold text-green-600 lg:text-3xl">
                  {heirs.filter(h => isHeirTrained(h.name)).length}/{heirs.length}
                </p>
              </div>
              <div className="hidden lg:block flex-1">
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200  h-2">
                    <div
                      className="bg-green-600 h-2  transition-all"
                      style={{ width: `${heirs.length > 0 ? (heirs.filter(h => isHeirTrained(h.name)).length / heirs.length) * 100 : 0}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-700">
                    {heirs.length > 0 ? Math.round((heirs.filter(h => isHeirTrained(h.name)).length / heirs.length) * 100) : 0}%
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-2">Training completion rate</p>
              </div>
            </div>
          </div>

          {/* Heirs List */}
          <div className="flex-1 lg:bg-white lg:bg-white lg:border lg:border-gray-300 lg:mb-6">
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
                      {isHeirTrained(heir.name) ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-yellow-600" />
                      )}
                      {heir.isKeyHolder && (
                        <span className="px-2 py-0.5 bg-gray-900 text-white text-xs">Key Holder</span>
                      )}
                    </div>
                    <div className="lg:flex lg:gap-6 lg:items-center lg:mt-2">
                      <p className="text-sm text-gray-700 mt-1 lg:mt-0">
                        <span className="font-medium">{heir.relationship}</span>
                        <span className="mx-1">•</span>
                        <span className="font-medium">{heir.allocation}% allocation</span>
                      </p>
                      <p className="text-xs text-gray-500 mt-1 lg:text-sm lg:mt-0">
                        Last drill: {getLastDrill(heir.name)}
                      </p>
                      {isHeirTrained(heir.name) ? (
                        <span className="hidden lg:inline-flex px-2 py-1 bg-green-100 text-green-700 text-xs ">
                          ✓ Fully Trained
                        </span>
                      ) : (
                        <span className="hidden lg:inline-flex px-2 py-1 bg-yellow-100 text-yellow-700 text-xs ">
                          ⚠ Training Pending
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditModal(heir)}
                      className="text-sm text-gray-900 hover:text-gray-600 lg:px-3 lg:py-1 lg:border lg:border-gray-300 lg:hover:bg-gray-100"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleRemoveHeir(heir.id)}
                      className="hidden lg:block text-sm text-red-600 hover:text-red-700 px-3 py-1 border border-red-600  hover:bg-red-50"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="px-6 py-6 space-y-3 border-t border-gray-200 lg:border-0 lg:grid lg:grid-cols-3 lg:gap-4 lg:space-y-0">
            <div className="lg:bg-white lg:bg-white lg:border lg:border-gray-300 lg:p-6">
              <h3 className="hidden lg:block text-lg font-semibold text-gray-900 mb-4">Training & Drills</h3>
              <button className="w-full py-3 bg-gray-900 text-white  text-sm hover:bg-gray-800 lg:py-4 lg:text-base">
                🎮 Run Inheritance Drill
              </button>
              <p className="hidden lg:block text-xs text-gray-500 mt-3">
                Test heirs&apos; ability to access funds in a simulated scenario
              </p>
            </div>
            <div className="lg:bg-white lg:bg-white lg:border lg:border-gray-300 lg:p-6">
              <h3 className="hidden lg:block text-lg font-semibold text-gray-900 mb-4">Risk Analysis</h3>
              <Link
                href="/dashboard/risk-simulator"
                className="flex items-center justify-center gap-2 w-full py-3 border border-gray-300 text-gray-900  text-sm hover:bg-gray-50 lg:py-4 lg:text-base"
              >
                <Activity className="w-4 h-4" />
                Test Recovery Scenarios
              </Link>
              <p className="hidden lg:block text-xs text-gray-500 mt-3">
                Simulate disaster scenarios to ensure funds are recoverable
              </p>
            </div>
            <div className="lg:bg-white lg:bg-white lg:border lg:border-gray-300 lg:p-6">
              <h3 className="hidden lg:block text-lg font-semibold text-gray-900 mb-4">Communication</h3>
              <button className="w-full py-3 border border-gray-300 text-gray-900 text-sm hover:bg-gray-50 lg:py-4 lg:text-base">
                📚 Send Training Materials
              </button>
              <p className="hidden lg:block text-xs text-gray-500 mt-3">
                Share educational resources and recovery instructions
              </p>
            </div>
          </div>

          {/* Mobile Add Button */}
          <div className="px-6 pb-6 lg:hidden">
            <button
              onClick={() => setShowAddModal(true)}
              className="w-full py-3 bg-gray-900 text-white  text-sm hover:bg-gray-800"
            >
              + Add New Heir
            </button>
          </div>
        </div>
      </div>

      {/* Add Heir Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-gray-300 max-w-md w-full shadow-lg">
            <div className="p-6 border-b border-gray-300">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-medium text-gray-900">Add New Heir</h2>
                <button
                  onClick={() => {
                    setShowAddModal(false)
                    setFormData({ name: '', relationship: '', allocation: '', email: '', phone: '', isKeyHolder: false })
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
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Sarah Chen"
                  className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Relationship
                </label>
                <input
                  type="text"
                  value={formData.relationship}
                  onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                  placeholder="e.g., Daughter, Spouse, Charity"
                  className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Allocation (%)
                </label>
                <input
                  type="number"
                  value={formData.allocation}
                  onChange={(e) => setFormData({ ...formData, allocation: e.target.value })}
                  placeholder="e.g., 25"
                  min="0"
                  max="100"
                  className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Email (optional)
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g., sarah@example.com"
                  className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Phone (optional)
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="e.g., +1 555-0123"
                  className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-gray-900"
                />
              </div>

              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isKeyHolder}
                    onChange={(e) => setFormData({ ...formData, isKeyHolder: e.target.checked })}
                    className="border-2 border-gray-900"
                  />
                  <span className="text-sm text-gray-900">This heir holds a key in the multisig</span>
                </label>
              </div>
            </div>

            <div className="p-6 border-t border-gray-300 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowAddModal(false)
                  setFormData({ name: '', relationship: '', allocation: '', email: '', phone: '', isKeyHolder: false })
                }}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 underline"
              >
                Cancel
              </button>
              <button
                onClick={handleAddHeir}
                disabled={!formData.name || !formData.allocation}
                className="px-4 py-2 bg-gray-900 text-white text-sm hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Add Heir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Heir Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-gray-300 max-w-md w-full shadow-lg">
            <div className="p-6 border-b border-gray-300">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-medium text-gray-900">Edit Heir</h2>
                <button
                  onClick={() => {
                    setShowEditModal(false)
                    setEditingHeir(null)
                    setFormData({ name: '', relationship: '', allocation: '', email: '', phone: '', isKeyHolder: false })
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
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Sarah Chen"
                  className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Relationship
                </label>
                <input
                  type="text"
                  value={formData.relationship}
                  onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                  placeholder="e.g., Daughter, Spouse, Charity"
                  className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Allocation (%)
                </label>
                <input
                  type="number"
                  value={formData.allocation}
                  onChange={(e) => setFormData({ ...formData, allocation: e.target.value })}
                  placeholder="e.g., 25"
                  min="0"
                  max="100"
                  className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Email (optional)
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g., sarah@example.com"
                  className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Phone (optional)
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="e.g., +1 555-0123"
                  className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-gray-900"
                />
              </div>

              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isKeyHolder}
                    onChange={(e) => setFormData({ ...formData, isKeyHolder: e.target.checked })}
                    className="border-2 border-gray-900"
                  />
                  <span className="text-sm text-gray-900">This heir holds a key in the multisig</span>
                </label>
              </div>
            </div>

            <div className="p-6 border-t border-gray-300 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowEditModal(false)
                  setEditingHeir(null)
                  setFormData({ name: '', relationship: '', allocation: '', email: '', phone: '', isKeyHolder: false })
                }}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 underline"
              >
                Cancel
              </button>
              <button
                onClick={handleEditHeir}
                disabled={!formData.name || !formData.allocation}
                className="px-4 py-2 bg-gray-900 text-white text-sm hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}