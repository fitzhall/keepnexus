# Phase 2C - Legal Documents Security Architecture

## Overview
Legal documents in KeepNexus require the highest level of security. Users are trusting us with their wills, trusts, and inheritance instructions. We must implement a zero-knowledge architecture where even we cannot access their documents.

## Core Security Principles

### 1. Zero-Knowledge Architecture
- **Client-side encryption ONLY** - Documents encrypted in browser before leaving device
- **We never see plaintext** - Server/database only stores encrypted blobs
- **No key storage** - Encryption keys derived from user's wallet signature
- **User controls everything** - Only they can decrypt their documents

### 2. Encryption Strategy

```typescript
// Proposed encryption flow
interface DocumentEncryption {
  // Step 1: Derive encryption key from wallet
  masterKey = deriveKey(walletSignature + userPassword)

  // Step 2: Generate document-specific key
  docKey = HKDF(masterKey, documentId, salt)

  // Step 3: Encrypt document
  encryptedDoc = AES-256-GCM(document, docKey, nonce)

  // Step 4: Store only encrypted blob
  storage = {
    encrypted: encryptedDoc,
    nonce: nonce,
    salt: salt,
    metadata: unencryptedMetadata // title, date, type only
  }
}
```

### 3. Storage Options (MVP to Production)

#### Option A: Supabase + Client Encryption (MVP) ✅
**Pros:**
- Already configured in project
- Quick to implement
- Handles auth and access control
- Good for MVP/testing

**Cons:**
- Centralized
- Trust required in infrastructure
- Not fully decentralized

**Implementation:**
```typescript
// Store encrypted blobs in Supabase
supabase.storage
  .from('legal-documents')
  .upload(`${userId}/${docId}.encrypted`, encryptedBlob)
```

#### Option B: IPFS + Encryption (Phase 3)
**Pros:**
- Immutable storage
- Decentralized
- Content-addressed
- Permanent records

**Cons:**
- More complex
- Need pinning service
- Public network (even if encrypted)

#### Option C: Hybrid Approach (Recommended for Production)
**Primary:** Encrypted cloud storage (Supabase/S3)
**Backup:** IPFS for immutability proof
**Local:** Browser IndexedDB cache

## Document Types & Structure

### 1. Document Categories
```typescript
enum DocumentType {
  LIVING_TRUST = 'living_trust',
  POUR_OVER_WILL = 'pour_over_will',
  BITCOIN_INSTRUCTIONS = 'bitcoin_instructions',
  BENEFICIARY_LETTER = 'beneficiary_letter',
  ASSET_INVENTORY = 'asset_inventory',
  MEDICAL_DIRECTIVE = 'medical_directive',
  POWER_OF_ATTORNEY = 'power_of_attorney'
}
```

### 2. Metadata Structure (Unencrypted)
```typescript
interface DocumentMetadata {
  id: string
  type: DocumentType
  title: string // "Living Trust" not the actual content
  created: Date
  modified: Date
  version: number
  size: number // encrypted size
  checksum: string // for integrity
  notarized?: {
    date: Date
    notaryId: string // public info only
  }
}
```

### 3. Document Storage Format
```typescript
interface EncryptedDocument {
  metadata: DocumentMetadata // public
  encrypted: {
    content: Uint8Array // AES-256-GCM encrypted
    nonce: Uint8Array
    salt: Uint8Array
    algorithm: 'AES-256-GCM'
  }
  signatures?: {
    owner: string // wallet signature
    witnesses?: string[] // multisig style
  }
}
```

## Access Control System

### 1. Permission Levels
```typescript
enum AccessLevel {
  OWNER = 'owner',        // Full access
  HEIR_VIEW = 'heir_view', // Can view after trigger
  HEIR_EDIT = 'heir_edit', // Can edit (rare)
  ATTORNEY = 'attorney',   // Professional access
  NONE = 'none'           // No access
}
```

### 2. Time-Locked Access (Smart!)
```typescript
interface TimeLock {
  beneficiary: string // wallet address
  unlocksAt?: Date // specific date
  unlocksWhen?: {
    trigger: 'no_heartbeat' | 'manual_release' | 'multisig_approval'
    duration: number // days after trigger
  }
}
```

### 3. Dead Man's Switch Integration
- If "I'M ALIVE" not clicked for X days
- Documents become accessible to heirs
- Notification sent before unlock
- Emergency override available

## Security Features

### 1. Document Upload Security
```typescript
const uploadDocument = async (file: File) => {
  // 1. Validate file type (PDF, TXT, DOCX)
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Invalid file type')
  }

  // 2. Check file size (max 10MB)
  if (file.size > MAX_SIZE) {
    throw new Error('File too large')
  }

  // 3. Scan for malware (use ClamAV or similar)
  const isSafe = await scanFile(file)

  // 4. Generate encryption key from wallet
  const key = await deriveKeyFromWallet()

  // 5. Encrypt client-side
  const encrypted = await encryptFile(file, key)

  // 6. Upload only encrypted blob
  return await uploadEncrypted(encrypted)
}
```

### 2. Document Viewing Security
```typescript
const viewDocument = async (docId: string) => {
  // 1. Check access permissions
  const hasAccess = await checkAccess(userId, docId)

  // 2. Download encrypted blob
  const encrypted = await downloadEncrypted(docId)

  // 3. Derive decryption key from wallet
  const key = await deriveKeyFromWallet()

  // 4. Decrypt client-side only
  const decrypted = await decryptFile(encrypted, key)

  // 5. Display in sandboxed iframe
  return displaySecurely(decrypted)
}
```

### 3. Audit Trail
```typescript
interface AuditLog {
  documentId: string
  userId: string
  action: 'view' | 'edit' | 'upload' | 'delete' | 'share'
  timestamp: Date
  ipAddress?: string // hashed
  walletAddress: string
}
```

## UI/UX for Document Security

### 1. Upload Interface
```tsx
<DocumentUpload>
  {/* Visual encryption indicator */}
  <EncryptionStatus>
    🔒 Documents encrypted locally before upload
  </EncryptionStatus>

  {/* Drag and drop with security message */}
  <DropZone>
    Drop files here (max 10MB)
    Files are encrypted on your device
    We never see your documents
  </DropZone>

  {/* Clear security guarantees */}
  <SecurityGuarantees>
    ✓ Client-side AES-256 encryption
    ✓ Zero-knowledge architecture
    ✓ Keys derived from your wallet
    ✓ Immutable audit trail
  </SecurityGuarantees>
</DocumentUpload>
```

### 2. Document Viewer
```tsx
<SecureViewer>
  {/* Watermark for screenshots */}
  <Watermark userId={userId} />

  {/* Disable right-click/copy */}
  <Document
    onContextMenu={prevent}
    onCopy={prevent}
    onPrint={log}
  />

  {/* Session timeout */}
  <SessionTimer minutes={15} />
</SecureViewer>
```

## Implementation Phases

### Phase 1: MVP (Local Storage)
- Browser IndexedDB for storage
- Basic encryption with wallet signature
- No cloud sync
- Export/import backup files

### Phase 2: Cloud Storage (Current Target)
- Supabase encrypted blob storage
- Client-side encryption
- Basic access control
- Audit logging

### Phase 3: Decentralized
- IPFS integration
- Smart contract access control
- Multi-party encryption
- Cross-device sync

## Privacy & Compliance

### What We Know:
- Document exists (encrypted)
- Metadata (type, date, size)
- Access logs (who, when)
- Wallet addresses

### What We DON'T Know:
- Document contents
- Personal information
- Financial details
- Beneficiary names
- Asset amounts

### Compliance Considerations:
- GDPR: User can delete everything
- HIPAA: Medical directives encrypted
- SOC2: Audit trails maintained
- Right to deletion: Full purge available

## Technical Stack

### Frontend:
- **Encryption:** WebCrypto API
- **Storage:** IndexedDB + Supabase
- **PDF:** PDF.js for viewing
- **Editor:** Quill or TinyMCE

### Backend:
- **Storage:** Supabase Storage
- **Database:** PostgreSQL (metadata only)
- **Auth:** Supabase Auth + Wallet
- **Monitoring:** Audit logs

### Libraries:
```json
{
  "crypto-js": "^4.2.0",        // Fallback encryption
  "pdf-lib": "^1.17.1",         // PDF manipulation
  "pdfjs-dist": "^3.11.174",    // PDF viewing
  "dexie": "^3.2.4",            // IndexedDB wrapper
  "@supabase/supabase-js": "^2.39.0" // Storage
}
```

## Security Checklist

### Before Launch:
- [ ] Penetration testing
- [ ] Encryption audit
- [ ] Access control review
- [ ] Backup/recovery testing
- [ ] Legal review of terms
- [ ] Insurance for liability

### Ongoing:
- [ ] Monthly security audits
- [ ] Encryption key rotation
- [ ] Access log reviews
- [ ] Vulnerability scanning
- [ ] User security education

## User Trust Signals

### Visual Indicators:
- 🔒 Lock icon during upload
- ✅ Checkmark after encryption
- 🛡️ Shield for protected docs
- 📝 Audit trail visible

### Transparency:
- Open source encryption code
- Published security audits
- Clear privacy policy
- Zero-knowledge proof

### Guarantees:
1. "We cannot read your documents"
2. "Only you control the keys"
3. "Encrypted before leaving your device"
4. "Deletable at any time"
5. "Immutable audit trail"

## Recovery Mechanisms

### Lost Wallet Access:
- Social recovery (multisig style)
- Shamir secret shares
- Time-delayed recovery
- Attorney override (if configured)

### Document Recovery:
- Local backups (encrypted)
- Cloud backups (encrypted)
- IPFS permanent storage
- Paper backup codes

## Summary

The legal document system must be:
1. **Zero-knowledge** - We never see plaintext
2. **Client-encrypted** - Before leaving device
3. **Auditable** - Complete access logs
4. **Recoverable** - Multiple backup methods
5. **Compliant** - GDPR, HIPAA ready

Users need to trust us with their most important documents. This architecture ensures even if our servers are compromised, documents remain safe. Only the user with their wallet can decrypt.

**Key Message to Users:**
"Your documents are encrypted on your device before upload. We store encrypted blobs we cannot read. Only you, with your wallet, can decrypt them. This is true zero-knowledge security."