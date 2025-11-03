'use client'

import { useState, useEffect } from 'react'
import {
  ArrowLeft,
  Plus,
  X,
  Shield,
  Clock,
  Users,
  Activity,
  ChevronRight,
  Circle,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Zap,
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

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600'
      case 'medium': return 'text-yellow-600'
      case 'high': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle2 className="w-5 h-5 text-green-600" />
      case 'paused': return <Clock className="w-5 h-5 text-yellow-600" />
      case 'pending': return <Circle className="w-5 h-5 text-gray-400" />
      default: return null
    }
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
                  <h1 className="text-3xl font-semibold text-gray-900">The Governator</h1>
                  <p className="text-gray-600 mt-2">Autonomous inheritance and access control</p>
                </div>
              </div>

              <div className="hidden lg:flex items-center gap-4">
                <Link
                  href="/dashboard"
                  className="px-5 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Back
                </Link>
                <button
                  onClick={() => setShowCreate(true)}
                  className="px-5 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Create Rule
                </button>
              </div>
            </div>

            {/* Stats - More visual weight */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
              <div>
                <p className="text-4xl font-light text-gray-900">{rules.filter(r => r.status === 'active').length}</p>
                <p className="text-gray-600 mt-1">Active Rules</p>
              </div>
              <div>
                <p className="text-4xl font-light text-gray-900">{new Set(rules.map(r => r.who)).size}</p>
                <p className="text-gray-600 mt-1">Beneficiaries</p>
              </div>
              <div>
                <p className="text-4xl font-light text-gray-900">{rules.reduce((sum, r) => sum + r.executions, 0)}</p>
                <p className="text-gray-600 mt-1">Executions</p>
              </div>
              <div>
                <p className={`text-4xl font-light ${rules.some(r => r.risk === 'high' && r.status === 'active') ? 'text-orange-600' : 'text-green-600'}`}>
                  {rules.some(r => r.risk === 'high' && r.status === 'active') ? 'Elevated' : 'Secure'}
                </p>
                <p className="text-gray-600 mt-1">Risk Status</p>
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 lg:px-8 py-8">
          {/* Active Rules - Card-based design */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Active Governance Rules</h2>

            {rules.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <Lock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 text-lg mb-2">No governance rules configured</p>
                <p className="text-gray-500">Create your first rule to automate inheritance</p>
                <button
                  onClick={() => setShowCreate(true)}
                  className="mt-6 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Get Started
                </button>
              </div>
            ) : (
              <div className="grid gap-4">
                {rules.map((rule) => (
                  <div key={rule.id} className="bg-white rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          {/* Rule Header */}
                          <div className="flex items-center gap-3 mb-4">
                            {getStatusIcon(rule.status)}
                            <h3 className="text-lg font-medium text-gray-900">{rule.who}</h3>
                            <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                              rule.risk === 'low' ? 'bg-green-100 text-green-700' :
                              rule.risk === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {rule.risk.toUpperCase()} RISK
                            </span>
                          </div>

                          {/* Rule Details */}
                          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-gray-500 mb-1">Permission</p>
                              <p className="font-medium text-gray-900">{rule.canDo}</p>
                            </div>
                            <div>
                              <p className="text-gray-500 mb-1">Trigger</p>
                              <p className="font-medium text-gray-900">{rule.when}</p>
                            </div>
                            <div>
                              <p className="text-gray-500 mb-1">Condition</p>
                              <p className="font-medium text-gray-900">{rule.condition}</p>
                            </div>
                            <div>
                              <p className="text-gray-500 mb-1">Activity</p>
                              <p className="font-medium text-gray-900">
                                {rule.executions} executions
                                {rule.lastExecuted && (
                                  <span className="text-gray-500 text-xs block">
                                    Last: {rule.lastExecuted.toLocaleDateString()}
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 ml-6">
                          <button
                            onClick={() => toggleRule(rule.id)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                              rule.status === 'active'
                                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                            }`}
                          >
                            {rule.status === 'active' ? 'Pause' : 'Resume'}
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(rule.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Templates - More visual */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Start Templates</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {TEMPLATES.map((template) => {
                const Icon = template.icon
                return (
                  <button
                    key={template.id}
                    onClick={() => applyTemplate(template)}
                    className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-all text-left group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 rounded-lg ${
                        template.risk === 'low' ? 'bg-green-50' :
                        template.risk === 'medium' ? 'bg-yellow-50' :
                        'bg-red-50'
                      }`}>
                        <Icon className={`w-6 h-6 ${getRiskColor(template.risk)}`} />
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{template.title}</h3>
                    <p className="text-sm text-gray-600 mb-4">{template.description}</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Who:</span>
                        <span className="text-gray-900 font-medium">{template.who}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Action:</span>
                        <span className="text-gray-900 font-medium">{template.canDo}</span>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Mobile FAB */}
          <div className="lg:hidden fixed bottom-6 right-6">
            <button
              onClick={() => setShowCreate(true)}
              className="w-14 h-14 bg-gray-900 text-white rounded-full shadow-lg hover:bg-gray-800 transition-colors flex items-center justify-center"
            >
              <Plus className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Create Modal - Better design */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">Create Governance Rule</h2>
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
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* WHO */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Users className="w-4 h-4 inline mr-1" />
                    Who can act?
                  </label>
                  <input
                    type="text"
                    value={newRule.who}
                    onChange={(e) => setNewRule({ ...newRule, who: e.target.value })}
                    placeholder="e.g., Emma Chen, Primary Heir"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none transition-colors"
                  />
                </div>

                {/* CAN DO */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Zap className="w-4 h-4 inline mr-1" />
                    What can they do?
                  </label>
                  <select
                    value={newRule.canDo}
                    onChange={(e) => setNewRule({ ...newRule, canDo: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none transition-colors"
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Clock className="w-4 h-4 inline mr-1" />
                    When does this trigger?
                  </label>
                  <select
                    value={newRule.when}
                    onChange={(e) => setNewRule({ ...newRule, when: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none transition-colors"
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Shield className="w-4 h-4 inline mr-1" />
                    Required conditions
                  </label>
                  <select
                    value={newRule.condition}
                    onChange={(e) => setNewRule({ ...newRule, condition: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none transition-colors"
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
                <div className="p-6 bg-gray-50 rounded-xl border border-gray-200">
                  <h3 className="text-sm font-medium text-gray-600 mb-3">Rule Preview</h3>
                  <p className="text-lg text-gray-900 leading-relaxed">
                    <span className="font-semibold">{newRule.who}</span> can{' '}
                    <span className="font-semibold text-blue-600">{newRule.canDo.toLowerCase()}</span> {' '}
                    <span className="font-semibold">{newRule.when.toLowerCase()}</span>, {' '}
                    provided <span className="font-semibold">{newRule.condition.toLowerCase()}</span>.
                  </p>
                  <div className="mt-4 flex items-center gap-2">
                    <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                      inferRisk(newRule.canDo) === 'low' ? 'bg-green-100 text-green-700' :
                      inferRisk(newRule.canDo) === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {inferRisk(newRule.canDo).toUpperCase()} RISK
                    </span>
                    <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
                      PENDING ACTIVATION
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowCreate(false)
                    setNewRule({ who: '', canDo: '', when: '', condition: '' })
                    setSelectedTemplate(null)
                  }}
                  className="px-6 py-2.5 text-gray-700 hover:bg-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={createRule}
                  disabled={!newRule.who || !newRule.canDo || !newRule.when || !newRule.condition}
                  className="px-6 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  Create Rule
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Delete Rule?</h3>
            </div>
            <p className="text-gray-600 mb-6">This action cannot be undone. The governance rule will be permanently deleted.</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteRule(deleteConfirm)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
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