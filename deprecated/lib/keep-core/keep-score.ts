/**
 * KEEP Score Engine
 * Calculates the 0-100 health score for Bitcoin inheritance setups
 * Based on weighted formula: Security (35%) + Redundancy (25%) + Liveness (20%) + Legal (10%) + Education (10%)
 */

import {
  LittleShardFile,
  KEEPScore,
  KEEPScoreComponents,
  ScoreRecommendation,
  TrendDirection
} from '@/lib/keep-core/data-model';

// ============================================================================
// Score Weights (from vision document)
// ============================================================================

const SCORE_WEIGHTS = {
  security: 0.35,
  redundancy: 0.25,
  liveness: 0.20,
  legal_readiness: 0.10,
  education: 0.10
};

// ============================================================================
// Main Score Calculation
// ============================================================================

/**
 * Calculate the overall KEEP Score (0-100)
 */
export function calculateKEEPScore(data: LittleShardFile): KEEPScore {
  const components = calculateComponents(data);

  // Weighted average calculation
  const value = Math.round(
    (components.security * SCORE_WEIGHTS.security) +
    (components.redundancy * SCORE_WEIGHTS.redundancy) +
    (components.liveness * SCORE_WEIGHTS.liveness) +
    (components.legal_readiness * SCORE_WEIGHTS.legal_readiness) +
    (components.education * SCORE_WEIGHTS.education)
  );

  // Calculate trend
  const trend = calculateTrend(data, value);

  // Generate recommendations
  const recommendations = generateRecommendations(data, components);

  return {
    value,
    calculated_at: new Date().toISOString(),
    components,
    trend,
    recommendations: recommendations.slice(0, 3) // Top 3 recommendations
  };
}

/**
 * Calculate all component scores
 */
function calculateComponents(data: LittleShardFile): KEEPScoreComponents {
  return {
    security: calculateSecurity(data),
    redundancy: calculateRedundancy(data),
    liveness: calculateLiveness(data),
    legal_readiness: calculateLegalReadiness(data),
    education: calculateEducation(data)
  };
}

// ============================================================================
// Component Calculators
// ============================================================================

/**
 * Security Score (0-100)
 * Based on: key storage types, multisig threshold, sharding, key age
 */
export function calculateSecurity(data: LittleShardFile): number {
  let score = 0;
  const maxScore = 100;

  // Check if multisig is configured (40 points)
  if (data.wallets.length > 0) {
    const wallet = data.wallets[0]; // Use primary wallet
    score += 20;

    // Bonus for higher threshold
    if (wallet.threshold >= 2) score += 10;
    if (wallet.threshold >= 3) score += 10;
  }

  // Check key storage types (30 points)
  if (data.keyholders.length > 0) {
    const hardwareWalletCount = data.keyholders.filter(k => k.storage_type === 'hardware-wallet').length;
    const paperCount = data.keyholders.filter(k => k.storage_type === 'paper').length;
    const vaultCount = data.keyholders.filter(k => k.storage_type === 'vault').length;

    // Points for secure storage types
    score += Math.min(15, hardwareWalletCount * 5);
    score += Math.min(10, vaultCount * 5);
    score += Math.min(5, paperCount * 2);
  }

  // Check for sharded keys (15 points)
  const shardedKeys = data.keyholders.filter(k => k.is_sharded);
  if (shardedKeys.length > 0) {
    score += Math.min(15, shardedKeys.length * 5);
  }

  // Check key age - fresher is better (15 points)
  if (data.keyholders.length > 0) {
    const avgKeyAge = data.keyholders.reduce((sum, k) => sum + k.key_age_days, 0) / data.keyholders.length;
    if (avgKeyAge < 365) score += 15;
    else if (avgKeyAge < 730) score += 10;
    else if (avgKeyAge < 1095) score += 5;
  }

  return Math.min(maxScore, score);
}

/**
 * Redundancy Score (0-100)
 * Based on: 3-3-3 rule, geographic distribution, key holder count
 */
export function calculateRedundancy(data: LittleShardFile): number {
  let score = 0;
  const maxScore = 100;

  // 3-3-3 Rule (40 points)
  if (data.redundancy.passes_3_3_3_rule) {
    score += 40;
  } else {
    // Partial credit
    if (data.redundancy.device_count >= 3) score += 13;
    if (data.redundancy.location_count >= 3) score += 13;
    if (data.redundancy.person_count >= 3) score += 14;
  }

  // Geographic distribution (30 points)
  const geoCount = data.redundancy.geographic_distribution.length;
  if (geoCount >= 5) score += 30;
  else if (geoCount >= 3) score += 20;
  else if (geoCount >= 2) score += 10;

  // Number of key holders (30 points)
  const keyCount = data.keyholders.length;
  if (keyCount >= 5) score += 30;
  else if (keyCount >= 4) score += 20;
  else if (keyCount >= 3) score += 15;
  else if (keyCount >= 2) score += 10;
  else if (keyCount >= 1) score += 5;

  return Math.min(maxScore, score);
}

/**
 * Liveness Score (0-100)
 * Based on: recent drills, success rate, key rotations
 */
export function calculateLiveness(data: LittleShardFile): number {
  let score = 0;
  const maxScore = 100;

  const now = new Date();

  // Recent drills (50 points)
  if (data.drills.length > 0) {
    const recentDrills = data.drills.filter(d => {
      const drillDate = new Date(d.timestamp);
      const daysSince = (now.getTime() - drillDate.getTime()) / (1000 * 60 * 60 * 24);
      return daysSince <= 365;
    });

    if (recentDrills.length > 0) {
      score += Math.min(30, recentDrills.length * 10);

      // Success rate
      const successRate = recentDrills.filter(d => d.success).length / recentDrills.length;
      score += Math.round(20 * successRate);
    }
  }

  // Key rotations (25 points)
  if (data.rotations.length > 0) {
    const recentRotations = data.rotations.filter(r => {
      const rotationDate = new Date(r.timestamp);
      const daysSince = (now.getTime() - rotationDate.getTime()) / (1000 * 60 * 60 * 24);
      return daysSince <= 730; // 2 years
    });

    if (recentRotations.length > 0) {
      score += Math.min(25, recentRotations.length * 10);
    }
  }

  // Risk analysis recency (25 points)
  if (data.risk_analysis.last_run) {
    const analysisDate = new Date(data.risk_analysis.last_run);
    const daysSince = (now.getTime() - analysisDate.getTime()) / (1000 * 60 * 60 * 24);

    if (daysSince <= 30) score += 25;
    else if (daysSince <= 90) score += 20;
    else if (daysSince <= 180) score += 15;
    else if (daysSince <= 365) score += 10;
  }

  return Math.min(maxScore, score);
}

/**
 * Legal Readiness Score (0-100)
 * Based on: will/trust status, documentation, review recency
 */
export function calculateLegalReadiness(data: LittleShardFile): number {
  let score = 0;
  const maxScore = 100;

  // Has will (30 points)
  if (data.legal_docs.has_will) score += 30;

  // Has trust (30 points)
  if (data.legal_docs.has_trust) score += 30;

  // Has letter of instruction (20 points)
  if (data.legal_docs.has_letter_of_instruction) score += 20;

  // Recent review (20 points)
  const now = new Date();
  const lastReview = new Date(data.legal_docs.last_review);
  const daysSince = (now.getTime() - lastReview.getTime()) / (1000 * 60 * 60 * 24);

  if (daysSince <= 365) score += 20;
  else if (daysSince <= 730) score += 10;

  return Math.min(maxScore, score);
}

/**
 * Education Score (0-100)
 * Based on: heir training, documentation, review schedule
 */
export function calculateEducation(data: LittleShardFile): number {
  let score = 0;
  const maxScore = 100;

  // Heirs trained (40 points)
  if (data.education.heirs_trained) score += 40;

  // Number of trained heirs (30 points)
  const trainedCount = data.education.trained_heirs.length;
  if (trainedCount >= 3) score += 30;
  else if (trainedCount >= 2) score += 20;
  else if (trainedCount >= 1) score += 10;

  // Recent training (30 points)
  const now = new Date();
  const lastTraining = new Date(data.education.last_training);
  const daysSince = (now.getTime() - lastTraining.getTime()) / (1000 * 60 * 60 * 24);

  if (daysSince <= 90) score += 30;
  else if (daysSince <= 180) score += 20;
  else if (daysSince <= 365) score += 10;

  return Math.min(maxScore, score);
}

// ============================================================================
// Trend Calculation
// ============================================================================

/**
 * Calculate score trend based on previous score
 */
function calculateTrend(data: LittleShardFile, currentScore: number): TrendDirection {
  const previousScore = data.keep_score?.value || 0;

  if (currentScore > previousScore + 2) return 'improving';
  if (currentScore < previousScore - 2) return 'declining';
  return 'stable';
}

// ============================================================================
// Recommendations
// ============================================================================

/**
 * Generate prioritized recommendations for score improvement
 */
export function generateRecommendations(
  data: LittleShardFile,
  components: KEEPScoreComponents
): string[] {
  const recommendations: ScoreRecommendation[] = [];

  // Security recommendations
  if (components.security < 80) {
    if (data.wallets.length === 0) {
      recommendations.push({
        priority: 'high',
        category: 'security',
        action: 'Configure a multisig wallet (3-of-5 recommended)',
        expected_improvement: 20,
        effort: 'moderate'
      });
    }

    const hardwareWallets = data.keyholders.filter(k => k.storage_type === 'hardware-wallet').length;
    if (hardwareWallets < 3) {
      recommendations.push({
        priority: 'high',
        category: 'security',
        action: 'Add hardware wallets for secure key storage',
        expected_improvement: 15,
        effort: 'easy'
      });
    }

    const shardedKeys = data.keyholders.filter(k => k.is_sharded).length;
    if (shardedKeys === 0) {
      recommendations.push({
        priority: 'medium',
        category: 'security',
        action: 'Shard critical keys using Shamir Secret Sharing',
        expected_improvement: 10,
        effort: 'moderate'
      });
    }
  }

  // Redundancy recommendations
  if (components.redundancy < 80) {
    if (!data.redundancy.passes_3_3_3_rule) {
      recommendations.push({
        priority: 'high',
        category: 'redundancy',
        action: 'Achieve 3-3-3 rule: 3 devices, 3 locations, 3 people minimum',
        expected_improvement: 20,
        effort: 'moderate'
      });
    }

    if (data.redundancy.geographic_distribution.length < 3) {
      recommendations.push({
        priority: 'medium',
        category: 'redundancy',
        action: 'Distribute keys across at least 3 geographic locations',
        expected_improvement: 15,
        effort: 'moderate'
      });
    }

    if (data.keyholders.length < 5) {
      recommendations.push({
        priority: 'medium',
        category: 'redundancy',
        action: `Add ${5 - data.keyholders.length} more key holders for better resilience`,
        expected_improvement: 10,
        effort: 'easy'
      });
    }
  }

  // Liveness recommendations
  if (components.liveness < 80) {
    if (data.drills.length === 0) {
      recommendations.push({
        priority: 'high',
        category: 'liveness',
        action: 'Perform your first recovery drill',
        expected_improvement: 25,
        effort: 'easy'
      });
    } else {
      const now = new Date();
      const lastDrill = data.drills[data.drills.length - 1];
      const daysSince = (now.getTime() - new Date(lastDrill.timestamp).getTime()) / (1000 * 60 * 60 * 24);

      if (daysSince > 90) {
        recommendations.push({
          priority: 'high',
          category: 'liveness',
          action: 'Schedule quarterly recovery drill (overdue)',
          expected_improvement: 15,
          effort: 'easy'
        });
      }
    }

    if (data.rotations.length === 0) {
      recommendations.push({
        priority: 'low',
        category: 'liveness',
        action: 'Consider annual key rotation for enhanced security',
        expected_improvement: 10,
        effort: 'complex'
      });
    }
  }

  // Legal recommendations
  if (components.legal_readiness < 80) {
    if (!data.legal_docs.has_will) {
      recommendations.push({
        priority: 'high',
        category: 'legal_readiness',
        action: 'Create or update your will to include Bitcoin instructions',
        expected_improvement: 30,
        effort: 'complex'
      });
    }

    if (!data.legal_docs.has_trust) {
      recommendations.push({
        priority: 'medium',
        category: 'legal_readiness',
        action: 'Consider establishing a trust for estate planning',
        expected_improvement: 30,
        effort: 'complex'
      });
    }

    if (!data.legal_docs.has_letter_of_instruction) {
      recommendations.push({
        priority: 'medium',
        category: 'legal_readiness',
        action: 'Write a letter of instruction for your heirs',
        expected_improvement: 20,
        effort: 'easy'
      });
    }
  }

  // Education recommendations
  if (components.education < 80) {
    if (!data.education.heirs_trained) {
      recommendations.push({
        priority: 'high',
        category: 'education',
        action: 'Schedule Bitcoin education session with heirs',
        expected_improvement: 40,
        effort: 'moderate'
      });
    }

    if (data.education.trained_heirs.length < 2) {
      recommendations.push({
        priority: 'medium',
        category: 'education',
        action: 'Train additional heirs on recovery procedures',
        expected_improvement: 20,
        effort: 'moderate'
      });
    }
  }

  // Sort by priority and expected improvement
  recommendations.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    return b.expected_improvement - a.expected_improvement;
  });

  // Return formatted action strings
  return recommendations.map(r => r.action);
}

// ============================================================================
// Score Tracking
// ============================================================================

/**
 * Update Little Shard file with new score
 */
export function updateFileWithScore(data: LittleShardFile): LittleShardFile {
  const newScore = calculateKEEPScore(data);

  return {
    ...data,
    keep_score: newScore,
    last_modified: new Date().toISOString()
  };
}

/**
 * Get score improvement suggestions with expected impact
 */
export function getImprovementPlan(data: LittleShardFile): ScoreRecommendation[] {
  const components = calculateComponents(data);
  const allRecommendations: ScoreRecommendation[] = [];

  // Generate all possible recommendations
  const recommendations = generateRecommendations(data, components);

  // This would be expanded to return the full ScoreRecommendation objects
  // For now, returning a simplified version
  return allRecommendations;
}