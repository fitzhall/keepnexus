/**
 * FamilySetup Context
 * Shared state for family configuration across the platform
 * Source of truth for: Vault, Heirs, Trust, Risk Simulator, Governator
 */

'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { MultisigSetup, Key } from '@/lib/risk-simulator/types'

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
}

// Complete Family Setup
export interface FamilySetupData {
  // Basic info
  familyName: string

  // Multisig configuration (from Vault)
  multisig: MultisigSetup

  // Heirs/Beneficiaries
  heirs: Heir[]

  // Trust information
  trust: TrustInfo

  // Governance rules (from Governator)
  governanceRules: GovernanceRule[]

  // Metadata
  lastUpdated: Date
  createdAt: Date
}

interface FamilySetupContextType {
  setup: FamilySetupData
  updateFamilyName: (name: string) => void
  updateMultisig: (multisig: MultisigSetup) => void
  updateHeirs: (heirs: Heir[]) => void
  updateTrust: (trust: TrustInfo) => void
  updateGovernanceRules: (rules: GovernanceRule[]) => void
  addGovernanceRule: (rule: GovernanceRule) => void
  removeGovernanceRule: (ruleId: string) => void
  loadFromFile: (data: FamilySetupData) => void
  resetToDefault: () => void
}

const FamilySetupContext = createContext<FamilySetupContextType | undefined>(undefined)

// Default setup (based on Chen Family demo)
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
        type: 'full',
        storage: 'hardware-wallet',
        location: 'Home Safe'
      },
      {
        id: 'mom',
        holder: 'Mom (Emma)',
        type: 'full',
        storage: 'hardware-wallet',
        location: 'Bank Safe Deposit'
      },
      {
        id: 'son',
        holder: 'Son (Mike Jr)',
        type: 'full',
        storage: 'hardware-wallet',
        location: 'Personal Safe'
      },
      {
        id: 'attorney',
        holder: 'Attorney (Harris)',
        type: 'full',
        storage: 'paper',
        location: 'Law Office Vault'
      },
      {
        id: 'custodian',
        holder: 'Custodian (Unchained)',
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
  lastUpdated: new Date(),
  createdAt: new Date()
}

export function FamilySetupProvider({ children }: { children: ReactNode }) {
  const [setup, setSetup] = useState<FamilySetupData>(DEFAULT_SETUP)

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('familySetup')
    if (stored) {
      try {
        const parsed = JSON.parse(stored, (key, value) => {
          // Revive Date objects
          if (key === 'lastUpdated' || key === 'createdAt' || key === 'lastReviewed' || key === 'lastExecuted') {
            return value ? new Date(value) : undefined
          }
          return value
        })
        setSetup(parsed)
      } catch (err) {
        console.error('Failed to load family setup from storage:', err)
      }
    }
  }, [])

  // Save to localStorage whenever setup changes
  useEffect(() => {
    localStorage.setItem('familySetup', JSON.stringify(setup))
  }, [setup])

  const updateFamilyName = (name: string) => {
    setSetup(prev => ({
      ...prev,
      familyName: name,
      multisig: { ...prev.multisig, family: name },
      lastUpdated: new Date()
    }))
  }

  const updateMultisig = (multisig: MultisigSetup) => {
    setSetup(prev => ({
      ...prev,
      multisig,
      lastUpdated: new Date()
    }))
  }

  const updateHeirs = (heirs: Heir[]) => {
    setSetup(prev => ({
      ...prev,
      heirs,
      lastUpdated: new Date()
    }))
  }

  const updateTrust = (trust: TrustInfo) => {
    setSetup(prev => ({
      ...prev,
      trust,
      lastUpdated: new Date()
    }))
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

  const loadFromFile = (data: FamilySetupData) => {
    setSetup({
      ...data,
      lastUpdated: new Date()
    })
  }

  const resetToDefault = () => {
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
        updateFamilyName,
        updateMultisig,
        updateHeirs,
        updateTrust,
        updateGovernanceRules,
        addGovernanceRule,
        removeGovernanceRule,
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
