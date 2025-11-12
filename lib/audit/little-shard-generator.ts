/**
 * Little Shard Generator
 * Creates standardized JSON governance document from audit results
 */

import crypto from 'crypto';

interface LittleShard {
  version: string;
  client_id: string;
  created_at: string;
  audit_ref: string;
  keep_score: number;
  btc_value: number;
  expected_loss: number;
  pillars: {
    security: PillarSection;
    legal: PillarSection;
    access: PillarSection;
    maintenance: PillarSection;
  };
  wallet_map: WalletMapEntry[];
  inheritance_rules: string[];
  recovery_steps: string[];
  governance: GovernanceStructure;
  proofs: {
    bip322_signatures: BIP322Proof[];
    timestamps: TimestampProof[];
  };
  legal: LegalSection;
  tax: TaxSection;
  attachments: Attachment[];
  meta: {
    generator: string;
    sha256?: string;
  };
}

interface PillarSection {
  score: number;
  issues: string[];
  actions: string[];
  impact: number;
}

interface WalletMapEntry {
  id: string;
  wallet_type: string;
  platform: string;
  holder: string;
  location: string;
  backup: string;
  notes: string;
}

interface GovernanceStructure {
  authority_hierarchy: string[];
  review_interval_months: number;
  key_holders: KeyHolder[];
  emergency_contacts: EmergencyContact[];
}

interface KeyHolder {
  name: string;
  role: string;
  holds_keys: boolean;
  key_ids: string[];
  contact: {
    email: string;
  };
}

interface EmergencyContact {
  email: string;
  notes: string;
}

interface BIP322Proof {
  address: string;
  message: string;
  signature: string;
  created_at: string;
}

interface TimestampProof {
  type: string;
  evidence: string;
  created_at: string;
}

interface LegalSection {
  jurisdiction: string;
  trust_present: boolean;
  bitcoin_mentioned_in_docs: boolean;
  rufadaa_compliant: boolean;
  documents: DocumentRef[];
}

interface DocumentRef {
  name: string;
  stored_local_path: string;
  hash_sha256: string;
}

interface TaxSection {
  cost_basis_tracking: boolean;
  notes: string;
}

interface Attachment {
  label: string;
  hash_sha256: string;
  note: string;
}

/**
 * Generate Little Shard JSON from audit report
 */
export function generateLittleShard(auditReport: any, formData: any): LittleShard {
  const now = new Date().toISOString();
  const clientId = crypto.randomBytes(8).toString('hex');

  // Extract scores and values
  const keepScore = auditReport.current_state?.keep_score || 0;
  const btcValue = auditReport.current_state?.holdings ||
                   auditReport.current_state?.btc_value ||
                   formData.btc_value_usd || 0;
  const birs = auditReport.current_state?.birs || 0;

  // Build pillar details
  const pillars = {
    security: buildPillarSection(auditReport.security, 'security'),
    legal: buildPillarSection(auditReport.legal, 'legal'),
    access: buildPillarSection(auditReport.access, 'access'),
    maintenance: buildPillarSection(auditReport.maintenance, 'maintenance')
  };

  // Build wallet map from form data
  const walletMap = buildWalletMap(formData);

  // Extract inheritance rules from analysis
  const inheritanceRules = extractInheritanceRules(auditReport, formData);

  // Generate recovery steps based on gaps
  const recoverySteps = generateRecoverySteps(auditReport, formData);

  // Build governance structure
  const governance = buildGovernance(formData, auditReport);

  // Legal integration snapshot
  const legal: LegalSection = {
    jurisdiction: `${formData.location_state || 'Unknown'}, ${formData.location_country || 'USA'}`,
    trust_present: formData.has_will_or_trust === true || formData.has_will_or_trust === 'true',
    bitcoin_mentioned_in_docs: formData.bitcoin_explicitly_mentioned === true || formData.bitcoin_explicitly_mentioned === 'true',
    rufadaa_compliant: formData.rufadaa_authority_added === true || formData.rufadaa_authority_added === 'true',
    documents: buildDocumentRefs(formData)
  };

  // Tax tracking
  const tax: TaxSection = {
    cost_basis_tracking: formData.tracks_cost_basis === true || formData.tracks_cost_basis === 'true',
    notes: formData.tracks_cost_basis ? 'Active tracking in place' : 'Recommend implementing cost basis tracking'
  };

  // Build the complete Little Shard
  const littleShard: LittleShard = {
    version: "1.0.0",
    client_id: clientId,
    created_at: now,
    audit_ref: `Bitcoin-Inheritance-Audit-${(formData.full_name || 'Client').replace(/\s/g, '-')}-${now.split('T')[0]}.pdf`,
    keep_score: keepScore,
    btc_value: btcValue,
    expected_loss: Math.round(birs),

    pillars: pillars,
    wallet_map: walletMap,
    inheritance_rules: inheritanceRules,
    recovery_steps: recoverySteps,
    governance: governance,

    proofs: {
      bip322_signatures: buildBIP322Proofs(formData),
      timestamps: buildTimestampProofs(formData)
    },

    legal: legal,
    tax: tax,

    attachments: buildAttachments(formData),

    meta: {
      generator: "KEEP-Audit-Engine/1.0.0"
    }
  };

  // Add SHA256 hash of the serialized JSON
  const jsonString = JSON.stringify(littleShard, null, 2);
  const hash = crypto.createHash('sha256').update(jsonString).digest('hex');
  littleShard.meta.sha256 = hash;

  return littleShard;
}

/**
 * Build pillar section from audit analysis
 */
function buildPillarSection(pillarData: any, pillarName: string): PillarSection {
  if (!pillarData) {
    return {
      score: 0,
      issues: ["No assessment data available"],
      actions: ["Complete assessment"],
      impact: 10
    };
  }

  const score = pillarData.score || 0;
  const issues = pillarData.gaps || [];
  const actions = extractPillarActions(pillarData);
  const impact = calculateImpact(score);

  return {
    score: Math.round(score * 10) / 10,
    issues: issues.slice(0, 5), // Top 5 issues
    actions: actions.slice(0, 5), // Top 5 actions
    impact: impact
  };
}

/**
 * Extract actionable items from pillar analysis
 */
function extractPillarActions(pillarData: any): string[] {
  const actions: string[] = [];

  // Extract from analysis text
  if (pillarData.analysis) {
    // Look for action-oriented phrases
    const actionPhrases = [
      /should implement (.*?)(?:\.|,|;|$)/gi,
      /need to (.*?)(?:\.|,|;|$)/gi,
      /must (.*?)(?:\.|,|;|$)/gi,
      /recommend (.*?)(?:\.|,|;|$)/gi
    ];

    actionPhrases.forEach(regex => {
      const matches = pillarData.analysis.matchAll(regex);
      for (const match of matches) {
        if (match[1] && match[1].length < 100) {
          actions.push(capitalizeFirst(match[1].trim()));
        }
      }
    });
  }

  // Add default actions based on score
  if (actions.length === 0) {
    if (pillarData.score < 3) {
      actions.push("Immediate remediation required");
      actions.push("Implement basic security measures");
    } else if (pillarData.score < 7) {
      actions.push("Strengthen existing protocols");
      actions.push("Document current procedures");
    } else {
      actions.push("Maintain current practices");
      actions.push("Schedule regular reviews");
    }
  }

  return actions;
}

/**
 * Build wallet map from form data
 */
function buildWalletMap(formData: any): WalletMapEntry[] {
  const wallets: WalletMapEntry[] = [];

  // Primary wallet
  if (formData.primary_custody_platform || formData.primary_wallet_type) {
    wallets.push({
      id: "K1",
      wallet_type: mapWalletType(formData.primary_wallet_type),
      platform: formData.primary_custody_platform || "Unknown",
      holder: formData.full_name || "Primary Holder",
      location: "Primary Location",
      backup: formData.backup_locations > 0 ? "Multiple backups" : "Single backup",
      notes: "Primary signing device"
    });
  }

  // Add additional keys based on number_of_keys
  const numKeys = parseInt(formData.number_of_keys) || 1;
  const keyholders = formData.keyholder_list ?
    formData.keyholder_list.split(',').map((k: string) => k.trim()) : [];

  for (let i = 1; i < Math.min(numKeys, 5); i++) {
    wallets.push({
      id: `K${i + 1}`,
      wallet_type: mapWalletType(formData.primary_wallet_type),
      platform: formData.primary_custody_platform || "Unknown",
      holder: keyholders[i] || `Keyholder ${i + 1}`,
      location: `Location ${i + 1}`,
      backup: formData.backup_locations > i ? "Backup present" : "No backup",
      notes: `Key ${i + 1} of ${numKeys}`
    });
  }

  return wallets;
}

/**
 * Map wallet type to schema enum
 */
function mapWalletType(walletType: string): string {
  const typeMap: { [key: string]: string } = {
    'single-sig': 'single-sig',
    '2-of-3': 'multisig-2of3',
    '3-of-5': 'multisig-3of5',
    'other-multisig': 'other'
  };
  return typeMap[walletType] || 'other';
}

/**
 * Extract inheritance rules from audit analysis
 */
function extractInheritanceRules(auditReport: any, formData: any): string[] {
  const rules: string[] = [];

  // Add rules based on wallet type
  if (formData.primary_wallet_type?.includes('multisig')) {
    rules.push("Multiple keyholders must coordinate for any transaction");
    rules.push("No single keyholder may act unilaterally");
  }

  // Add rules based on legal setup
  if (formData.has_will_or_trust) {
    rules.push("All transfers must comply with trust/will provisions");
  }

  // Add rules based on keyholders
  if (formData.keyholder_list) {
    const holders = formData.keyholder_list.split(',').map((k: string) => k.trim());
    if (holders.length > 1) {
      rules.push(`${holders[0]} must coordinate with ${holders[1]} for recovery`);
    }
  }

  // Add time delay for security
  if (auditReport.current_state?.keep_score < 50) {
    rules.push("Implement 72-hour time delay on large transfers during estate events");
  }

  // Default rules if none generated
  if (rules.length === 0) {
    rules.push("Follow documented recovery procedures");
    rules.push("Verify all parties before releasing keys");
    rules.push("Document all recovery actions");
  }

  return rules;
}

/**
 * Generate recovery steps based on gaps and best practices
 */
function generateRecoverySteps(auditReport: any, formData: any): string[] {
  const steps: string[] = [];

  // Legal first
  steps.push("Obtain death certificate or incapacity documentation");

  // Contact coordination
  if (formData.attorney_name) {
    steps.push(`Contact estate attorney: ${formData.attorney_name}`);
  } else {
    steps.push("Contact designated legal representative");
  }

  // Key coordination based on wallet type
  if (formData.primary_wallet_type?.includes('multisig')) {
    steps.push("Coordinate required keyholders to meet signing threshold");
  } else {
    steps.push("Secure access to primary wallet keys");
  }

  // Platform-specific
  if (formData.primary_custody_platform) {
    steps.push(`Follow ${formData.primary_custody_platform} recovery procedures`);
  }

  // Transfer execution
  steps.push("Execute transfer to beneficiary wallets per estate plan");
  steps.push("Document all transactions for tax reporting");

  return steps;
}

/**
 * Build governance structure
 */
function buildGovernance(formData: any, auditReport: any): GovernanceStructure {
  const keyholders = formData.keyholder_list ?
    formData.keyholder_list.split(',').map((k: string) => k.trim()) : [];

  const governance: GovernanceStructure = {
    authority_hierarchy: [],
    review_interval_months: 12,
    key_holders: [],
    emergency_contacts: []
  };

  // Build hierarchy
  if (formData.attorney_name) {
    governance.authority_hierarchy.push("Estate Attorney");
  }
  governance.authority_hierarchy.push(...keyholders);
  if (governance.authority_hierarchy.length === 0) {
    governance.authority_hierarchy.push("Primary Holder");
  }

  // Add key holders
  keyholders.forEach((holder: string, index: number) => {
    governance.key_holders.push({
      name: holder,
      role: index === 0 ? "Primary" : `Keyholder ${index + 1}`,
      holds_keys: true,
      key_ids: [`K${index + 1}`],
      contact: {
        email: formData.email && index === 0 ? formData.email : `contact${index + 1}@example.com`
      }
    });
  });

  // Add attorney if present
  if (formData.attorney_name) {
    governance.key_holders.push({
      name: formData.attorney_name,
      role: "Attorney",
      holds_keys: false,
      key_ids: [],
      contact: {
        email: "attorney@law.firm"
      }
    });
  }

  // Emergency contacts based on platform
  if (formData.primary_custody_platform) {
    governance.emergency_contacts.push({
      email: `support@${formData.primary_custody_platform.toLowerCase()}.com`,
      notes: `${formData.primary_custody_platform} support`
    });
  }

  return governance;
}

/**
 * Build BIP-322 proof placeholders
 */
function buildBIP322Proofs(formData: any): BIP322Proof[] {
  if (formData.cryptographic_proof_created !== true &&
      formData.cryptographic_proof_created !== 'true') {
    return [];
  }

  return [{
    address: "bc1q[pending]",
    message: `This wallet is controlled by ${formData.full_name || 'the holder'} as of ${new Date().toISOString().split('T')[0]}`,
    signature: "[To be generated]",
    created_at: new Date().toISOString()
  }];
}

/**
 * Build timestamp proof placeholders
 */
function buildTimestampProofs(formData: any): TimestampProof[] {
  if (formData.timestamped_evidence_exists !== true &&
      formData.timestamped_evidence_exists !== 'true') {
    return [];
  }

  return [{
    type: "OpenTimestamps",
    evidence: "[Pending OTS proof]",
    created_at: new Date().toISOString()
  }];
}

/**
 * Build document references
 */
function buildDocumentRefs(formData: any): DocumentRef[] {
  const docs: DocumentRef[] = [];

  if (formData.has_will_or_trust) {
    docs.push({
      name: "Estate Planning Documents",
      stored_local_path: "vault/estate-docs",
      hash_sha256: "[To be computed]"
    });
  }

  if (formData.bitcoin_explicitly_mentioned) {
    docs.push({
      name: "Bitcoin Addendum",
      stored_local_path: "vault/bitcoin-addendum",
      hash_sha256: "[To be computed]"
    });
  }

  return docs;
}

/**
 * Build attachment references
 */
function buildAttachments(formData: any): Attachment[] {
  const attachments: Attachment[] = [];

  if (formData.primary_wallet_type?.includes('multisig')) {
    attachments.push({
      label: "Wallet descriptor (masked)",
      hash_sha256: "[To be computed]",
      note: "Store locally only - do not upload"
    });
  }

  if (formData.access_instructions_format === 'video' ||
      formData.access_instructions_format === 'both') {
    attachments.push({
      label: "Recovery instruction video",
      hash_sha256: "[To be computed]",
      note: "Encrypted local storage only"
    });
  }

  return attachments;
}

/**
 * Calculate impact score based on pillar score
 */
function calculateImpact(score: number): number {
  if (score < 2) return 10;
  if (score < 4) return 9;
  if (score < 6) return 7;
  if (score < 8) return 5;
  return 3;
}

/**
 * Capitalize first letter
 */
function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}