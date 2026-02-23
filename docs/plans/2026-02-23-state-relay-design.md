# State Relay — Design Document

**Date:** 2026-02-23
**Status:** Draft — pre-grant submission
**Target:** OpenSats grant application
**Author:** KEEP team

---

## One-Liner

An open-source Nostr primitive for encrypted state sync and verifiable agent coordination between keypair-identified entities.

---

## The Gap

Nostr solved identity (keypairs) and messaging (relay network). But applications that need to *coordinate* — sync encrypted state across devices, dispatch commands to agents, and receive verifiable receipts — have no standard primitive. Every builder rolls their own, if they build it at all.

State Relay fills this gap with three composable pieces: **state snapshots** (encrypted, addressable, revision-tracked), **commands** (encrypted dispatch to any npub), and **receipts** (signed proof of execution). All built on existing Nostr event kinds, NIP-44 encryption, and NIP-17 DM wrapping.

The first production consumer is KEEP, a Bitcoin inheritance continuity tool where estate plans sync across family devices and coordinate with professional advisors — all on Nostr identity, no server. But State Relay is app-agnostic: any local-first app, AI agent, or multi-device workflow gets serverless coordination for free.

---

## Goals

- **Serverless sync:** Restore the latest good state on a new device using only Nostr identity + relays.
- **Agentic coordination:** Send a command to an agent/device and receive a verifiable receipt.
- **Public-good primitive:** Usable by any app, not KEEP-specific.

## Non-Goals (explicit)

- Not a custody system.
- Not storing secrets (seeds, keys, descriptors, private notes).
- Not guaranteeing permanent storage on relays.
- Not building a full portal/dashboard.
- Not implementing CRDTs or merge logic (v1 is last-write-wins).
- Not implementing multi-recipient encryption (v1 is self-encryption for snapshots).
- Not implementing remote signing / NIP-46 (future integration option).

---

## Target Users

1. **Local-first app developers** who need serverless state sync without building a backend.
2. **Agent builders** who need a comms + memory layer without OAuth/servers.
3. **Sovereign users** who want identity-based restore and coordination.

## Use Cases

| Use Case | Snapshot | Command | Receipt |
|----------|----------|---------|---------|
| Bitcoin inheritance plan syncs across family devices | X | | |
| AI agent persists memory across sessions via npub | X | | |
| Estate coordinator dispatches drill to family members | | X | X |
| Encrypted password manager syncs without a cloud account | X | | |
| Multisig ceremony coordination between participants | | X | X |
| IoT devices report state and accept commands via Nostr identity | X | X | X |

---

## Architecture

### Core Principle

**Canonical state is local. Nostr is the relay for sync + coordination.**

Local file/database is the source of truth. Nostr events are replicas, receipts, and coordination messages. If all relays disappear, the local state remains intact.

### Three Components

```
┌─────────────────────────────────────────────┐
│                State Relay                   │
│                                              │
│  ┌─────────────┐  ┌──────────┐  ┌────────┐  │
│  │  Snapshots   │  │ Commands │  │Receipts│  │
│  │  (sync)      │  │ (action) │  │(proof) │  │
│  │              │  │          │  │        │  │
│  │ publish()    │  │ send()   │  │ ack()  │  │
│  │ fetch()      │  │ on()     │  │ done() │  │
│  │ restore()    │  │          │  │ fail() │  │
│  └──────┬───────┘  └────┬─────┘  └───┬────┘  │
│         │               │            │        │
│         └───────┬───────┴────────────┘        │
│                 │                              │
│          ┌──────┴──────┐                       │
│          │ Relay Pool  │                       │
│          │ (connect,   │                       │
│          │  subscribe, │                       │
│          │  publish)   │                       │
│          └─────────────┘                       │
└─────────────────────────────────────────────┘
```

---

## Data Model

### State Snapshot (Encrypted Payload)

A snapshot is a small JSON blob. **Max target: 32KB. Hard cap: 64KB.** This ensures broad relay compatibility (most relays accept 64KB-128KB events) and fast sync.

The snapshot contains no secrets. Ever.

```json
{
  "schema": "state-relay.snapshot.v1",
  "app": "keep",
  "namespace": "default",
  "device_id": "DEV_8f2a...",
  "state_id": "uuid-v4",
  "rev": 42,
  "prev": "optional-previous-state-id",
  "ts": 1700000000,
  "summary": {
    "health": "green",
    "notes": "optional human-readable note"
  },
  "data": {
    "payload": {}
  }
}
```

**What goes in `data.payload`** (app-defined, non-sensitive):
- Role IDs / Nostr pubkeys (no real names)
- Drill status and next drill date
- Policy flags and configuration
- Hashed pointers to local vault sections
- Health/completeness score signals

**What MUST NEVER go in a snapshot:**
- Seed phrases, xprvs, raw wallet descriptors
- Address lists, private notes with identity details
- Anything catastrophic if metadata leaks, even encrypted

### Conflict Resolution (v1)

**Last-write-wins.** Resolution order:
1. Highest `rev` number wins
2. If `rev` is equal: newest `created_at` timestamp wins
3. If timestamps are equal: lexicographic `device_id` comparison as final tiebreaker

No merge logic. No CRDTs. Simple, predictable, documented. Merge strategies are explicitly deferred to v2.

### Versioning Strategy

State Relay uses semantic versioning on the `schema` field. Clients:
- MUST ignore fields they don't recognize
- MUST reject schemas with a major version they don't support
- SHOULD warn on minor version mismatches

---

## Nostr Event Spec

### Implementation Note on Kind Numbers

Kind numbers `30333` (snapshot) and `30334` (receipt) are used as experimental kinds during development. A NIP draft will be submitted to formalize these upon v1 completion. This follows standard Nostr protocol evolution practice.

### Encryption

All encrypted content uses **NIP-44** (versioned encrypted payloads) via nostr-tools. Snapshots are encrypted to self (own pubkey) by default. Commands are encrypted pairwise to the target npub.

### Event Kind 30333 — State Snapshot

Addressable/parameterized replaceable event. Publishing a new event with the same `d` tag replaces the previous one on relays.

**Required tags:**

```json
[
  ["d", "keep:default"],
  ["app", "keep"],
  ["ns", "default"],
  ["rev", "42"],
  ["device", "DEV_8f2a..."],
  ["ver", "1"]
]
```

**Content:** NIP-44 encrypted payload (the snapshot JSON above).

### Command Messages (NIP-17 Encrypted DMs)

Commands use NIP-17-style encrypted DM wrapping via nostr-tools.

**Command payload schema:**

```json
{
  "schema": "state-relay.command.v1",
  "cmd_id": "uuid-v4",
  "ts": 1700000000,
  "from": "npub-sender",
  "to": "npub-target",
  "namespace": "keep:default",
  "action": "run_drill",
  "params": {},
  "ttl": 300,
  "expect_receipt": true
}
```

**Delivery hardening:**
- Commands include a `ttl` field (seconds). Expired commands are ignored by the receiver.
- Sender retries with exponential backoff, up to 3 attempts.
- Receiver deduplicates on `cmd_id` — same command executed at most once.
- If no receipt arrives within `ttl`, sender marks command as `unacknowledged`.

**Known limitation:** NIP-17 DMs are designed for human messaging. Relay operators may rate-limit or deprioritize DM kinds. No guaranteed delivery or ordering. The retry/TTL/dedup strategy mitigates this for v1. A dedicated command kind may be explored in v2.

### Event Kind 30334 — Receipt

Signed by the responder. Provides verifiable proof of command execution.

**Required tags:**

```json
[
  ["e", "command-event-id"],
  ["d", "cmd-id-uuid"],
  ["ns", "keep:default"],
  ["status", "completed"]
]
```

**Content (plaintext JSON):**

```json
{
  "schema": "state-relay.receipt.v1",
  "cmd_id": "uuid-v4",
  "status": "completed",
  "ts": 1700000000,
  "result": {},
  "state_ref": {
    "kind": 30333,
    "d": "keep:default",
    "rev": 43,
    "event_id": "optional-latest-snapshot-event-id"
  }
}
```

**Receipt lifecycle statuses:** `received` | `started` | `completed` | `failed`

---

## Core Flows

### Flow A: Publish Snapshot (sync push)

1. Local app updates state, increments `rev`
2. Serialize snapshot JSON
3. Encrypt payload with NIP-44 to own pubkey
4. Publish event kind 30333 with addressable `d` tag
5. Store event ID locally as `published_at`
6. Emit `snapshot:published` event

### Flow B: Restore on New Device (sync pull)

1. User supplies npub + signing ability (or local signer)
2. Query relays for kind 30333 with matching `d` tag
3. Apply conflict resolution: highest `rev`, then `created_at`, then `device_id`
4. Verify event signature
5. Decrypt payload with NIP-44
6. Validate schema and rev monotonicity (reject if rev < local last-known-good)
7. Hydrate local store; mark as current
8. Emit `snapshot:received` event

### Flow C: Send Command + Receive Receipt (agentic)

1. Sender creates command payload with `cmd_id` and `ttl`
2. Encrypt via NIP-17 to target npub; publish
3. Emit `command:sent` event; start receipt timeout timer
4. Target receives command, validates schema, checks `ttl` not expired, deduplicates on `cmd_id`
5. Target calls `ctx.ack()` — sends receipt with status `received`
6. Target executes action asynchronously
7. Target calls `ctx.complete(result)` or `ctx.fail(reason)` — sends final receipt
8. Sender receives receipt, verifies signature, updates local state view
9. If no receipt within `ttl`: mark as `unacknowledged`, retry up to 3x with exponential backoff

---

## API Design (TypeScript / npm)

### Configuration

```typescript
interface StateRelayConfig {
  identity: {
    pubkey: string;
    signEvent: (evt: UnsignedEvent) => Promise<SignedEvent>;
    encrypt: (plaintext: string, pubkey: string) => Promise<string>;
    decrypt: (ciphertext: string, pubkey: string) => Promise<string>;
  };
  relays: {
    publish: string[];   // default: 3 relays
    read: string[];      // default: 5 relays
  };
  app: {
    name: string;        // e.g., "keep"
    namespace: string;   // e.g., "default"
    deviceId: string;    // stable random ID
  };
  options?: {
    ttl?: number;              // command TTL in seconds (default: 300)
    retries?: number;          // command retry attempts (default: 3)
    maxSnapshotBytes?: number; // hard cap (default: 65536)
  };
}
```

### Core Class

```typescript
class StateRelay extends EventEmitter {
  constructor(config: StateRelayConfig);

  // Lifecycle
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  destroy(): Promise<void>;
  status(): RelayStatus;

  // Snapshots
  publishSnapshot(payload: object, rev: number): Promise<{ eventId: string }>;
  fetchLatestSnapshot(): Promise<SnapshotResult | null>;

  // Commands
  sendCommand(
    toPubkey: string,
    action: string,
    params?: object
  ): Promise<{ cmdId: string }>;

  onCommand(
    handler: (cmd: CommandPayload, ctx: CommandContext) => Promise<void>
  ): () => void;  // returns unsubscribe function

  // Events
  on(event: 'snapshot:published', handler: (data: SnapshotEvent) => void): this;
  on(event: 'snapshot:received', handler: (data: SnapshotEvent) => void): this;
  on(event: 'command:received', handler: (data: CommandEvent) => void): this;
  on(event: 'command:unacknowledged', handler: (data: CommandEvent) => void): this;
  on(event: 'receipt:received', handler: (data: ReceiptEvent) => void): this;
  on(event: 'relay:connected', handler: (url: string) => void): this;
  on(event: 'relay:error', handler: (url: string, err: Error) => void): this;
}

interface CommandContext {
  ack(): Promise<void>;              // sends "received" receipt immediately
  complete(result?: object): Promise<void>;  // sends "completed" receipt
  fail(reason?: string): Promise<void>;      // sends "failed" receipt
}
```

---

## Security Requirements

### Key Handling (hard rule)

The module MUST NEVER store long-term private keys in plain text. The `signEvent`, `encrypt`, and `decrypt` functions are injected by the consumer — State Relay never touches raw key material.

### Snapshot Validation

1. Verify event signature before decrypting
2. Validate payload schema (reject unknown major versions)
3. Enforce rev monotonicity (never accept rev < last-known-good unless user explicitly overrides)
4. Keep local cache of last-known-good snapshot

### Relay Strategy

- Publish to N relays (default 3)
- Read from M relays (default 5), take newest valid snapshot per conflict resolution rules
- Allow user-defined relay lists
- Handle relay failure gracefully (continue operating if at least 1 relay responds)
- NIP-42 AUTH support as optional configuration for relays that require it

### Metadata Awareness

Snapshot events reveal metadata: kind, pubkey, timestamps, relay presence. v1 accepts this trade-off. The content is encrypted, but the fact that a pubkey published a state-relay event at a given time is observable. Users should be informed of this in documentation.

---

## Deliverables

### Must-Have (grant acceptance criteria)

- Publish encrypted snapshot and restore it on a clean device from relays
- Send command, receive receipt, with signature verification end-to-end
- No secrets stored or transmitted
- Works with 3+ relays, handles relay failure gracefully
- Published npm package (v0.1.0)
- Documentation: "How to integrate in 15 minutes"
- Draft NIP document for kind numbers

### Nice-to-Have (v1 if time allows)

- Snapshot rollback protection (reject older rev) — likely ships, low effort
- Local cache of last-known-good snapshot — likely ships, low effort
- Relay retry/fallback policy — likely ships, medium effort

### Explicitly Deferred to v2

- Transition log / event sourcing
- Multi-recipient encryption (encrypt snapshot to multiple pubkeys)
- NIP-46 remote signing integration
- CRDT-based merge strategies
- Dedicated command event kind (replacing DM wrapping)

---

## Timeline (8 weeks)

### Weeks 1-2: Spec & Skeleton

- Finalize event schemas with concrete nostr-tools code examples
- Draft NIP document
- Scaffold npm package: TypeScript, vitest, CI
- Implement relay connection management and config
- **Deliverable:** Published spec + repo with passing CI

### Weeks 3-4: State Sync

- Snapshot publish with NIP-44 self-encryption
- Snapshot fetch with signature verification + rev validation
- Conflict resolution (last-write-wins)
- Local cache of last-known-good state
- **Deliverable:** Working publish/restore demo across 3+ relays

### Weeks 5-6: Command & Receipt Loop

- Command dispatch via NIP-17 encrypted DMs
- Receipt system with ack/complete/fail lifecycle
- Retry logic, TTL, deduplication
- Event emitter integration
- **Deliverable:** Working agent coordination demo

### Weeks 7-8: Polish & Ship

- CLI tool for manual testing and debugging
- Minimal example app (restore-from-npub demo)
- API documentation + quickstart guide
- npm publish v0.1.0
- **Deliverable:** Published package + docs + example repo

---

## Repo Structure

```
state-relay/
├── spec/                    # Event schemas, examples, draft NIP
├── packages/
│   └── state-relay/         # Core npm package (monorepo-ready)
│       ├── src/
│       │   ├── snapshot.ts  # Publish, fetch, restore
│       │   ├── command.ts   # Send, receive, dedup
│       │   ├── receipt.ts   # Ack, complete, fail
│       │   ├── relay.ts     # Connection pool management
│       │   ├── types.ts     # Shared types and schemas
│       │   └── index.ts     # Public API surface
│       └── __tests__/
├── examples/
│   ├── cli/                 # CLI demo tool
│   └── restore-app/         # Minimal web app
└── docs/
    ├── quickstart.md
    ├── api.md
    └── architecture.md
```

Monorepo structure with `packages/` for a single package — signals ecosystem readiness. Future community packages (`state-relay-react`, `state-relay-agent`) slot in naturally.

---

## Implementation Stack

- **Language:** TypeScript
- **Nostr SDK:** nostr-tools
- **Encryption:** NIP-44 via nostr-tools
- **DMs:** NIP-17 via nostr-tools
- **Testing:** vitest
- **Package:** npm, ESM + CJS dual export
- **CI:** GitHub Actions

---

## Open Questions (to resolve in Week 1)

1. Exact NIP-17 DM wrapping API in current nostr-tools version — verify support
2. Whether to use nostr-tools relay pool or build a thin wrapper
3. CLI framework choice (commander vs. minimal custom)
4. Whether the draft NIP should cover all three components or just snapshots initially
