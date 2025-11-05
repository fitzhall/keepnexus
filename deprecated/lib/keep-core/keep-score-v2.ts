/**
 * KEEP Score Engine V2
 * Aligned with KEEP framework:
 * - Keep it Secure
 * - Establish Legal Protection
 * - Ensure Access
 * - Plan for the Future
 *
 * Simplified scoring focused on what matters most
 */

import {
  LittleShardFile,
  KEEPScore,
  KEEPScoreComponents,
  TrendDirection
} from './data-model';

// ============================================================================
// KEEP-Aligned Weights
// ============================================================================

const KEEP_WEIGHTS = {
  keep_secure: 0.25,         // K - Security of keys
  establish_legal: 0.25,     // E - Legal protection (trust/will)
  ensure_access: 0.25,       // E - Access & redundancy
  plan_future: 0.25         // P - Future planning & education
};

// ============================================================================
// Main KEEP Score Calculation
// ============================================================================

/**
 * Calculate KEEP Score aligned with framework
 */
export function calculateKEEPScore(data: LittleShardFile): KEEPScore {
  // Calculate KEEP components
  const keepSecure = calculateKeepSecure(data);
  const establishLegal = calculateEstablishLegal(data);
  const ensureAccess = calculateEnsureAccess(data);
  const planFuture = calculatePlanFuture(data);

  // Equal weighting for simplicity and clarity
  const value = Math.round(
    (keepSecure * KEEP_WEIGHTS.keep_secure) +
    (establishLegal * KEEP_WEIGHTS.establish_legal) +
    (ensureAccess * KEEP_WEIGHTS.ensure_access) +
    (planFuture * KEEP_WEIGHTS.plan_future)
  );

  // Map to old component structure for compatibility
  const components: KEEPScoreComponents = {
    security: keepSecure,
    legal_readiness: establishLegal,
    redundancy: ensureAccess,
    education: planFuture,
    liveness: ensureAccess // Combined with redundancy for simplicity
  };

  // Generate simple, actionable recommendations
  const recommendations = generateSimpleRecommendations(
    keepSecure,
    establishLegal,
    ensureAccess,
    planFuture,
    data
  );

  // Determine trend
  const previousScore = data.keep_score?.value || 0;
  let trend: TrendDirection = 'stable';
  if (value > previousScore + 2) trend = 'improving';
  if (value < previousScore - 2) trend = 'declining';

  return {
    value,
    calculated_at: new Date().toISOString(),
    components,
    trend,
    recommendations: recommendations.slice(0, 3)
  };
}

// ============================================================================
// K - Keep it Secure (25%)
// ============================================================================

function calculateKeepSecure(data: LittleShardFile): number {
  let score = 0;

  // Has multisig configured? (40 points)
  if (data.wallets.length > 0 && data.wallets[0].threshold >= 2) {
    score += 40;
  }

  // Hardware wallets used? (30 points)
  const hardwareCount = data.keyholders.filter(k =>
    k.storage_type === 'hardware-wallet'
  ).length;
  score += Math.min(30, hardwareCount * 10);

  // Keys are fresh? (30 points)
  const avgKeyAge = data.keyholders.length > 0
    ? data.keyholders.reduce((sum, k) => sum + k.key_age_days, 0) / data.keyholders.length
    : 999;
  if (avgKeyAge < 365) score += 30;
  else if (avgKeyAge < 730) score += 15;

  return Math.min(100, score);
}

// ============================================================================
// E - Establish Legal Protection (25%)
// ============================================================================

function calculateEstablishLegal(data: LittleShardFile): number {
  let score = 0;

  // Has trust? (40 points) - Most important
  if (data.legal_docs.has_trust) score += 40;

  // Has will? (30 points)
  if (data.legal_docs.has_will) score += 30;

  // Has instructions? (20 points)
  if (data.legal_docs.has_letter_of_instruction) score += 20;

  // Recently reviewed? (10 points)
  const daysSinceReview = Math.floor(
    (Date.now() - new Date(data.legal_docs.last_review).getTime()) / (1000 * 60 * 60 * 24)
  );
  if (daysSinceReview < 365) score += 10;

  return Math.min(100, score);
}

// ============================================================================
// E - Ensure Access (25%)
// ============================================================================

function calculateEnsureAccess(data: LittleShardFile): number {
  let score = 0;

  // Meets 3-3-3 rule? (40 points)
  if (data.redundancy.passes_3_3_3_rule) {
    score += 40;
  } else {
    // Partial credit
    if (data.redundancy.device_count >= 3) score += 13;
    if (data.redundancy.location_count >= 3) score += 13;
    if (data.redundancy.person_count >= 3) score += 14;
  }

  // Geographic distribution? (30 points)
  const locations = data.redundancy.geographic_distribution.length;
  score += Math.min(30, locations * 10);

  // Recent successful drill? (30 points)
  const recentDrill = data.drills.find(d => {
    const daysSince = Math.floor(
      (Date.now() - new Date(d.timestamp).getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysSince < 90 && d.success;
  });
  if (recentDrill) score += 30;

  return Math.min(100, score);
}

// ============================================================================
// P - Plan for the Future (25%)
// ============================================================================

function calculatePlanFuture(data: LittleShardFile): number {
  let score = 0;

  // Heirs trained? (40 points)
  if (data.education.heirs_trained) score += 40;

  // Multiple heirs trained? (30 points)
  const trainedCount = data.education.trained_heirs.length;
  score += Math.min(30, trainedCount * 10);

  // Recovery tested successfully? (30 points)
  const successfulDrills = data.drills.filter(d => d.success).length;
  score += Math.min(30, successfulDrills * 10);

  return Math.min(100, score);
}

// ============================================================================
// Simple Recommendations
// ============================================================================

function generateSimpleRecommendations(
  keepSecure: number,
  establishLegal: number,
  ensureAccess: number,
  planFuture: number,
  data: LittleShardFile
): string[] {
  const recs: string[] = [];

  // Find weakest area first
  const scores = [
    { area: 'K', score: keepSecure, name: 'Security' },
    { area: 'E1', score: establishLegal, name: 'Legal' },
    { area: 'E2', score: ensureAccess, name: 'Access' },
    { area: 'P', score: planFuture, name: 'Future' }
  ].sort((a, b) => a.score - b.score);

  // Recommend fixes for weakest areas
  for (const area of scores) {
    if (area.score >= 80) continue; // Good enough

    switch (area.area) {
      case 'K':
        if (data.wallets.length === 0) {
          recs.push('Set up multisig wallet (2-of-3 minimum)');
        } else if (data.keyholders.filter(k => k.storage_type === 'hardware-wallet').length < 2) {
          recs.push('Add hardware wallets for key storage');
        } else {
          recs.push('Rotate keys annually for security');
        }
        break;

      case 'E1':
        if (!data.legal_docs.has_trust) {
          recs.push('Establish trust for estate planning');
        } else if (!data.legal_docs.has_will) {
          recs.push('Create will with Bitcoin instructions');
        } else {
          recs.push('Write letter of instruction for heirs');
        }
        break;

      case 'E2':
        if (!data.redundancy.passes_3_3_3_rule) {
          recs.push('Achieve 3 devices, 3 locations, 3 people');
        } else if (data.drills.length === 0) {
          recs.push('Run first recovery drill');
        } else {
          recs.push('Test recovery process quarterly');
        }
        break;

      case 'P':
        if (!data.education.heirs_trained) {
          recs.push('Train heirs on recovery process');
        } else if (data.education.trained_heirs.length < 2) {
          recs.push('Train backup heir for redundancy');
        } else {
          recs.push('Document recovery instructions');
        }
        break;
    }
  }

  return recs;
}

// ============================================================================
// Score Tracking
// ============================================================================

/**
 * Update Little Shard file with new score
 */
export function updateFileWithScore(data: LittleShardFile): LittleShardFile {
  const newScore = calculateKEEPScore(data)

  return {
    ...data,
    keep_score: newScore,
    last_modified: new Date().toISOString()
  }
}

// ============================================================================
// Text-Based Display Helpers
// ============================================================================

/**
 * Format score for terminal-style display
 */
export function formatScoreForDisplay(score: KEEPScore, data: LittleShardFile): string {
  const k = calculateKeepSecure(data);
  const e1 = calculateEstablishLegal(data);
  const e2 = calculateEnsureAccess(data);
  const p = calculatePlanFuture(data);

  const getStatus = (val: number) => {
    if (val >= 80) return '[GOOD]    ';
    if (val >= 60) return '[OK]      ';
    if (val >= 40) return '[IMPROVE] ';
    return '[CRITICAL]';
  };

  return `
KEEP SCORE: ${score.value}

K: Keep Secure............${k.toString().padStart(3)} ${getStatus(k)}
E: Establish Legal........${e1.toString().padStart(3)} ${getStatus(e1)}
E: Ensure Access..........${e2.toString().padStart(3)} ${getStatus(e2)}
P: Plan Future............${p.toString().padStart(3)} ${getStatus(p)}

NEXT STEPS:
${score.recommendations.map((r, i) => `${i + 1}. ${r}`).join('\n')}
`.trim();
}