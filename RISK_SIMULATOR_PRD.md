# Risk Simulator - Product Requirements Document

**Last Updated:** 2025-11-04
**Status:** Phase 1 - Interactive Demo Build
**Owner:** Keep Nexus Development Team

---

## Executive Summary

The Risk Simulator is an **advisor-facing tool** for Bitcoin estate planners to visually demonstrate multisig security risks and solutions to clients in real-time consultations.

**Core Value Proposition:**
Show clients their inheritance plan's vulnerabilities (red cells) and watch them turn into resilient solutions (green cells) with one configuration change.

**This is NOT:**
- A self-serve consumer tool
- A SaaS dashboard for ongoing management
- Feature-rich or complex

**This IS:**
- A professional advisor consultation tool
- A document generator (PDF is the product)
- Simple, elegant, file-first
- Demo-ready interactive experience

---

## Product Philosophy

### Elon-Level Simplicity
- **Simplicity is elegance** - every feature must justify its existence
- **File-first system** - web interface assists, PDF is the deliverable
- **Retro aesthetic** - terminal/spreadsheet feel, not modern SaaS
- **Show, don't tell** - visualization over explanation

### The "Wow Moments"
1. **Clarity from chaos** - sticky notes → clean table
2. **Intelligence proof** - click scenario → system calculates outcome instantly
3. **Problem → Solution** - red cells → one change → green cells
4. **Professional artifact** - generate printable playbook

---

## User Context

### Primary User: Bitcoin Estate Planning Advisor
- Sits with client during consultation (60-90 min session)
- Needs to look professional and competent
- Configures client's multisig setup live
- Simulates disasters to reveal risks
- Shows fixes in real-time
- Exports PDF playbook client takes to lawyer

### Secondary User: The Client (Passive Observer)
- Watches advisor configure their setup
- Sees their family/roles represented visually
- Understands risks through color-coded table
- Takes home PDF with recovery instructions
- Shows PDF to lawyer/CPA

### Tertiary User: Legal/Financial Professionals
- Receive PDF playbook from client
- Verify multisig setup matches legal documents
- Understand recovery procedures
- No technical Bitcoin knowledge required

---

## Technical Architecture

### Data Model

```typescript
// Core Types
interface MultisigSetup {
  threshold: number              // M in M-of-N
  totalKeys: number             // N in M-of-N
  keys: Key[]
  createdAt: Date
  family: string                // "Chen Family"
}

interface Key {
  id: string
  holder: string                // "Dad", "Mom", "Child A"
  type: 'full' | 'sharded'
  shardConfig?: ShardConfig
  storage: 'hardware-wallet' | 'paper' | 'vault' | 'digital'
  location: string              // "Home safe", "Bank vault"
}

interface ShardConfig {
  k: number                     // Threshold for reconstruction
  m: number                     // Total shards
  holders: string[]             // Who holds each shard
}

interface Scenario {
  id: string
  name: string                  // "Both Primaries Die"
  description: string
  unavailableHolders: string[]  // Who can't be reached
  compromisedKeys?: string[]    // Attacker has these (optional)
}

interface SimulationResult {
  scenario: Scenario
  availableKeys: number
  requiredKeys: number
  outcome: 'recoverable' | 'locked' | 'stolen' | 'degraded'
  recoveryPath?: string[]       // Which keys would be used
  recommendation?: string       // How to fix if locked
}
```

### Simulation Logic (Core Algorithm)

```typescript
function simulateScenario(
  setup: MultisigSetup,
  scenario: Scenario
): SimulationResult {

  // For each key, determine if it's available
  const availableKeys = setup.keys.filter(key => {

    // If key holder is unavailable
    if (scenario.unavailableHolders.includes(key.holder)) {

      // Check if sharded and can reconstruct
      if (key.type === 'sharded') {
        const availableShards = key.shardConfig!.holders.filter(
          h => !scenario.unavailableHolders.includes(h)
        )
        return availableShards.length >= key.shardConfig!.k
      }

      return false // Can't use this key
    }

    return true // Key is available
  })

  const numAvailable = availableKeys.length

  // Determine outcome
  if (numAvailable >= setup.threshold) {
    return {
      scenario,
      availableKeys: numAvailable,
      requiredKeys: setup.threshold,
      outcome: 'recoverable',
      recoveryPath: availableKeys.slice(0, setup.threshold).map(k => k.holder)
    }
  }

  return {
    scenario,
    availableKeys: numAvailable,
    requiredKeys: setup.threshold,
    outcome: 'locked',
    recommendation: generateRecommendation(setup, scenario)
  }
}

function calculateResilienceScore(
  setup: MultisigSetup,
  scenarios: Scenario[]
): number {
  const results = scenarios.map(s => simulateScenario(setup, s))
  const recoverable = results.filter(r => r.outcome === 'recoverable').length
  return Math.round((recoverable / scenarios.length) * 100)
}
```

---

## Phase 1: Interactive Demo (CURRENT FOCUS)

**Timeline:** 4-5 days
**Deliverable:** Screen-recordable demo for 90-second video

### Features

#### 1. Risk Matrix Table
- **Visual:** 5 keys (rows) × 6 scenarios (columns)
- **Color coding:**
  - 🟢 Green: Key available in this scenario
  - 🔴 Red: Key unavailable/locked
  - 🟡 Yellow: Degraded (compromised but usable)
- **Smooth animations:** Color transitions using Framer Motion
- **Clean design:** White background, gray borders, status colors only

#### 2. Preset Configuration (Hardcoded)
- **Chen Family 3-of-5 Multisig**
  - Key 1: Dad (hardware wallet, home safe)
  - Key 2: Mom (hardware wallet, home safe)
  - Key 3: Child A (paper wallet, child's possession)
  - Key 4: Bank Vault (paper backup, bank safety deposit box)
  - Key 5: Lawyer (sealed envelope, law office vault)

#### 3. Scenario Buttons
Six clickable disaster scenarios:
1. **Both Primaries Die** - Dad + Mom unavailable
2. **One Primary Dies** - Dad unavailable only
3. **House Fire** - Dad + Mom (co-located risk)
4. **Key Theft** - One key compromised
5. **Divorce** - Mom unavailable (legal dispute)
6. **Custodian Unavailable** - Lawyer/Bank unavailable

**Interaction:** Click button → simulation runs → table updates → score recalculates

#### 4. Shard Configuration Controls
- **Per-key toggles:** "☐ Shard this key?"
- **When checked:** Shows k-of-m selector + shard holder dropdowns
- **Example:** Shard Key #1 (Dad) → 2-of-3 → Child A, Child B, Trusted Friend
- **Effect:** Click toggle → simulation reruns → red cells turn green

#### 5. Resilience Score Display
- **Big number:** 0-100%
- **Visual indicator:** Color-coded (red <50%, yellow 50-79%, green 80%+)
- **Updates live:** Recalculates on any configuration change
- **Location:** Top of page, prominent

#### 6. Recovery Path Indicator
- **Shows for each scenario:** "Available keys: Dad + Child A + Vault = 3/3 ✓"
- **Visual feedback:** Which keys would actually be used
- **Helps clients understand:** Not just "recoverable" but HOW

### UI Layout (Desktop)

```
┌────────────────────────────────────────────────────────────┐
│  Risk Simulator                    Resilience: 67% 🟡      │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  ┌─────────────────┐  ┌──────────────────────────────┐   │
│  │ Configuration   │  │   Risk Matrix                │   │
│  │                 │  │                              │   │
│  │ M-of-N:         │  │   ┌───┬────┬────┬────┬────┐ │   │
│  │ [3] of [5]      │  │   │   │Both│Fire│Thft│Div │ │   │
│  │                 │  │   ├───┼────┼────┼────┼────┤ │   │
│  │ Key 1: Dad      │  │   │Dad│ 🔴 │ 🔴 │ 🟢 │ 🟢 │ │   │
│  │ ☐ Shard?        │  │   │Mom│ 🔴 │ 🔴 │ 🟢 │ 🔴 │ │   │
│  │                 │  │   │Ch │ 🟢 │ 🟢 │ 🟢 │ 🟢 │ │   │
│  │ Key 2: Mom      │  │   │Vlt│ 🟢 │ 🟡 │ 🟢 │ 🟢 │ │   │
│  │ ☐ Shard?        │  │   │Law│ 🟢 │ 🟢 │ 🟢 │ 🟢 │ │   │
│  │                 │  │   └───┴────┴────┴────┴────┘ │   │
│  │ Key 3: Child A  │  │                              │   │
│  │ ☐ Shard?        │  │   Recovery Paths:            │   │
│  │                 │  │   Both Die: ❌ LOCKED        │   │
│  │ Key 4: Vault    │  │   Available: Child+Vault+Law │   │
│  │ ☐ Shard?        │  │   Need: 3 | Have: 3          │   │
│  │                 │  │   BUT: Only 2 available ⚠️   │   │
│  │ Key 5: Lawyer   │  │                              │   │
│  │ ☐ Shard?        │  │   Recommendation:            │   │
│  │                 │  │   → Shard Key #1 (Dad)       │   │
│  └─────────────────┘  │   → Shard Key #2 (Mom)       │   │
│                       └──────────────────────────────┘   │
│                                                            │
│  Scenario Buttons:                                         │
│  [Both Die] [One Dies] [Fire] [Theft] [Divorce] [Cust.]  │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

### Technical Stack (Phase 1)

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS (minimal, matching existing dashboard)
- **Animations:** Framer Motion (color transitions, score updates)
- **State:** React useState (no complex state management needed)
- **Routing:** `/app/dashboard/risk-simulator/page.tsx`
- **Components:**
  - `RiskMatrix.tsx` - The main table
  - `RiskCell.tsx` - Individual cells with color states
  - `ScenarioButtons.tsx` - Disaster scenario selector
  - `ConfigPanel.tsx` - Left-side configuration
  - `ShardToggle.tsx` - Shard configuration per key
  - `ResilienceScore.tsx` - Big score display
  - `RecoveryPath.tsx` - Shows available keys

### File Structure

```
keepnexus/
├── app/
│   └── dashboard/
│       └── risk-simulator/
│           └── page.tsx                 // Main page
├── components/
│   └── risk-simulator/
│       ├── RiskMatrix.tsx              // Table component
│       ├── RiskCell.tsx                // Individual cells
│       ├── ScenarioButtons.tsx         // Scenario selector
│       ├── ConfigPanel.tsx             // Left config panel
│       ├── ShardToggle.tsx             // Shard controls
│       ├── ResilienceScore.tsx         // Score display
│       └── RecoveryPath.tsx            // Recovery info
├── lib/
│   └── risk-simulator/
│       ├── types.ts                    // TypeScript interfaces
│       ├── engine.ts                   // Simulation algorithm
│       ├── scenarios.ts                // Preset scenarios
│       └── recommendations.ts          // Fix suggestions
└── RISK_SIMULATOR_PRD.md              // This document
```

---

## Phase 2: Configuration Interface (NEXT)

**Timeline:** 3-4 days
**Deliverable:** Advisor can configure any client's setup

### Features to Add

1. **M-of-N Selector**
   - Dropdown for threshold (M)
   - Dropdown for total keys (N)
   - Common presets: 2-of-3, 3-of-5, 4-of-7

2. **Key Holder Customization**
   - Change names (not just "Dad", "Mom")
   - Add/remove key holders
   - Set storage type per key
   - Set location per key

3. **Custom Scenarios**
   - Add new disaster scenarios
   - Select which holders unavailable
   - Name and describe scenario

4. **Save/Load Setups**
   - Export as JSON (file-first)
   - Import previous setups
   - Local storage backup

---

## Phase 3: Output & Polish (FINAL)

**Timeline:** 2-3 days
**Deliverable:** Professional PDF playbook

### Features to Add

1. **PDF Generator**
   - Professional template
   - Key distribution table
   - Recovery instructions (plain English)
   - Signature lines (client, advisor, date)
   - Tamper-evident hash
   - Legal disclaimer

2. **Print Optimization**
   - Clean print CSS
   - Page breaks
   - Black & white friendly
   - QR code for digital verification

3. **Export Options**
   - Download PDF
   - Copy setup as JSON
   - Print-optimized view

---

## Success Metrics

### Phase 1 (Demo) Success Criteria
- [ ] Table displays 5×6 grid correctly
- [ ] Scenario buttons trigger recalculation
- [ ] Color transitions are smooth (not jarring)
- [ ] Resilience score updates accurately
- [ ] "Shard key" toggle causes red→green transition
- [ ] Recovery path displays correctly
- [ ] Demo is screen-recordable at 1080p
- [ ] Loads in <2 seconds

### User Experience Goals
- **Clarity:** Client understands their risk in <30 seconds of looking at table
- **Engagement:** Advisor can narrate scenario ("what if you both die...") and client sees immediate visual feedback
- **Satisfaction:** Red→green transition feels rewarding, not arbitrary
- **Trust:** Professional appearance, no bugs/glitches during demo

### Technical Goals
- **Correctness:** Simulation logic handles all edge cases
- **Performance:** Recalculation is instant (<100ms)
- **Maintainability:** Clean code, well-commented
- **Extensibility:** Easy to add new scenarios/features in Phase 2

---

## Design Principles

### Visual Design
- **Aesthetic:** Terminal/spreadsheet, retro-minimal
- **Colors:** B&W + status colors (green/yellow/red) only
- **Typography:** Sans-serif (system font), monospace for data
- **Layout:** Grid-based, generous whitespace
- **No:** Gradients, shadows, glassmorphism, modern SaaS styling

### Interaction Design
- **Speed:** Instant feedback (<100ms)
- **Clarity:** One action = one clear outcome
- **Forgiveness:** All changes are reversible
- **Guidance:** Show recommendations, not just problems

### Information Hierarchy
1. **Risk Matrix** - the hero, most visual real estate
2. **Resilience Score** - secondary, top-right prominence
3. **Configuration** - tertiary, left panel utility
4. **Scenario Buttons** - bottom, action triggers

---

## Edge Cases & Considerations

### Simulation Logic Edge Cases
- **All keys sharded:** Can any scenario still lock funds?
- **Threshold = Total (N-of-N):** Single point of failure warnings
- **Threshold = 1 (1-of-N):** Theft/compromise risks high
- **Circular dependencies:** A's shard held by B, B's shard held by A
- **Geographic co-location:** Multiple keys in same physical location

### UX Edge Cases
- **Too many scenarios:** Table gets unwieldy (limit to 8 scenarios max)
- **Too many keys:** Consider pagination or scrolling (cap at 7 keys)
- **Mobile view:** Table may need to stack vertically
- **Color blindness:** Use icons in addition to colors

### Data Edge Cases
- **Invalid configurations:** Threshold > Total Keys
- **Empty shard holders:** Shard enabled but no holders selected
- **Duplicate holders:** Same person holds multiple shards of one key

---

## Out of Scope (v1)

**NOT building:**
- Multi-user collaboration
- Cloud sync/accounts/login
- Real blockchain integration
- Actual key generation
- Hardware wallet connection
- Automated monitoring/alerts
- Mobile app
- Voice/video recording
- AI-powered recommendations (beyond simple logic)

---

## Development Milestones

### Milestone 1: Core Table & Logic (Days 1-2)
- [ ] TypeScript types defined
- [ ] Simulation engine written & tested
- [ ] Risk matrix table renders
- [ ] Hardcoded Chen Family data displays
- [ ] Basic styling matches dashboard aesthetic

**Deliverable:** Static table showing correct data

### Milestone 2: Interactivity (Days 2-3)
- [ ] Scenario buttons work
- [ ] Table updates on click
- [ ] Resilience score calculates
- [ ] Recovery path displays
- [ ] Color coding correct

**Deliverable:** Clickable scenario demo

### Milestone 3: Shard Configuration (Days 3-4)
- [ ] Shard toggles added
- [ ] Shard config panel (k-of-m)
- [ ] Shard holder selection
- [ ] Recalculation on shard change
- [ ] Red→green transitions smooth

**Deliverable:** Full interactive demo

### Milestone 4: Polish & Testing (Day 4-5)
- [ ] Animations smooth (Framer Motion)
- [ ] Responsive layout
- [ ] Edge cases handled
- [ ] Performance optimized
- [ ] Code cleaned/commented
- [ ] Demo-ready

**Deliverable:** Screen-recordable feature

---

## Demo Script Reference

### Scene 3: Risk Awareness (The Core Demo)

**Setup:** Chen Family 3-of-5 multisig displayed in table

**Action 1:** "Let's see what happens if you and your spouse both die..."
→ Click "Both Primaries Die" button
→ Dad & Mom rows turn red
→ Resilience score drops to 60%
→ Recovery path shows: "⚠️ LOCKED - Only 2 of 3 keys available"

**Pause:** Let client react ("oh no...")

**Action 2:** "Watch this — if we shard your key between your two children..."
→ Toggle "☑ Shard Key #1 (Dad)"
→ Set to 2-of-3 → Child A, Child B, Trusted Friend
→ Table recalculates
→ Dad's row turns green in "Both Die" column
→ Resilience score rises to 100%
→ Recovery path shows: "✓ Recoverable - Child A + Child B can reconstruct Dad's key"

**Result:** Client sees problem → solution → outcome in 30 seconds

---

## Questions & Decisions Log

### Resolved
✅ **Drag-and-drop vs forms?** → Forms with live preview (faster, clearer)
✅ **Shard depth?** → Simple (k-of-m check only)
✅ **Demo vs full tool first?** → Interactive demo with hardcoded data
✅ **Target user?** → Advisor tool, not self-serve
✅ **Aesthetic?** → Retro-minimal, terminal/spreadsheet feel

### Open
- **Mobile layout?** → Defer to Phase 2
- **Scenario limit?** → Start with 6, test if need more
- **Export format?** → PDF primary, JSON backup (Phase 3)

---

## References & Context

- **Original Discussion:** Technical assessment conversation (2025-11-04)
- **Demo Vision:** 90-second video showing advisor-client consultation
- **Design Reference:** `/dashboard/governator` page styling
- **Tailwind Config:** `/keepnexus/tailwind.config.ts`
- **Existing Dashboard:** `/dashboard/page.tsx` (for style consistency)

---

## Next Steps

1. **Create reference doc** ✅ (this file)
2. **Build Milestone 1** → Core table & logic
3. **Build Milestone 2** → Interactivity
4. **Build Milestone 3** → Shard configuration
5. **Build Milestone 4** → Polish & test
6. **Record demo** → 90-second video
7. **Review & iterate** → Feedback from test advisors
8. **Phase 2** → Configuration interface
9. **Phase 3** → PDF export

---

**Status:** Ready to build Phase 1
**Next Action:** Create TypeScript types and simulation engine
