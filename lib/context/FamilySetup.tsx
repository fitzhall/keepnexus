/**
 * FamilySetup Context
 * Shared state for family configuration across the platform
 * Source of truth for: Vault, Heirs, Trust, Risk Simulator, Governator
 */

'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { MultisigSetup, Key, Vault, FamilyCharter, NexusAuditEntry, ThapHistoryEntry } from '@/lib/risk-simulator/types'
import { calculateThapHash } from '@/lib/thap/hash'
import {
  ScheduleEvent,
  DrillRecord,
  DrillSettings,
  VaultSettings,
  TaxSettings,
  CaptainSettings,
  ForeverSettings
} from '@/lib/risk-simulator/file-export'

// Governance Rule (from Governator)
export interface GovernanceRule {
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

// Heir/Beneficiary
export interface Heir {
  id: string
  name: string
  relationship: string
  email?: string
  phone?: string
  allocation?: number // Percentage of inheritance
  isKeyHolder?: boolean
}

// Trust Information
export interface TrustInfo {
  trustName?: string
  trusteeNames?: string[]
  dateEstablished?: Date
  lastReviewed?: Date
  documentIds?: string[] // References to uploaded documents
  jurisdiction?: string
  bitcoinInDocs?: boolean
  rufadaaFiled?: boolean
}

// Complete Family Setup (v1.2.0 - File-First System)
export interface FamilySetupData {
  // Basic info
  familyName: string

  // Core estate planning data
  multisig: MultisigSetup
  heirs: Heir[]
  trust: TrustInfo
  governanceRules: GovernanceRule[]

  // Page-specific data (v1.2.0+)
  scheduleEvents: ScheduleEvent[]
  drillHistory: DrillRecord[]
  drillSettings: DrillSettings
  vaultSettings: VaultSettings
  taxSettings: TaxSettings
  captainSettings: CaptainSettings
  foreverSettings: ForeverSettings

  // Core 4: Multi-wallet, Charter, THAP, Audit
  vaults: Vault[]
  charter: FamilyCharter
  auditTrail: NexusAuditEntry[]
  thapHash: string
  thapHistory: ThapHistoryEntry[]

  // Metadata
  lastUpdated: Date
  createdAt: Date
}

interface FamilySetupContextType {
  setup: FamilySetupData

  // Core data updates
  updateFamilyName: (name: string) => void
  updateMultisig: (multisig: MultisigSetup) => void
  updateHeirs: (heirs: Heir[]) => void
  updateTrust: (trust: TrustInfo) => void
  updateGovernanceRules: (rules: GovernanceRule[]) => void
  addGovernanceRule: (rule: GovernanceRule) => void
  removeGovernanceRule: (ruleId: string) => void

  // Page-specific data updates (v1.2.0+)
  updateScheduleEvents: (events: ScheduleEvent[]) => void
  addScheduleEvent: (event: ScheduleEvent) => void
  removeScheduleEvent: (id: string) => void

  updateDrillHistory: (history: DrillRecord[]) => void
  addDrillRecord: (record: DrillRecord) => void
  updateDrillSettings: (settings: DrillSettings) => void

  updateVaultSettings: (settings: VaultSettings) => void
  updateTaxSettings: (settings: TaxSettings) => void
  updateCaptainSettings: (settings: CaptainSettings) => void
  updateForeverSettings: (settings: ForeverSettings) => void

  // Core 4: Vault management
  addVault: (vault: Vault) => void
  updateVault: (id: string, vault: Partial<Vault>) => void
  removeVault: (id: string) => void

  // Core 4: Charter
  updateCharter: (charter: FamilyCharter) => void

  // Core 4: Audit
  addAuditEntry: (action: string, details: string, field?: string, oldValue?: string, newValue?: string) => void

  // File operations
  loadFromFile: (data: FamilySetupData) => void
  resetToDefault: () => void
}

const FamilySetupContext = createContext<FamilySetupContextType | undefined>(undefined)

// Empty setup for new users (triggers create wizard)
const EMPTY_SETUP: FamilySetupData = {
  familyName: '',
  multisig: {
    family: '',
    threshold: 0,
    totalKeys: 0,
    keys: [],
    createdAt: new Date()
  },
  heirs: [],
  trust: {},
  governanceRules: [],
  scheduleEvents: [],
  drillHistory: [],
  drillSettings: {
    frequency: 'quarterly',
    participants: [],
    notificationDays: 7,
    autoReminder: true,
    lastDrillDate: undefined as unknown as Date,
    nextDrillDate: undefined as unknown as Date,
  },
  vaultSettings: {
    walletType: 'hardware',
    lastRotationDate: undefined as unknown as Date,
    rotationFrequency: 90,
    backupLocations: [],
    testTransactionCompleted: false
  },
  taxSettings: {
    reportingFrequency: 'quarterly',
    cpaEmail: '',
    cpaName: '',
    autoGenerate: false,
    lastReportDate: undefined as unknown as Date,
    nextReportDue: undefined as unknown as Date,
    taxStrategy: 'hodl'
  },
  captainSettings: {
    advisorName: '',
    advisorEmail: '',
    advisorPhone: '',
    advisorFirm: '',
    serviceTier: 'nexus',
    annualReviewDate: undefined as unknown as Date,
    lastCheckupDate: undefined as unknown as Date,
    professionalNetwork: {
      attorney: '',
      cpa: '',
      custodian: ''
    }
  },
  foreverSettings: {
    archivalEnabled: false,
    redundantLocations: [],
    lastBackupDate: undefined as unknown as Date,
    generationPlan: '',
    timeLockInstructions: ''
  },

  // Core 4 defaults
  vaults: [],
  charter: {
    mission: '',
    principles: [],
    reviewFrequency: 'annual',
  },
  auditTrail: [],
  thapHash: '',
  thapHistory: [],

  lastUpdated: new Date(),
  createdAt: new Date()
}

// Demo setup (Chen Family) for testing
const DEFAULT_SETUP: FamilySetupData = {
  familyName: 'Chen Family',
  multisig: {
    family: 'Chen Family',
    threshold: 3,
    totalKeys: 5,
    keys: [
      {
        id: 'dad',
        holder: 'Dad (Michael)',
        role: 'primary',
        type: 'full',
        storage: 'hardware-wallet',
        location: 'Home Safe'
      },
      {
        id: 'mom',
        holder: 'Mom (Emma)',
        role: 'spouse',
        type: 'full',
        storage: 'hardware-wallet',
        location: 'Bank Safe Deposit'
      },
      {
        id: 'son',
        holder: 'Son (Mike Jr)',
        role: 'child',
        type: 'full',
        storage: 'hardware-wallet',
        location: 'Personal Safe'
      },
      {
        id: 'attorney',
        holder: 'Attorney (Harris)',
        role: 'attorney',
        type: 'full',
        storage: 'paper',
        location: 'Law Office Vault'
      },
      {
        id: 'custodian',
        holder: 'Custodian (Unchained)',
        role: 'custodian',
        type: 'full',
        storage: 'custodian',
        location: 'Distributed'
      }
    ],
    createdAt: new Date()
  },
  heirs: [
    {
      id: 'mom',
      name: 'Emma Chen',
      relationship: 'Spouse',
      email: 'emma@chenfamily.com',
      allocation: 60,
      isKeyHolder: true
    },
    {
      id: 'son',
      name: 'Mike Chen Jr.',
      relationship: 'Son',
      email: 'mike.jr@chenfamily.com',
      allocation: 30,
      isKeyHolder: true
    },
    {
      id: 'charity',
      name: 'Bitcoin Foundation',
      relationship: 'Charity',
      allocation: 10,
      isKeyHolder: false
    }
  ],
  trust: {
    trustName: 'Chen Family Revocable Living Trust',
    trusteeNames: ['Michael Chen', 'Emma Chen'],
    lastReviewed: new Date('2024-10-15')
  },
  governanceRules: [
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
    }
  ],

  // Page-specific data defaults (v1.2.0+)
  scheduleEvents: [
    {
      id: '1',
      title: 'Key Rotation',
      description: 'Quarterly security rotation',
      date: '2025-11-14',
      type: 'rotation',
      completed: false
    },
    {
      id: '2',
      title: 'Monthly Drill',
      description: 'Inheritance simulation',
      date: '2025-11-18',
      type: 'drill',
      completed: false
    },
    {
      id: '3',
      title: 'Trust Review',
      description: 'Annual document review',
      date: '2025-12-01',
      type: 'review',
      completed: false
    },
    {
      id: '4',
      title: 'Tax Report',
      description: 'Auto-generated CSV',
      date: '2025-12-31',
      type: 'report',
      completed: false
    }
  ],

  drillHistory: [
    {
      id: '1',
      date: new Date('2024-10-18'),
      participants: ['Emma Chen', 'Mike Chen Jr.'],
      result: 'passed',
      notes: 'All heirs successfully accessed backup keys',
      duration: 15,
      recoveryTime: 180
    },
    {
      id: '2',
      date: new Date('2024-09-18'),
      participants: ['Emma Chen', 'Mike Chen Jr.'],
      result: 'passed',
      notes: '2/3 heirs passed, Mike Jr. needed guidance',
      duration: 22,
      recoveryTime: 240
    }
  ],

  drillSettings: {
    frequency: 'monthly',
    participants: ['Emma Chen', 'Mike Chen Jr.'],
    notificationDays: 7,
    autoReminder: true,
    lastDrillDate: new Date('2024-10-18'),
    nextDrillDate: new Date('2025-11-18')
  },

  vaultSettings: {
    walletType: 'hardware',
    lastRotationDate: new Date('2024-08-14'),
    rotationFrequency: 90,
    backupLocations: ['Home Safe', 'Bank Vault', 'Attorney Office'],
    testTransactionCompleted: true
  },

  taxSettings: {
    reportingFrequency: 'quarterly',
    cpaEmail: 'harris@cpafirm.com',
    cpaName: 'Harris & Associates CPA',
    autoGenerate: true,
    lastReportDate: new Date('2024-09-30'),
    nextReportDue: new Date('2025-12-31'),
    taxStrategy: 'hodl'
  },

  captainSettings: {
    advisorName: 'Sarah Thompson',
    advisorEmail: 'sarah@keepadvisors.com',
    advisorPhone: '+1-555-KEEP-BTC',
    advisorFirm: 'Keep Advisors LLC',
    serviceTier: 'nexus',
    annualReviewDate: new Date('2025-10-15'),
    lastCheckupDate: new Date('2024-10-15'),
    professionalNetwork: {
      attorney: 'Harris Law Group',
      cpa: 'Harris & Associates CPA',
      custodian: 'Unchained Capital'
    }
  },

  foreverSettings: {
    archivalEnabled: false,
    redundantLocations: ['Home Safe', 'Bank Vault', 'Attorney Office'],
    lastBackupDate: new Date('2024-10-18'),
    generationPlan: 'Multi-generational Bitcoin wealth transfer plan established for Chen family descendants',
    timeLockInstructions: 'Review time-lock vaults annually; activate emergency protocol if primary holder inactive >90 days'
  },

  // Core 4 defaults for demo
  vaults: [],
  charter: {
    mission: 'Preserve and grow family Bitcoin wealth across generations with security, transparency, and shared governance.',
    principles: [
      'Never store all keys in one location',
      'Review inheritance plan quarterly',
      'All heirs must complete annual drill'
    ],
    reviewFrequency: 'quarterly',
    lastReviewed: new Date('2024-10-15'),
  },
  auditTrail: [],
  thapHash: '',
  thapHistory: [],

  // Metadata
  lastUpdated: new Date(),
  createdAt: new Date()
}

export function FamilySetupProvider({ children }: { children: ReactNode }) {
  const [setup, setSetup] = useState<FamilySetupData>(EMPTY_SETUP)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('familySetup')
    if (stored) {
      try {
        const parsed = JSON.parse(stored, (key, value) => {
          const dateFields = [
            'lastUpdated', 'createdAt', 'lastReviewed', 'lastExecuted',
            'date', 'lastDrillDate', 'nextDrillDate', 'lastRotationDate',
            'lastReportDate', 'nextReportDue', 'annualReviewDate',
            'lastCheckupDate', 'lastBackupDate', 'timestamp'
          ]
          if (dateFields.includes(key)) {
            return value ? new Date(value) : undefined
          }
          return value
        })
        // Migration: if vaults[] missing but multisig has keys, wrap into vaults[0]
        if ((!parsed.vaults || parsed.vaults.length === 0) && parsed.multisig?.keys?.length > 0) {
          parsed.vaults = [{
            id: 'vault-primary',
            label: 'primary',
            multisig: parsed.multisig,
          }]
        }
        // Ensure Core 4 fields exist
        if (!parsed.charter) parsed.charter = { mission: '', principles: [], reviewFrequency: 'annual' }
        if (!parsed.auditTrail) parsed.auditTrail = []
        if (!parsed.thapHash) parsed.thapHash = ''
        if (!parsed.thapHistory) parsed.thapHistory = []
        setSetup(parsed)
      } catch (err) {
        console.error('Failed to load family setup from storage:', err)
      }
    }
    setIsLoaded(true)
  }, [])

  // Save to localStorage whenever setup changes (skip until initial load completes)
  useEffect(() => {
    if (!isLoaded) return
    localStorage.setItem('familySetup', JSON.stringify(setup))
  }, [setup, isLoaded])

  // THAP: Auto-recalculate hash when canonical data fields change
  useEffect(() => {
    if (!setup.familyName) return

    calculateThapHash(setup).then(newHash => {
      if (newHash !== setup.thapHash && setup.thapHash !== '') {
        // Hash changed — push old hash to history
        setSetup(prev => ({
          ...prev,
          thapHistory: [...prev.thapHistory, {
            hash: prev.thapHash,
            timestamp: new Date(),
          }],
          thapHash: newHash,
        }))
      } else if (setup.thapHash === '') {
        // First calculation
        setSetup(prev => ({ ...prev, thapHash: newHash }))
      }
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setup.familyName, setup.multisig, setup.vaults, setup.heirs, setup.charter, setup.trust, setup.governanceRules, setup.captainSettings, setup.drillSettings, setup.taxSettings])

  const updateFamilyName = (name: string) => {
    setSetup(prev => ({
      ...prev,
      familyName: name,
      multisig: { ...prev.multisig, family: name },
      lastUpdated: new Date()
    }))
    addAuditEntry('family.updated', `Family name changed to "${name}"`, 'familyName')
  }

  const updateMultisig = (multisig: MultisigSetup) => {
    setSetup(prev => ({
      ...prev,
      multisig,
      lastUpdated: new Date()
    }))
    addAuditEntry('multisig.updated', `Multisig updated: ${multisig.threshold}-of-${multisig.totalKeys}`)
  }

  const updateHeirs = (heirs: Heir[]) => {
    setSetup(prev => ({
      ...prev,
      heirs,
      lastUpdated: new Date()
    }))
    addAuditEntry('heirs.updated', `Heirs updated: ${heirs.length} beneficiaries`)
  }

  const updateTrust = (trust: TrustInfo) => {
    setSetup(prev => ({
      ...prev,
      trust,
      lastUpdated: new Date()
    }))
    addAuditEntry('trust.updated', `Trust info updated`)
  }

  const updateGovernanceRules = (rules: GovernanceRule[]) => {
    setSetup(prev => ({
      ...prev,
      governanceRules: rules,
      lastUpdated: new Date()
    }))
  }

  const addGovernanceRule = (rule: GovernanceRule) => {
    setSetup(prev => ({
      ...prev,
      governanceRules: [...prev.governanceRules, rule],
      lastUpdated: new Date()
    }))
  }

  const removeGovernanceRule = (ruleId: string) => {
    setSetup(prev => ({
      ...prev,
      governanceRules: prev.governanceRules.filter(r => r.id !== ruleId),
      lastUpdated: new Date()
    }))
  }

  // Schedule Events methods
  const updateScheduleEvents = (events: ScheduleEvent[]) => {
    setSetup(prev => ({
      ...prev,
      scheduleEvents: events,
      lastUpdated: new Date()
    }))
  }

  const addScheduleEvent = (event: ScheduleEvent) => {
    setSetup(prev => ({
      ...prev,
      scheduleEvents: [...prev.scheduleEvents, event],
      lastUpdated: new Date()
    }))
  }

  const removeScheduleEvent = (id: string) => {
    setSetup(prev => ({
      ...prev,
      scheduleEvents: prev.scheduleEvents.filter(e => e.id !== id),
      lastUpdated: new Date()
    }))
  }

  // Drill methods
  const updateDrillHistory = (history: DrillRecord[]) => {
    setSetup(prev => ({
      ...prev,
      drillHistory: history,
      lastUpdated: new Date()
    }))
  }

  const addDrillRecord = (record: DrillRecord) => {
    setSetup(prev => ({
      ...prev,
      drillHistory: [...prev.drillHistory, record],
      lastUpdated: new Date()
    }))
  }

  const updateDrillSettings = (settings: DrillSettings) => {
    setSetup(prev => ({
      ...prev,
      drillSettings: settings,
      lastUpdated: new Date()
    }))
  }

  // Page-specific settings methods
  const updateVaultSettings = (settings: VaultSettings) => {
    setSetup(prev => ({
      ...prev,
      vaultSettings: settings,
      lastUpdated: new Date()
    }))
  }

  const updateTaxSettings = (settings: TaxSettings) => {
    setSetup(prev => ({
      ...prev,
      taxSettings: settings,
      lastUpdated: new Date()
    }))
  }

  const updateCaptainSettings = (settings: CaptainSettings) => {
    setSetup(prev => ({
      ...prev,
      captainSettings: settings,
      lastUpdated: new Date()
    }))
  }

  const updateForeverSettings = (settings: ForeverSettings) => {
    setSetup(prev => ({
      ...prev,
      foreverSettings: settings,
      lastUpdated: new Date()
    }))
  }

  // ── Core 4: Vault methods ──

  const addAuditEntry = (action: string, details: string, field?: string, oldValue?: string, newValue?: string) => {
    const entry: NexusAuditEntry = {
      id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date(),
      action,
      details,
      field,
      oldValue,
      newValue,
    }
    setSetup(prev => ({
      ...prev,
      auditTrail: [...prev.auditTrail, entry],
    }))
  }

  const addVault = (vault: Vault) => {
    setSetup(prev => ({
      ...prev,
      vaults: [...prev.vaults, vault],
      // Keep multisig in sync with first vault for backward compat
      multisig: prev.vaults.length === 0 ? vault.multisig : prev.multisig,
      lastUpdated: new Date(),
    }))
    addAuditEntry('vault.created', `Added vault "${vault.label}"`)
  }

  const updateVault = (id: string, updates: Partial<Vault>) => {
    setSetup(prev => {
      const vaults = prev.vaults.map(v => v.id === id ? { ...v, ...updates } : v)
      return {
        ...prev,
        vaults,
        // Keep multisig in sync with first vault
        multisig: vaults[0]?.multisig || prev.multisig,
        lastUpdated: new Date(),
      }
    })
    addAuditEntry('vault.updated', `Updated vault "${id}"`)
  }

  const removeVault = (id: string) => {
    setSetup(prev => {
      const vaults = prev.vaults.filter(v => v.id !== id)
      return {
        ...prev,
        vaults,
        multisig: vaults[0]?.multisig || prev.multisig,
        lastUpdated: new Date(),
      }
    })
    addAuditEntry('vault.removed', `Removed vault "${id}"`)
  }

  const updateCharter = (charter: FamilyCharter) => {
    setSetup(prev => ({
      ...prev,
      charter,
      lastUpdated: new Date(),
    }))
    addAuditEntry('charter.updated', 'Family charter updated')
  }

  const loadFromFile = (data: FamilySetupData) => {
    setSetup({
      ...data,
      lastUpdated: new Date()
    })
  }

  const resetToDefault = () => {
    setSetup({
      ...EMPTY_SETUP,
      lastUpdated: new Date(),
      createdAt: new Date()
    })
    localStorage.removeItem('familySetup')
  }

  const loadDemoData = () => {
    setSetup({
      ...DEFAULT_SETUP,
      lastUpdated: new Date(),
      createdAt: new Date()
    })
  }

  return (
    <FamilySetupContext.Provider
      value={{
        setup,
        // Core data updates
        updateFamilyName,
        updateMultisig,
        updateHeirs,
        updateTrust,
        updateGovernanceRules,
        addGovernanceRule,
        removeGovernanceRule,
        // Page-specific data updates
        updateScheduleEvents,
        addScheduleEvent,
        removeScheduleEvent,
        updateDrillHistory,
        addDrillRecord,
        updateDrillSettings,
        updateVaultSettings,
        updateTaxSettings,
        updateCaptainSettings,
        updateForeverSettings,
        // Core 4
        addVault,
        updateVault,
        removeVault,
        updateCharter,
        addAuditEntry,
        // File operations
        loadFromFile,
        resetToDefault
      }}
    >
      {children}
    </FamilySetupContext.Provider>
  )
}

// Hook to use the context
export function useFamilySetup() {
  const context = useContext(FamilySetupContext)
  if (context === undefined) {
    throw new Error('useFamilySetup must be used within a FamilySetupProvider')
  }
  return context
}
