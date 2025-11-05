# KeepNexus - Existing Systems Review
**Date:** November 5, 2025
**Purpose:** Document what's already built and assess if it fits the KEEP vision

---

## 🏗️ Current Architecture Overview

### Core Services (Already Built)
Located in `/lib/`:

1. **Bitcoin Services** (`/lib/bitcoin/`)
   - `wallet.ts` - Wallet connection/disconnection
   - `multisig.ts` - Multisig configuration and pending approvals

2. **Security Services** (`/lib/security/`)
   - `score.ts` - Security scoring service (separate from KEEP Score)

3. **Risk Simulator** (`/lib/risk-simulator/`) - **OLD/BROKEN**
   - Has combined scenario bug
   - Only 6 scenarios
   - Should be deprecated

4. **NEW Systems** (`/lib/keep-core/` & `/lib/risk-engine/`)
   - `keep-score-v2.ts` - KEEP-aligned scoring (K.E.E.P framework)
   - `little-shard.ts` - File format for data sovereignty
   - `simulator.ts` - Fixed risk engine with 17 scenarios

---

## 📊 Dashboard Sections Review

### Main Dashboard (`/dashboard/page.tsx`)
- **Status:** ✅ Good foundation
- **Features:**
  - Wallet connection UI
  - Multisig setup
  - Threat score display
  - Navigation to all sections
- **Fits KEEP?** Yes, but needs integration with KEEP Score

### 1. Vault (`/dashboard/vault/`)
- **Purpose:** Wallet configuration and management
- **Status:** ✅ Functional
- **Fits KEEP?** Yes - aligns with "K" (Keep Secure)

### 2. Heirs (`/dashboard/heirs/`)
- **Purpose:** Heir management and training
- **Status:** Unknown - needs review
- **Fits KEEP?** Yes - aligns with "P" (Plan for Future)

### 3. Trust (`/dashboard/trust/`)
- **Purpose:** Trust documentation
- **Status:** Unknown - needs review
- **Fits KEEP?** Yes - aligns with "E" (Establish Legal Protection)

### 4. Drills (`/dashboard/drills/`)
- **Purpose:** Recovery drill scheduling
- **Status:** Unknown - needs review
- **Fits KEEP?** Yes - aligns with "E" (Ensure Access)

### 5. Schedule (`/dashboard/schedule/`)
- **Purpose:** Key rotation scheduling
- **Status:** Unknown - needs review
- **Fits KEEP?** Yes - supports liveness

### 6. Captain (`/dashboard/captain/`)
- **Purpose:** Admin/settings
- **Status:** Unknown - needs review
- **Fits KEEP?** Yes - governance control

### 7. Tax (`/dashboard/tax/`)
- **Purpose:** Tax CSV exports
- **Status:** Unknown - needs review
- **Fits KEEP?** Yes - aligns with "P" (Plan for Future)

### 8. Governator (`/dashboard/governator/`)
- **Purpose:** Governance rules engine
- **Status:** Unknown - needs review
- **Fits KEEP?** Yes - core governance system

### 9. Risk Simulator (`/dashboard/risk-simulator/`) - **BROKEN**
- **Status:** ❌ Broken (combined scenario bug)
- **Solution:** Redirect to `/dashboard/keep-score`

### 10. KEEP Score (`/dashboard/keep-score/`) - **NEW**
- **Status:** ✅ Working
- **Features:**
  - KEEP-aligned scoring (25% each for K.E.E.P)
  - Little Shard file format
  - Risk matrix with 17 scenarios
  - Ultra-simple text UI

### 11. Forever (`/dashboard/forever/`)
- **Purpose:** Unknown
- **Status:** Needs investigation

---

## 🎯 Assessment: What Needs Work?

### ✅ What's Good (Keep As-Is)
1. **Main dashboard** - Good wallet/multisig integration
2. **Navigation structure** - 13 sections cover all needs
3. **Context system** - FamilySetup context works

### ⚠️ What Needs Integration
1. **KEEP Score** should be prominent on main dashboard
2. **Security score service** should use KEEP Score formula
3. **File import/export** should use Little Shard format everywhere

### ❌ What Should Be Replaced/Removed
1. **Old risk simulator** (`/lib/risk-simulator/`) - Use new one
2. **Broken risk simulator page** - Redirect to KEEP Score

### 🔍 What Needs Investigation
1. **Heirs page** - Does it track training?
2. **Trust page** - Does it track documents?
3. **Drills page** - Does it track success/failure?
4. **Forever page** - What is this for?

---

## 📈 Alignment with KEEP Framework

The system mostly aligns with KEEP:

- **K (Keep Secure):** ✅ Vault, multisig, wallet connection
- **E (Establish Legal):** ⚠️ Trust page exists but needs review
- **E (Ensure Access):** ✅ Drills, schedule, redundancy
- **P (Plan Future):** ⚠️ Tax, heirs exist but need review

---

## 🚀 Recommended Next Steps

1. **Immediate:**
   - Keep server running on port 3000
   - Test each dashboard section
   - Document what each does

2. **Integration:**
   - Add KEEP Score widget to main dashboard
   - Replace old securityScoreService with KEEP Score
   - Use Little Shard format for all data

3. **Cleanup:**
   - Remove old `/lib/risk-simulator/` code
   - Redirect broken pages to working ones
   - Consolidate scoring systems

4. **Enhancement:**
   - Add configuration UI for wallet/keys (if missing)
   - Ensure drill tracking feeds into KEEP Score
   - Verify trust documents feed into score

---

## 💡 Key Insight

The platform has good bones but needs:
1. **Consolidation** - Multiple scoring systems should become one (KEEP Score)
2. **Integration** - Sections work in silos, need unified data model (Little Shard)
3. **Simplification** - Remove broken/duplicate features

The KEEP Score system we built is the RIGHT approach - it should become the central metric everything else feeds into.