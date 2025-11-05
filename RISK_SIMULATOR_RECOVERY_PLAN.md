# Risk Simulator Recovery Plan
**Date:** November 5, 2025
**Status:** AWAITING SIGN-OFF
**Estimated Time:** 4-6 hours total across 3 phases

## Executive Summary
The Risk Simulator has a simple bug (property name mismatch) that was turned into a complex architectural problem. This plan restores the original simple, timeless design while fixing the core issue, keeping the good parts (Little Shard™ branding, KEEP Score foundation) for future use.

## Core Principles
1. **Simplicity First** - Could be printed and understood in 50 years
2. **Fix, Don't Rebuild** - Minimal changes to working code
3. **Phase-by-Phase** - Each phase independently valuable
4. **No Over-Engineering** - Text-based, clear, bulletproof
5. **Salvage Good Work** - Keep Little Shard™ branding and KEEP Score foundation

## What We're Keeping (The Good Parts)
- ✅ **Little Shard™ branding** - Important for culture/brand (just the name, not complexity)
- ✅ **KEEP Score foundation** - Good base for future implementation (Phase 4+)
- ✅ **FamilySetup context** - Clean data sharing between components
- ✅ **File export/import structure** - Works well, just needs simplification

## What We're Removing (The Bad Parts)
- ❌ **Dual type systems** - Pick one, deprecate the other
- ❌ **Redirect to keep-score** - Risk Simulator should stand alone for now
- ❌ **Over-engineered abstractions** - Keep it simple
- ❌ **Missing matrix functionality** - Must be restored

## The Actual Bug
```typescript
// PROBLEM: Two systems using different property names
// Old System (risk-simulator/): affectedRoles, affectedIndices, affectedLocations
// New System (risk-engine/): affected_roles, affected_indices, affected_locations
// Matrix checks camelCase, combine function uses snake_case
```

---

## PHASE 1: Emergency Fix (30 minutes)
**Goal:** Make "Both Primaries Die" scenario work correctly
**Risk:** None - surgical fix only

### Steps:
1. **Fix the combine logic in `/lib/risk-simulator/engine.ts`**
   - Ensure it merges ALL affected properties (not just unavailableHolders)
   - Use consistent property names (stick with camelCase for now)

2. **Verify the matrix in `RiskMatrix.tsx`**
   - Ensure it checks the same properties the combine function sets
   - No visual changes, just property alignment

3. **Test only this scenario:**
   - Both Primaries Die should show as LOCKED (not recoverable)
   - Individual Primary Dies should show as RECOVERABLE
   - Combined scenario should merge both affected lists

### Success Criteria:
- ✅ Both Primaries Die correctly shows as non-recoverable
- ✅ Matrix displays correct red/green for combined scenarios
- ✅ No other functionality broken

---

## PHASE 2: Restore Lost Features (1-2 hours)
**Goal:** Bring back missing original functionality
**Risk:** Low - adding back, not changing

### Steps:
1. **Restore the Risk Simulator route**
   - Remove redirect to keep-score
   - Use original page at `/dashboard/risk-simulator`

2. **Add back scenario list at bottom**
   - List all scenarios with recovery status
   - Show recovery path for each (which keys would be used)
   - Include recommendations for locked scenarios

3. **Show wallet type clearly**
   - Display "3-of-5 Multisig" prominently
   - List key holders with their types (hardware wallet, paper, etc.)

### Success Criteria:
- ✅ Risk Simulator accessible at original URL
- ✅ Bottom section shows all scenarios with outcomes
- ✅ Clear display of wallet configuration

---

## PHASE 3: Architecture Cleanup & Brand Alignment (2-3 hours)
**Goal:** Remove confusion, establish single source of truth, align with Little Shard™ branding
**Risk:** Medium - needs careful testing

### Steps:
1. **Pick ONE type system**
   - Keep `risk-simulator/` as primary (it works)
   - Mark `risk-engine/` as deprecated BUT preserve for Phase 4
   - Document this decision in code

2. **Simplify data flow with Little Shard™ branding**
   - Risk Simulator uses FamilySetup context for data
   - Rename exports to "Little Shard™ file" (cultural branding)
   - Keep simple JSON structure (not complex)
   - Keep Chen Family as default demo

3. **Add simple data persistence**
   - Save configuration to localStorage
   - Export as "Little Shard™ file" (.shard extension)
   - Import/export should be obvious
   - Prepare structure for future KEEP Score addition

### Success Criteria:
- ✅ Single, clear type system
- ✅ No duplicate scenario definitions
- ✅ Simple import/export as Little Shard™ files
- ✅ Foundation ready for Phase 4 (KEEP Score)

---

## PHASE 4: KEEP Score Integration (FUTURE - After Phases 1-3)
**Goal:** Add KEEP Score as a layer on top of working Risk Simulator
**Timeline:** After current recovery is complete and stable

### What the previous developer got RIGHT for KEEP Score:
- Basic score calculation structure
- Component breakdown (security, redundancy, liveness, legal, education)
- Integration with risk analysis results
- Visual score display components

### Future Implementation (NOT NOW):
1. Add KEEP Score as optional dashboard view
2. Use existing `/keep-score` work as foundation
3. Keep it simple - just a 0-100 score with clear factors
4. Save score in Little Shard™ file structure

---

## What We're NOT Doing (in Phases 1-3)
- ❌ Building KEEP Score system (Phase 4 - future)
- ❌ Monte Carlo simulations (unnecessary complexity)
- ❌ Complex governance integration (separate module)
- ❌ Removing working code that isn't broken
- ❌ Over-engineering the Little Shard™ format (keep it simple JSON)

## File Changes Required

### Phase 1 Files:
- `/lib/risk-simulator/engine.ts` - Fix combine logic
- `/components/risk-simulator/RiskMatrix.tsx` - Verify property names

### Phase 2 Files:
- `/app/dashboard/risk-simulator/page.tsx` - Remove redirect, restore original
- `/components/risk-simulator/ScenarioList.tsx` - Create new component
- `/components/risk-simulator/WalletInfo.tsx` - Create new component

### Phase 3 Files:
- `/lib/risk-simulator/` - Add deprecation notices
- `/lib/risk-engine/` - Mark as deprecated
- `/lib/keep-core/` - Mark as future implementation

## Testing Plan
1. **Phase 1:** Test all 6 preset scenarios individually and combined
2. **Phase 2:** Verify all UI elements visible and functional
3. **Phase 3:** Test import/export with multiple configurations

## Rollback Plan
Git commits after each phase. If anything breaks:
```bash
git reset --hard HEAD~1
```

## Future Considerations (NOT NOW)
After this recovery is complete, future enhancements could include:
- Gradual implementation of KEEP Score (separate project)
- Little Shard format (when mature)
- Advanced simulation features (if needed)

But ONLY after the simple version works perfectly.

---

## Summary: Best of Both Worlds Approach

### From Previous Agents We Keep:
- **Agent 1's** simple matrix and clear visualization
- **Agent 2's** Little Shard™ branding and file structure
- **Agent 2's** KEEP Score foundation (for Phase 4)
- **Both agents'** good architectural decisions

### From Previous Agents We Remove:
- **Agent 2's** premature complexity
- **Agent 2's** redirect away from Risk Simulator
- **Both agents'** failure to fix the actual bug
- **Duplicate type systems** causing confusion

---

## Sign-Off Required

**Before proceeding, please confirm:**

- [ ] You agree with fixing the bug first (Phase 1)
- [ ] You want the simple features restored (Phase 2)
- [ ] You approve keeping Little Shard™ branding (Phase 3)
- [ ] You understand KEEP Score comes later (Phase 4)
- [ ] You approve the "salvage the good parts" approach

**Your decision:**
- APPROVE - Proceed with Phase 1
- MODIFY - Request specific changes
- REJECT - Different approach needed

---

*Note: Each phase will be implemented separately with your approval before moving to the next. This ensures quality and prevents wasted effort.*