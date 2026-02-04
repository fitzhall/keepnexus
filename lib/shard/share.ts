/**
 * Share Service - Generate and manage share tokens for Keep Nexus
 *
 * This service enables hodlers to share their shard with professionals.
 * The share token allows professionals to import the shard into KEEP SYS.
 *
 * Key security features:
 * - Separate share master key (not derived from password)
 * - Per-share encryption keys
 * - Token expiration
 * - Revocation support
 */

import type { KeepNexusFile } from '../risk-simulator/file-export'
import type { ExtendedShard } from './adapter'
import { ShardAdapter } from './adapter'

// ============================================================================
// TYPES
// ============================================================================

export type ProfessionalType = 'attorney' | 'cpa' | 'advisor'
export type AccessLevel = 'view' | 'propose_changes'
export type ShareStatus = 'pending' | 'accepted' | 'expired' | 'revoked'

export interface ShareConfig {
  professional_type: ProfessionalType
  professional_email: string
  access_level: AccessLevel
  expires_in_days: number
}

export interface ShareToken {
  token_id: string
  token_value: string
  token_hash: string
  shard_hash: string
  config: ShareConfig
  created_at: string
  expires_at: string
  status: ShareStatus
}

export interface ActiveShare {
  token_id: string
  professional_email: string
  professional_type: ProfessionalType
  access_level: AccessLevel
  created_at: string
  expires_at: string
  status: ShareStatus
  last_accessed_at?: string
}

export interface ShareBundle {
  token: string
  encrypted_shard: string
  nonce: string
  salt: string
  metadata: {
    shard_id: string
    shard_version: string
    schema_version: string
    client_display_name?: string
    expires_at: string
  }
}

// ============================================================================
// CONSTANTS
// ============================================================================

const SHARE_MASTER_KEY_STORAGE = 'keepnexus_share_master_key'
const ACTIVE_SHARES_STORAGE = 'keepnexus_active_shares'

// ============================================================================
// SHARE SERVICE
// ============================================================================

export class ShareService {
  private shareMasterKey: CryptoKey | null = null

  /**
   * Initialize the share service, loading or generating the share master key
   */
  async initialize(): Promise<void> {
    const stored = localStorage.getItem(SHARE_MASTER_KEY_STORAGE)

    if (stored) {
      // Import existing key
      const keyData = JSON.parse(stored)
      this.shareMasterKey = await crypto.subtle.importKey(
        'jwk',
        keyData,
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
      )
    } else {
      // Generate new key
      this.shareMasterKey = await crypto.subtle.generateKey(
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
      )

      // Export and store
      const exported = await crypto.subtle.exportKey('jwk', this.shareMasterKey)
      localStorage.setItem(SHARE_MASTER_KEY_STORAGE, JSON.stringify(exported))
    }
  }

  /**
   * Generate a share token for a professional
   */
  async generateShareToken(
    keepNexusFile: KeepNexusFile,
    config: ShareConfig
  ): Promise<ShareBundle> {
    if (!this.shareMasterKey) {
      await this.initialize()
    }

    // 1. Convert to Shard format
    const shard = ShardAdapter.toShard(keepNexusFile)

    // 2. Generate token components
    const tokenId = crypto.randomUUID()
    const randomBytes = crypto.getRandomValues(new Uint8Array(32))
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + config.expires_in_days)
    const expirationTimestamp = Math.floor(expiresAt.getTime() / 1000).toString(36)

    // Token format: random(32) + expiration(13) + professional_type_code(1)
    const typeCode = config.professional_type[0] // a, c, or a
    const tokenValue = this.bytesToBase64(randomBytes) + expirationTimestamp + typeCode

    // 3. Calculate token hash
    const tokenHash = await this.hashString(tokenValue)

    // 4. Derive per-share encryption key
    const shareKey = await this.deriveShareKey(tokenValue)

    // 5. Encrypt the shard
    const { encrypted, nonce, salt } = await this.encryptShard(shard, shareKey)

    // 6. Calculate shard hash
    const shardHash = shard.canonical_state.canonical_hash

    // 7. Create share token record
    const shareToken: ShareToken = {
      token_id: tokenId,
      token_value: tokenValue,
      token_hash: tokenHash,
      shard_hash: shardHash,
      config,
      created_at: new Date().toISOString(),
      expires_at: expiresAt.toISOString(),
      status: 'pending',
    }

    // 8. Store in active shares
    this.addActiveShare(shareToken)

    // 9. Return share bundle
    return {
      token: tokenValue,
      encrypted_shard: encrypted,
      nonce,
      salt,
      metadata: {
        shard_id: shard.shard_id,
        shard_version: shard.shard_version,
        schema_version: shard.schema_version,
        client_display_name: keepNexusFile.family,
        expires_at: expiresAt.toISOString(),
      },
    }
  }

  /**
   * Generate a shareable link
   */
  generateShareLink(bundle: ShareBundle): string {
    // Encode the bundle as a URL-safe string
    const bundleJson = JSON.stringify({
      t: bundle.token,
      e: bundle.encrypted_shard,
      n: bundle.nonce,
      s: bundle.salt,
      m: bundle.metadata,
    })

    const encoded = btoa(bundleJson)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '')

    // Use KEEP SYS import URL
    return `https://keep-dashboard-theta.vercel.app/client-shards/import?data=${encoded}`
  }

  /**
   * Get all active shares
   */
  getActiveShares(): ActiveShare[] {
    const stored = localStorage.getItem(ACTIVE_SHARES_STORAGE)
    if (!stored) return []

    const shares: ActiveShare[] = JSON.parse(stored)

    // Update expired statuses
    const now = new Date()
    for (const share of shares) {
      if (share.status === 'pending' && new Date(share.expires_at) < now) {
        share.status = 'expired'
      }
    }

    // Save updated statuses
    localStorage.setItem(ACTIVE_SHARES_STORAGE, JSON.stringify(shares))

    return shares
  }

  /**
   * Revoke a share token
   */
  revokeShare(tokenId: string): boolean {
    const shares = this.getActiveShares()
    const share = shares.find(s => s.token_id === tokenId)

    if (!share) return false

    share.status = 'revoked'
    localStorage.setItem(ACTIVE_SHARES_STORAGE, JSON.stringify(shares))

    return true
  }

  /**
   * Clear all shares
   */
  clearAllShares(): void {
    localStorage.removeItem(ACTIVE_SHARES_STORAGE)
  }

  // ==========================================================================
  // PRIVATE HELPERS
  // ==========================================================================

  private addActiveShare(shareToken: ShareToken): void {
    const shares = this.getActiveShares()

    shares.push({
      token_id: shareToken.token_id,
      professional_email: shareToken.config.professional_email,
      professional_type: shareToken.config.professional_type,
      access_level: shareToken.config.access_level,
      created_at: shareToken.created_at,
      expires_at: shareToken.expires_at,
      status: shareToken.status,
    })

    localStorage.setItem(ACTIVE_SHARES_STORAGE, JSON.stringify(shares))
  }

  private async deriveShareKey(tokenValue: string): Promise<CryptoKey> {
    if (!this.shareMasterKey) {
      throw new Error('Share service not initialized')
    }

    // Use token as additional entropy for key derivation
    const encoder = new TextEncoder()
    const tokenData = encoder.encode(tokenValue)

    // Get raw key material from master key
    const masterKeyData = await crypto.subtle.exportKey('raw', this.shareMasterKey)

    // Combine master key + token for per-share key
    const combined = new Uint8Array(masterKeyData.byteLength + tokenData.length)
    combined.set(new Uint8Array(masterKeyData), 0)
    combined.set(tokenData, masterKeyData.byteLength)

    // Derive share key using PBKDF2
    const baseKey = await crypto.subtle.importKey(
      'raw',
      combined,
      'PBKDF2',
      false,
      ['deriveBits', 'deriveKey']
    )

    const salt = crypto.getRandomValues(new Uint8Array(16))

    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt,
        iterations: 100000,
        hash: 'SHA-256',
      },
      baseKey,
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    )
  }

  private async encryptShard(
    shard: ExtendedShard,
    key: CryptoKey
  ): Promise<{ encrypted: string; nonce: string; salt: string }> {
    const encoder = new TextEncoder()
    const shardJson = JSON.stringify(shard)
    const shardData = encoder.encode(shardJson)

    const nonce = crypto.getRandomValues(new Uint8Array(12))
    const salt = crypto.getRandomValues(new Uint8Array(16))

    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: nonce },
      key,
      shardData
    )

    return {
      encrypted: this.bytesToBase64(new Uint8Array(encrypted)),
      nonce: this.bytesToBase64(nonce),
      salt: this.bytesToBase64(salt),
    }
  }

  private async hashString(input: string): Promise<string> {
    const encoder = new TextEncoder()
    const data = encoder.encode(input)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }

  private bytesToBase64(bytes: Uint8Array): string {
    let binary = ''
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    return btoa(binary)
  }
}

// ============================================================================
// SINGLETON
// ============================================================================

export const shareService = new ShareService()
