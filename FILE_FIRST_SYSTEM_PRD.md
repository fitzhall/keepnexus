# File-First System PRD
## KeepNexus: Self-Sovereign Bitcoin Estate Planning

**Last Updated:** November 4, 2025
**Status:** Phase A - In Planning
**Vision:** Build "Git for Bitcoin Estate Planning" - .keepnexus file as source of truth

---

## 🎯 VISION

### Core Principle: Bitcoin Ethos
The `.keepnexus` file is the **source of truth**, not the database. The web UI is just a beautiful editor.

**User Journey:**
1. User creates/receives a `.keepnexus` file (encrypted, portable)
2. User uploads file to KeepNexus platform
3. All their data appears in the right places (Vault, Heirs, Trust, Governator, Schedule, etc.)
4. User makes changes in the UI
5. Changes automatically sync to their file
6. User exports updated `.keepnexus` file
7. User can take file anywhere - **zero lock-in**

**Business Model:**
- **FREE:** Base features (import/export, risk sim, basic planning)
- **PAID:** Premium modules (Family Banking, Yield Seeking, Payout Schedules, etc.)
- **Network Effect:** File format becomes standard, KeepNexus becomes the best editor

---

## 📊 CURRENT STATE ASSESSMENT

### ✅ What's Already Built

#### File Format Infrastructure
- **File:** `lib/risk-simulator/file-export.ts`
- **Encryption:** AES-256-GCM + PBKDF2 (100k iterations)
- **Format:** JSON-based for portability
- **Checksums:** SHA-256 integrity verification
- **Audit Trail:** Who/what/when tracking

#### KeepNexusFile Schema (v1.1.0)
```typescript
{
  version: string                    // "1.1.0"
  created: Date
  modified: Date
  family: string                     // "Chen Family"
  setup: MultisigSetup              // M-of-N, keys, holders
  analysis?: RiskAnalysis           // Simulation results
  governance?: GovernanceRule[]     // Governator rules
  heirs?: Heir[]                    // Beneficiaries
  trust?: TrustInfo                 // Legal documents
  auditTrail: AuditEntry[]         // Change history
}
```

#### Working Components
- ✅ **FileExport** - Creates encrypted .keepnexus files
- ✅ **FileImport** - Decrypts and loads files
- ✅ **FamilySetup Context** - Centralized state management
- ✅ **PDF Exports** - Attorney, CPA, Technical, Family playbooks
- ✅ **Risk Simulator** - Full round-trip (import → analyze → export)
- ✅ **Governator** - Connected to context, included in file

#### Pages Connected to Context
| Page | Context Integration | Status |
|------|-------------------|--------|
| `/dashboard/risk-simulator` | ✅ Full | Working |
| `/dashboard/governator` | ✅ Full | Working |
| `/dashboard/vault` | ⚠️ Partial | Needs verification |
| `/dashboard/heirs` | ⚠️ Partial | Needs verification |
| `/dashboard/trust` | ⚠️ Partial | Needs verification |
| `/dashboard/schedule` | ❌ Local state | Broken |
| `/dashboard/drills` | ❌ Local state | Broken |
| `/dashboard/tax` | ❌ Unknown | Needs verification |
| `/dashboard/captain` | ❌ Unknown | Needs verification |
| `/dashboard/forever` | ❌ Unknown | Needs verification |

---

## 🚨 CRITICAL GAPS

### Gap 1: Import Entry Point (BLOCKER)
**Problem:** FileImport button only exists on `/dashboard/risk-simulator`
**Impact:** New users arriving at platform can't import their .keepnexus files
**Fix:** Add import button to main dashboard and landing page

### Gap 2: Incomplete File Format (CRITICAL)
**Problem:** File format missing data from 5+ pages
**Impact:** Incomplete round-trip - user data gets lost on export/import cycle

**Currently MISSING from KeepNexusFile:**
```typescript
❌ scheduleEvents: ScheduleEvent[]
❌ drillHistory: DrillRecord[]
❌ drillSettings: DrillSettings
❌ taxSettings: TaxSettings
❌ captainSettings: CaptainSettings
❌ foreverSettings: ForeverSettings
❌ vaultSettings: VaultSettings
```

### Gap 3: Pages Use Local State (CRITICAL)
**Problem:** Pages like Schedule and Drills use `useState` instead of FamilySetup context
**Impact:** Data doesn't persist to .keepnexus file
**Example:**
```typescript
// WRONG (current):
const [events, setEvents] = useState<ScheduleEvent[]>([...])

// RIGHT (needed):
const { setup, updateScheduleEvents } = useFamilySetup()
const events = setup.scheduleEvents
```

### Gap 4: No First-Run Experience
**Problem:** Platform assumes users start from scratch
**Impact:** Confusing for users with existing .keepnexus files
**Fix:** Detect empty state → show modal: "Import file OR start fresh"

### Gap 5: Import Doesn't Navigate/Notify
**Problem:** After import, user stays on Risk Simulator page with no feedback
**Fix:** Show success toast, navigate to dashboard, highlight loaded data

---

## 🛠️ IMPLEMENTATION PHASES

### **PHASE A: Expand File Format** ⏱️ 2-3 hours

**Goal:** Add all missing page data to KeepNexusFile schema

**File to Edit:** `lib/risk-simulator/file-export.ts`

**New Type Definitions Needed:**
```typescript
// Schedule
export interface ScheduleEvent {
  id: string
  title: string
  description: string
  date: string
  type: 'drill' | 'rotation' | 'review' | 'custom'
}

// Drills
export interface DrillRecord {
  id: string
  date: Date
  participants: string[]
  result: 'passed' | 'failed' | 'skipped'
  notes?: string
}

export interface DrillSettings {
  frequency: 'weekly' | 'monthly' | 'quarterly'
  participants: string[]
  notificationDays: number
  autoReminder: boolean
}

// Tax
export interface TaxSettings {
  reportingFrequency: 'monthly' | 'quarterly' | 'annually'
  cpaEmail?: string
  autoGenerate: boolean
  lastReportDate?: Date
}

// Captain (advisor settings)
export interface CaptainSettings {
  advisorName?: string
  advisorEmail?: string
  advisorPhone?: string
  serviceTier: 'nexus' | 'captain' | 'family-office'
  annualReviewDate?: Date
}

// Forever (long-term preservation)
export interface ForeverSettings {
  archivalEnabled: boolean
  ipfsHash?: string
  redundantLocations: string[]
  lastBackupDate?: Date
}

// Vault (wallet-specific settings)
export interface VaultSettings {
  walletType?: string
  lastRotationDate?: Date
  rotationFrequency: number // days
  backupLocations: string[]
}
```

**Updated KeepNexusFile Interface:**
```typescript
export interface KeepNexusFile {
  version: string                    // Bump to "1.2.0"
  created: Date
  modified: Date
  family: string

  // Core estate planning (already exists)
  setup: MultisigSetup
  analysis?: {
    results: SimulationResult[]
    resilienceScore: number
    timestamp: Date
  }
  governance?: {
    rules: GovernanceRule[]
    constitution?: string
  }
  heirs?: Heir[]
  trust?: TrustInfo

  // NEW: Page-specific data
  schedule?: ScheduleEvent[]
  drills?: {
    history: DrillRecord[]
    settings: DrillSettings
  }
  vault?: VaultSettings
  tax?: TaxSettings
  captain?: CaptainSettings
  forever?: ForeverSettings

  // Audit trail (already exists)
  auditTrail: AuditEntry[]
}
```

**Update Methods:**
- ✅ `createFile()` - Add new optional parameters
- ✅ `encryptFile()` - No changes needed (handles any structure)
- ✅ `decryptFile()` - No changes needed
- ✅ Version validation (ensure backward compatibility)

**Acceptance Criteria:**
- [ ] All new types defined in `file-export.ts`
- [ ] KeepNexusFile interface updated with optional fields
- [ ] File version bumped to "1.2.0"
- [ ] Backward compatibility maintained (v1.1.0 files still import)

---

### **PHASE B: Centralize All Data in Context** ⏱️ 4-6 hours

**Goal:** Expand FamilySetup context to be single source of truth for ALL pages

**File to Edit:** `lib/context/FamilySetup.tsx`

**Expanded FamilySetupData:**
```typescript
export interface FamilySetupData {
  // Basic info
  familyName: string

  // Core estate planning (already exists)
  multisig: MultisigSetup
  heirs: Heir[]
  trust: TrustInfo
  governanceRules: GovernanceRule[]

  // NEW: Page-specific data
  scheduleEvents: ScheduleEvent[]
  drillHistory: DrillRecord[]
  drillSettings: DrillSettings
  vaultSettings: VaultSettings
  taxSettings: TaxSettings
  captainSettings: CaptainSettings
  foreverSettings: ForeverSettings

  // Metadata
  lastUpdated: Date
  createdAt: Date
}
```

**New Update Methods Needed:**
```typescript
interface FamilySetupContextType {
  setup: FamilySetupData

  // Existing methods
  updateFamilyName: (name: string) => void
  updateMultisig: (multisig: MultisigSetup) => void
  updateHeirs: (heirs: Heir[]) => void
  updateTrust: (trust: TrustInfo) => void
  updateGovernanceRules: (rules: GovernanceRule[]) => void

  // NEW methods
  updateScheduleEvents: (events: ScheduleEvent[]) => void
  addScheduleEvent: (event: ScheduleEvent) => void
  removeScheduleEvent: (id: string) => void

  updateDrillHistory: (history: DrillRecord[]) => void
  addDrillRecord: (record: DrillRecord) => void
  updateDrillSettings: (settings: DrillSettings) => void

  updateVaultSettings: (settings: VaultSettings) => void
  updateTaxSettings: (settings: TaxSettings) => void
  updateCaptainSettings: (settings: CaptainSettings) => void
  updateForeverSettings: (settings: ForeverSettings) => void

  loadFromFile: (data: FamilySetupData) => void
  resetToDefault: () => void
}
```

**Updated DEFAULT_SETUP:**
```typescript
const DEFAULT_SETUP: FamilySetupData = {
  familyName: 'Chen Family',
  multisig: { /* existing */ },
  heirs: [ /* existing */ ],
  trust: { /* existing */ },
  governanceRules: [ /* existing */ ],

  // NEW defaults
  scheduleEvents: [
    { id: '1', title: 'Key Rotation', description: 'Quarterly security rotation', date: 'Nov 14, 2025', type: 'rotation' },
    { id: '2', title: 'Monthly Drill', description: 'Inheritance simulation', date: 'Nov 18, 2025', type: 'drill' },
  ],
  drillHistory: [
    { id: '1', date: new Date('2024-10-18'), participants: ['Emma', 'Mike Jr'], result: 'passed', notes: 'All heirs passed' }
  ],
  drillSettings: {
    frequency: 'monthly',
    participants: ['Emma Chen', 'Mike Chen Jr.'],
    notificationDays: 7,
    autoReminder: true
  },
  vaultSettings: {
    rotationFrequency: 90,
    backupLocations: ['Home Safe', 'Bank Vault']
  },
  taxSettings: {
    reportingFrequency: 'quarterly',
    autoGenerate: true
  },
  captainSettings: {
    serviceTier: 'nexus'
  },
  foreverSettings: {
    archivalEnabled: false,
    redundantLocations: []
  },

  lastUpdated: new Date(),
  createdAt: new Date()
}
```

**Acceptance Criteria:**
- [ ] FamilySetupData interface expanded with all new fields
- [ ] All update methods implemented
- [ ] DEFAULT_SETUP includes realistic default data
- [ ] localStorage persistence works with expanded schema
- [ ] Context updates trigger re-renders on consuming pages

---

### **PHASE C: Refactor Pages to Use Context** ⏱️ 6-8 hours

**Goal:** Replace all local `useState` with FamilySetup context reads/writes

#### Pages to Refactor

**1. `/dashboard/schedule/page.tsx`** (CRITICAL)
- **Current:** Local state `const [events, setEvents] = useState<ScheduleEvent[]>([...])`
- **Change to:**
  ```typescript
  const { setup, updateScheduleEvents, addScheduleEvent, removeScheduleEvent } = useFamilySetup()
  const events = setup.scheduleEvents
  ```
- **Test:** Add event → export file → clear localStorage → import file → verify event exists

**2. `/dashboard/drills/page.tsx`** (CRITICAL)
- **Current:** Local state for frequency, participants, history
- **Change to:**
  ```typescript
  const { setup, updateDrillSettings, addDrillRecord } = useFamilySetup()
  const { drillSettings, drillHistory } = setup
  ```
- **Test:** Change frequency → export → import → verify settings persist

**3. `/dashboard/vault/page.tsx`** (VERIFY FIRST)
- **Action:** Check if already using context or local state
- **If local state:** Refactor to use `setup.vaultSettings`

**4. `/dashboard/tax/page.tsx`** (VERIFY FIRST)
- **Action:** Check current implementation
- **If local state:** Refactor to use `setup.taxSettings`

**5. `/dashboard/captain/page.tsx`** (VERIFY FIRST)
- **Action:** Check current implementation
- **If local state:** Refactor to use `setup.captainSettings`

**6. `/dashboard/forever/page.tsx`** (VERIFY FIRST)
- **Action:** Check current implementation
- **If local state:** Refactor to use `setup.foreverSettings`

**7. `/dashboard/heirs/page.tsx`** (VERIFY)
- **Action:** Confirm already using `setup.heirs` from context
- **No changes needed if already correct**

**8. `/dashboard/trust/page.tsx`** (VERIFY)
- **Action:** Confirm already using `setup.trust` from context
- **No changes needed if already correct**

**Refactor Template:**
```typescript
// BEFORE:
export default function SchedulePage() {
  const [events, setEvents] = useState<ScheduleEvent[]>([...])

  const handleAddEvent = () => {
    setEvents([...events, newEvent])
  }

  return <div>...</div>
}

// AFTER:
import { useFamilySetup } from '@/lib/context/FamilySetup'

export default function SchedulePage() {
  const { setup, addScheduleEvent } = useFamilySetup()
  const events = setup.scheduleEvents

  const handleAddEvent = () => {
    addScheduleEvent(newEvent)
  }

  return <div>...</div>
}
```

**Acceptance Criteria:**
- [ ] All pages read from FamilySetup context
- [ ] No pages use local `useState` for persistent data
- [ ] Changes on any page update context
- [ ] Context changes save to localStorage
- [ ] All pages re-render when context updates

---

### **PHASE D: Update File Import/Export Flow** ⏱️ 3-4 hours

**Goal:** Complete round-trip works for ALL page data

#### D1: Update Export Logic
**File:** `components/risk-simulator/FileExport.tsx`

**Current:** Only exports multisig setup, analysis, governance, heirs, trust
**Change:** Export ALL context data

```typescript
const handleExport = async () => {
  const { setup } = useFamilySetup()

  const file = keepNexusFileService.createFile(
    setup.multisig,
    { results, resilienceScore },
    setup.governanceRules,
    setup.heirs,
    setup.trust,

    // NEW: Add all page data
    setup.scheduleEvents,
    setup.drillHistory,
    setup.drillSettings,
    setup.vaultSettings,
    setup.taxSettings,
    setup.captainSettings,
    setup.foreverSettings,

    existingAuditTrail
  )

  const encrypted = await keepNexusFileService.encryptFile(file, password)
  // ... download
}
```

**Update:** `keepNexusFileService.createFile()` signature
```typescript
createFile(
  setup: MultisigSetup,
  analysis?: { results: SimulationResult[]; resilienceScore: number },
  governanceRules?: GovernanceRule[],
  heirs?: Heir[],
  trust?: TrustInfo,
  // NEW parameters
  scheduleEvents?: ScheduleEvent[],
  drillHistory?: DrillRecord[],
  drillSettings?: DrillSettings,
  vaultSettings?: VaultSettings,
  taxSettings?: TaxSettings,
  captainSettings?: CaptainSettings,
  foreverSettings?: ForeverSettings,
  existingAuditTrail?: AuditEntry[]
): KeepNexusFile
```

#### D2: Update Import Logic
**File:** `app/dashboard/risk-simulator/page.tsx` (current location)

**Current:** Only loads multisig, governance, heirs, trust
**Change:** Load ALL file data into context

```typescript
const handleImport = (file: KeepNexusFile) => {
  // Load existing data
  setSetup(file.setup)
  updateMultisig(file.setup)

  if (file.governance?.rules) {
    updateGovernanceRules(file.governance.rules)
  }
  if (file.heirs) {
    updateHeirs(file.heirs)
  }
  if (file.trust) {
    updateTrust(file.trust)
  }

  // NEW: Load all page data
  if (file.schedule) {
    updateScheduleEvents(file.schedule)
  }
  if (file.drills?.history) {
    updateDrillHistory(file.drills.history)
  }
  if (file.drills?.settings) {
    updateDrillSettings(file.drills.settings)
  }
  if (file.vault) {
    updateVaultSettings(file.vault)
  }
  if (file.tax) {
    updateTaxSettings(file.tax)
  }
  if (file.captain) {
    updateCaptainSettings(file.captain)
  }
  if (file.forever) {
    updateForeverSettings(file.forever)
  }

  // Show success notification
  toast.success(`Loaded ${file.family} configuration`)
}
```

**Acceptance Criteria:**
- [ ] Export includes ALL page data
- [ ] Import loads ALL page data into context
- [ ] No data loss on export → import cycle
- [ ] Success toast shows after import

---

### **PHASE E: Make Import Globally Accessible** ⏱️ 2-3 hours

**Goal:** Users can import from anywhere, not just Risk Simulator

#### E1: Add Import to Main Dashboard
**File:** `app/dashboard/page.tsx`

**Add to header:**
```typescript
import { FileImport } from '@/components/risk-simulator/FileImport'
import { useFamilySetup } from '@/lib/context/FamilySetup'

export default function DashboardPage() {
  const { loadFromFile } = useFamilySetup()

  const handleImport = (file: KeepNexusFile) => {
    // Load ALL data from file
    loadFromFile({
      familyName: file.family,
      multisig: file.setup,
      heirs: file.heirs || [],
      trust: file.trust || {},
      governanceRules: file.governance?.rules || [],
      scheduleEvents: file.schedule || [],
      drillHistory: file.drills?.history || [],
      drillSettings: file.drills?.settings || DEFAULT_DRILL_SETTINGS,
      // ... etc
    })

    toast.success(`Welcome back, ${file.family}!`)
  }

  return (
    <div>
      {/* Header with Import/Export */}
      <div className="flex justify-between items-center">
        <h1>KEEP NEXUS</h1>
        <div className="flex gap-2">
          <FileImport onImport={handleImport} />
          <FileExport />
        </div>
      </div>
      {/* ... rest of dashboard */}
    </div>
  )
}
```

#### E2: Update FamilySetup Context loadFromFile
**File:** `lib/context/FamilySetup.tsx`

**Make loadFromFile handle KeepNexusFile directly:**
```typescript
const loadFromKeepNexusFile = (file: KeepNexusFile) => {
  setSetup({
    familyName: file.family,
    multisig: file.setup,
    heirs: file.heirs || [],
    trust: file.trust || {},
    governanceRules: file.governance?.rules || [],
    scheduleEvents: file.schedule || [],
    drillHistory: file.drills?.history || [],
    drillSettings: file.drills?.settings || DEFAULT_DRILL_SETTINGS,
    vaultSettings: file.vault || DEFAULT_VAULT_SETTINGS,
    taxSettings: file.tax || DEFAULT_TAX_SETTINGS,
    captainSettings: file.captain || DEFAULT_CAPTAIN_SETTINGS,
    foreverSettings: file.forever || DEFAULT_FOREVER_SETTINGS,
    lastUpdated: new Date(),
    createdAt: file.created
  })
}
```

**Acceptance Criteria:**
- [ ] Import button visible on main dashboard
- [ ] Import works from dashboard (not just Risk Simulator)
- [ ] Success toast appears after import
- [ ] All pages immediately show imported data

---

### **PHASE F: First-Run Experience** ⏱️ 3-4 hours

**Goal:** Guide new users to either import file OR start fresh

#### F1: Detect Empty State
**File:** `app/dashboard/page.tsx`

```typescript
export default function DashboardPage() {
  const [showWelcome, setShowWelcome] = useState(false)
  const { setup } = useFamilySetup()

  useEffect(() => {
    // Check if this is first visit (no localStorage data)
    const hasData = localStorage.getItem('familySetup')
    const isDefaultSetup = setup.familyName === 'Chen Family' &&
                          setup.createdAt.toDateString() === new Date().toDateString()

    if (!hasData || isDefaultSetup) {
      setShowWelcome(true)
    }
  }, [])

  return (
    <>
      {showWelcome && <WelcomeModal onClose={() => setShowWelcome(false)} />}
      {/* ... rest of dashboard */}
    </>
  )
}
```

#### F2: Welcome Modal Component
**File:** `components/dashboard/WelcomeModal.tsx` (new file)

```typescript
interface WelcomeModalProps {
  onClose: () => void
}

export function WelcomeModal({ onClose }: WelcomeModalProps) {
  const { resetToDefault } = useFamilySetup()

  const handleStartFresh = () => {
    resetToDefault()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white max-w-2xl w-full p-8">
        <h2 className="text-2xl font-bold mb-4">Welcome to KeepNexus</h2>

        <div className="grid grid-cols-2 gap-6 mt-6">
          {/* Import Option */}
          <div className="border-2 border-gray-300 p-6 hover:border-gray-900">
            <h3 className="font-semibold mb-2">Import Configuration</h3>
            <p className="text-sm text-gray-600 mb-4">
              Already have a .keepnexus file? Upload it to load your estate plan.
            </p>
            <FileImport onImport={(file) => {
              // Import logic
              onClose()
            }} />
          </div>

          {/* Start Fresh Option */}
          <div className="border-2 border-gray-300 p-6 hover:border-gray-900">
            <h3 className="font-semibold mb-2">Start From Scratch</h3>
            <p className="text-sm text-gray-600 mb-4">
              New to KeepNexus? We'll guide you through setting up your estate plan.
            </p>
            <button
              onClick={handleStartFresh}
              className="w-full px-4 py-2 bg-gray-900 text-white"
            >
              Get Started
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
```

**Acceptance Criteria:**
- [ ] Modal shows on first visit (empty localStorage)
- [ ] "Import Configuration" option works
- [ ] "Start From Scratch" option sets up default family
- [ ] Modal doesn't show again after choice is made
- [ ] User can manually trigger modal from settings

---

### **PHASE G: End-to-End Testing** ⏱️ 2-3 hours

**Goal:** Verify complete round-trip for all page data

#### Test Script

**Test 1: Fresh Setup → Export**
1. Clear localStorage
2. Start fresh (Chen Family default)
3. Navigate to all pages, verify default data shows
4. Export .keepnexus file
5. Verify file contains all page data (inspect JSON)

**Test 2: Import → Modify → Export**
1. Clear localStorage
2. Import Chen Family file from Test 1
3. Verify all pages show correct data:
   - [ ] Risk Simulator: multisig config
   - [ ] Governator: governance rules
   - [ ] Heirs: beneficiary list
   - [ ] Trust: legal documents
   - [ ] Schedule: upcoming events
   - [ ] Drills: history and settings
   - [ ] Vault: wallet settings
   - [ ] Tax: reporting settings
   - [ ] Captain: advisor info
   - [ ] Forever: archival settings
4. Make changes on each page
5. Export new file
6. Compare file versions (verify changes captured)

**Test 3: Cross-Page Updates**
1. Import file
2. Add heir in Heirs page
3. Immediately navigate to Governator
4. Create rule for new heir (verify heir appears in dropdown)
5. Export file
6. Verify both changes in file JSON

**Test 4: Backward Compatibility**
1. Import old v1.1.0 file (missing new fields)
2. Verify app doesn't crash
3. Verify old data loads correctly
4. Verify new fields use defaults
5. Export → verify file upgraded to v1.2.0

**Test 5: Error Handling**
1. Try importing corrupted file → verify error message
2. Try importing file with wrong password → verify error
3. Try importing non-.keepnexus file → verify rejection
4. Export without password → verify error

**Acceptance Criteria:**
- [ ] All 5 tests pass
- [ ] No data loss in any scenario
- [ ] No console errors
- [ ] All error messages user-friendly
- [ ] Performance acceptable (<2s for import/export)

---

## 🏆 SUCCESS CRITERIA

### Functional Requirements
- [ ] User can import .keepnexus file from main dashboard
- [ ] Import populates ALL pages with correct data
- [ ] User can make changes on ANY page
- [ ] Changes automatically sync to context
- [ ] User can export updated .keepnexus file
- [ ] Export includes ALL page data (zero data loss)
- [ ] Import/export cycle preserves all data
- [ ] Backward compatibility with v1.1.0 files

### Technical Requirements
- [ ] File format version bumped to 1.2.0
- [ ] FamilySetup context is single source of truth
- [ ] No pages use local `useState` for persistent data
- [ ] localStorage persistence works
- [ ] Encryption/decryption works (AES-256-GCM)
- [ ] File integrity verified (SHA-256 checksums)
- [ ] Audit trail captures all changes

### User Experience
- [ ] First-run modal guides new users
- [ ] Import button accessible from dashboard
- [ ] Success toasts on import/export
- [ ] Error messages are clear
- [ ] Import/export <2 seconds
- [ ] Mobile responsive

---

## 💰 FUTURE: MODULAR PRICING MODEL

Once file-first system is complete, add premium modules:

### File Format Extension
```typescript
export interface KeepNexusFile {
  // ... existing fields ...

  // NEW: Premium modules (locked behind subscription)
  modules?: {
    familyBanking?: {
      enabled: boolean
      loans: FamilyLoan[]
      creditLines: CreditLine[]
    }
    yieldSeeking?: {
      enabled: boolean
      strategies: YieldStrategy[]
      allocations: YieldAllocation[]
    }
    payoutSchedules?: {
      enabled: boolean
      schedules: PayoutSchedule[]
      vesting: VestingRule[]
    }
    // ... future modules
  }
}
```

### Pricing Tiers
- **FREE:** Import/export, risk sim, basic estate planning
- **NEXUS ($99/year):** All base features, priority support
- **CAPTAIN ($2,500):** + Family Banking module
- **FAMILY OFFICE ($15,000):** + All modules, white-glove service

### Module Activation
- Modules unlock via subscription
- Free tier can VIEW module data but not EDIT
- File format supports modules even if user downgrades (data preserved)

---

## 📋 IMPLEMENTATION CHECKLIST

### Phase A: Expand File Format
- [ ] Define all new type interfaces
- [ ] Update KeepNexusFile interface
- [ ] Bump version to 1.2.0
- [ ] Update createFile() method
- [ ] Test backward compatibility

### Phase B: Centralize Data in Context
- [ ] Expand FamilySetupData interface
- [ ] Add all new update methods
- [ ] Update DEFAULT_SETUP
- [ ] Test localStorage persistence
- [ ] Test context re-renders

### Phase C: Refactor Pages
- [ ] Schedule page → context
- [ ] Drills page → context
- [ ] Verify/fix Vault page
- [ ] Verify/fix Tax page
- [ ] Verify/fix Captain page
- [ ] Verify/fix Forever page
- [ ] Verify Heirs page
- [ ] Verify Trust page

### Phase D: Update Import/Export
- [ ] Update FileExport component
- [ ] Update createFile() signature
- [ ] Update import handler
- [ ] Add success notifications
- [ ] Test round-trip

### Phase E: Global Import Access
- [ ] Add import to dashboard header
- [ ] Update loadFromFile() method
- [ ] Add export to dashboard header
- [ ] Test from multiple pages

### Phase F: First-Run Experience
- [ ] Create WelcomeModal component
- [ ] Add empty state detection
- [ ] Wire up import/fresh options
- [ ] Test first-visit flow

### Phase G: Testing
- [ ] Run all 5 test scenarios
- [ ] Fix any bugs found
- [ ] Performance optimization
- [ ] Mobile testing
- [ ] Cross-browser testing

---

## 🚀 ROLLOUT PLAN

### Week 1: Foundation
- Complete Phases A & B (file format + context)
- Internal testing

### Week 2: Pages Refactor
- Complete Phase C (all pages → context)
- Component testing

### Week 3: Integration
- Complete Phases D & E (import/export flow)
- Integration testing

### Week 4: Polish & Launch
- Complete Phase F (first-run UX)
- Complete Phase G (end-to-end testing)
- Bug fixes
- Documentation
- **SHIP IT**

---

## 📞 SUPPORT & QUESTIONS

**When context runs out, refer back to this document.**

**Key Questions to Ask:**
1. What phase are we on?
2. Has the file format been expanded? (Phase A)
3. Is FamilySetup context centralized? (Phase B)
4. Which pages still use local state? (Phase C)
5. Can users import from dashboard? (Phase E)

**Critical Files:**
- `lib/risk-simulator/file-export.ts` - File format
- `lib/context/FamilySetup.tsx` - Centralized state
- `app/dashboard/page.tsx` - Main dashboard
- All `/app/dashboard/*/page.tsx` files - Individual pages

**Test Command:**
```bash
# Verify localStorage structure
localStorage.getItem('familySetup')

# Check context version
console.log(setup.version)

# Export test
# Navigate to Risk Simulator → Export → Inspect JSON
```

---

**Status:** Ready to begin Phase A
**Next Action:** Define type interfaces in file-export.ts
**Estimated Completion:** 3-4 days for full implementation
