# Keep Nexus v2 Design

**Date**: February 5, 2026
**Status**: Approved
**Philosophy**: The Little Shard IS the system

## Core Principles

1. **Text-based, terminal-esque** — No cards, no fancy UI, just text
2. **Shard-first** — Everything revolves around the Little Shard file
3. **Built to last generations** — Serious, not something to fiddle with
4. **First principles** — Only what a hodler absolutely needs
5. **File-first** — Local sovereignty, no cloud dependency
6. **External continuity** — Check-ins are advisor-led, not deadman switches

---

## Main View

When a shard exists:

```
KEEP NEXUS
Chen Family Reserve
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

₿ 12.84719203
$1,247,832 USD
● healthy

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

vault       3-of-5 · Theya · 5 roles assigned
heirs       Sarah 50% · Emma 30% · Trust 20%
legal       CA · trust ✓ · RUFADAA ✓
last check  Jan 14, 2026 · all signers verified

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[update]   [share]   [export]
```

### Status Indicators

| Status | Display | Meaning |
|--------|---------|---------|
| Healthy | `● healthy` (green) | All good, no issues |
| Attention | `● attention` (yellow) | Something needs review |
| Action Required | `● action required` (red) | Urgent item |

### Empty State

```
KEEP NEXUS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

No shard found.

[create]   [import]
```

---

## Three Actions

### [update]

Opens menu of what can be changed:

```
KEEP NEXUS · update
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

What changed?

[vault]       keys, multisig, custody platform
[heirs]       beneficiaries, allocations
[legal]       jurisdiction, trust, documents
[roles]       who has access, professionals
[policies]    checkin frequency, drills, triggers
[continuity]  record check-in, drill, or event

[cancel]
```

### [share]

Share encrypted shard with professionals:

```
KEEP NEXUS · share
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Share shard with:

[attorney]   [cpa]   [advisor]

[cancel]
```

Then: email → expiration → generates encrypted link.

### [export]

Downloads `.keepnexus` file. Simple confirmation:

```
KEEP NEXUS · export
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Downloading chen-family-2026-02-05.keepnexus

[done]
```

---

## Standard Roles

Positions in the multisig/governance structure. People are assigned to roles.

| Role | Description |
|------|-------------|
| Primary 1 | Main holder, likely founder |
| Primary 2 | Spouse or co-holder |
| Trustee | Fiduciary oversight |
| Custodian | Institutional or backup holder |
| Attorney | Legal counsel |
| CPA | Tax and accounting |
| Advisor | Bitcoin advisor for continuity |

---

## Update Flows

### Vault

```
KEEP NEXUS · update vault
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

platform      Theya
quorum        3 of 5

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

role          assigned to          device
Primary 1     James Chen           Coldcard
Primary 2     Sarah Chen           Ledger
Trustee       First Republic       Trezor
Attorney      Chen & Associates    Coldcard
Advisor       Bitcoin Advisor Co   —

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

last verified   Jan 21, 2026
descriptor      7f3a8b2c...

[verify]   [edit roles]   [save]   [cancel]
```

### Heirs

```
KEEP NEXUS · update heirs
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Sarah Chen         spouse      50%   keyholder
Emma Chen          daughter    30%
Family Trust       trust       20%

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[add heir]   [edit]   [save]   [cancel]
```

### Continuity

Record external check-ins, drills, and life events:

```
KEEP NEXUS · record event
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

What happened?

[check-in]    all signers verified responsive
[drill]       recovery exercise completed
[life event]  marriage, move, device change, etc.

[cancel]
```

Check-in recording:

```
KEEP NEXUS · record check-in
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Date          Feb 5, 2026
Verified by   Bitcoin Advisor Co.
Signers       5 of 5 confirmed
Notes         quarterly review, all keys accessible

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[save]   [cancel]
```

---

## Create Flow (New Users)

5-step wizard:

1. **Family** — Family name
2. **Vault** — Platform, quorum
3. **Roles** — Assign people to standard roles
4. **Heirs** — Add beneficiaries with allocations
5. **Legal** — Jurisdiction, trust status, documents

---

## Import Flow

```
KEEP NEXUS · import
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Drop .keepnexus file here or [browse]

[cancel]
```

---

## Visual Design

- **Background**: Dark (`#09090b` zinc-950) or light (user preference)
- **Typography**: Monospace for structure, clean sans for labels
- **Borders**: Simple line dividers (`━━━`) not boxes
- **Colors**: Minimal — green/yellow/red for status only
- **Spacing**: Generous, readable
- **Width**: Max ~600px, centered

---

## What Gets Cut

From the old system, we're removing:

- 14-tile dashboard grid
- KEEP Score widget (complex metrics)
- Deadman switch UI
- Animated backgrounds
- Cards and fancy UI components
- Multiple navigation layers

---

## What Stays

- Share wizard (works, just needs text-based wrapper)
- FamilySetupContext (data layer)
- Shard adapter (KeepNexus ↔ Shard v2.1.0)
- Export functionality
- Core shard schema

---

## Implementation Notes

This is a **refactor**, not a new build:

1. Replace `/app/dashboard/page.tsx` with new main view
2. Simplify or remove unused dashboard sub-pages
3. Keep share wizard, wrap in text-based UI
4. Keep export functionality
5. Add create wizard for new users
6. Wire everything to existing FamilySetupContext

Route structure:
- `/` → Main view (or login if not authenticated)
- `/create` → Create wizard
- `/update/[section]` → Update flows
- `/share` → Share wizard

---

## Success Criteria

- Opens in <1 second
- Everything visible on one screen (no scrolling for main view)
- Hodler can check status in <5 seconds
- Update flow completes in <30 seconds
- Works offline (file-first)
- Installable locally (Electron wrapper later)
