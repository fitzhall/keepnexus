/**
 * Little Shard™ File Handler
 * Manages creation, loading, saving, and encryption of KEEP data files
 * Everything happens client-side for complete data sovereignty
 */

import {
  LittleShardFile,
  ValidationResult,
  FileMetadata,
  EventLogEntry,
  KEEPScore,
  Wallet,
  KeyHolder
} from './data-model';

// ============================================================================
// Constants
// ============================================================================

export const LITTLE_SHARD_VERSION = '1.0.0';
export const FILE_EXTENSION = '.shard';
export const ENCRYPTION_ALGORITHM = 'AES-GCM';
export const DEFAULT_ITERATIONS = 100000; // For key derivation

// ============================================================================
// File Creation & Initialization
// ============================================================================

/**
 * Create a new Little Shard file with default structure
 */
export function createNewShardFile(familyName: string): LittleShardFile {
  const now = new Date().toISOString();

  return {
    // Metadata
    version: LITTLE_SHARD_VERSION,
    created_at: now,
    last_modified: now,

    // Family info
    family_name: familyName,

    // Initial KEEP Score (starts low)
    keep_score: {
      value: 25,
      calculated_at: now,
      components: {
        security: 30,
        redundancy: 20,
        liveness: 25,
        legal_readiness: 20,
        education: 30
      },
      trend: 'stable',
      recommendations: [
        'Add at least 3 key holders to reach minimum redundancy',
        'Configure geographic distribution across multiple locations',
        'Schedule your first recovery drill'
      ]
    },

    // Demo wallet and keyholders for testing
    wallets: [{
      id: 'wallet1',
      name: 'Family Vault',
      type: 'multisig',
      threshold: 2,
      total_keys: 3,
      created_at: now,
      last_used: now
    }],
    keyholders: [
      {
        id: 'kh1',
        name: 'Alice Chen',
        role: 'primary',
        email: 'alice@example.com',
        phone: '555-0100',
        location: 'San Francisco',
        storage_type: 'hardware-wallet',
        device_info: 'Ledger Nano X',
        key_created: now,
        key_age_days: 0,
        last_drill_participation: null,
        is_active: true
      },
      {
        id: 'kh2',
        name: 'Bob Chen',
        role: 'secondary',
        email: 'bob@example.com',
        phone: '555-0101',
        location: 'New York',
        storage_type: 'hardware-wallet',
        device_info: 'Trezor Model T',
        key_created: now,
        key_age_days: 0,
        last_drill_participation: null,
        is_active: true
      },
      {
        id: 'kh3',
        name: 'Lawyer Smith',
        role: 'tertiary',
        email: 'smith@lawfirm.com',
        phone: '555-0102',
        location: 'Chicago',
        storage_type: 'paper',
        device_info: 'Safety deposit box',
        key_created: now,
        key_age_days: 0,
        last_drill_participation: null,
        is_active: true
      }
    ],

    // Redundancy metrics matching demo data
    redundancy: {
      device_count: 3,
      location_count: 3,
      person_count: 3,
      geographic_distribution: ['San Francisco', 'New York', 'Chicago'],
      passes_3_3_3_rule: true
    },

    // Activity tracking (empty)
    drills: [],
    rotations: [],

    // Legal & education defaults
    legal_docs: {
      has_will: false,
      has_trust: false,
      has_letter_of_instruction: false,
      last_review: now,
      next_review: addDays(now, 365)
    },

    education: {
      heirs_trained: false,
      last_training: now,
      next_review: addDays(now, 90),
      trained_heirs: []
    },

    // Initial risk analysis
    risk_analysis: {
      last_run: now,
      scenarios_tested: 0,
      probability_of_recovery: 0,
      critical_risks: ['No multisig configuration defined'],
      mitigation_applied: [],
      scenario_results: []
    },

    // Start event log
    event_log: [
      {
        id: generateId(),
        timestamp: now,
        event_type: 'file_created',
        description: `Little Shard file created for ${familyName}`,
        metadata: { version: LITTLE_SHARD_VERSION }
      }
    ]
  };
}

// ============================================================================
// File Validation
// ============================================================================

/**
 * Validate a Little Shard file structure and data
 */
export function validateShardFile(data: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check required fields
  if (!data.version) errors.push('Missing version field');
  if (!data.family_name) errors.push('Missing family_name field');
  if (!data.keep_score) errors.push('Missing keep_score object');
  if (!data.wallets) errors.push('Missing wallets array');
  if (!data.keyholders) errors.push('Missing keyholders array');

  // Check version compatibility
  const version_compatible = data.version === LITTLE_SHARD_VERSION ||
                           data.version?.startsWith('1.');

  if (!version_compatible) {
    errors.push(`Incompatible version: ${data.version}`);
  }

  // Validate KEEP Score
  if (data.keep_score) {
    if (data.keep_score.value < 0 || data.keep_score.value > 100) {
      errors.push('KEEP Score must be between 0-100');
    }
  }

  // Validate wallet configuration
  if (data.wallets && data.wallets.length > 0) {
    data.wallets.forEach((wallet: Wallet, i: number) => {
      if (wallet.threshold > wallet.total_keys) {
        errors.push(`Wallet ${i}: threshold cannot exceed total_keys`);
      }
      if (wallet.threshold < 1) {
        errors.push(`Wallet ${i}: threshold must be at least 1`);
      }
    });
  } else {
    warnings.push('No multisig wallet configured');
  }

  // Validate keyholders
  if (data.keyholders && data.keyholders.length > 0) {
    const ids = new Set<string>();
    data.keyholders.forEach((holder: KeyHolder) => {
      if (ids.has(holder.id)) {
        errors.push(`Duplicate keyholder ID: ${holder.id}`);
      }
      ids.add(holder.id);

      // Check shard configuration
      if (holder.is_sharded && holder.shard_config) {
        if (holder.shard_config.threshold > holder.shard_config.total) {
          errors.push(`${holder.name}: shard threshold exceeds total shards`);
        }
      }
    });
  } else {
    warnings.push('No keyholders defined');
  }

  // Check redundancy
  if (data.redundancy && !data.redundancy.passes_3_3_3_rule) {
    warnings.push('Does not meet 3-3-3 redundancy rule (3 devices, 3 locations, 3 people)');
  }

  // Check drills
  if (!data.drills || data.drills.length === 0) {
    warnings.push('No recovery drills performed yet');
  }

  // Check legal docs
  if (data.legal_docs) {
    if (!data.legal_docs.has_will && !data.legal_docs.has_trust) {
      warnings.push('No will or trust documents on file');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    version_compatible
  };
}

// ============================================================================
// File Import/Export
// ============================================================================

/**
 * Export Little Shard file to JSON string
 */
export function exportToJSON(data: LittleShardFile, pretty = true): string {
  // Add file hash before export
  const exportData = { ...data };
  exportData.file_hash = calculateHash(exportData);

  return pretty
    ? JSON.stringify(exportData, null, 2)
    : JSON.stringify(exportData);
}

/**
 * Import Little Shard file from JSON string
 */
export function importFromJSON(jsonString: string): LittleShardFile {
  try {
    const data = JSON.parse(jsonString);

    // Validate before returning
    const validation = validateShardFile(data);
    if (!validation.valid) {
      throw new Error(`Invalid file: ${validation.errors.join(', ')}`);
    }

    return data as LittleShardFile;
  } catch (error) {
    throw new Error(`Failed to import file: ${error}`);
  }
}

/**
 * Save file to browser download
 */
export function downloadFile(data: LittleShardFile, filename?: string): void {
  const json = exportToJSON(data);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = filename || `keep_${data.family_name.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}.shard`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Load file from user selection
 */
export async function loadFile(file: File): Promise<LittleShardFile> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = importFromJSON(content);
        resolve(data);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

// ============================================================================
// Encryption (Client-Side)
// ============================================================================

/**
 * Encrypt Little Shard file with password
 * Uses Web Crypto API for client-side encryption
 */
export async function encryptFile(
  data: LittleShardFile,
  password: string
): Promise<{ encrypted: ArrayBuffer; salt: ArrayBuffer; iv: ArrayBuffer }> {
  const encoder = new TextEncoder();
  const jsonString = exportToJSON(data);
  const dataBuffer = encoder.encode(jsonString);

  // Generate random salt and IV
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));

  // Derive key from password
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );

  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: DEFAULT_ITERATIONS,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );

  // Encrypt data
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    dataBuffer
  );

  return { encrypted, salt: salt.buffer, iv: iv.buffer };
}

/**
 * Decrypt Little Shard file with password
 */
export async function decryptFile(
  encryptedData: ArrayBuffer,
  password: string,
  salt: ArrayBuffer,
  iv: ArrayBuffer
): Promise<LittleShardFile> {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  // Derive key from password
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );

  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: DEFAULT_ITERATIONS,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );

  // Decrypt data
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    encryptedData
  );

  const jsonString = decoder.decode(decrypted);
  return importFromJSON(jsonString);
}

// ============================================================================
// Event Log Management
// ============================================================================

/**
 * Add entry to event log
 */
export function addEventLogEntry(
  data: LittleShardFile,
  eventType: string,
  description: string,
  metadata?: Record<string, any>
): LittleShardFile {
  const entry: EventLogEntry = {
    id: generateId(),
    timestamp: new Date().toISOString(),
    event_type: eventType,
    description,
    metadata
  };

  // Add hash of previous entry for tamper evidence
  if (data.event_log && data.event_log.length > 0) {
    const previousEntry = data.event_log[data.event_log.length - 1];
    entry.hash = calculateHash(previousEntry);
  }

  return {
    ...data,
    event_log: [...(data.event_log || []), entry],
    last_modified: entry.timestamp
  };
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Generate unique ID
 */
function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Calculate SHA-256 hash of object
 */
async function calculateHash(obj: any): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(JSON.stringify(obj));
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Simple synchronous hash for non-async contexts
 */
function calculateHashSync(obj: any): string {
  // Simple hash for synchronous contexts (not cryptographically secure)
  const str = JSON.stringify(obj);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16);
}

// Use sync version for now
export { calculateHashSync as calculateHash };

/**
 * Add days to date
 */
function addDays(dateString: string, days: number): string {
  const date = new Date(dateString);
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

// ============================================================================
// Local Storage Management
// ============================================================================

const STORAGE_KEY = 'keep_little_shard';

/**
 * Save to browser local storage
 */
export function saveToLocalStorage(data: LittleShardFile): void {
  if (typeof window === 'undefined') return; // Skip on server

  try {
    const json = exportToJSON(data);
    localStorage.setItem(STORAGE_KEY, json);
  } catch (error) {
    console.error('Failed to save to local storage:', error);
  }
}

/**
 * Load from browser local storage
 */
export function loadFromLocalStorage(): LittleShardFile | null {
  if (typeof window === 'undefined') return null; // Skip on server

  try {
    const json = localStorage.getItem(STORAGE_KEY);
    if (!json) return null;
    return importFromJSON(json);
  } catch (error) {
    console.error('Failed to load from local storage:', error);
    return null;
  }
}

/**
 * Clear local storage
 */
export function clearLocalStorage(): void {
  if (typeof window === 'undefined') return; // Skip on server

  localStorage.removeItem(STORAGE_KEY);
}