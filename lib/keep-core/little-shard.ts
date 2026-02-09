/**
 * Little Shard™ File Handler v2.0
 * Manages creation, loading, saving, and encryption of .keep files
 * Everything happens client-side for complete data sovereignty
 */

import {
  LittleShardFile,
  ValidationResult,
  EventLogEntry,
  Wallet,
  KeyHolder
} from './data-model';

// ============================================================================
// Constants
// ============================================================================

export const LITTLE_SHARD_VERSION = '2.0.0';
export const FILE_EXTENSION = '.keep';
export const ENCRYPTION_ALGORITHM = 'AES-GCM';
export const DEFAULT_ITERATIONS = 100000;

// ============================================================================
// File Creation & Initialization
// ============================================================================

export function createNewShardFile(familyName: string): LittleShardFile {
  const now = new Date().toISOString();

  return {
    version: LITTLE_SHARD_VERSION,
    created_at: now,
    last_modified: now,
    family_name: familyName,

    // K — Key Governance
    wallets: [],
    keyholders: [],
    governance_rules: [],
    redundancy: {
      device_count: 0,
      location_count: 0,
      person_count: 0,
      geographic_distribution: [],
      passes_3_3_3_rule: false
    },

    // E — Estate Integration
    heirs: [],
    charter: {
      mission: '',
      principles: [],
      reviewFrequency: 'annual',
    },
    legal: {
      has_will: false,
      has_trust: false,
      has_letter_of_instruction: false,
      last_review: now,
      next_review: addDays(now, 365),
    },

    // E — Ensured Continuity
    drills: [],
    continuity: {
      checkin_frequency: 'quarterly',
      drill_frequency: 'quarterly',
    },
    rotations: [],

    // P — Professional Stewardship
    professionals: {},
    education: {
      heirs_trained: false,
      last_training: now,
      next_review: addDays(now, 90),
      trained_heirs: [],
    },

    // Integrity
    keep_score: {
      value: 25,
      calculated_at: now,
      components: {
        security: 30,
        redundancy: 20,
        liveness: 25,
        legal_readiness: 20,
        education: 30,
      },
      trend: 'stable',
      recommendations: [
        'Add at least 3 key holders to reach minimum redundancy',
        'Configure geographic distribution across multiple locations',
        'Schedule your first recovery drill',
      ],
    },
    thap: {
      current_hash: '',
      history: [],
    },
    event_log: [
      {
        id: generateId(),
        timestamp: now,
        event_type: 'file_created',
        description: `Keep file created for ${familyName}`,
        metadata: { version: LITTLE_SHARD_VERSION },
      },
    ],
  };
}

// ============================================================================
// v1 → v2 Migration
// ============================================================================

/**
 * Migrate a v1 FamilySetupData (old .keepnexus/.shard format) to LittleShardFile v2.0
 */
export function migrateV1ToV2(v1Data: any): LittleShardFile {
  const now = new Date().toISOString();

  // Build wallets from v1 vaults[] or multisig
  const wallets: Wallet[] = [];
  if (v1Data.vaults && v1Data.vaults.length > 0) {
    v1Data.vaults.forEach((v: any, i: number) => {
      wallets.push({
        id: v.id || `wallet-${i}`,
        label: v.label || 'primary',
        descriptor: '',
        threshold: v.multisig?.threshold || 0,
        total_keys: v.multisig?.totalKeys || 0,
        platform: v.multisig?.platform,
        created_at: v.multisig?.createdAt ? new Date(v.multisig.createdAt).toISOString() : now,
      });
    });
  } else if (v1Data.multisig?.threshold) {
    wallets.push({
      id: 'wallet-primary',
      label: 'primary',
      descriptor: '',
      threshold: v1Data.multisig.threshold,
      total_keys: v1Data.multisig.totalKeys,
      platform: v1Data.multisig.platform,
      created_at: v1Data.multisig.createdAt ? new Date(v1Data.multisig.createdAt).toISOString() : now,
    });
  }

  // Build keyholders from v1 multisig.keys
  const keyholders: KeyHolder[] = [];
  const keys = v1Data.vaults?.[0]?.multisig?.keys || v1Data.multisig?.keys || [];
  keys.forEach((k: any) => {
    keyholders.push({
      id: k.id || generateId(),
      name: k.holder || '',
      role: k.role || 'other',
      jurisdiction: '',
      storage_type: k.storage || 'hardware-wallet',
      location: k.location || '',
      key_age_days: 0,
      is_sharded: k.type === 'sharded',
    });
  });

  // Build heirs
  const heirs = (v1Data.heirs || []).map((h: any) => ({
    id: h.id || generateId(),
    name: h.name || '',
    relationship: h.relationship || '',
    allocation: h.allocation,
    isKeyHolder: h.isKeyHolder,
    contact: h.email || h.phone ? { email: h.email, phone: h.phone } : undefined,
  }));

  // Build charter
  const charter = {
    mission: v1Data.charter?.mission || '',
    principles: v1Data.charter?.principles || [],
    reviewFrequency: (v1Data.charter?.reviewFrequency || 'annual') as 'quarterly' | 'annual',
    lastReviewed: v1Data.charter?.lastReviewed ? new Date(v1Data.charter.lastReviewed).toISOString() : undefined,
  };

  // Build legal
  const legal = {
    has_will: false,
    has_trust: !!v1Data.trust?.trustName,
    has_letter_of_instruction: false,
    trust_name: v1Data.trust?.trustName,
    jurisdiction: v1Data.trust?.jurisdiction,
    bitcoin_in_docs: v1Data.trust?.bitcoinInDocs,
    rufadaa_filed: v1Data.trust?.rufadaaFiled,
    trustee_names: v1Data.trust?.trusteeNames,
    last_review: v1Data.trust?.lastReviewed ? new Date(v1Data.trust.lastReviewed).toISOString() : now,
    next_review: addDays(now, 365),
  };

  // Build continuity
  const continuity = {
    checkin_frequency: (v1Data.drillSettings?.notificationDays === 30 ? 'monthly' :
      v1Data.drillSettings?.notificationDays === 365 ? 'annual' : 'quarterly') as 'monthly' | 'quarterly' | 'annual',
    drill_frequency: (v1Data.drillSettings?.frequency || 'quarterly') as 'monthly' | 'quarterly' | 'annual',
    last_drill: v1Data.drillSettings?.lastDrillDate ? new Date(v1Data.drillSettings.lastDrillDate).toISOString() : undefined,
    next_drill_due: v1Data.drillSettings?.nextDrillDate ? new Date(v1Data.drillSettings.nextDrillDate).toISOString() : undefined,
    notification_days: v1Data.drillSettings?.notificationDays,
  };

  // Build professionals
  const professionals = {
    advisor: v1Data.captainSettings?.advisorName ? {
      name: v1Data.captainSettings.advisorName,
      firm: v1Data.captainSettings.advisorFirm,
      email: v1Data.captainSettings.advisorEmail,
      phone: v1Data.captainSettings.advisorPhone,
    } : undefined,
    attorney: v1Data.captainSettings?.professionalNetwork?.attorney ? {
      name: v1Data.captainSettings.professionalNetwork.attorney,
    } : undefined,
    cpa: v1Data.taxSettings?.cpaName ? {
      name: v1Data.taxSettings.cpaName,
      email: v1Data.taxSettings.cpaEmail,
    } : undefined,
  };

  // Build drills from drillHistory
  const drills = (v1Data.drillHistory || []).map((d: any) => ({
    id: d.id || generateId(),
    timestamp: d.date ? new Date(d.date).toISOString() : now,
    type: 'recovery' as const,
    participants: d.participants || [],
    success: d.result === 'passed',
    duration_minutes: d.duration,
    notes: d.notes,
  }));

  // Build event_log from auditTrail
  const event_log: EventLogEntry[] = (v1Data.auditTrail || []).map((a: any, i: number) => ({
    id: a.id || generateId(),
    timestamp: a.timestamp ? new Date(a.timestamp).toISOString() : now,
    event_type: a.action || 'unknown',
    description: a.details || '',
    metadata: a.field ? { field: a.field, oldValue: a.oldValue, newValue: a.newValue } : undefined,
  }));

  // Add migration entry
  event_log.push({
    id: generateId(),
    timestamp: now,
    event_type: 'file_migrated',
    description: 'Migrated from v1 format to v2.0',
    metadata: { from_version: '1.0.0', to_version: LITTLE_SHARD_VERSION },
  });

  // Build THAP
  const thap = {
    current_hash: v1Data.thapHash || '',
    history: (v1Data.thapHistory || []).map((h: any) => ({
      hash: h.hash || '',
      timestamp: h.timestamp ? new Date(h.timestamp).toISOString() : now,
      note: h.note,
    })),
  };

  return {
    version: LITTLE_SHARD_VERSION,
    created_at: v1Data.createdAt ? new Date(v1Data.createdAt).toISOString() : now,
    last_modified: now,
    family_name: v1Data.familyName || '',
    wallets,
    keyholders,
    governance_rules: (v1Data.governanceRules || []).map((r: any) => ({
      id: r.id,
      who: r.who,
      canDo: r.canDo,
      when: r.when,
      condition: r.condition,
      status: r.status || 'active',
      risk: r.risk,
      lastExecuted: r.lastExecuted ? new Date(r.lastExecuted).toISOString() : undefined,
      executions: r.executions,
    })),
    redundancy: {
      device_count: keyholders.length,
      location_count: new Set(keyholders.map(k => k.location).filter(Boolean)).size,
      person_count: keyholders.length,
      geographic_distribution: [...new Set(keyholders.map(k => k.location).filter(Boolean))],
      passes_3_3_3_rule: keyholders.length >= 3,
    },
    heirs,
    charter,
    legal,
    drills,
    continuity,
    rotations: [],
    professionals,
    education: {
      heirs_trained: false,
      last_training: now,
      next_review: addDays(now, 90),
      trained_heirs: [],
    },
    keep_score: {
      value: 25,
      calculated_at: now,
      components: { security: 30, redundancy: 20, liveness: 25, legal_readiness: 20, education: 30 },
      trend: 'stable',
      recommendations: [],
    },
    thap,
    event_log,
  };
}

// ============================================================================
// File Validation
// ============================================================================

export function validateShardFile(data: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!data.version) errors.push('Missing version field');
  if (!data.family_name) errors.push('Missing family_name field');
  if (!data.keep_score) errors.push('Missing keep_score object');
  if (!data.wallets) errors.push('Missing wallets array');
  if (!data.keyholders) errors.push('Missing keyholders array');

  // Accept both v1 and v2
  const version_compatible = data.version === LITTLE_SHARD_VERSION ||
    data.version?.startsWith('1.') ||
    data.version?.startsWith('2.');

  if (!version_compatible) {
    errors.push(`Incompatible version: ${data.version}`);
  }

  if (data.keep_score) {
    if (data.keep_score.value < 0 || data.keep_score.value > 100) {
      errors.push('KEEP Score must be between 0-100');
    }
  }

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

  if (data.keyholders && data.keyholders.length > 0) {
    const ids = new Set<string>();
    data.keyholders.forEach((holder: KeyHolder) => {
      if (ids.has(holder.id)) {
        errors.push(`Duplicate keyholder ID: ${holder.id}`);
      }
      ids.add(holder.id);
      if (holder.is_sharded && holder.shard_config) {
        if (holder.shard_config.threshold > holder.shard_config.total) {
          errors.push(`${holder.name}: shard threshold exceeds total shards`);
        }
      }
    });
  } else {
    warnings.push('No keyholders defined');
  }

  if (data.redundancy && !data.redundancy.passes_3_3_3_rule) {
    warnings.push('Does not meet 3-3-3 redundancy rule (3 devices, 3 locations, 3 people)');
  }

  if (!data.drills || data.drills.length === 0) {
    warnings.push('No recovery drills performed yet');
  }

  if (data.legal) {
    if (!data.legal.has_will && !data.legal.has_trust) {
      warnings.push('No will or trust documents on file');
    }
  }

  return { valid: errors.length === 0, errors, warnings, version_compatible };
}

// ============================================================================
// File Import/Export
// ============================================================================

export function exportToJSON(data: LittleShardFile, pretty = true): string {
  const exportData = { ...data, last_modified: new Date().toISOString() };
  exportData.file_hash = calculateHashSync(exportData);
  return pretty ? JSON.stringify(exportData, null, 2) : JSON.stringify(exportData);
}

export function importFromJSON(jsonString: string): LittleShardFile {
  try {
    const data = JSON.parse(jsonString);

    // If this is a v1 file (has familyName but not family_name), migrate it
    if (data.familyName && !data.family_name) {
      return migrateV1ToV2(data);
    }

    const validation = validateShardFile(data);
    if (!validation.valid) {
      throw new Error(`Invalid file: ${validation.errors.join(', ')}`);
    }

    return data as LittleShardFile;
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('Invalid file:')) {
      throw error;
    }
    throw new Error(`Failed to import file: ${error}`);
  }
}

export function downloadFile(data: LittleShardFile, filename?: string): void {
  const json = exportToJSON(data);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || `${data.family_name.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}${FILE_EXTENSION}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

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

export async function encryptFile(
  data: LittleShardFile,
  password: string
): Promise<{ encrypted: ArrayBuffer; salt: ArrayBuffer; iv: ArrayBuffer }> {
  const encoder = new TextEncoder();
  const jsonString = exportToJSON(data);
  const dataBuffer = encoder.encode(jsonString);

  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const keyMaterial = await crypto.subtle.importKey(
    'raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits', 'deriveKey']
  );

  const key = await crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: DEFAULT_ITERATIONS, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );

  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, dataBuffer);
  return { encrypted, salt: salt.buffer, iv: iv.buffer };
}

export async function decryptFile(
  encryptedData: ArrayBuffer,
  password: string,
  salt: ArrayBuffer,
  iv: ArrayBuffer
): Promise<LittleShardFile> {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  const keyMaterial = await crypto.subtle.importKey(
    'raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits', 'deriveKey']
  );

  const key = await crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: DEFAULT_ITERATIONS, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );

  const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, encryptedData);
  const jsonString = decoder.decode(decrypted);
  return importFromJSON(jsonString);
}

// ============================================================================
// Event Log Management
// ============================================================================

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
    metadata,
  };

  if (data.event_log && data.event_log.length > 0) {
    const previousEntry = data.event_log[data.event_log.length - 1];
    entry.hash = calculateHashSync(previousEntry);
  }

  return {
    ...data,
    event_log: [...(data.event_log || []), entry],
    last_modified: entry.timestamp,
  };
}

// ============================================================================
// Utility Functions
// ============================================================================

function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function calculateHashSync(obj: any): string {
  const str = JSON.stringify(obj);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16);
}

export { calculateHashSync as calculateHash };

function addDays(dateString: string, days: number): string {
  const date = new Date(dateString);
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

// ============================================================================
// Local Storage Management
// ============================================================================

const STORAGE_KEY = 'keep_little_shard';

export function saveToLocalStorage(data: LittleShardFile): void {
  if (typeof window === 'undefined') return;
  try {
    const json = exportToJSON(data);
    localStorage.setItem(STORAGE_KEY, json);
  } catch (error) {
    console.error('Failed to save to local storage:', error);
  }
}

export function loadFromLocalStorage(): LittleShardFile | null {
  if (typeof window === 'undefined') return null;
  try {
    const json = localStorage.getItem(STORAGE_KEY);
    if (!json) return null;
    return importFromJSON(json);
  } catch (error) {
    console.error('Failed to load from local storage:', error);
    return null;
  }
}

export function clearLocalStorage(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}
