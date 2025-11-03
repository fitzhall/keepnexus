// Document Storage Service - Handles encrypted blob storage
// MVP: Local storage, Production: Supabase

import { EncryptedDocument, DocumentMetadata, DocumentType } from './encryption'

export interface StoredDocument {
  metadata: DocumentMetadata
  encryptedBlobId: string
  ownerId: string
  created: Date
  lastAccessed?: Date
  accessCount: number
}

export interface DocumentAccessLog {
  documentId: string
  userId: string
  action: 'upload' | 'view' | 'download' | 'delete' | 'share'
  timestamp: Date
  ipHash?: string
  success: boolean
  errorMessage?: string
}

export class DocumentStorageService {
  private documents: Map<string, StoredDocument> = new Map()
  private encryptedBlobs: Map<string, EncryptedDocument> = new Map()
  private accessLogs: DocumentAccessLog[] = []

  // Store encrypted document (MVP: in memory, Production: Supabase)
  async storeDocument(
    encryptedDoc: EncryptedDocument,
    ownerId: string
  ): Promise<StoredDocument> {
    const storedDoc: StoredDocument = {
      metadata: encryptedDoc.metadata,
      encryptedBlobId: encryptedDoc.id,
      ownerId,
      created: new Date(),
      accessCount: 0
    }

    // Store metadata
    this.documents.set(encryptedDoc.id, storedDoc)

    // Store encrypted blob
    this.encryptedBlobs.set(encryptedDoc.id, encryptedDoc)

    // Log the upload
    this.logAccess({
      documentId: encryptedDoc.id,
      userId: ownerId,
      action: 'upload',
      timestamp: new Date(),
      success: true
    })

    // In production, this would upload to Supabase:
    // await supabase.storage.from('documents').upload(
    //   `${ownerId}/${encryptedDoc.id}.encrypted`,
    //   encryptedDoc.encryptedData
    // )

    return storedDoc
  }

  // Retrieve encrypted document
  async getDocument(documentId: string, userId: string): Promise<EncryptedDocument | null> {
    const storedDoc = this.documents.get(documentId)

    if (!storedDoc) {
      this.logAccess({
        documentId,
        userId,
        action: 'view',
        timestamp: new Date(),
        success: false,
        errorMessage: 'Document not found'
      })
      return null
    }

    // Check access permissions
    if (storedDoc.ownerId !== userId && !this.checkHeirAccess(userId, documentId)) {
      this.logAccess({
        documentId,
        userId,
        action: 'view',
        timestamp: new Date(),
        success: false,
        errorMessage: 'Access denied'
      })
      throw new Error('Access denied to this document')
    }

    // Update access tracking
    storedDoc.lastAccessed = new Date()
    storedDoc.accessCount++

    // Log successful access
    this.logAccess({
      documentId,
      userId,
      action: 'view',
      timestamp: new Date(),
      success: true
    })

    return this.encryptedBlobs.get(documentId) || null
  }

  // List all documents for a user
  async listDocuments(userId: string): Promise<StoredDocument[]> {
    const userDocs: StoredDocument[] = []

    this.documents.forEach(doc => {
      if (doc.ownerId === userId || this.checkHeirAccess(userId, doc.metadata.id)) {
        userDocs.push(doc)
      }
    })

    return userDocs.sort((a, b) => b.created.getTime() - a.created.getTime())
  }

  // Delete document
  async deleteDocument(documentId: string, userId: string): Promise<boolean> {
    const storedDoc = this.documents.get(documentId)

    if (!storedDoc) {
      return false
    }

    // Only owner can delete
    if (storedDoc.ownerId !== userId) {
      this.logAccess({
        documentId,
        userId,
        action: 'delete',
        timestamp: new Date(),
        success: false,
        errorMessage: 'Only owner can delete'
      })
      throw new Error('Only the document owner can delete documents')
    }

    // Delete from storage
    this.documents.delete(documentId)
    this.encryptedBlobs.delete(documentId)

    // Log deletion
    this.logAccess({
      documentId,
      userId,
      action: 'delete',
      timestamp: new Date(),
      success: true
    })

    return true
  }

  // Get documents by type
  async getDocumentsByType(userId: string, type: DocumentType): Promise<StoredDocument[]> {
    const docs = await this.listDocuments(userId)
    return docs.filter(doc => doc.metadata.type === type)
  }

  // Check if heir has access (mock for now)
  private checkHeirAccess(userId: string, documentId: string): boolean {
    // In production, this would check:
    // 1. Is user listed as heir?
    // 2. Has dead man's switch triggered?
    // 3. Has time lock expired?
    // 4. Has multisig approval been granted?
    return false // For now, only owners have access
  }

  // Log document access for audit trail
  private logAccess(log: DocumentAccessLog): void {
    this.accessLogs.push(log)

    // In production, store in database
    // await supabase.from('document_access_logs').insert(log)
  }

  // Get audit logs for a document
  getAuditLogs(documentId: string): DocumentAccessLog[] {
    return this.accessLogs
      .filter(log => log.documentId === documentId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }

  // Get storage statistics
  getStorageStats(userId: string): {
    totalDocuments: number
    totalSize: number
    documentTypes: Record<DocumentType, number>
    recentAccess: Date | null
  } {
    const userDocs = Array.from(this.documents.values()).filter(
      doc => doc.ownerId === userId
    )

    const stats = {
      totalDocuments: userDocs.length,
      totalSize: userDocs.reduce((sum, doc) => sum + doc.metadata.size, 0),
      documentTypes: {} as Record<DocumentType, number>,
      recentAccess: null as Date | null
    }

    // Count document types
    Object.values(DocumentType).forEach(type => {
      stats.documentTypes[type] = userDocs.filter(
        doc => doc.metadata.type === type
      ).length
    })

    // Find most recent access
    const recentDoc = userDocs
      .filter(doc => doc.lastAccessed)
      .sort((a, b) => (b.lastAccessed?.getTime() || 0) - (a.lastAccessed?.getTime() || 0))[0]

    stats.recentAccess = recentDoc?.lastAccessed || null

    return stats
  }

  // Export all documents for backup (encrypted)
  async exportDocuments(userId: string): Promise<{
    documents: StoredDocument[]
    encryptedBlobs: Map<string, EncryptedDocument>
  }> {
    const userDocs = await this.listDocuments(userId)
    const blobs = new Map<string, EncryptedDocument>()

    userDocs.forEach(doc => {
      const blob = this.encryptedBlobs.get(doc.encryptedBlobId)
      if (blob) {
        blobs.set(doc.encryptedBlobId, blob)
      }
    })

    return {
      documents: userDocs,
      encryptedBlobs: blobs
    }
  }

  // Import documents from backup
  async importDocuments(
    backup: {
      documents: StoredDocument[]
      encryptedBlobs: Map<string, EncryptedDocument>
    },
    userId: string
  ): Promise<number> {
    let imported = 0

    backup.documents.forEach(doc => {
      if (doc.ownerId === userId) {
        this.documents.set(doc.metadata.id, doc)
        const blob = backup.encryptedBlobs.get(doc.encryptedBlobId)
        if (blob) {
          this.encryptedBlobs.set(doc.encryptedBlobId, blob)
          imported++
        }
      }
    })

    return imported
  }
}

export const documentStorage = new DocumentStorageService()