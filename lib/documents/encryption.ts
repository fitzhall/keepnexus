// Zero-Knowledge Document Encryption Service
// All encryption happens client-side - we NEVER see plaintext

export interface EncryptedDocument {
  id: string
  encryptedData: ArrayBuffer
  nonce: Uint8Array
  salt: Uint8Array
  metadata: DocumentMetadata
}

export interface DocumentMetadata {
  id: string
  type: DocumentType
  title: string
  originalName: string
  size: number
  created: Date
  modified: Date
  mimeType: string
  checksum: string
}

export enum DocumentType {
  LIVING_TRUST = 'living_trust',
  POUR_OVER_WILL = 'pour_over_will',
  BITCOIN_INSTRUCTIONS = 'bitcoin_instructions',
  BENEFICIARY_LETTER = 'beneficiary_letter',
  ASSET_INVENTORY = 'asset_inventory',
  MEDICAL_DIRECTIVE = 'medical_directive',
  POWER_OF_ATTORNEY = 'power_of_attorney',
  OTHER = 'other'
}

export class DocumentEncryptionService {
  private readonly ALGORITHM = 'AES-GCM'
  private readonly KEY_LENGTH = 256
  private readonly SALT_LENGTH = 16
  private readonly NONCE_LENGTH = 12
  private readonly PBKDF2_ITERATIONS = 100000

  // Derive encryption key from wallet signature and password
  async deriveKey(walletSignature: string, password: string): Promise<CryptoKey> {
    // Combine wallet signature and password for key derivation
    const encoder = new TextEncoder()
    const keyMaterial = encoder.encode(walletSignature + password)

    // Import key material
    const baseKey = await crypto.subtle.importKey(
      'raw',
      keyMaterial,
      'PBKDF2',
      false,
      ['deriveBits', 'deriveKey']
    )

    // Generate salt for PBKDF2
    const salt = crypto.getRandomValues(new Uint8Array(this.SALT_LENGTH))

    // Derive the actual encryption key
    return await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt,
        iterations: this.PBKDF2_ITERATIONS,
        hash: 'SHA-256'
      },
      baseKey,
      { name: this.ALGORITHM, length: this.KEY_LENGTH },
      true,
      ['encrypt', 'decrypt']
    )
  }

  // Encrypt a file before upload
  async encryptFile(
    file: File,
    walletSignature: string,
    password: string
  ): Promise<EncryptedDocument> {
    // Read file as array buffer
    const fileData = await file.arrayBuffer()

    // Generate salt and nonce
    const salt = crypto.getRandomValues(new Uint8Array(this.SALT_LENGTH))
    const nonce = crypto.getRandomValues(new Uint8Array(this.NONCE_LENGTH))

    // Derive encryption key
    const key = await this.deriveKeyWithSalt(walletSignature, password, salt)

    // Encrypt the file
    const encryptedData = await crypto.subtle.encrypt(
      {
        name: this.ALGORITHM,
        iv: nonce
      },
      key,
      fileData
    )

    // Calculate checksum of encrypted data for integrity
    const checksum = await this.calculateChecksum(encryptedData)

    // Create metadata (this will be stored unencrypted)
    const metadata: DocumentMetadata = {
      id: this.generateDocumentId(),
      type: this.detectDocumentType(file.name),
      title: this.sanitizeTitle(file.name),
      originalName: file.name,
      size: encryptedData.byteLength,
      created: new Date(),
      modified: new Date(file.lastModified),
      mimeType: file.type || 'application/octet-stream',
      checksum
    }

    return {
      id: metadata.id,
      encryptedData,
      nonce,
      salt,
      metadata
    }
  }

  // Decrypt a file for viewing
  async decryptFile(
    encryptedDoc: EncryptedDocument,
    walletSignature: string,
    password: string
  ): Promise<ArrayBuffer> {
    // Derive the same key using the stored salt
    const key = await this.deriveKeyWithSalt(walletSignature, password, encryptedDoc.salt)

    // Verify checksum before decryption
    const currentChecksum = await this.calculateChecksum(encryptedDoc.encryptedData)
    if (currentChecksum !== encryptedDoc.metadata.checksum) {
      throw new Error('Document integrity check failed. File may be corrupted.')
    }

    try {
      // Decrypt the document
      const decryptedData = await crypto.subtle.decrypt(
        {
          name: this.ALGORITHM,
          iv: encryptedDoc.nonce
        },
        key,
        encryptedDoc.encryptedData
      )

      return decryptedData
    } catch (error) {
      throw new Error('Failed to decrypt document. Please verify your password.')
    }
  }

  // Helper: Derive key with specific salt (for decryption)
  private async deriveKeyWithSalt(
    walletSignature: string,
    password: string,
    salt: Uint8Array
  ): Promise<CryptoKey> {
    const encoder = new TextEncoder()
    const keyMaterial = encoder.encode(walletSignature + password)

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
        salt,
        iterations: this.PBKDF2_ITERATIONS,
        hash: 'SHA-256'
      },
      baseKey,
      { name: this.ALGORITHM, length: this.KEY_LENGTH },
      true,
      ['encrypt', 'decrypt']
    )
  }

  // Calculate SHA-256 checksum
  private async calculateChecksum(data: ArrayBuffer): Promise<string> {
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }

  // Generate unique document ID
  private generateDocumentId(): string {
    return `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Detect document type from filename
  private detectDocumentType(filename: string): DocumentType {
    const lower = filename.toLowerCase()
    if (lower.includes('trust')) return DocumentType.LIVING_TRUST
    if (lower.includes('will')) return DocumentType.POUR_OVER_WILL
    if (lower.includes('bitcoin') || lower.includes('btc')) return DocumentType.BITCOIN_INSTRUCTIONS
    if (lower.includes('beneficiary') || lower.includes('heir')) return DocumentType.BENEFICIARY_LETTER
    if (lower.includes('asset') || lower.includes('inventory')) return DocumentType.ASSET_INVENTORY
    if (lower.includes('medical') || lower.includes('directive')) return DocumentType.MEDICAL_DIRECTIVE
    if (lower.includes('power') || lower.includes('attorney')) return DocumentType.POWER_OF_ATTORNEY
    return DocumentType.OTHER
  }

  // Sanitize filename for display (remove sensitive info)
  private sanitizeTitle(filename: string): string {
    // Remove file extension
    const withoutExt = filename.replace(/\.[^/.]+$/, '')
    // Remove special characters but keep spaces
    const sanitized = withoutExt.replace(/[^a-zA-Z0-9\s]/g, '')
    // Limit length
    return sanitized.substring(0, 50)
  }

  // Validate file before encryption
  validateFile(file: File): { valid: boolean; error?: string } {
    const MAX_SIZE = 10 * 1024 * 1024 // 10MB
    const ALLOWED_TYPES = [
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png'
    ]

    if (file.size > MAX_SIZE) {
      return { valid: false, error: 'File size must be less than 10MB' }
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return { valid: false, error: 'File type not supported. Use PDF, Word, TXT, or images.' }
    }

    return { valid: true }
  }

  // Convert ArrayBuffer to Blob for viewing
  arrayBufferToBlob(buffer: ArrayBuffer, mimeType: string): Blob {
    return new Blob([buffer], { type: mimeType })
  }

  // Create object URL for viewing in iframe
  createViewableUrl(blob: Blob): string {
    return URL.createObjectURL(blob)
  }

  // Clean up object URL when done viewing
  revokeViewableUrl(url: string): void {
    URL.revokeObjectURL(url)
  }
}

export const documentEncryption = new DocumentEncryptionService()