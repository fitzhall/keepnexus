# Security Model: What Can The Server See?

## The Valid Concern

**"Whoever holds the servers has access"** - You're absolutely right! Let's be transparent about what the server operator CAN and CANNOT access.

---

## 🔓 What The Server CAN Access

### 1. **Encrypted Blobs** ✅
- The server stores the encrypted document data
- This is just scrambled bytes without the key
- Like having a locked safe but no combination

### 2. **Metadata** ✅
The server can see:
- Document ID: `doc_1234567_abc123`
- File type: `living_trust`, `will`, etc.
- Upload date/time
- File size (encrypted size, not original)
- Original filename (sanitized)
- User ID who uploaded
- Access logs (who accessed when)

### 3. **Current Storage Locations**
```
MVP (Current):        JavaScript Map objects in RAM
                     └── Dies when server restarts

Production (Future):  Supabase Storage
                     └── Cloud database/blob storage
                     └── Persistent across restarts
```

---

## 🔒 What The Server CANNOT Access

### 1. **Document Contents** ❌
- The actual text/content of your documents
- What your will says
- Who your beneficiaries are
- Your asset details
- Any sensitive information IN the documents

### 2. **Encryption Keys** ❌
The server never has:
- Your wallet private key
- Your encryption password
- The derived AES-256 key
- Any way to decrypt the documents

### 3. **Why Can't They Decrypt?**
```
Your Wallet Signature + Your Password
            ↓
    PBKDF2 (100,000 iterations)
            ↓
    AES-256-GCM Key (256 bits)
            ↓
    Used to encrypt/decrypt
```

**The server never sees any part of this process!**

---

## 🤔 But What If...

### **Q: What if someone hacks the server?**
**A:** They get encrypted blobs they can't read + metadata

### **Q: What if the government subpoenas the server?**
**A:** They get encrypted blobs they can't decrypt without your password

### **Q: What if a rogue employee steals the database?**
**A:** Same - encrypted blobs are useless without keys

### **Q: What if they try to brute-force the encryption?**
**A:** AES-256 would take billions of years to crack with current technology

### **Q: What if they have my metadata?**
**A:** Yes, they'd know:
- You have 3 documents
- Uploaded on Oct 1, 2024
- Types: will, trust, bitcoin_instructions
- Sizes: 100KB, 200KB, 50KB

But they CANNOT read what's inside them.

---

## 🎯 The Trade-offs

### **What We're Protecting**
✅ Document contents (100% private)
✅ Sensitive information
✅ Beneficiary details
✅ Asset information
✅ Personal instructions

### **What We're NOT Hiding**
❌ That you use the service
❌ Number of documents
❌ Document types (categories)
❌ Upload/access times
❌ File sizes

---

## 💡 Comparison to Other Services

| Service | Can Read Your Docs? | Encryption |
|---------|-------------------|------------|
| **Google Drive** | ✅ YES | Server-side (they have keys) |
| **Dropbox** | ✅ YES | Server-side (they have keys) |
| **DocuSign** | ✅ YES | Transport only |
| **Bank Portals** | ✅ YES | Database encryption (they have keys) |
| **KeepNexus** | ❌ NO | Client-side (zero-knowledge) |

---

## 🔐 Additional Security Layers

### **Current Implementation**
1. **Wallet-based key derivation** - Links encryption to your Bitcoin wallet
2. **Password protection** - Additional secret only you know
3. **PBKDF2 iterations** - Makes brute force attacks impractical
4. **Per-document salt** - Each document encrypted differently

### **Future Enhancements (Phase 3+)**
1. **Multi-party encryption** - Require multiple keys to decrypt
2. **Shamir secret sharing** - Split keys across multiple parties
3. **Hardware wallet integration** - Sign with hardware wallet
4. **Distributed storage** - Store chunks across multiple servers
5. **IPFS integration** - Decentralized storage option

---

## 🚨 The Honest Truth

**YES**, the server operator has access to:
- Encrypted blobs (useless without keys)
- Metadata (document types, sizes, dates)
- Access patterns (when you upload/view)

**NO**, they cannot:
- Read your document contents
- Decrypt without your password
- Access your wallet private key
- See sensitive information

**This is why it's called "Zero-Knowledge"** - The server has zero knowledge of your document CONTENTS, though it does know you're using the service and some metadata.

---

## 🤝 Trust Model

You need to trust that:
1. ✅ The encryption is implemented correctly (it is - AES-256-GCM)
2. ✅ The client-side code isn't compromised (open source, auditable)
3. ✅ Your browser isn't compromised (standard web security)

You DON'T need to trust:
1. ❌ The server operator won't read your docs (they can't)
2. ❌ The database won't be hacked (encrypted anyway)
3. ❌ Employees won't access your data (they can't decrypt)

---

## 📊 Bottom Line

**Your question is spot-on.** Server operators DO have access to encrypted data and metadata. But the zero-knowledge architecture ensures they CANNOT read your actual documents without your wallet signature AND password.

It's like mailing a locked safe through the postal service:
- 📬 The post office handles the safe (server stores encrypted blob)
- 👁️ They can see it's a safe (metadata)
- 🔒 But they can't open it without your combination (encryption key)

This is the best we can do with web-based services. For absolute paranoia-level security, you'd need:
- Air-gapped computer
- Local-only encryption
- Never touching the internet
- Physical safe for storage

But for a practical web service, this zero-knowledge approach is the gold standard.

---

*Remember: Even with zero-knowledge encryption, always keep local backups of critical documents!*