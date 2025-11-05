/**
 * KeepNexus File Format (.keepnexus)
 * Encrypted portable configuration file for Bitcoin multisig estate planning
 *
 * Bitcoin ethos: Self-sovereign, offline-capable, portable data files
 * The file is the source of truth - web UI just makes it digestible
 */

import { MultisigSetup, SimulationResult } from './types'
import { DocumentEncryptionService } from '../documents/encryption'
import { GovernanceRule, Heir, TrustInfo } from '../context/FamilySetup'

/**
 * Schedule Event - Recurring or one-time events for the family
 * Used by: /dashboard/schedule
 */
export interface ScheduleEvent {
  id: string
  title: string
  description: string
  date: string                       // ISO date string
  type: 'drill' | 'rotation' | 'review' | 'report' | 'custom'
  completed?: boolean
  createdAt?: Date
}

/**
 * Drill Record - History of inheritance drill executions
 * Used by: /dashboard/drills
 */
export interface DrillRecord {
  id: string
  date: Date
  participants: string[]            // Names of heirs who participated
  result: 'passed' | 'failed' | 'skipped'
  notes?: string
  duration?: number                 // Minutes
  recoveryTime?: number             // Seconds to access first key
}

/**
 * Drill Settings - Configuration for automated drill scheduling
 * Used by: /dashboard/drills
 */
export interface DrillSettings {
  frequency: 'weekly' | 'monthly' | 'quarterly' | 'annually'
  participants: string[]            // Default participants (heir names)
  notificationDays: number          // Days before drill to notify (e.g., 7)
  autoReminder: boolean             // Send automatic reminders
  lastDrillDate?: Date
  nextDrillDate?: Date
}

/**
 * Vault Settings - Wallet and key rotation configuration
 * Used by: /dashboard/vault
 */
export interface VaultSettings {
  walletType?: string               // 'hardware' | 'software' | 'paper'
  lastRotationDate?: Date
  rotationFrequency: number         // Days between key rotations
  backupLocations: string[]         // Physical locations of backups
  testTransactionCompleted?: boolean
}

/**
 * Tax Settings - Tax reporting and CPA integration
 * Used by: /dashboard/tax
 */
export interface TaxSettings {
  reportingFrequency: 'monthly' | 'quarterly' | 'annually'
  cpaEmail?: string
  cpaName?: string
  autoGenerate: boolean             // Auto-generate CSV reports
  lastReportDate?: Date
  nextReportDue?: Date
  taxStrategy?: string              // 'hodl' | 'active-trader' | 'mining'
}

/**
 * Captain Settings - Advisor/professional coordination
 * Used by: /dashboard/captain
 */
export interface CaptainSettings {
  advisorName?: string
  advisorEmail?: string
  advisorPhone?: string
  advisorFirm?: string
  serviceTier: 'nexus' | 'captain' | 'family-office' | 'diy'
  annualReviewDate?: Date
  lastCheckupDate?: Date
  professionalNetwork?: {           // Connected professionals
    attorney?: string
    cpa?: string
    custodian?: string
  }
}

/**
 * Forever Settings - Long-term archival and preservation
 * Used by: /dashboard/forever
 */
export interface ForeverSettings {
  archivalEnabled: boolean
  ipfsHash?: string                 // IPFS hash if uploaded to distributed storage
  arweaveId?: string                // Arweave transaction ID if permanently stored
  redundantLocations: string[]      // List of backup locations
  lastBackupDate?: Date
  generationPlan?: string           // Multi-generational transfer instructions
  timeLockInstructions?: string     // Instructions for time-locked vaults
}

export interface KeepNexusFile {
  version: string                    // File format version (e.g., "1.2.0")
  created: Date                      // When this configuration was created
  modified: Date                     // Last modification timestamp
  family: string                     // Family name

  // Core estate planning data
  setup: MultisigSetup              // Complete multisig configuration
  analysis?: {                       // Optional: Last risk analysis results
    results: SimulationResult[]
    resilienceScore: number
    timestamp: Date
  }
  governance?: {                     // Governator rules - THE VALUE PROPOSITION
    rules: GovernanceRule[]
    constitution?: string            // Optional governance philosophy/notes
  }
  heirs?: Heir[]                     // Beneficiaries and allocations
  trust?: TrustInfo                  // Trust/legal entity information

  // Page-specific data (v1.2.0+)
  schedule?: ScheduleEvent[]         // Scheduled events (rotations, drills, reviews)
  drills?: {                         // Drill history and settings
    history: DrillRecord[]
    settings: DrillSettings
  }
  vault?: VaultSettings              // Wallet and rotation settings
  tax?: TaxSettings                  // Tax reporting configuration
  captain?: CaptainSettings          // Advisor/professional coordination
  forever?: ForeverSettings          // Long-term preservation settings

  // Audit trail
  auditTrail: AuditEntry[]          // Who did what when
}

export interface AuditEntry {
  timestamp: Date
  action: string                     // 'created', 'modified', 'exported', 'imported'
  user?: string                      // Optional user identifier
  details?: string                   // Optional description
}

export interface EncryptedKeepNexusFile {
  encryptedData: ArrayBuffer
  nonce: Uint8Array
  salt: Uint8Array
  metadata: KeepNexusMetadata
}

export interface KeepNexusMetadata {
  version: string
  family: string
  created: Date
  modified: Date
  checksum: string
}

export class KeepNexusFileService {
  private encryptionService: DocumentEncryptionService
  private readonly FILE_VERSION = '1.2.0' // Bumped for page-specific data (schedule, drills, vault, tax, captain, forever)

  constructor() {
    this.encryptionService = new DocumentEncryptionService()
  }

  /**
   * Create a new KeepNexus file from current configuration
   * v1.2.0: NOW INCLUDES complete page-specific data for true file-first system
   */
  createFile(
    setup: MultisigSetup,
    analysis?: { results: SimulationResult[]; resilienceScore: number },
    governanceRules?: GovernanceRule[],
    heirs?: Heir[],
    trust?: TrustInfo,
    scheduleEvents?: ScheduleEvent[],
    drillsData?: { history: DrillRecord[]; settings: DrillSettings },
    vaultSettings?: VaultSettings,
    taxSettings?: TaxSettings,
    captainSettings?: CaptainSettings,
    foreverSettings?: ForeverSettings,
    existingAuditTrail?: AuditEntry[]
  ): KeepNexusFile {
    const now = new Date()

    const file: KeepNexusFile = {
      version: this.FILE_VERSION,
      created: existingAuditTrail ? new Date(existingAuditTrail[0].timestamp) : now,
      modified: now,
      family: setup.family,

      // Core estate planning data
      setup,
      analysis: analysis ? { ...analysis, timestamp: now } : undefined,
      governance: governanceRules ? { rules: governanceRules } : undefined,
      heirs,
      trust,

      // Page-specific data (v1.2.0+)
      schedule: scheduleEvents,
      drills: drillsData,
      vault: vaultSettings,
      tax: taxSettings,
      captain: captainSettings,
      forever: foreverSettings,

      // Audit trail
      auditTrail: existingAuditTrail || []
    }

    // Add audit entry for this action
    file.auditTrail.push({
      timestamp: now,
      action: existingAuditTrail ? 'modified' : 'created',
      details: existingAuditTrail ? 'Configuration updated' : 'Initial configuration created'
    })

    return file
  }

  /**
   * Encrypt a KeepNexus file for export
   */
  async encryptFile(
    file: KeepNexusFile,
    password: string
  ): Promise<EncryptedKeepNexusFile> {
    // Convert file to JSON string
    const fileJson = JSON.stringify(file, null, 2)
    const encoder = new TextEncoder()
    const fileData = encoder.encode(fileJson)

    // Generate salt and nonce
    const salt = crypto.getRandomValues(new Uint8Array(16))
    const nonce = crypto.getRandomValues(new Uint8Array(12))

    // Derive encryption key from password only (simpler than wallet + password)
    const key = await this.deriveKey(password, salt)

    // Encrypt the file data
    const encryptedData = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: nonce
      },
      key,
      fileData
    )

    // Calculate checksum
    const checksum = await this.calculateChecksum(encryptedData)

    // Create metadata (stored unencrypted for file info display)
    const metadata: KeepNexusMetadata = {
      version: file.version,
      family: file.family,
      created: file.created,
      modified: file.modified,
      checksum
    }

    return {
      encryptedData,
      nonce,
      salt,
      metadata
    }
  }

  /**
   * Decrypt a KeepNexus file for import
   */
  async decryptFile(
    encryptedFile: EncryptedKeepNexusFile,
    password: string
  ): Promise<KeepNexusFile> {
    // Verify checksum
    const currentChecksum = await this.calculateChecksum(encryptedFile.encryptedData)
    if (currentChecksum !== encryptedFile.metadata.checksum) {
      throw new Error('File integrity check failed. File may be corrupted.')
    }

    // Derive the same key using stored salt
    const key = await this.deriveKey(password, encryptedFile.salt)

    try {
      // Decrypt the file
      const decryptedData = await crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: encryptedFile.nonce as BufferSource
        },
        key,
        encryptedFile.encryptedData
      )

      // Convert back to string and parse JSON
      const decoder = new TextDecoder()
      const fileJson = decoder.decode(decryptedData)
      const file: KeepNexusFile = JSON.parse(fileJson)

      // Validate file format
      if (!file.version || !file.setup) {
        throw new Error('Invalid KeepNexus file format')
      }

      // Backward compatibility: v1.1.0 files won't have page-specific data
      // These fields are optional in v1.2.0+, so old files import cleanly
      // Migration happens automatically when user exports updated file
      if (file.version === '1.1.0' || file.version === '1.0.0') {
        // Old format is valid - optional fields will be undefined
        console.log(`Importing legacy file format ${file.version}. Data will be upgraded on next export.`)
      }

      // Add import audit entry
      file.auditTrail.push({
        timestamp: new Date(),
        action: 'imported',
        details: 'Configuration imported from file'
      })

      return file
    } catch (error) {
      if (error instanceof Error && error.message.includes('Invalid')) {
        throw error
      }
      throw new Error('Failed to decrypt file. Please verify your password.')
    }
  }

  /**
   * Export encrypted file as downloadable blob
   */
  async exportToBlob(
    encryptedFile: EncryptedKeepNexusFile
  ): Promise<Blob> {
    // Create a structured binary format for the file
    const fileData = {
      version: encryptedFile.metadata.version,
      family: encryptedFile.metadata.family,
      created: encryptedFile.metadata.created.toISOString(),
      modified: encryptedFile.metadata.modified.toISOString(),
      checksum: encryptedFile.metadata.checksum,
      nonce: Array.from(encryptedFile.nonce),
      salt: Array.from(encryptedFile.salt),
      encryptedData: Array.from(new Uint8Array(encryptedFile.encryptedData))
    }

    // Convert to JSON (we'll use JSON format for simplicity and portability)
    const jsonString = JSON.stringify(fileData, null, 2)
    const blob = new Blob([jsonString], { type: 'application/json' })

    return blob
  }

  /**
   * Import from uploaded file blob
   */
  async importFromBlob(blob: Blob): Promise<EncryptedKeepNexusFile> {
    const text = await blob.text()
    const fileData = JSON.parse(text)

    // Reconstruct the encrypted file structure
    const encryptedFile: EncryptedKeepNexusFile = {
      encryptedData: new Uint8Array(fileData.encryptedData).buffer,
      nonce: new Uint8Array(fileData.nonce),
      salt: new Uint8Array(fileData.salt),
      metadata: {
        version: fileData.version,
        family: fileData.family,
        created: new Date(fileData.created),
        modified: new Date(fileData.modified),
        checksum: fileData.checksum
      }
    }

    return encryptedFile
  }

  /**
   * Generate filename for download
   */
  generateFilename(family: string): string {
    const sanitized = family.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()
    const timestamp = new Date().toISOString().split('T')[0]
    return `${sanitized}_${timestamp}.keepnexus`
  }

  /**
   * Trigger browser download
   */
  downloadFile(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Private helpers

  private async deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
    const encoder = new TextEncoder()
    const keyMaterial = encoder.encode(password)

    const baseKey = await crypto.subtle.importKey(
      'raw',
      keyMaterial,
      'PBKDF2',
      false,
      ['deriveBits', 'deriveKey']
    )

    return await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt as BufferSource,
        iterations: 100000, // Same as document encryption
        hash: 'SHA-256'
      },
      baseKey,
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    )
  }

  private async calculateChecksum(data: ArrayBuffer): Promise<string> {
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }
}

export const keepNexusFileService = new KeepNexusFileService()
