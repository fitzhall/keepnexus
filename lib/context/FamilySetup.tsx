/**
 * FamilySetup Context v2.0
 * Wraps LittleShardFile as the single source of truth.
 * All UI code uses `useFamilySetup()` — the hook API stays the same.
 */

'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import {
  LittleShardFile,
  Heir,
  GovernanceRule,
  Charter,
  Wallet as ShardWallet,
  KeyHolder,
  EventLogEntry,
  ProfessionalNetwork,
  ContinuityConfig,
  LegalDocuments,
} from '@/lib/keep-core/data-model'
import { createNewShardFile, migrateV1ToV2 } from '@/lib/keep-core/little-shard'
import { calculateThapHash } from '@/lib/thap/hash'

// Re-export types that UI pages import from here
export type { Heir, GovernanceRule, Charter, LegalDocuments, ProfessionalNetwork, ContinuityConfig }

// ============================================================================
// Context Types
// ============================================================================

interface FamilySetupContextType {
  setup: LittleShardFile

  // Core data updates
  updateFamilyName: (name: string) => void
  updateHeirs: (heirs: Heir[]) => void
  updateGovernanceRules: (rules: GovernanceRule[]) => void
  addGovernanceRule: (rule: GovernanceRule) => void
  removeGovernanceRule: (ruleId: string) => void

  // K — Key Governance
  addWallet: (wallet: ShardWallet) => void
  updateWallet: (id: string, wallet: Partial<ShardWallet>) => void
  removeWallet: (id: string) => void

  // E — Estate Integration
  updateCharter: (charter: Charter) => void
  updateLegal: (legal: LegalDocuments) => void

  // E — Ensured Continuity
  updateContinuity: (continuity: ContinuityConfig) => void

  // P — Professional Stewardship
  updateProfessionals: (professionals: ProfessionalNetwork) => void

  // Integrity
  addEventLogEntry: (eventType: string, description: string, metadata?: Record<string, any>) => void

  // File operations
  loadFromFile: (data: any) => void
  resetToDefault: () => void
}

const FamilySetupContext = createContext<FamilySetupContextType | undefined>(undefined)

// ============================================================================
// Empty shard (triggers create wizard when family_name is '')
// ============================================================================

const EMPTY_SHARD: LittleShardFile = createNewShardFile('')

// ============================================================================
// Provider
// ============================================================================

export function FamilySetupProvider({ children }: { children: ReactNode }) {
  const [setup, setSetup] = useState<LittleShardFile>(EMPTY_SHARD)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('familySetup')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)

        // Detect v1 format (has familyName but not family_name)
        if (parsed.familyName && !parsed.family_name) {
          const migrated = migrateV1ToV2(parsed)
          setSetup(migrated)
        } else {
          // Ensure all v2 required fields exist
          const shard: LittleShardFile = {
            ...EMPTY_SHARD,
            ...parsed,
            // Ensure nested objects exist
            charter: { ...EMPTY_SHARD.charter, ...parsed.charter },
            legal: { ...EMPTY_SHARD.legal, ...parsed.legal },
            continuity: { ...EMPTY_SHARD.continuity, ...parsed.continuity },
            professionals: { ...EMPTY_SHARD.professionals, ...parsed.professionals },
            education: { ...EMPTY_SHARD.education, ...parsed.education },
            thap: { ...EMPTY_SHARD.thap, ...parsed.thap },
            keep_score: { ...EMPTY_SHARD.keep_score, ...parsed.keep_score },
            redundancy: { ...EMPTY_SHARD.redundancy, ...parsed.redundancy },
          }
          setSetup(shard)
        }
      } catch (err) {
        console.error('Failed to load family setup from storage:', err)
      }
    }
    setIsLoaded(true)
  }, [])

  // Save to localStorage whenever setup changes
  useEffect(() => {
    if (!isLoaded) return
    localStorage.setItem('familySetup', JSON.stringify(setup))
  }, [setup, isLoaded])

  // THAP: Auto-recalculate hash when canonical data fields change
  useEffect(() => {
    if (!setup.family_name) return

    calculateThapHash(setup).then(newHash => {
      if (newHash !== setup.thap.current_hash && setup.thap.current_hash !== '') {
        // Hash changed — push old hash to history
        setSetup(prev => ({
          ...prev,
          thap: {
            current_hash: newHash,
            history: [...prev.thap.history, {
              hash: prev.thap.current_hash,
              timestamp: new Date().toISOString(),
            }],
          },
        }))
      } else if (setup.thap.current_hash === '') {
        // First calculation
        setSetup(prev => ({
          ...prev,
          thap: { ...prev.thap, current_hash: newHash },
        }))
      }
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    setup.family_name, setup.wallets, setup.keyholders, setup.heirs,
    setup.charter, setup.legal, setup.governance_rules,
    setup.professionals, setup.continuity,
  ])

  // ── Helper: append event log entry with hash chain ──
  const appendEventLog = (eventType: string, description: string, metadata?: Record<string, any>) => {
    setSetup(prev => {
      const entry: EventLogEntry = {
        id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        timestamp: new Date().toISOString(),
        event_type: eventType,
        description,
        metadata,
      }
      // Hash chain: hash of previous entry
      if (prev.event_log.length > 0) {
        const prevEntry = prev.event_log[prev.event_log.length - 1]
        const str = JSON.stringify(prevEntry)
        let hash = 0
        for (let i = 0; i < str.length; i++) {
          hash = ((hash << 5) - hash) + str.charCodeAt(i)
          hash = hash & hash
        }
        entry.hash = Math.abs(hash).toString(16)
      }
      return {
        ...prev,
        event_log: [...prev.event_log, entry],
        last_modified: entry.timestamp,
      }
    })
  }

  // ── Core Data Updates ──

  const updateFamilyName = (name: string) => {
    setSetup(prev => ({ ...prev, family_name: name, last_modified: new Date().toISOString() }))
    appendEventLog('family.updated', `Family name changed to "${name}"`)
  }

  const updateHeirs = (heirs: Heir[]) => {
    setSetup(prev => ({ ...prev, heirs, last_modified: new Date().toISOString() }))
    appendEventLog('heirs.updated', `Heirs updated: ${heirs.length} beneficiaries`)
  }

  const updateGovernanceRules = (rules: GovernanceRule[]) => {
    setSetup(prev => ({ ...prev, governance_rules: rules, last_modified: new Date().toISOString() }))
  }

  const addGovernanceRule = (rule: GovernanceRule) => {
    setSetup(prev => ({
      ...prev,
      governance_rules: [...prev.governance_rules, rule],
      last_modified: new Date().toISOString(),
    }))
  }

  const removeGovernanceRule = (ruleId: string) => {
    setSetup(prev => ({
      ...prev,
      governance_rules: prev.governance_rules.filter(r => r.id !== ruleId),
      last_modified: new Date().toISOString(),
    }))
  }

  // ── K: Wallet management ──

  const addWallet = (wallet: ShardWallet) => {
    setSetup(prev => ({ ...prev, wallets: [...prev.wallets, wallet], last_modified: new Date().toISOString() }))
    appendEventLog('wallet.created', `Added wallet "${wallet.label}"`)
  }

  const updateWallet = (id: string, updates: Partial<ShardWallet>) => {
    setSetup(prev => ({
      ...prev,
      wallets: prev.wallets.map(w => w.id === id ? { ...w, ...updates } : w),
      last_modified: new Date().toISOString(),
    }))
    appendEventLog('wallet.updated', `Updated wallet "${id}"`)
  }

  const removeWallet = (id: string) => {
    setSetup(prev => ({
      ...prev,
      wallets: prev.wallets.filter(w => w.id !== id),
      last_modified: new Date().toISOString(),
    }))
    appendEventLog('wallet.removed', `Removed wallet "${id}"`)
  }

  // ── E: Estate ──

  const updateCharter = (charter: Charter) => {
    setSetup(prev => ({ ...prev, charter, last_modified: new Date().toISOString() }))
    appendEventLog('charter.updated', 'Family charter updated')
  }

  const updateLegal = (legal: LegalDocuments) => {
    setSetup(prev => ({ ...prev, legal, last_modified: new Date().toISOString() }))
    appendEventLog('legal.updated', 'Legal documents updated')
  }

  // ── E: Continuity ──

  const updateContinuity = (continuity: ContinuityConfig) => {
    setSetup(prev => ({ ...prev, continuity, last_modified: new Date().toISOString() }))
  }

  // ── P: Professionals ──

  const updateProfessionals = (professionals: ProfessionalNetwork) => {
    setSetup(prev => ({ ...prev, professionals, last_modified: new Date().toISOString() }))
    appendEventLog('professionals.updated', 'Professional network updated')
  }

  // ── File operations ──

  const loadFromFile = (data: any) => {
    // Accept either v1 (FamilySetupData) or v2 (LittleShardFile)
    if (data.familyName && !data.family_name) {
      // v1 format — migrate
      const migrated = migrateV1ToV2(data)
      setSetup({ ...migrated, last_modified: new Date().toISOString() })
    } else {
      // v2 format — use directly with defaults for missing fields
      const shard: LittleShardFile = {
        ...EMPTY_SHARD,
        ...data,
        charter: { ...EMPTY_SHARD.charter, ...data.charter },
        legal: { ...EMPTY_SHARD.legal, ...data.legal },
        continuity: { ...EMPTY_SHARD.continuity, ...data.continuity },
        professionals: { ...EMPTY_SHARD.professionals, ...data.professionals },
        education: { ...EMPTY_SHARD.education, ...data.education },
        thap: { ...EMPTY_SHARD.thap, ...data.thap },
        keep_score: { ...EMPTY_SHARD.keep_score, ...data.keep_score },
        redundancy: { ...EMPTY_SHARD.redundancy, ...data.redundancy },
        last_modified: new Date().toISOString(),
      }
      setSetup(shard)
    }
  }

  const resetToDefault = () => {
    const empty = createNewShardFile('')
    setSetup(empty)
    localStorage.removeItem('familySetup')
  }

  return (
    <FamilySetupContext.Provider
      value={{
        setup,
        updateFamilyName,
        updateHeirs,
        updateGovernanceRules,
        addGovernanceRule,
        removeGovernanceRule,
        addWallet,
        updateWallet,
        removeWallet,
        updateCharter,
        updateLegal,
        updateContinuity,
        updateProfessionals,
        addEventLogEntry: appendEventLog,
        loadFromFile,
        resetToDefault,
      }}
    >
      {children}
    </FamilySetupContext.Provider>
  )
}

export function useFamilySetup() {
  const context = useContext(FamilySetupContext)
  if (context === undefined) {
    throw new Error('useFamilySetup must be used within a FamilySetupProvider')
  }
  return context
}
