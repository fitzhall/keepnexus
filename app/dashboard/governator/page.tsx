'use client'

import { useState, useEffect } from 'react'
import {
  ArrowLeft,
  Plus,
  X,
  Shield,
  Activity,
  AlertCircle,
  Lock,
  Trash2
} from 'lucide-react'
import Link from 'next/link'

interface GovernanceRule {
  id: string
  who: string
  canDo: string
  when: string
  condition: string
  status: 'active' | 'paused' | 'pending'
  risk: 'low' | 'medium' | 'high'
  lastExecuted?: Date
  executions: number
}

const TEMPLATES = [
  {
    id: 'inheritance',
    title: 'Inheritance Protocol',
    description: 'Automatic asset transfer after inactivity',
    who: 'Primary Heir',
    canDo: 'Full Access',
    when: 'After 90 days inactive',
    condition: '2-of-3 multisig approval',
    risk: 'high' as const,
    icon: Shield
  },
  {
    id: 'emergency',
    title: 'Emergency Access',
    description: 'Medical emergency fund release',
    who: 'Spouse',
    canDo: 'Withdraw 10%',
    when: 'Immediately',
    condition: 'Medical documentation',
    risk: 'medium' as const,
    icon: AlertCircle
  },
  {
    id: 'maintenance',
    title: 'Tax Compliance',
    description: 'Automated reporting for tax season',
    who: 'CPA',
    canDo: 'Export data',
    when: 'Quarterly',
    condition: 'Automatic',
    risk: 'low' as const,
    icon: Activity
  }
]

export default function GovernatorPage() {
  const [rules, setRules] = useState<GovernanceRule[]>([])
  const [showCreate, setShowCreate] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<typeof TEMPLATES[0] | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const [newRule, setNewRule] = useState({
    who: '',
    canDo: '',
    when: '',
    condition: ''
  })

  useEffect(() => {
    const mockRules: GovernanceRule[] = [
      {
        id: '001',
        who: 'Emma Chen',
        canDo: 'Withdraw 10%',
        when: 'Immediately',
        condition: 'Medical emergency verified',
        status: 'active',
        risk: 'medium',
        lastExecuted: new Date('2024-10-15'),
        executions: 2
      },
      {
        id: '002',
        who: 'Michael Chen Jr.',
        canDo: 'Full Access',
        when: 'After 90 days inactive',
        condition: '2-of-3 multisig approval',
        status: 'active',
        risk: 'high',
        executions: 0
      },
      {
        id: '003',
        who: 'Harris & Associates',
        canDo: 'Export data',
        when: 'Quarterly',
        condition: 'Automatic',
        status: 'active',
        risk: 'low',
        lastExecuted: new Date('2024-10-01'),
        executions: 12
      }
    ]
    setRules(mockRules)
  }, [])

  const createRule = () => {
    if (!newRule.who || !newRule.canDo || !newRule.when || !newRule.condition) return

    const rule: GovernanceRule = {
      id: Date.now().toString(),
      who: newRule.who,
      canDo: newRule.canDo,
      when: newRule.when,
      condition: newRule.condition,
      status: 'pending',
      risk: inferRisk(newRule.canDo),
      executions: 0
    }

    setRules([rule, ...rules])
    setShowCreate(false)
    setNewRule({ who: '', canDo: '', when: '', condition: '' })
    setSelectedTemplate(null)
  }

  const inferRisk = (action: string): 'low' | 'medium' | 'high' => {
    const lower = action.toLowerCase()
    if (lower.includes('full') || lower.includes('50%')) return 'high'
    if (lower.includes('10%') || lower.includes('withdraw')) return 'medium'
    return 'low'
  }

  const toggleRule = (id: string) => {
    setRules(rules.map(r =>
      r.id === id
        ? { ...r, status: r.status === 'active' ? 'paused' : 'active' }
        : r
    ))
  }

  const deleteRule = (id: string) => {
    setRules(rules.filter(r => r.id !== id))
    setDeleteConfirm(null)
  }

  const applyTemplate = (template: typeof TEMPLATES[0]) => {
    setSelectedTemplate(template)
    setNewRule({
      who: template.who,
      canDo: template.canDo,
      when: template.when,
      condition: template.condition
    })
    setShowCreate(true)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header - Clean but substantial */}
        <div className="bg-white border-b border-gray-200">
          <div className="px-4 py-8 lg:px-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <Link href="/dashboard" className="lg:hidden">
                  <ArrowLeft className="w-6 h-6 text-gray-700" />
                </Link>
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900">The Governator</h1>
                  <p className="text-sm text-gray-600 mt-1">
                    {rules.filter(r => r.status === 'active').length} active • {new Set(rules.map(r => r.who)).size} beneficiaries • {rules.reduce((sum, r) => sum + r.executions, 0)} executions
                  </p>
                </div>
              </div>

              <div className="hidden lg:flex items-center gap-4">
                <Link
                  href="/dashboard"
                  className="text-sm text-gray-600 hover:text-gray-900 underline"
                >
                  Back
                </Link>
                <button
                  onClick={() => setShowCreate(true)}
                  className="px-4 py-2 bg-gray-900 text-white text-sm hover:bg-gray-800"
                >
                  + Create Rule
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 lg:px-8 py-8">
          {/* Active Rules - Card-based design */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Active Governance Rules</h2>

            {rules.length === 0 ? (
              <div className="bg-white border border-gray-300 p-12 text-center">
                <Lock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">No governance rules configured</p>
                <p className="text-gray-500 text-sm">Create your first rule to automate inheritance</p>
                <button
                  onClick={() => setShowCreate(true)}
                  className="mt-6 px-4 py-2 bg-gray-900 text-white text-sm hover:bg-gray-800"
                >
                  Get Started
                </button>
              </div>
            ) : (
              <div className="bg-white border border-gray-300">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-300">
                      <th className="px-4 py-2 text-left text-xs text-gray-600">
                        Who
                      </th>
                      <th className="px-4 py-2 text-left text-xs text-gray-600 border-l border-gray-300">
                        Can Do
                      </th>
                      <th className="px-4 py-2 text-left text-xs text-gray-600 border-l border-gray-300">
                        When
                      </th>
                      <th className="px-4 py-2 text-left text-xs text-gray-600 border-l border-gray-300">
                        If
                      </th>
                      <th className="px-4 py-2 text-left text-xs text-gray-600 border-l border-gray-300">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {rules.map((rule) => (
                      <tr key={rule.id} className="border-b border-gray-200 last:border-0">
                        {/* WHO Column */}
                        <td className="px-4 py-3 align-top text-sm">
                          <div className="text-gray-900 mb-1">
                            {rule.who}
                          </div>
                          <div className="text-xs text-gray-500">
                            {rule.risk} risk • {rule.executions}x
                            {rule.lastExecuted && ` • ${rule.lastExecuted.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                          </div>
                        </td>

                        {/* CAN DO Column */}
                        <td className="px-4 py-3 border-l border-gray-300 align-top text-sm text-gray-900">
                          {rule.canDo}
                        </td>

                        {/* WHEN Column */}
                        <td className="px-4 py-3 border-l border-gray-300 align-top text-sm text-gray-900">
                          {rule.when}
                        </td>

                        {/* IF Column */}
                        <td className="px-4 py-3 border-l border-gray-300 align-top text-sm text-gray-900">
                          {rule.condition}
                        </td>

                        {/* ACTIONS Column */}
                        <td className="px-4 py-3 border-l border-gray-300 align-top">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => toggleRule(rule.id)}
                              className="text-xs text-gray-600 hover:text-gray-900 underline"
                            >
                              {rule.status === 'active' ? 'pause' : 'resume'}
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(rule.id)}
                              className="text-xs text-gray-400 hover:text-gray-900"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Templates - More visual */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Start Templates</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {TEMPLATES.map((template) => (
                <button
                  key={template.id}
                  onClick={() => applyTemplate(template)}
                  className="bg-white border border-gray-300 p-4 text-left hover:border-gray-400"
                >
                  <h3 className="font-medium text-gray-900 mb-1">{template.title}</h3>
                  <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                  <div className="text-xs text-gray-500">
                    {template.who} • {template.canDo}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Mobile FAB */}
          <div className="lg:hidden fixed bottom-6 right-6">
            <button
              onClick={() => setShowCreate(true)}
              className="w-12 h-12 bg-gray-900 text-white shadow-lg hover:bg-gray-800 flex items-center justify-center"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Create Modal - Better design */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-gray-300 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-lg">
            <div className="p-6 border-b border-gray-300">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-medium text-gray-900">Create Governance Rule</h2>
                  {selectedTemplate && (
                    <p className="text-sm text-gray-600 mt-1">Based on {selectedTemplate.title} template</p>
                  )}
                </div>
                <button
                  onClick={() => {
                    setShowCreate(false)
                    setNewRule({ who: '', canDo: '', when: '', condition: '' })
                    setSelectedTemplate(null)
                  }}
                  className="text-gray-400 hover:text-gray-900"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* WHO */}
                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    Who can act?
                  </label>
                  <input
                    type="text"
                    value={newRule.who}
                    onChange={(e) => setNewRule({ ...newRule, who: e.target.value })}
                    placeholder="e.g., Emma Chen, Primary Heir"
                    className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-gray-900"
                  />
                </div>

                {/* CAN DO */}
                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    What can they do?
                  </label>
                  <select
                    value={newRule.canDo}
                    onChange={(e) => setNewRule({ ...newRule, canDo: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-gray-900"
                  >
                    <option value="">Select action</option>
                    <optgroup label="View Access">
                      <option value="View balances">View balances</option>
                      <option value="Export data">Export data</option>
                    </optgroup>
                    <optgroup label="Withdraw Access">
                      <option value="Withdraw 10%">Withdraw 10%</option>
                      <option value="Withdraw 50%">Withdraw 50%</option>
                      <option value="Full Access">Full Access</option>
                    </optgroup>
                    <optgroup label="Control Access">
                      <option value="Freeze account">Freeze account</option>
                      <option value="Initiate recovery">Initiate recovery</option>
                    </optgroup>
                  </select>
                </div>

                {/* WHEN */}
                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    When does this trigger?
                  </label>
                  <select
                    value={newRule.when}
                    onChange={(e) => setNewRule({ ...newRule, when: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-gray-900"
                  >
                    <option value="">Select trigger</option>
                    <optgroup label="Immediate">
                      <option value="Immediately">Immediately</option>
                    </optgroup>
                    <optgroup label="Time-based">
                      <option value="After 30 days inactive">After 30 days inactive</option>
                      <option value="After 90 days inactive">After 90 days inactive</option>
                      <option value="After 1 year inactive">After 1 year inactive</option>
                    </optgroup>
                    <optgroup label="Event-based">
                      <option value="Upon death">Upon death</option>
                      <option value="Upon incapacity">Upon incapacity</option>
                      <option value="At age 18">At age 18</option>
                      <option value="At age 25">At age 25</option>
                    </optgroup>
                    <optgroup label="Recurring">
                      <option value="Monthly">Monthly</option>
                      <option value="Quarterly">Quarterly</option>
                      <option value="Annually">Annually</option>
                    </optgroup>
                  </select>
                </div>

                {/* CONDITION */}
                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    Required conditions
                  </label>
                  <select
                    value={newRule.condition}
                    onChange={(e) => setNewRule({ ...newRule, condition: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-gray-900"
                  >
                    <option value="">Select condition</option>
                    <optgroup label="Automatic">
                      <option value="Automatic">No approval needed</option>
                    </optgroup>
                    <optgroup label="Multisig">
                      <option value="2-of-3 multisig approval">2-of-3 multisig approval</option>
                      <option value="3-of-5 multisig approval">3-of-5 multisig approval</option>
                    </optgroup>
                    <optgroup label="Documentation">
                      <option value="Death certificate">Death certificate</option>
                      <option value="Medical documentation">Medical documentation</option>
                      <option value="Court order">Court order</option>
                      <option value="KYC verification">KYC verification</option>
                    </optgroup>
                  </select>
                </div>
              </div>

              {/* Preview */}
              {newRule.who && newRule.canDo && newRule.when && newRule.condition && (
                <div className="p-4 bg-gray-50 border border-gray-300">
                  <p className="text-sm text-gray-600 mb-2">Preview:</p>
                  <p className="text-gray-900">
                    {newRule.who} can {newRule.canDo.toLowerCase()} {newRule.when.toLowerCase()}, provided {newRule.condition.toLowerCase()}.
                  </p>
                  <div className="mt-2 text-xs text-gray-500">
                    {inferRisk(newRule.canDo)} risk • pending activation
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-300 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowCreate(false)
                  setNewRule({ who: '', canDo: '', when: '', condition: '' })
                  setSelectedTemplate(null)
                }}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 underline"
              >
                Cancel
              </button>
              <button
                onClick={createRule}
                disabled={!newRule.who || !newRule.canDo || !newRule.when || !newRule.condition}
                className="px-4 py-2 bg-gray-900 text-white text-sm hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Create Rule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-gray-300 max-w-md w-full p-6 shadow-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Delete Rule?</h3>
            <p className="text-sm text-gray-600 mb-6">This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 underline"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteRule(deleteConfirm)}
                className="px-4 py-2 bg-gray-900 text-white text-sm hover:bg-gray-800"
              >
                Delete Rule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}