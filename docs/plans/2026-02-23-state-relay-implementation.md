# State Relay — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build an npm package (`state-relay`) that provides encrypted state sync and verifiable agent coordination over Nostr, using nostr-tools.

**Architecture:** Three modules (snapshot, command, receipt) behind a single `StateRelay` class that extends EventEmitter. All crypto is dependency-injected — the library never touches raw keys. nostr-tools `SimplePool` handles relay connections. NIP-44 for encryption, NIP-17/NIP-59 for command wrapping.

**Tech Stack:** TypeScript, nostr-tools v2.x, vitest, tsup (bundler), npm package with ESM + CJS dual export.

---

## Prerequisites

This is a **new standalone repo**, not part of the keepnexus codebase. The plan assumes you're starting from scratch in a new directory.

**Key nostr-tools APIs you'll use:**

```typescript
// Event creation
import { generateSecretKey, getPublicKey, finalizeEvent, verifyEvent } from 'nostr-tools/pure'

// Relay pool
import { SimplePool } from 'nostr-tools/pool'

// NIP-44 encryption
import * as nip44 from 'nostr-tools/nip44'

// NIP-17 DMs (built on NIP-59 gift wrap)
import * as nip17 from 'nostr-tools/nip17'

// Filter matching
import { matchFilter } from 'nostr-tools/filter'
```

**Critical nostr-tools notes:**
- `SimplePool.publish()` returns `Promise<string>[]` (array of promises, one per relay) — use `Promise.allSettled()`
- `SimplePool.subscribeMany()` takes a single `Filter` object, not `Filter[]`
- NIP-17 DMs must be published to recipient's `kind: 10050` relay list
- Addressable events (kind 30000-39999) use `d` tag as unique key per `(kind, pubkey, d)` tuple
- Query addressable events with `'#d': ['value']` in filter

---

## Task 1: Scaffold the Project

**Files:**
- Create: `state-relay/package.json`
- Create: `state-relay/tsconfig.json`
- Create: `state-relay/tsup.config.ts`
- Create: `state-relay/vitest.config.ts`
- Create: `state-relay/.gitignore`
- Create: `state-relay/packages/state-relay/src/index.ts`
- Create: `state-relay/packages/state-relay/package.json`
- Create: `state-relay/packages/state-relay/tsconfig.json`

**Step 1: Create the repo directory and initialize git**

```bash
mkdir -p state-relay && cd state-relay && git init
```

**Step 2: Create root package.json**

```json
{
  "name": "state-relay-monorepo",
  "private": true,
  "workspaces": ["packages/*"],
  "scripts": {
    "build": "npm run build --workspace=packages/state-relay",
    "test": "npm run test --workspace=packages/state-relay",
    "lint": "tsc --noEmit --project packages/state-relay/tsconfig.json"
  }
}
```

**Step 3: Create packages/state-relay/package.json**

```json
{
  "name": "state-relay",
  "version": "0.1.0",
  "description": "Encrypted state sync and verifiable agent coordination over Nostr",
  "type": "module",
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "require": "./dist/index.cjs",
      "types": "./dist/index.d.ts"
    }
  },
  "files": ["dist"],
  "scripts": {
    "build": "tsup",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "peerDependencies": {
    "nostr-tools": ">=2.0.0"
  },
  "devDependencies": {
    "nostr-tools": "^2.23.0",
    "typescript": "^5.5.0",
    "tsup": "^8.0.0",
    "vitest": "^2.0.0"
  },
  "keywords": ["nostr", "state", "sync", "relay", "agent", "coordination", "encrypted"],
  "license": "MIT"
}
```

**Step 4: Create packages/state-relay/tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "declaration": true,
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "lib": ["ES2022"]
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "__tests__"]
}
```

**Step 5: Create packages/state-relay/tsup.config.ts**

```typescript
import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  sourcemap: true,
})
```

**Step 6: Create packages/state-relay/vitest.config.ts**

```typescript
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
  },
})
```

**Step 7: Create .gitignore**

```
node_modules/
dist/
*.tsbuildinfo
.DS_Store
```

**Step 8: Create placeholder src/index.ts**

```typescript
export const VERSION = '0.1.0'
```

**Step 9: Install dependencies and verify build**

```bash
cd state-relay
npm install
npm run build
npm run test
```

Expected: Build succeeds, tests pass (no tests yet, vitest reports 0 tests).

**Step 10: Commit**

```bash
git add -A
git commit -m "chore: scaffold state-relay monorepo with tsup, vitest, nostr-tools"
```

---

## Task 2: Define Core Types

**Files:**
- Create: `packages/state-relay/src/types.ts`
- Test: `packages/state-relay/__tests__/types.test.ts`

**Step 1: Write the test**

```typescript
// packages/state-relay/__tests__/types.test.ts
import { describe, it, expect } from 'vitest'
import {
  STATE_SNAPSHOT_KIND,
  STATE_RECEIPT_KIND,
  DEFAULT_OPTIONS,
  type StateRelayConfig,
  type SnapshotPayload,
  type CommandPayload,
  type ReceiptPayload,
  type SnapshotResult,
} from '../src/types'

describe('types', () => {
  it('exports correct kind numbers', () => {
    expect(STATE_SNAPSHOT_KIND).toBe(30333)
    expect(STATE_RECEIPT_KIND).toBe(30334)
  })

  it('exports default options', () => {
    expect(DEFAULT_OPTIONS.ttl).toBe(300)
    expect(DEFAULT_OPTIONS.retries).toBe(3)
    expect(DEFAULT_OPTIONS.maxSnapshotBytes).toBe(65536)
  })

  it('SnapshotPayload validates schema field', () => {
    const snapshot: SnapshotPayload = {
      schema: 'state-relay.snapshot.v1',
      app: 'test',
      namespace: 'default',
      device_id: 'DEV_test',
      state_id: 'uuid-123',
      rev: 1,
      ts: Math.floor(Date.now() / 1000),
      summary: { health: 'green' },
      data: { payload: { foo: 'bar' } },
    }
    expect(snapshot.schema).toBe('state-relay.snapshot.v1')
    expect(snapshot.rev).toBe(1)
  })

  it('CommandPayload includes ttl field', () => {
    const cmd: CommandPayload = {
      schema: 'state-relay.command.v1',
      cmd_id: 'uuid-456',
      ts: Math.floor(Date.now() / 1000),
      from: 'npub-sender',
      to: 'npub-target',
      namespace: 'test:default',
      action: 'run_drill',
      params: {},
      ttl: 300,
      expect_receipt: true,
    }
    expect(cmd.ttl).toBe(300)
    expect(cmd.action).toBe('run_drill')
  })

  it('ReceiptPayload supports all lifecycle statuses', () => {
    const statuses: ReceiptPayload['status'][] = ['received', 'started', 'completed', 'failed']
    statuses.forEach(status => {
      const receipt: ReceiptPayload = {
        schema: 'state-relay.receipt.v1',
        cmd_id: 'uuid-789',
        status,
        ts: Math.floor(Date.now() / 1000),
      }
      expect(receipt.status).toBe(status)
    })
  })
})
```

**Step 2: Run test to verify it fails**

```bash
cd state-relay && npm test
```

Expected: FAIL — module `../src/types` does not export the expected values.

**Step 3: Write types.ts**

```typescript
// packages/state-relay/src/types.ts
import type { Event as NostrEvent, EventTemplate, VerifiedEvent } from 'nostr-tools/pure'

// --- Kind Numbers (experimental, pending NIP draft) ---

export const STATE_SNAPSHOT_KIND = 30333
export const STATE_RECEIPT_KIND = 30334

// --- Config ---

export interface StateRelayIdentity {
  pubkey: string
  signEvent: (evt: EventTemplate) => Promise<VerifiedEvent>
  encrypt: (plaintext: string, pubkey: string) => Promise<string>
  decrypt: (ciphertext: string, pubkey: string) => Promise<string>
}

export interface StateRelayRelays {
  publish: string[]
  read: string[]
}

export interface StateRelayApp {
  name: string
  namespace: string
  deviceId: string
}

export interface StateRelayOptions {
  ttl: number
  retries: number
  maxSnapshotBytes: number
}

export const DEFAULT_OPTIONS: StateRelayOptions = {
  ttl: 300,
  retries: 3,
  maxSnapshotBytes: 65536,
}

export interface StateRelayConfig {
  identity: StateRelayIdentity
  relays: StateRelayRelays
  app: StateRelayApp
  options?: Partial<StateRelayOptions>
}

// --- Snapshot ---

export interface SnapshotPayload {
  schema: 'state-relay.snapshot.v1'
  app: string
  namespace: string
  device_id: string
  state_id: string
  rev: number
  prev?: string
  ts: number
  summary: {
    health: 'green' | 'yellow' | 'red'
    notes?: string
  }
  data: {
    payload: Record<string, unknown>
  }
}

export interface SnapshotResult {
  payload: SnapshotPayload
  rev: number
  eventId: string
  createdAt: number
}

// --- Command ---

export interface CommandPayload {
  schema: 'state-relay.command.v1'
  cmd_id: string
  ts: number
  from: string
  to: string
  namespace: string
  action: string
  params: Record<string, unknown>
  ttl: number
  expect_receipt: boolean
}

export interface CommandContext {
  ack(): Promise<void>
  complete(result?: Record<string, unknown>): Promise<void>
  fail(reason?: string): Promise<void>
}

// --- Receipt ---

export type ReceiptStatus = 'received' | 'started' | 'completed' | 'failed'

export interface ReceiptPayload {
  schema: 'state-relay.receipt.v1'
  cmd_id: string
  status: ReceiptStatus
  ts: number
  result?: Record<string, unknown>
  state_ref?: {
    kind: number
    d: string
    rev: number
    event_id?: string
  }
}

// --- Relay Status ---

export interface RelayStatus {
  connected: Map<string, boolean>
  lastPublishedRev: number | null
  lastPublishedEventId: string | null
}

// --- Events ---

export type StateRelayEventMap = {
  'snapshot:published': { eventId: string; rev: number }
  'snapshot:received': SnapshotResult
  'command:sent': { cmdId: string; action: string; to: string }
  'command:received': CommandPayload
  'command:unacknowledged': { cmdId: string; action: string; to: string }
  'receipt:received': ReceiptPayload
  'relay:connected': string
  'relay:error': { url: string; error: Error }
}
```

**Step 4: Run test to verify it passes**

```bash
cd state-relay && npm test
```

Expected: PASS — all 4 tests green.

**Step 5: Commit**

```bash
git add -A
git commit -m "feat: define core types, kind numbers, and config interfaces"
```

---

## Task 3: Build Relay Pool Manager

**Files:**
- Create: `packages/state-relay/src/relay.ts`
- Test: `packages/state-relay/__tests__/relay.test.ts`

**Step 1: Write the test**

```typescript
// packages/state-relay/__tests__/relay.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { RelayPool } from '../src/relay'

// Mock nostr-tools SimplePool
vi.mock('nostr-tools/pool', () => {
  const mockPool = {
    publish: vi.fn(() => [Promise.resolve('ok')]),
    querySync: vi.fn(() => Promise.resolve([])),
    subscribeMany: vi.fn(() => ({ close: vi.fn() })),
    close: vi.fn(),
    destroy: vi.fn(),
    listConnectionStatus: vi.fn(() => new Map([['wss://relay1.test', true]])),
  }
  return { SimplePool: vi.fn(() => mockPool) }
})

describe('RelayPool', () => {
  let pool: RelayPool

  beforeEach(() => {
    pool = new RelayPool({
      publish: ['wss://relay1.test'],
      read: ['wss://relay1.test', 'wss://relay2.test'],
    })
  })

  it('creates with relay config', () => {
    const status = pool.status()
    expect(status).toBeDefined()
  })

  it('publishes to publish relays', async () => {
    const results = await pool.publish({ id: 'test', kind: 1, content: '', created_at: 0, tags: [], pubkey: '', sig: '' })
    expect(results.length).toBeGreaterThan(0)
  })

  it('queries from read relays', async () => {
    const events = await pool.query({ kinds: [30333] })
    expect(Array.isArray(events)).toBe(true)
  })

  it('subscribes and returns unsubscribe function', () => {
    const unsub = pool.subscribe(
      { kinds: [1059] },
      { onevent: () => {} }
    )
    expect(typeof unsub).toBe('function')
  })

  it('cleans up on destroy', () => {
    pool.destroy()
    // Should not throw
  })
})
```

**Step 2: Run test to verify it fails**

```bash
cd state-relay && npm test
```

Expected: FAIL — `RelayPool` not found.

**Step 3: Write relay.ts**

```typescript
// packages/state-relay/src/relay.ts
import { SimplePool } from 'nostr-tools/pool'
import type { Event as NostrEvent, Filter, SubscribeManyParams } from 'nostr-tools/pure'
import type { StateRelayRelays } from './types'

export class RelayPool {
  private pool: SimplePool
  private relays: StateRelayRelays

  constructor(relays: StateRelayRelays) {
    this.relays = relays
    this.pool = new SimplePool()
  }

  async publish(event: NostrEvent): Promise<PromiseSettledResult<string>[]> {
    const promises = this.pool.publish(this.relays.publish, event)
    return Promise.allSettled(promises)
  }

  async query(filter: Filter): Promise<NostrEvent[]> {
    return this.pool.querySync(this.relays.read, filter)
  }

  subscribe(
    filter: Filter,
    params: Pick<SubscribeManyParams, 'onevent' | 'oneose' | 'onclose'>
  ): () => void {
    const sub = this.pool.subscribeMany(this.relays.read, filter, params)
    return () => sub.close()
  }

  status(): Map<string, boolean> {
    return this.pool.listConnectionStatus()
  }

  destroy(): void {
    this.pool.destroy()
  }
}
```

**Step 4: Run test to verify it passes**

```bash
cd state-relay && npm test
```

Expected: PASS — all 5 tests green.

**Step 5: Commit**

```bash
git add -A
git commit -m "feat: add RelayPool wrapper around nostr-tools SimplePool"
```

---

## Task 4: Build Snapshot Module

**Files:**
- Create: `packages/state-relay/src/snapshot.ts`
- Test: `packages/state-relay/__tests__/snapshot.test.ts`

**Step 1: Write the test**

```typescript
// packages/state-relay/__tests__/snapshot.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { SnapshotManager } from '../src/snapshot'
import {
  STATE_SNAPSHOT_KIND,
  DEFAULT_OPTIONS,
  type StateRelayConfig,
  type SnapshotPayload,
} from '../src/types'

const mockPubkey = 'a'.repeat(64)

function makeConfig(): StateRelayConfig {
  return {
    identity: {
      pubkey: mockPubkey,
      signEvent: vi.fn(async (evt) => ({
        ...evt,
        pubkey: mockPubkey,
        id: 'event-id-123',
        sig: 'sig-abc',
      })),
      encrypt: vi.fn(async (plaintext) => `encrypted:${plaintext}`),
      decrypt: vi.fn(async (ciphertext) => ciphertext.replace('encrypted:', '')),
    },
    relays: {
      publish: ['wss://relay1.test'],
      read: ['wss://relay1.test'],
    },
    app: { name: 'test-app', namespace: 'default', deviceId: 'DEV_test' },
  }
}

function makePayload(rev: number): Record<string, unknown> {
  return { foo: 'bar', rev }
}

describe('SnapshotManager', () => {
  let manager: SnapshotManager
  let config: StateRelayConfig

  beforeEach(() => {
    config = makeConfig()
    manager = new SnapshotManager(config, DEFAULT_OPTIONS)
  })

  it('builds a valid snapshot payload', () => {
    const snapshot = manager.buildPayload(makePayload(1), 1)
    expect(snapshot.schema).toBe('state-relay.snapshot.v1')
    expect(snapshot.app).toBe('test-app')
    expect(snapshot.namespace).toBe('default')
    expect(snapshot.device_id).toBe('DEV_test')
    expect(snapshot.rev).toBe(1)
    expect(snapshot.data.payload).toEqual({ foo: 'bar', rev: 1 })
  })

  it('builds a valid Nostr event from snapshot', async () => {
    const event = await manager.buildEvent(makePayload(1), 1)
    expect(event.kind).toBe(STATE_SNAPSHOT_KIND)
    expect(event.tags).toContainEqual(['d', 'test-app:default'])
    expect(event.tags).toContainEqual(['app', 'test-app'])
    expect(event.tags).toContainEqual(['rev', '1'])
    expect(event.tags).toContainEqual(['device', 'DEV_test'])
    expect(event.tags).toContainEqual(['ver', '1'])
  })

  it('encrypts the snapshot content', async () => {
    const event = await manager.buildEvent(makePayload(1), 1)
    expect(event.content).toMatch(/^encrypted:/)
    expect(config.identity.encrypt).toHaveBeenCalledOnce()
  })

  it('rejects snapshots exceeding max size', async () => {
    const hugePayload: Record<string, unknown> = {
      data: 'x'.repeat(DEFAULT_OPTIONS.maxSnapshotBytes + 1),
    }
    await expect(manager.buildEvent(hugePayload, 1)).rejects.toThrow(/exceeds max/)
  })

  it('resolves conflict: highest rev wins', () => {
    const a = { rev: 5, createdAt: 100, deviceId: 'DEV_a' }
    const b = { rev: 3, createdAt: 200, deviceId: 'DEV_b' }
    expect(manager.resolveConflict(a, b)).toBe('a')
  })

  it('resolves conflict: same rev, newest created_at wins', () => {
    const a = { rev: 5, createdAt: 100, deviceId: 'DEV_a' }
    const b = { rev: 5, createdAt: 200, deviceId: 'DEV_b' }
    expect(manager.resolveConflict(a, b)).toBe('b')
  })

  it('resolves conflict: same rev + time, lexicographic device_id wins', () => {
    const a = { rev: 5, createdAt: 100, deviceId: 'DEV_b' }
    const b = { rev: 5, createdAt: 100, deviceId: 'DEV_a' }
    expect(manager.resolveConflict(a, b)).toBe('b')
  })

  it('parses and decrypts a snapshot event', async () => {
    const event = await manager.buildEvent(makePayload(1), 1)
    // Simulate fetched event with id/pubkey/sig
    const fetched = { ...event, id: 'event-id-123', pubkey: mockPubkey, sig: 'sig-abc' }
    const result = await manager.parseEvent(fetched)
    expect(result.payload.schema).toBe('state-relay.snapshot.v1')
    expect(result.rev).toBe(1)
    expect(result.payload.data.payload).toEqual({ foo: 'bar', rev: 1 })
  })
})
```

**Step 2: Run test to verify it fails**

```bash
cd state-relay && npm test
```

Expected: FAIL — `SnapshotManager` not found.

**Step 3: Write snapshot.ts**

```typescript
// packages/state-relay/src/snapshot.ts
import {
  STATE_SNAPSHOT_KIND,
  type StateRelayConfig,
  type StateRelayOptions,
  type SnapshotPayload,
  type SnapshotResult,
} from './types'
import type { EventTemplate } from 'nostr-tools/pure'

interface ConflictCandidate {
  rev: number
  createdAt: number
  deviceId: string
}

export class SnapshotManager {
  private config: StateRelayConfig
  private options: StateRelayOptions

  constructor(config: StateRelayConfig, options: StateRelayOptions) {
    this.config = config
    this.options = options
  }

  buildPayload(data: Record<string, unknown>, rev: number, prev?: string): SnapshotPayload {
    return {
      schema: 'state-relay.snapshot.v1',
      app: this.config.app.name,
      namespace: this.config.app.namespace,
      device_id: this.config.app.deviceId,
      state_id: crypto.randomUUID(),
      rev,
      prev,
      ts: Math.floor(Date.now() / 1000),
      summary: { health: 'green' },
      data: { payload: data },
    }
  }

  async buildEvent(data: Record<string, unknown>, rev: number, prev?: string) {
    const snapshot = this.buildPayload(data, rev, prev)
    const plaintext = JSON.stringify(snapshot)

    if (new TextEncoder().encode(plaintext).byteLength > this.options.maxSnapshotBytes) {
      throw new Error(
        `Snapshot exceeds max size: ${new TextEncoder().encode(plaintext).byteLength} > ${this.options.maxSnapshotBytes} bytes`
      )
    }

    const encrypted = await this.config.identity.encrypt(plaintext, this.config.identity.pubkey)
    const dTag = `${this.config.app.name}:${this.config.app.namespace}`

    const template: EventTemplate = {
      kind: STATE_SNAPSHOT_KIND,
      created_at: Math.floor(Date.now() / 1000),
      tags: [
        ['d', dTag],
        ['app', this.config.app.name],
        ['ns', this.config.app.namespace],
        ['rev', String(rev)],
        ['device', this.config.app.deviceId],
        ['ver', '1'],
      ],
      content: encrypted,
    }

    return this.config.identity.signEvent(template)
  }

  async parseEvent(event: { content: string; id: string; created_at: number; tags: string[][] }): Promise<SnapshotResult> {
    const decrypted = await this.config.identity.decrypt(event.content, this.config.identity.pubkey)
    const payload = JSON.parse(decrypted) as SnapshotPayload

    if (payload.schema !== 'state-relay.snapshot.v1') {
      throw new Error(`Unsupported snapshot schema: ${payload.schema}`)
    }

    return {
      payload,
      rev: payload.rev,
      eventId: event.id,
      createdAt: event.created_at,
    }
  }

  resolveConflict(a: ConflictCandidate, b: ConflictCandidate): 'a' | 'b' {
    if (a.rev !== b.rev) return a.rev > b.rev ? 'a' : 'b'
    if (a.createdAt !== b.createdAt) return a.createdAt > b.createdAt ? 'a' : 'b'
    return a.deviceId <= b.deviceId ? 'a' : 'b'
  }

  selectBest(events: Array<{ id: string; created_at: number; tags: string[][] }>): typeof events[number] | null {
    if (events.length === 0) return null
    if (events.length === 1) return events[0]

    return events.reduce((best, current) => {
      const bestRev = parseInt(best.tags.find(t => t[0] === 'rev')?.[1] ?? '0', 10)
      const currentRev = parseInt(current.tags.find(t => t[0] === 'rev')?.[1] ?? '0', 10)
      const bestDevice = best.tags.find(t => t[0] === 'device')?.[1] ?? ''
      const currentDevice = current.tags.find(t => t[0] === 'device')?.[1] ?? ''

      const winner = this.resolveConflict(
        { rev: bestRev, createdAt: best.created_at, deviceId: bestDevice },
        { rev: currentRev, createdAt: current.created_at, deviceId: currentDevice },
      )
      return winner === 'a' ? best : current
    })
  }
}
```

**Step 4: Run test to verify it passes**

```bash
cd state-relay && npm test
```

Expected: PASS — all 9 tests green.

**Step 5: Commit**

```bash
git add -A
git commit -m "feat: add SnapshotManager with build, parse, and conflict resolution"
```

---

## Task 5: Build Command Module

**Files:**
- Create: `packages/state-relay/src/command.ts`
- Test: `packages/state-relay/__tests__/command.test.ts`

**Step 1: Write the test**

```typescript
// packages/state-relay/__tests__/command.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { CommandManager } from '../src/command'
import { DEFAULT_OPTIONS, type CommandPayload } from '../src/types'

const senderPubkey = 'a'.repeat(64)
const targetPubkey = 'b'.repeat(64)

describe('CommandManager', () => {
  let manager: CommandManager

  beforeEach(() => {
    manager = new CommandManager(
      { name: 'test-app', namespace: 'default', deviceId: 'DEV_test' },
      senderPubkey,
      DEFAULT_OPTIONS,
    )
  })

  it('builds a valid command payload', () => {
    const cmd = manager.buildPayload(targetPubkey, 'run_drill', { drill_type: 'full' })
    expect(cmd.schema).toBe('state-relay.command.v1')
    expect(cmd.from).toBe(senderPubkey)
    expect(cmd.to).toBe(targetPubkey)
    expect(cmd.action).toBe('run_drill')
    expect(cmd.ttl).toBe(300)
    expect(cmd.expect_receipt).toBe(true)
    expect(cmd.cmd_id).toBeDefined()
    expect(cmd.params).toEqual({ drill_type: 'full' })
  })

  it('generates unique cmd_ids', () => {
    const a = manager.buildPayload(targetPubkey, 'action_a')
    const b = manager.buildPayload(targetPubkey, 'action_b')
    expect(a.cmd_id).not.toBe(b.cmd_id)
  })

  it('validates an incoming command payload', () => {
    const cmd = manager.buildPayload(targetPubkey, 'run_drill')
    expect(manager.validatePayload(cmd)).toBe(true)
  })

  it('rejects command with wrong schema', () => {
    const cmd = manager.buildPayload(targetPubkey, 'run_drill')
    ;(cmd as any).schema = 'wrong'
    expect(manager.validatePayload(cmd)).toBe(false)
  })

  it('detects expired commands', () => {
    const cmd = manager.buildPayload(targetPubkey, 'run_drill')
    cmd.ts = Math.floor(Date.now() / 1000) - 600 // 10 minutes ago
    cmd.ttl = 300 // 5 minute TTL
    expect(manager.isExpired(cmd)).toBe(true)
  })

  it('accepts non-expired commands', () => {
    const cmd = manager.buildPayload(targetPubkey, 'run_drill')
    expect(manager.isExpired(cmd)).toBe(false)
  })

  it('deduplicates by cmd_id', () => {
    const cmd = manager.buildPayload(targetPubkey, 'run_drill')
    expect(manager.isDuplicate(cmd.cmd_id)).toBe(false)
    manager.markSeen(cmd.cmd_id)
    expect(manager.isDuplicate(cmd.cmd_id)).toBe(true)
  })
})
```

**Step 2: Run test to verify it fails**

```bash
cd state-relay && npm test
```

Expected: FAIL — `CommandManager` not found.

**Step 3: Write command.ts**

```typescript
// packages/state-relay/src/command.ts
import type { StateRelayApp, StateRelayOptions, CommandPayload } from './types'

export class CommandManager {
  private app: StateRelayApp
  private pubkey: string
  private options: StateRelayOptions
  private seenCommands: Set<string> = new Set()

  constructor(app: StateRelayApp, pubkey: string, options: StateRelayOptions) {
    this.app = app
    this.pubkey = pubkey
    this.options = options
  }

  buildPayload(
    toPubkey: string,
    action: string,
    params: Record<string, unknown> = {},
  ): CommandPayload {
    return {
      schema: 'state-relay.command.v1',
      cmd_id: crypto.randomUUID(),
      ts: Math.floor(Date.now() / 1000),
      from: this.pubkey,
      to: toPubkey,
      namespace: `${this.app.name}:${this.app.namespace}`,
      action,
      params,
      ttl: this.options.ttl,
      expect_receipt: true,
    }
  }

  validatePayload(cmd: CommandPayload): boolean {
    return (
      cmd.schema === 'state-relay.command.v1' &&
      typeof cmd.cmd_id === 'string' &&
      typeof cmd.ts === 'number' &&
      typeof cmd.from === 'string' &&
      typeof cmd.to === 'string' &&
      typeof cmd.action === 'string' &&
      typeof cmd.ttl === 'number'
    )
  }

  isExpired(cmd: CommandPayload): boolean {
    const now = Math.floor(Date.now() / 1000)
    return now > cmd.ts + cmd.ttl
  }

  isDuplicate(cmdId: string): boolean {
    return this.seenCommands.has(cmdId)
  }

  markSeen(cmdId: string): void {
    this.seenCommands.add(cmdId)
  }
}
```

**Step 4: Run test to verify it passes**

```bash
cd state-relay && npm test
```

Expected: PASS — all 7 tests green.

**Step 5: Commit**

```bash
git add -A
git commit -m "feat: add CommandManager with build, validate, TTL, and dedup"
```

---

## Task 6: Build Receipt Module

**Files:**
- Create: `packages/state-relay/src/receipt.ts`
- Test: `packages/state-relay/__tests__/receipt.test.ts`

**Step 1: Write the test**

```typescript
// packages/state-relay/__tests__/receipt.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ReceiptManager } from '../src/receipt'
import { STATE_RECEIPT_KIND, type ReceiptPayload } from '../src/types'

const mockPubkey = 'a'.repeat(64)

describe('ReceiptManager', () => {
  let manager: ReceiptManager
  const signEvent = vi.fn(async (evt: any) => ({
    ...evt,
    pubkey: mockPubkey,
    id: 'receipt-event-id',
    sig: 'receipt-sig',
  }))

  beforeEach(() => {
    manager = new ReceiptManager('test-app:default', signEvent)
  })

  it('builds an ack receipt', () => {
    const receipt = manager.buildReceipt('cmd-123', 'received')
    expect(receipt.schema).toBe('state-relay.receipt.v1')
    expect(receipt.cmd_id).toBe('cmd-123')
    expect(receipt.status).toBe('received')
  })

  it('builds a completed receipt with result', () => {
    const receipt = manager.buildReceipt('cmd-123', 'completed', { drills_passed: 3 })
    expect(receipt.status).toBe('completed')
    expect(receipt.result).toEqual({ drills_passed: 3 })
  })

  it('builds a failed receipt with no result', () => {
    const receipt = manager.buildReceipt('cmd-123', 'failed')
    expect(receipt.status).toBe('failed')
    expect(receipt.result).toBeUndefined()
  })

  it('builds a receipt with state_ref', () => {
    const receipt = manager.buildReceipt('cmd-123', 'completed', undefined, {
      kind: 30333,
      d: 'test-app:default',
      rev: 43,
    })
    expect(receipt.state_ref).toEqual({ kind: 30333, d: 'test-app:default', rev: 43 })
  })

  it('builds a signed Nostr event from receipt', async () => {
    const event = await manager.buildEvent('cmd-123', 'completed', 'cmd-event-id-456')
    expect(event.kind).toBe(STATE_RECEIPT_KIND)
    expect(event.tags).toContainEqual(['d', 'cmd-123'])
    expect(event.tags).toContainEqual(['e', 'cmd-event-id-456'])
    expect(event.tags).toContainEqual(['ns', 'test-app:default'])
    expect(event.tags).toContainEqual(['status', 'completed'])
  })

  it('parses a receipt from event content', () => {
    const receipt: ReceiptPayload = {
      schema: 'state-relay.receipt.v1',
      cmd_id: 'cmd-123',
      status: 'completed',
      ts: 1700000000,
      result: { ok: true },
    }
    const parsed = manager.parseContent(JSON.stringify(receipt))
    expect(parsed.cmd_id).toBe('cmd-123')
    expect(parsed.status).toBe('completed')
  })

  it('rejects receipt with wrong schema', () => {
    const bad = JSON.stringify({ schema: 'wrong', cmd_id: 'x', status: 'completed', ts: 0 })
    expect(() => manager.parseContent(bad)).toThrow(/Unsupported receipt schema/)
  })
})
```

**Step 2: Run test to verify it fails**

```bash
cd state-relay && npm test
```

Expected: FAIL — `ReceiptManager` not found.

**Step 3: Write receipt.ts**

```typescript
// packages/state-relay/src/receipt.ts
import {
  STATE_RECEIPT_KIND,
  type ReceiptPayload,
  type ReceiptStatus,
} from './types'
import type { EventTemplate, VerifiedEvent } from 'nostr-tools/pure'

export class ReceiptManager {
  private namespace: string
  private signEvent: (evt: EventTemplate) => Promise<VerifiedEvent>

  constructor(
    namespace: string,
    signEvent: (evt: EventTemplate) => Promise<VerifiedEvent>,
  ) {
    this.namespace = namespace
    this.signEvent = signEvent
  }

  buildReceipt(
    cmdId: string,
    status: ReceiptStatus,
    result?: Record<string, unknown>,
    stateRef?: ReceiptPayload['state_ref'],
  ): ReceiptPayload {
    const receipt: ReceiptPayload = {
      schema: 'state-relay.receipt.v1',
      cmd_id: cmdId,
      status,
      ts: Math.floor(Date.now() / 1000),
    }
    if (result !== undefined) receipt.result = result
    if (stateRef !== undefined) receipt.state_ref = stateRef
    return receipt
  }

  async buildEvent(
    cmdId: string,
    status: ReceiptStatus,
    commandEventId?: string,
    result?: Record<string, unknown>,
    stateRef?: ReceiptPayload['state_ref'],
  ): Promise<VerifiedEvent> {
    const receipt = this.buildReceipt(cmdId, status, result, stateRef)

    const tags: string[][] = [
      ['d', cmdId],
      ['ns', this.namespace],
      ['status', status],
    ]
    if (commandEventId) {
      tags.push(['e', commandEventId])
    }

    const template: EventTemplate = {
      kind: STATE_RECEIPT_KIND,
      created_at: Math.floor(Date.now() / 1000),
      tags,
      content: JSON.stringify(receipt),
    }

    return this.signEvent(template)
  }

  parseContent(content: string): ReceiptPayload {
    const parsed = JSON.parse(content) as ReceiptPayload
    if (parsed.schema !== 'state-relay.receipt.v1') {
      throw new Error(`Unsupported receipt schema: ${parsed.schema}`)
    }
    return parsed
  }
}
```

**Step 4: Run test to verify it passes**

```bash
cd state-relay && npm test
```

Expected: PASS — all 7 tests green.

**Step 5: Commit**

```bash
git add -A
git commit -m "feat: add ReceiptManager with build, sign, and parse"
```

---

## Task 7: Build the StateRelay Facade Class

**Files:**
- Create: `packages/state-relay/src/state-relay.ts`
- Test: `packages/state-relay/__tests__/state-relay.test.ts`
- Modify: `packages/state-relay/src/index.ts`

This is the main public API that composes snapshot, command, receipt, and relay modules.

**Step 1: Write the test**

```typescript
// packages/state-relay/__tests__/state-relay.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { StateRelay } from '../src/state-relay'
import { STATE_SNAPSHOT_KIND, STATE_RECEIPT_KIND, type StateRelayConfig } from '../src/types'

// Mock the relay pool
vi.mock('nostr-tools/pool', () => {
  const mockPool = {
    publish: vi.fn(() => [Promise.resolve('ok')]),
    querySync: vi.fn(() => Promise.resolve([])),
    subscribeMany: vi.fn(() => ({ close: vi.fn() })),
    close: vi.fn(),
    destroy: vi.fn(),
    listConnectionStatus: vi.fn(() => new Map()),
  }
  return { SimplePool: vi.fn(() => mockPool) }
})

const mockPubkey = 'a'.repeat(64)

function makeConfig(): StateRelayConfig {
  return {
    identity: {
      pubkey: mockPubkey,
      signEvent: vi.fn(async (evt) => ({
        ...evt,
        pubkey: mockPubkey,
        id: 'event-' + Math.random().toString(36).slice(2),
        sig: 'sig-abc',
      })),
      encrypt: vi.fn(async (plaintext) => `enc:${plaintext}`),
      decrypt: vi.fn(async (ciphertext) => ciphertext.replace('enc:', '')),
    },
    relays: {
      publish: ['wss://relay1.test'],
      read: ['wss://relay1.test'],
    },
    app: { name: 'test', namespace: 'default', deviceId: 'DEV_test' },
  }
}

describe('StateRelay', () => {
  let relay: StateRelay

  beforeEach(() => {
    relay = new StateRelay(makeConfig())
  })

  it('creates without throwing', () => {
    expect(relay).toBeDefined()
  })

  it('reports status', () => {
    const status = relay.status()
    expect(status).toHaveProperty('connected')
    expect(status).toHaveProperty('lastPublishedRev')
    expect(status).toHaveProperty('lastPublishedEventId')
  })

  it('publishes a snapshot', async () => {
    const result = await relay.publishSnapshot({ key: 'value' }, 1)
    expect(result).toHaveProperty('eventId')
  })

  it('emits snapshot:published after publishing', async () => {
    const handler = vi.fn()
    relay.on('snapshot:published', handler)
    await relay.publishSnapshot({ key: 'value' }, 1)
    expect(handler).toHaveBeenCalledWith(
      expect.objectContaining({ rev: 1 })
    )
  })

  it('fetches latest snapshot (returns null when empty)', async () => {
    const result = await relay.fetchLatestSnapshot()
    expect(result).toBeNull()
  })

  it('sends a command', async () => {
    const targetPubkey = 'b'.repeat(64)
    const result = await relay.sendCommand(targetPubkey, 'run_drill', { type: 'full' })
    expect(result).toHaveProperty('cmdId')
    expect(typeof result.cmdId).toBe('string')
  })

  it('registers and unregisters command handlers', () => {
    const handler = vi.fn()
    const unsub = relay.onCommand(handler)
    expect(typeof unsub).toBe('function')
    unsub()
  })

  it('destroys cleanly', async () => {
    await relay.destroy()
    // Should not throw
  })
})
```

**Step 2: Run test to verify it fails**

```bash
cd state-relay && npm test
```

Expected: FAIL — `StateRelay` not found.

**Step 3: Write state-relay.ts**

```typescript
// packages/state-relay/src/state-relay.ts
import { EventEmitter } from 'events'
import { RelayPool } from './relay'
import { SnapshotManager } from './snapshot'
import { CommandManager } from './command'
import { ReceiptManager } from './receipt'
import {
  STATE_SNAPSHOT_KIND,
  STATE_RECEIPT_KIND,
  DEFAULT_OPTIONS,
  type StateRelayConfig,
  type StateRelayOptions,
  type StateRelayEventMap,
  type SnapshotResult,
  type CommandPayload,
  type CommandContext,
  type ReceiptPayload,
  type RelayStatus,
} from './types'

export class StateRelay extends EventEmitter {
  private config: StateRelayConfig
  private options: StateRelayOptions
  private pool: RelayPool
  private snapshots: SnapshotManager
  private commands: CommandManager
  private receipts: ReceiptManager
  private lastPublishedRev: number | null = null
  private lastPublishedEventId: string | null = null
  private subscriptions: Array<() => void> = []

  constructor(config: StateRelayConfig) {
    super()
    this.config = config
    this.options = { ...DEFAULT_OPTIONS, ...config.options }
    this.pool = new RelayPool(config.relays)
    this.snapshots = new SnapshotManager(config, this.options)
    this.commands = new CommandManager(config.app, config.identity.pubkey, this.options)
    this.receipts = new ReceiptManager(
      `${config.app.name}:${config.app.namespace}`,
      config.identity.signEvent,
    )
  }

  // --- Lifecycle ---

  status(): RelayStatus {
    return {
      connected: this.pool.status(),
      lastPublishedRev: this.lastPublishedRev,
      lastPublishedEventId: this.lastPublishedEventId,
    }
  }

  async destroy(): Promise<void> {
    this.subscriptions.forEach(unsub => unsub())
    this.subscriptions = []
    this.pool.destroy()
    this.removeAllListeners()
  }

  // --- Snapshots ---

  async publishSnapshot(
    data: Record<string, unknown>,
    rev: number,
  ): Promise<{ eventId: string }> {
    const event = await this.snapshots.buildEvent(data, rev)
    await this.pool.publish(event as any)

    this.lastPublishedRev = rev
    this.lastPublishedEventId = event.id
    this.emit('snapshot:published', { eventId: event.id, rev })

    return { eventId: event.id }
  }

  async fetchLatestSnapshot(): Promise<SnapshotResult | null> {
    const dTag = `${this.config.app.name}:${this.config.app.namespace}`
    const events = await this.pool.query({
      kinds: [STATE_SNAPSHOT_KIND],
      authors: [this.config.identity.pubkey],
      '#d': [dTag],
    })

    if (events.length === 0) return null

    const best = this.snapshots.selectBest(events)
    if (!best) return null

    const result = await this.snapshots.parseEvent(best)
    this.emit('snapshot:received', result)
    return result
  }

  // --- Commands ---

  async sendCommand(
    toPubkey: string,
    action: string,
    params?: Record<string, unknown>,
  ): Promise<{ cmdId: string }> {
    const cmd = this.commands.buildPayload(toPubkey, action, params)

    // Encrypt command as DM content and publish
    const encrypted = await this.config.identity.encrypt(
      JSON.stringify(cmd),
      toPubkey,
    )

    const event = await this.config.identity.signEvent({
      kind: 4, // Simplified for v1 — upgrade to NIP-17 wrapping in integration
      created_at: Math.floor(Date.now() / 1000),
      tags: [['p', toPubkey]],
      content: encrypted,
    })

    await this.pool.publish(event as any)
    this.emit('command:sent', { cmdId: cmd.cmd_id, action, to: toPubkey })

    return { cmdId: cmd.cmd_id }
  }

  onCommand(
    handler: (cmd: CommandPayload, ctx: CommandContext) => Promise<void>,
  ): () => void {
    // Subscribe to incoming DMs tagged to us
    const unsub = this.pool.subscribe(
      {
        kinds: [4],
        '#p': [this.config.identity.pubkey],
      },
      {
        onevent: async (event: any) => {
          try {
            const decrypted = await this.config.identity.decrypt(event.content, event.pubkey)
            const cmd = JSON.parse(decrypted) as CommandPayload

            if (!this.commands.validatePayload(cmd)) return
            if (this.commands.isExpired(cmd)) return
            if (this.commands.isDuplicate(cmd.cmd_id)) return
            this.commands.markSeen(cmd.cmd_id)

            this.emit('command:received', cmd)

            const ctx: CommandContext = {
              ack: async () => {
                const receipt = await this.receipts.buildEvent(cmd.cmd_id, 'received', event.id)
                await this.pool.publish(receipt as any)
              },
              complete: async (result?) => {
                const receipt = await this.receipts.buildEvent(cmd.cmd_id, 'completed', event.id, result)
                await this.pool.publish(receipt as any)
              },
              fail: async (reason?) => {
                const receipt = await this.receipts.buildEvent(
                  cmd.cmd_id,
                  'failed',
                  event.id,
                  reason ? { reason } : undefined,
                )
                await this.pool.publish(receipt as any)
              },
            }

            await handler(cmd, ctx)
          } catch {
            // Ignore malformed events
          }
        },
      },
    )

    this.subscriptions.push(unsub)
    return unsub
  }

  // --- Receipts (passive listener) ---

  onReceipt(handler: (receipt: ReceiptPayload) => void): () => void {
    const unsub = this.pool.subscribe(
      {
        kinds: [STATE_RECEIPT_KIND],
        '#p': [this.config.identity.pubkey],
      },
      {
        onevent: (event: any) => {
          try {
            const receipt = this.receipts.parseContent(event.content)
            this.emit('receipt:received', receipt)
            handler(receipt)
          } catch {
            // Ignore malformed receipts
          }
        },
      },
    )

    this.subscriptions.push(unsub)
    return unsub
  }
}
```

**Step 4: Update index.ts to export the public API**

```typescript
// packages/state-relay/src/index.ts
export { StateRelay } from './state-relay'
export {
  VERSION,
  STATE_SNAPSHOT_KIND,
  STATE_RECEIPT_KIND,
  DEFAULT_OPTIONS,
  type StateRelayConfig,
  type StateRelayIdentity,
  type StateRelayRelays,
  type StateRelayApp,
  type StateRelayOptions,
  type SnapshotPayload,
  type SnapshotResult,
  type CommandPayload,
  type CommandContext,
  type ReceiptPayload,
  type ReceiptStatus,
  type RelayStatus,
  type StateRelayEventMap,
} from './types'

export const VERSION = '0.1.0'
```

Note: `VERSION` is exported from both files — remove the one from `types.ts` (it's only in `index.ts`). Actually, it was only in index.ts from Task 1. Just replace the content of index.ts entirely.

**Step 5: Run test to verify it passes**

```bash
cd state-relay && npm test
```

Expected: PASS — all tests green (types: 4, relay: 5, snapshot: 9, command: 7, receipt: 7, state-relay: 8 = 40 total).

**Step 6: Verify build**

```bash
cd state-relay && npm run build
```

Expected: tsup outputs `dist/index.js`, `dist/index.cjs`, `dist/index.d.ts`.

**Step 7: Commit**

```bash
git add -A
git commit -m "feat: add StateRelay facade class composing snapshot, command, and receipt modules"
```

---

## Task 8: Build CLI Demo

**Files:**
- Create: `examples/cli/index.ts`
- Create: `examples/cli/package.json`
- Create: `examples/cli/tsconfig.json`

**Step 1: Create examples/cli/package.json**

```json
{
  "name": "state-relay-cli-demo",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "publish-snapshot": "npx tsx index.ts publish",
    "fetch-snapshot": "npx tsx index.ts fetch",
    "send-command": "npx tsx index.ts send-command"
  },
  "dependencies": {
    "nostr-tools": "^2.23.0",
    "state-relay": "file:../../packages/state-relay"
  },
  "devDependencies": {
    "tsx": "^4.0.0",
    "typescript": "^5.5.0"
  }
}
```

**Step 2: Create examples/cli/tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  }
}
```

**Step 3: Create examples/cli/index.ts**

```typescript
// examples/cli/index.ts
import { generateSecretKey, getPublicKey, finalizeEvent } from 'nostr-tools/pure'
import * as nip44 from 'nostr-tools/nip44'
import { StateRelay, type StateRelayConfig } from 'state-relay'

const DEMO_RELAYS = [
  'wss://relay.damus.io',
  'wss://nos.lol',
  'wss://relay.nostr.band',
]

function createConfig(sk: Uint8Array): StateRelayConfig {
  const pk = getPublicKey(sk)
  return {
    identity: {
      pubkey: pk,
      signEvent: async (template) => finalizeEvent(template, sk),
      encrypt: async (plaintext, pubkey) => {
        const ck = nip44.v2.utils.getConversationKey(sk, pubkey)
        return nip44.v2.encrypt(plaintext, ck)
      },
      decrypt: async (ciphertext, pubkey) => {
        const ck = nip44.v2.utils.getConversationKey(sk, pubkey)
        return nip44.v2.decrypt(ciphertext, ck)
      },
    },
    relays: {
      publish: DEMO_RELAYS.slice(0, 3),
      read: DEMO_RELAYS,
    },
    app: {
      name: 'demo',
      namespace: 'default',
      deviceId: `DEV_${crypto.randomUUID().slice(0, 8)}`,
    },
  }
}

async function publishDemo() {
  const sk = generateSecretKey()
  const pk = getPublicKey(sk)
  console.log(`Generated keypair: ${pk.slice(0, 16)}...`)

  const relay = new StateRelay(createConfig(sk))

  relay.on('snapshot:published', (data) => {
    console.log(`Published! Event ID: ${data.eventId}`)
    console.log(`Revision: ${data.rev}`)
  })

  const result = await relay.publishSnapshot(
    { message: 'Hello from State Relay CLI', timestamp: new Date().toISOString() },
    1,
  )

  console.log(`Snapshot published: ${result.eventId}`)

  // Wait a moment for relay propagation, then fetch it back
  console.log('Waiting 2s for relay propagation...')
  await new Promise(r => setTimeout(r, 2000))

  const fetched = await relay.fetchLatestSnapshot()
  if (fetched) {
    console.log(`Fetched snapshot rev ${fetched.rev}:`)
    console.log(JSON.stringify(fetched.payload.data.payload, null, 2))
  } else {
    console.log('No snapshot found (relay may need more time)')
  }

  await relay.destroy()
  process.exit(0)
}

async function fetchDemo() {
  console.log('Fetch demo requires an existing npub. Use publish first.')
  process.exit(0)
}

const command = process.argv[2]
switch (command) {
  case 'publish':
    publishDemo().catch(console.error)
    break
  case 'fetch':
    fetchDemo().catch(console.error)
    break
  default:
    console.log('Usage: npx tsx index.ts [publish|fetch]')
    process.exit(1)
}
```

**Step 4: Commit (don't install deps — this is a demo, users install themselves)**

```bash
git add -A
git commit -m "feat: add CLI demo for publish/fetch snapshot flow"
```

---

## Task 9: Write Documentation

**Files:**
- Create: `docs/quickstart.md`
- Create: `docs/api.md`
- Create: `docs/architecture.md`
- Create: `README.md`
- Create: `spec/event-schemas.md`

**Step 1: Create README.md**

```markdown
# State Relay

Encrypted state sync and verifiable agent coordination over Nostr.

## What is this?

State Relay is an open-source primitive that lets any local-first app:

1. **Sync encrypted state** via Nostr as an addressable "latest snapshot"
2. **Coordinate actions** via encrypted commands and signed receipts

Canonical state stays local. Nostr is the relay for sync + coordination.

## Install

npm install state-relay nostr-tools

## Quick Start

See [docs/quickstart.md](docs/quickstart.md) for a 15-minute integration guide.

## API Reference

See [docs/api.md](docs/api.md).

## Architecture

See [docs/architecture.md](docs/architecture.md).

## Event Spec

See [spec/event-schemas.md](spec/event-schemas.md) for Nostr event kind definitions.

## License

MIT
```

**Step 2: Create docs/quickstart.md**

Write a concise quickstart showing:
- Install
- Create config with nostr-tools key generation
- Publish a snapshot
- Fetch it back
- Send a command and handle receipt

Use the same patterns from the CLI demo but explained step by step. Target: readable in 5 minutes, runnable in 15.

**Step 3: Create docs/api.md**

Document every public method on `StateRelay`:
- `constructor(config)` — explain each config field
- `publishSnapshot(data, rev)` — params, return, events emitted
- `fetchLatestSnapshot()` — return type, conflict resolution behavior
- `sendCommand(toPubkey, action, params?)` — how commands are encrypted and delivered
- `onCommand(handler)` — the CommandContext interface (ack/complete/fail)
- `onReceipt(handler)` — passive receipt listener
- `status()` — what it returns
- `destroy()` — cleanup behavior

**Step 4: Create docs/architecture.md**

Short doc covering:
- Local-first principle
- Three components diagram
- Nostr event flow
- Conflict resolution rules
- Security model (key injection, no secrets in snapshots)

**Step 5: Create spec/event-schemas.md**

Document the three event types with full tag examples:
- Kind 30333 (snapshot)
- Kind 30334 (receipt)
- NIP-17 wrapped commands

Include JSON examples for each payload schema.

**Step 6: Commit**

```bash
git add -A
git commit -m "docs: add README, quickstart, API reference, architecture, and event spec"
```

---

## Task 10: Final Integration Test and Package Verification

**Files:**
- Create: `packages/state-relay/__tests__/integration.test.ts`

**Step 1: Write an integration test that exercises the full flow with mocked relays**

```typescript
// packages/state-relay/__tests__/integration.test.ts
import { describe, it, expect, vi } from 'vitest'
import { StateRelay, type StateRelayConfig, STATE_SNAPSHOT_KIND } from '../src/index'

vi.mock('nostr-tools/pool', () => {
  const publishedEvents: any[] = []
  const mockPool = {
    publish: vi.fn((relays, event) => {
      publishedEvents.push(event)
      return [Promise.resolve('ok')]
    }),
    querySync: vi.fn(async () => publishedEvents.filter(e => e.kind === STATE_SNAPSHOT_KIND)),
    subscribeMany: vi.fn(() => ({ close: vi.fn() })),
    close: vi.fn(),
    destroy: vi.fn(),
    listConnectionStatus: vi.fn(() => new Map([['wss://relay.test', true]])),
  }
  return { SimplePool: vi.fn(() => mockPool) }
})

const mockPubkey = 'a'.repeat(64)

function makeConfig(): StateRelayConfig {
  return {
    identity: {
      pubkey: mockPubkey,
      signEvent: vi.fn(async (evt) => ({
        ...evt,
        pubkey: mockPubkey,
        id: 'evt-' + Math.random().toString(36).slice(2, 10),
        sig: 'sig-test',
      })),
      encrypt: vi.fn(async (pt) => Buffer.from(pt).toString('base64')),
      decrypt: vi.fn(async (ct) => Buffer.from(ct, 'base64').toString('utf-8')),
    },
    relays: {
      publish: ['wss://relay.test'],
      read: ['wss://relay.test'],
    },
    app: { name: 'integration', namespace: 'test', deviceId: 'DEV_int' },
  }
}

describe('Integration: full snapshot round-trip', () => {
  it('publishes and fetches a snapshot end-to-end', async () => {
    const relay = new StateRelay(makeConfig())
    const events: string[] = []

    relay.on('snapshot:published', (data) => events.push(`published:${data.rev}`))
    relay.on('snapshot:received', (data) => events.push(`received:${data.rev}`))

    // Publish
    const { eventId } = await relay.publishSnapshot({ hello: 'world' }, 1)
    expect(eventId).toBeDefined()
    expect(events).toContain('published:1')

    // Fetch
    const snapshot = await relay.fetchLatestSnapshot()
    expect(snapshot).not.toBeNull()
    expect(snapshot!.payload.data.payload).toEqual({ hello: 'world' })
    expect(snapshot!.rev).toBe(1)
    expect(events).toContain('received:1')

    await relay.destroy()
  })

  it('publishes multiple revisions and fetches the latest', async () => {
    const relay = new StateRelay(makeConfig())

    await relay.publishSnapshot({ version: 'first' }, 1)
    await relay.publishSnapshot({ version: 'second' }, 2)
    await relay.publishSnapshot({ version: 'third' }, 3)

    const snapshot = await relay.fetchLatestSnapshot()
    expect(snapshot).not.toBeNull()
    expect(snapshot!.rev).toBe(3)
    expect(snapshot!.payload.data.payload).toEqual({ version: 'third' })

    await relay.destroy()
  })

  it('sends a command and gets a cmdId back', async () => {
    const relay = new StateRelay(makeConfig())
    const targetPubkey = 'b'.repeat(64)

    const { cmdId } = await relay.sendCommand(targetPubkey, 'run_drill', { type: 'tabletop' })
    expect(cmdId).toBeDefined()
    expect(typeof cmdId).toBe('string')

    await relay.destroy()
  })

  it('status reports last published state', async () => {
    const relay = new StateRelay(makeConfig())

    let status = relay.status()
    expect(status.lastPublishedRev).toBeNull()

    await relay.publishSnapshot({ data: true }, 5)

    status = relay.status()
    expect(status.lastPublishedRev).toBe(5)
    expect(status.lastPublishedEventId).toBeDefined()

    await relay.destroy()
  })
})
```

**Step 2: Run all tests**

```bash
cd state-relay && npm test
```

Expected: ALL PASS — types (4) + relay (5) + snapshot (9) + command (7) + receipt (7) + state-relay (8) + integration (4) = 44 tests.

**Step 3: Run build**

```bash
cd state-relay && npm run build
```

Expected: Clean build, no errors.

**Step 4: Run type check**

```bash
cd state-relay && npm run lint
```

Expected: No type errors.

**Step 5: Commit**

```bash
git add -A
git commit -m "test: add integration tests for full snapshot round-trip and command flow"
```

---

## Summary

| Task | What it builds | Tests |
|------|---------------|-------|
| 1 | Project scaffold (monorepo, tsup, vitest) | 0 |
| 2 | Core types, kind numbers, config | 4 |
| 3 | RelayPool wrapper | 5 |
| 4 | SnapshotManager (build, parse, conflict resolution) | 9 |
| 5 | CommandManager (build, validate, TTL, dedup) | 7 |
| 6 | ReceiptManager (build, sign, parse) | 7 |
| 7 | StateRelay facade (public API) | 8 |
| 8 | CLI demo | 0 |
| 9 | Documentation (README, quickstart, API, arch, spec) | 0 |
| 10 | Integration tests + final verification | 4 |
| **Total** | | **44** |
