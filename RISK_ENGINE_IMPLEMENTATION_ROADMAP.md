# KEEP Risk Engine & Score System - Implementation Roadmap

**Project Start:** November 5, 2025
**Target MVP:** November 12, 2025 (1 week)
**Full System:** November 26, 2025 (3 weeks)
**Status:** 🟢 Active Development

---

## 🎯 Mission Statement

Build a client-side, file-first risk analysis and scoring system for Bitcoin multisig estate planning that provides:
1. **One Simple Score** (0-100) families can understand
2. **Deep Risk Analysis** for advisors via simulation
3. **Complete Data Sovereignty** via Little Shard™ files
4. **Visual Proof** of resilience (red→green transformation)

---

## 📋 Quick Reference - Current Status

### What We're Building (NOT fixing old code)
- ✅ Decided to skip fixing broken implementation
- ✅ Building fresh from vision documents
- ⏳ Phase 1A in progress: Core Data Model

### Key Decisions Made
- **File Format:** Little Shard™ JSON (encrypted)
- **Score Formula:** `(Security × 0.4) + (Redundancy × 0.3) + (Liveness × 0.2) + (Legal × 0.1)`
- **Architecture:** Two-layer (Score Engine + Risk Simulator)
- **Tech Stack:** TypeScript + React (keeping existing stack)
- **No Server Calls:** Everything runs client-side

---

## 🏗️ Architecture Overview

```
KEEP Risk System
├── Layer 1: KEEP Score Engine (User-Facing)
│   ├── Instant 0-100 score calculation
│   ├── Component breakdown (security, redundancy, etc.)
│   └── Simple recommendations ("Add hardware wallet +10 points")
│
├── Layer 2: Risk Simulator (Advisor-Facing)
│   ├── Scenario testing (death, theft, loss, etc.)
│   ├── Monte Carlo simulations (optional)
│   └── Mitigation suggestions
│
└── Foundation: Little Shard™ File
    ├── Encrypted JSON format
    ├── Complete estate data model
    └── Append-only event log
```

---

## 📅 Implementation Phases

### Phase 1: Foundation (Days 1-3)
**Goal:** Create the core data model and file system

#### Phase 1A: Little Shard™ File Format ⏳ CURRENT
- [ ] Define complete JSON schema
- [ ] Create TypeScript interfaces
- [ ] Build encryption/decryption layer
- [ ] Implement file import/export
- [ ] Add validation and versioning

**Key Files to Create:**
- `lib/keep-core/little-shard.ts`
- `lib/keep-core/data-model.ts`
- `lib/keep-core/encryption.ts`

#### Phase 1B: KEEP Score Engine
- [ ] Implement weighted scoring formula
- [ ] Create component calculators (security, redundancy, etc.)
- [ ] Build score history tracking
- [ ] Add recommendation engine

**Key Files to Create:**
- `lib/keep-core/keep-score.ts`
- `lib/keep-core/recommendations.ts`

---

### Phase 2: Risk Simulator 2.0 (Days 4-5)
**Goal:** Build proper risk analysis with working combined scenarios

#### Phase 2A: Core Simulation Engine
- [ ] Fix combined scenario logic (properly merge ALL properties)
- [ ] Implement all scenarios from vision docs:
  - Death (single/joint)
  - Key loss
  - Theft
  - Divorce/legal freeze
  - Rogue custodian
  - Coercion ($5 wrench attack)
  - Natural disaster/geographic loss
- [ ] Create deterministic outcome calculation
- [ ] Build mitigation action system

**Key Files to Create:**
- `lib/risk-engine/simulator.ts`
- `lib/risk-engine/scenarios.ts`
- `lib/risk-engine/mitigation.ts`

#### Phase 2B: Advanced Features
- [ ] Add Monte Carlo simulation option
- [ ] Implement probability calculations
- [ ] Create risk heat maps
- [ ] Build scenario combinations

**Key Files to Create:**
- `lib/risk-engine/monte-carlo.ts`
- `lib/risk-engine/probability.ts`

---

### Phase 3: User Interface (Days 6-7)
**Goal:** Create clean, professional UI matching the vision

#### Phase 3A: Score Dashboard
- [ ] Big 0-100 score display widget
- [ ] Component breakdown bars
- [ ] Trend/history chart
- [ ] Recommendations panel

**Key Components:**
- `components/keep-dashboard/ScoreWidget.tsx`
- `components/keep-dashboard/ScoreBreakdown.tsx`
- `components/keep-dashboard/RecommendationsPanel.tsx`

#### Phase 3B: Risk Simulator Interface
- [ ] Enhanced risk matrix (with proper combined scenarios)
- [ ] Mitigation action buttons
- [ ] Scenario selector with multi-select
- [ ] Visual feedback (red→green animation)

**Key Components:**
- `components/risk-simulator/RiskMatrix2.tsx`
- `components/risk-simulator/MitigationPanel.tsx`
- `components/risk-simulator/ScenarioSelector.tsx`

---

### Phase 4: Integration & Polish (Week 2)
**Goal:** Connect everything and add professional touches

- [ ] Connect Score Engine to Simulator results
- [ ] Add annual checkup system
- [ ] Implement PDF export
- [ ] Create setup wizard
- [ ] Add demo data sets
- [ ] Write documentation

---

## 🔧 Technical Specifications

### Little Shard™ File Schema v1.0

```typescript
interface LittleShardFile {
  // Metadata
  version: string;           // "1.0.0"
  created_at: string;        // ISO 8601
  last_modified: string;     // ISO 8601
  file_hash: string;         // SHA-256 of content

  // KEEP Score
  keep_score: {
    value: number;           // 0-100
    calculated_at: string;
    components: {
      security: number;      // 0-100
      redundancy: number;    // 0-100
      liveness: number;      // 0-100
      legal_readiness: number; // 0-100
      education: number;     // 0-100
    };
    trend: 'improving' | 'stable' | 'declining';
  };

  // Multisig Configuration
  wallets: Array<{
    id: string;
    descriptor: string;      // Output descriptor
    threshold: number;       // M in M-of-N
    total_keys: number;      // N in M-of-N
    created_at: string;
  }>;

  // Key Holders
  keyholders: Array<{
    id: string;
    role: 'primary' | 'spouse' | 'child' | 'attorney' | 'custodian' | 'friend';
    name: string;
    jurisdiction: string;
    storage_type: string;
    location: string;
    key_age_days: number;
    is_sharded: boolean;
    shard_config?: {
      threshold: number;
      total: number;
      holders: string[];
    };
  }>;

  // Redundancy Tracking
  redundancy: {
    device_count: number;
    location_count: number;
    person_count: number;
    geographic_distribution: string[];
  };

  // Activity Log
  drills: Array<{
    timestamp: string;
    type: 'recovery' | 'signing' | 'verification';
    participants: string[];
    success: boolean;
    notes: string;
  }>;

  rotations: Array<{
    timestamp: string;
    keys_rotated: string[];
    reason: string;
  }>;

  // Legal & Education
  legal_docs: {
    has_will: boolean;
    has_trust: boolean;
    last_review: string;
    next_review: string;
  };

  education: {
    heirs_trained: boolean;
    last_training: string;
    next_review: string;
  };

  // Risk Analysis Results
  risk_analysis: {
    last_run: string;
    scenarios_tested: number;
    probability_of_recovery: number;
    critical_risks: string[];
    mitigation_applied: string[];
  };
}
```

### KEEP Score Formula (V2 - Aligned)

```typescript
function calculateKEEPScore(data: LittleShardFile): number {
  const keepSecure = calculateKeepSecure(data);           // K - 25%
  const establishLegal = calculateEstablishLegal(data);   // E - 25%
  const ensureAccess = calculateEnsureAccess(data);       // E - 25%
  const planFuture = calculatePlanFuture(data);          // P - 25%

  // Equal weighting for clarity and simplicity
  const score = (
    (keepSecure * 0.25) +
    (establishLegal * 0.25) +
    (ensureAccess * 0.25) +
    (planFuture * 0.25)
  );

  return Math.round(score);
}
```

---

## 🚀 Implementation Strategy

### Day 1 Focus (TODAY)
1. Create this roadmap ✅
2. Set up new file structure
3. Define Little Shard schema
4. Build basic file I/O

### Success Metrics
- [ ] Little Shard files can be created/loaded
- [ ] KEEP Score calculates correctly
- [ ] Risk Simulator handles ALL scenarios properly
- [ ] Combined scenarios work (union logic)
- [ ] UI shows red→green transformation
- [ ] Everything runs client-side
- [ ] PDF export works

### What We're NOT Building (Yet)
- Governator integration (Phase 5)
- Cloud sync/backup
- Mobile app
- Hardware wallet integration
- Live blockchain monitoring

---

## 📝 Key Design Principles

1. **File-First:** The Little Shard file IS the product
2. **Client-Side:** No data leaves the device
3. **Visual Clarity:** Show, don't tell
4. **Professional Output:** PDF for lawyers/advisors
5. **Incremental Value:** Each phase ships something useful

---

## 🎯 Definition of Done

### MVP (End of Week 1)
- [ ] Can create/load Little Shard files
- [ ] KEEP Score displays and updates
- [ ] All scenarios from vision docs work
- [ ] Combined scenarios properly implemented
- [ ] Basic UI with red→green visualization
- [ ] Can export configuration as JSON

### Full System (End of Week 3)
- [ ] Monte Carlo simulations working
- [ ] PDF export with professional formatting
- [ ] Annual checkup system
- [ ] Demo data for presentations
- [ ] Full documentation
- [ ] Ready for production deployment

---

## 📚 Reference Documents

1. **KEEP Risk Simulator + Score Engine Architecture Brief** - Core vision
2. **KEEP Multisig Risk Module Product Specification** - Detailed features
3. **Original PRD** - UI/UX specifications (partially obsolete)
4. **Session Logs** - Development history (ignore broken implementation)

---

## 🔄 Daily Status Updates

### November 5, 2025
- Created implementation roadmap
- Decided to skip fixing broken code
- Starting fresh with Phase 1A: Little Shard file format
- ✅ Completed Little Shard data model
- ✅ Built KEEP Score Engine V1
- ✅ Implemented Risk Simulator with 17 scenarios
- ✅ Fixed combined scenario bug properly
- ✅ **Pivoted to KEEP-aligned scoring (V2)**
- **Decision:** Keep Little Shard simple (map + trust only, no tax/milestone complexity)
- **Next:** Build ultra-simple text-based UI

### [Daily updates will be added here]

---

## 📞 Questions/Decisions Needed

1. **Encryption:** Which algorithm for Little Shard files? (Suggest: AES-256-GCM)
2. **File Extension:** `.shard`, `.keep`, or `.json`?
3. **Monte Carlo:** How many iterations default? (Suggest: 1000)
4. **Score Threshold:** What score is "good enough"? (Suggest: 80+)

---

**Remember:** We're building the RIGHT version from the start. No technical debt. No broken features. Just clean, working code that matches the vision.