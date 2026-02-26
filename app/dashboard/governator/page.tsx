'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useFamilySetup, GovernanceRule } from '@/lib/context/FamilySetup'

const TEMPLATES = [
  {
    id: 'inheritance',
    title: 'inheritance protocol',
    description: 'automatic asset transfer after inactivity',
    who: 'Primary Heir',
    canDo: 'Full Access',
    when: 'After 90 days inactive',
    condition: '2-of-3 multisig approval',
    risk: 'high' as const,
  },
  {
    id: 'emergency',
    title: 'emergency access',
    description: 'medical emergency fund release',
    who: 'Spouse',
    canDo: 'Withdraw 10%',
    when: 'Immediately',
    condition: 'Medical documentation',
    risk: 'medium' as const,
  },
  {
    id: 'maintenance',
    title: 'tax compliance',
    description: 'automated reporting for tax season',
    who: 'CPA',
    canDo: 'Export data',
    when: 'Quarterly',
    condition: 'Automatic',
    risk: 'low' as const,
  }
]

const ACTION_OPTIONS = [
  { group: 'view access', options: ['View balances', 'Export data'] },
  { group: 'withdraw access', options: ['Withdraw 10%', 'Withdraw 50%', 'Full Access'] },
  { group: 'control access', options: ['Freeze account', 'Initiate recovery'] },
]

const TRIGGER_OPTIONS = [
  { group: 'immediate', options: ['Immediately'] },
  { group: 'time-based', options: ['After 30 days inactive', 'After 90 days inactive', 'After 1 year inactive'] },
  { group: 'event-based', options: ['Upon death', 'Upon incapacity', 'At age 18', 'At age 25'] },
  { group: 'recurring', options: ['Monthly', 'Quarterly', 'Annually'] },
]

const CONDITION_OPTIONS = [
  { group: 'automatic', options: ['Automatic'] },
  { group: 'multisig', options: ['2-of-3 multisig approval', '3-of-5 multisig approval'] },
  { group: 'documentation', options: ['Death certificate', 'Medical documentation', 'Court order', 'KYC verification'] },
]

export default function GovernatorPage() {
  const { setup, updateGovernanceRules } = useFamilySetup()
  const [rules, setRules] = useState<GovernanceRule[]>(setup.governance_rules)
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
    setRules(setup.governance_rules)
  }, [setup.governance_rules])

  useEffect(() => {
    if (JSON.stringify(rules) !== JSON.stringify(setup.governance_rules)) {
      updateGovernanceRules(rules)
    }
  }, [rules, setup.governance_rules, updateGovernanceRules])

  const inferRisk = (action: string): 'low' | 'medium' | 'high' => {
    const lower = action.toLowerCase()
    if (lower.includes('full') || lower.includes('50%')) return 'high'
    if (lower.includes('10%') || lower.includes('withdraw')) return 'medium'
    return 'low'
  }

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

  const riskDot = (risk: string) => {
    if (risk === 'high') return 'text-red-500'
    if (risk === 'medium') return 'text-yellow-500'
    return 'text-green-500'
  }

  return (
    <main className="nexus">
      <div className="nexus-container">
        <div className="nexus-title">KEEP NEXUS · governance</div>
        <div className="nexus-family">The Governator</div>

        <div className="text-xs text-zinc-500 mt-2">
          {rules.filter(r => r.status === 'active').length} active · {new Set(rules.map(r => r.who)).size} beneficiaries · {rules.reduce((sum, r) => sum + (r.executions ?? 0), 0)} executions
        </div>

        <div className="nexus-divider" />

        {/* Active Rules */}
        {rules.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-zinc-500 text-sm mb-1">no governance rules configured</p>
            <p className="text-zinc-600 dark:text-zinc-400 text-xs mb-6">create your first rule to automate inheritance</p>
            <button
              onClick={() => setShowCreate(true)}
              className="nexus-btn nexus-btn-primary"
            >
              [create rule]
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {rules.map((rule) => (
              <div key={rule.id} className="border border-zinc-200 dark:border-zinc-800 px-3 py-3">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="text-sm text-zinc-800 dark:text-zinc-200">
                    <span className={riskDot(rule.risk ?? 'low')}>●</span>{' '}
                    <span className="font-medium">{rule.who}</span>
                    <span className="text-zinc-500"> can </span>
                    {rule.canDo.toLowerCase()}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => toggleRule(rule.id)}
                      className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                    >
                      [{rule.status === 'active' ? 'pause' : 'resume'}]
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(rule.id)}
                      className="text-xs text-zinc-600 hover:text-red-400 transition-colors"
                    >
                      [x]
                    </button>
                  </div>
                </div>
                <div className="space-y-0.5 pl-3">
                  <div className="nexus-row">
                    <span className="nexus-row-label">when</span>
                    <span className="nexus-row-value">{rule.when}</span>
                  </div>
                  <div className="nexus-row">
                    <span className="nexus-row-label">if</span>
                    <span className="nexus-row-value">{rule.condition}</span>
                  </div>
                  <div className="nexus-row">
                    <span className="nexus-row-label">status</span>
                    <span className="nexus-row-value">
                      {rule.status} · {rule.executions ?? 0}x
                      {rule.lastExecuted && ` · ${new Date(rule.lastExecuted).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="nexus-divider" />

        {/* Templates */}
        <div className="text-zinc-400 text-xs uppercase tracking-wider mb-4">templates</div>
        <div className="space-y-2">
          {TEMPLATES.map((template) => (
            <button
              key={template.id}
              onClick={() => applyTemplate(template)}
              className="w-full text-left border border-zinc-200 dark:border-zinc-800 px-3 py-3 hover:border-zinc-500 dark:hover:border-zinc-500 transition-colors"
            >
              <div className="text-sm text-zinc-800 dark:text-zinc-200 mb-1">{template.title}</div>
              <div className="text-xs text-zinc-500">{template.description} · {template.who} · {template.canDo.toLowerCase()}</div>
            </button>
          ))}
        </div>

        <div className="nexus-divider" />

        <div className="nexus-actions">
          <button className="nexus-btn nexus-btn-primary" onClick={() => setShowCreate(true)}>[create rule]</button>
          <Link href="/dashboard" className="nexus-btn">[back]</Link>
        </div>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="px-4 py-4 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center justify-between">
                <div>
                  <div className="nexus-title">create rule</div>
                  {selectedTemplate && (
                    <div className="text-xs text-zinc-500 mt-1">from {selectedTemplate.title} template</div>
                  )}
                </div>
                <button
                  onClick={() => {
                    setShowCreate(false)
                    setNewRule({ who: '', canDo: '', when: '', condition: '' })
                    setSelectedTemplate(null)
                  }}
                  className="text-zinc-500 hover:text-zinc-300 transition-colors text-sm"
                >
                  [close]
                </button>
              </div>
            </div>

            <div className="px-4 py-4 space-y-4">
              {/* Who */}
              <div className="space-y-1">
                <label className="text-zinc-400 text-xs uppercase tracking-wider">who can act?</label>
                <input
                  type="text"
                  value={newRule.who}
                  onChange={(e) => setNewRule({ ...newRule, who: e.target.value })}
                  placeholder="e.g., Emma Chen, Primary Heir"
                  className="nexus-input w-full"
                />
              </div>

              {/* Can Do */}
              <div className="space-y-1">
                <label className="text-zinc-400 text-xs uppercase tracking-wider">what can they do?</label>
                <select
                  value={newRule.canDo}
                  onChange={(e) => setNewRule({ ...newRule, canDo: e.target.value })}
                  className="nexus-select w-full"
                >
                  <option value="">select action</option>
                  {ACTION_OPTIONS.map(g => (
                    <optgroup key={g.group} label={g.group}>
                      {g.options.map(o => <option key={o} value={o}>{o}</option>)}
                    </optgroup>
                  ))}
                </select>
              </div>

              {/* When */}
              <div className="space-y-1">
                <label className="text-zinc-400 text-xs uppercase tracking-wider">when does this trigger?</label>
                <select
                  value={newRule.when}
                  onChange={(e) => setNewRule({ ...newRule, when: e.target.value })}
                  className="nexus-select w-full"
                >
                  <option value="">select trigger</option>
                  {TRIGGER_OPTIONS.map(g => (
                    <optgroup key={g.group} label={g.group}>
                      {g.options.map(o => <option key={o} value={o}>{o}</option>)}
                    </optgroup>
                  ))}
                </select>
              </div>

              {/* Condition */}
              <div className="space-y-1">
                <label className="text-zinc-400 text-xs uppercase tracking-wider">required conditions</label>
                <select
                  value={newRule.condition}
                  onChange={(e) => setNewRule({ ...newRule, condition: e.target.value })}
                  className="nexus-select w-full"
                >
                  <option value="">select condition</option>
                  {CONDITION_OPTIONS.map(g => (
                    <optgroup key={g.group} label={g.group}>
                      {g.options.map(o => <option key={o} value={o}>{o}</option>)}
                    </optgroup>
                  ))}
                </select>
              </div>

              {/* Preview */}
              {newRule.who && newRule.canDo && newRule.when && newRule.condition && (
                <>
                  <div className="nexus-divider !my-3" />
                  <div className="text-zinc-400 text-xs uppercase tracking-wider mb-1">preview</div>
                  <div className="text-sm text-zinc-700 dark:text-zinc-300">
                    {newRule.who} can {newRule.canDo.toLowerCase()} {newRule.when.toLowerCase()}, provided {newRule.condition.toLowerCase()}.
                  </div>
                  <div className="text-xs text-zinc-500">
                    {inferRisk(newRule.canDo)} risk · pending activation
                  </div>
                </>
              )}
            </div>

            <div className="px-4 py-4 border-t border-zinc-200 dark:border-zinc-800">
              <div className="nexus-actions !mt-0">
                <button
                  onClick={createRule}
                  disabled={!newRule.who || !newRule.canDo || !newRule.when || !newRule.condition}
                  className="nexus-btn nexus-btn-primary disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  [create]
                </button>
                <button
                  onClick={() => {
                    setShowCreate(false)
                    setNewRule({ who: '', canDo: '', when: '', condition: '' })
                    setSelectedTemplate(null)
                  }}
                  className="nexus-btn"
                >
                  [cancel]
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 max-w-sm w-full px-4 py-6">
            <div className="text-sm text-zinc-800 dark:text-zinc-200 mb-1">delete rule?</div>
            <div className="text-xs text-zinc-500 mb-6">this action cannot be undone.</div>
            <div className="nexus-actions !mt-0">
              <button
                onClick={() => deleteConfirm && deleteRule(deleteConfirm)}
                className="nexus-btn text-red-500 border-red-500/30 hover:border-red-500 hover:text-red-400"
              >
                [delete]
              </button>
              <button
                onClick={() => setDeleteConfirm(null)}
                className="nexus-btn"
              >
                [cancel]
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
