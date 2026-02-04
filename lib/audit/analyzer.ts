import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

// ============================================
// TYPES
// ============================================

export interface ExecutiveAnalysis {
  executive_summary: string;
  primary_concern: string;
  urgency_factor: string;
  key_insight: string;
}

export interface PillarAnalysis {
  analysis: string;
  gaps: string[];
  score: number;
  weight: string;
}

export interface PatternsAnalysis {
  systemic_patterns: string;
  compound_risks: string;
  critical_vulnerability: string;
}

export interface ActionItem {
  priority: string;
  action: string;
  rationale: string;
  steps: string;
  timeline: string;
  impact: string;
}

export interface ActionPlan {
  priority_actions: ActionItem[];
  roadmap: {
    immediate: string[];
    month_1: string[];
    quarter_1: string[];
  };
  gap_coverage: string;
}

export interface RiskScenario {
  title: string;
  trigger: string;
  cascade: string;
  outcome: string;
  prevention: string;
}

export interface ScenariosAnalysis {
  scenarios: RiskScenario[];
}

// ============================================
// KEEP FRAMEWORK CONTEXT
// ============================================

const KEEP_FRAMEWORK = `KEEP Framework measures Bitcoin inheritance readiness:
- K(30%): Key Security - Private key storage, distribution, backups
- E(25%): Estate Legal - Wills, trusts, Bitcoin integration
- E(25%): Emergency Access - Family's ability to recover
- P(20%): Perpetual Maintenance - Reviews, updates, succession

Scoring Tiers:
- 86-100: Institutional Grade (minimal risk)
- 71-85: Strong Foundation (low risk)
- 51-70: Exposed (moderate risk)
- 31-50: Major Gaps (high risk)
- 0-30: Critical Risk (extreme risk)

BIRS (Bitcoin Inheritance Risk Score) = Holdings × (1-Score/100) = potential loss in dollars

The 9 Critical Questions (0-3 scale):
Q1-3: Security pillar (key distribution, backups, awareness)
Q4-5: Legal pillar (integration, governance)
Q6-7: Access pillar (emergency protocols, testing)
Q8-9: Maintenance pillar (succession, reviews)`;

// ============================================
// STAGE 1: EXECUTIVE SUMMARY
// ============================================

export async function analyzeExecutive(
  fullData: any,
  keepScore: number,
  birs: number
): Promise<ExecutiveAnalysis> {
  const prompt = `${KEEP_FRAMEWORK}

Analyze ${fullData.full_name}'s Bitcoin inheritance readiness:
- Holdings: $${fullData.btc_value_usd?.toLocaleString()}
- KEEP Score: ${keepScore}/100 (${getTier(keepScore)})
- Risk (BIRS): $${Math.round(birs).toLocaleString()}
- Setup: ${fullData.primary_wallet_type} on ${fullData.primary_custody_platform}
- Family: ${fullData.family_status}, Age: ${fullData.age_bracket}

Provide executive analysis in JSON:
{
  "executive_summary": "3-4 sentences capturing overall readiness and critical issues",
  "primary_concern": "Single most important issue to address",
  "urgency_factor": "Why immediate action is needed",
  "key_insight": "Most important pattern or observation"
}`;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 800,
    system: "You are a Bitcoin inheritance expert. Return only valid JSON.",
    messages: [{ role: 'user', content: prompt }]
  });

  return parseJSON(extractTextFromResponse(response));
}

// ============================================
// STAGE 2-5: PILLAR ANALYSIS
// ============================================

export async function analyzePillar(
  pillarName: string,
  fullData: any,
  pillarScores: any,
  context?: any
): Promise<PillarAnalysis> {
  const pillarDetails = getPillarDetails(pillarName, fullData, pillarScores);

  let contextInfo = '';
  if (context) {
    contextInfo = `\nContext from previous analysis:\n`;
    if (context.executive) contextInfo += `- Primary concern: ${context.executive.primary_concern}\n`;
    if (context.security) contextInfo += `- Security gaps: ${context.security.gaps?.join('; ')}\n`;
    if (context.legal) contextInfo += `- Legal gaps: ${context.legal.gaps?.join('; ')}\n`;
  }

  const prompt = `${KEEP_FRAMEWORK}
${contextInfo}

Analyze the ${pillarName.toUpperCase()} pillar:
${pillarDetails}

Return JSON:
{
  "analysis": "3-4 sentences on this pillar's impact on inheritance",
  "gaps": ["2-3 specific gaps"],
  "score": ${pillarScores[getPillarKey(pillarName)]},
  "weight": "${getPillarWeight(pillarName)}"
}`;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 600,
    system: "You are a Bitcoin inheritance expert. Return only valid JSON.",
    messages: [{ role: 'user', content: prompt }]
  });

  return parseJSON(extractTextFromResponse(response));
}

// ============================================
// STAGE 6: PATTERNS ANALYSIS
// ============================================

export async function analyzePatterns(pillars: {
  security?: PillarAnalysis;
  legal?: PillarAnalysis;
  access?: PillarAnalysis;
  maintenance?: PillarAnalysis;
}): Promise<PatternsAnalysis> {
  const allGaps = [
    ...(pillars.security?.gaps || []),
    ...(pillars.legal?.gaps || []),
    ...(pillars.access?.gaps || []),
    ...(pillars.maintenance?.gaps || [])
  ];

  const prompt = `Based on these gaps across all KEEP pillars:
${allGaps.join('\n')}

Identify patterns in JSON:
{
  "systemic_patterns": "Overall patterns across pillars",
  "compound_risks": "How gaps compound each other",
  "critical_vulnerability": "Most dangerous combination"
}`;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 500,
    system: "You are a Bitcoin inheritance expert. Return only valid JSON.",
    messages: [{ role: 'user', content: prompt }]
  });

  return parseJSON(extractTextFromResponse(response));
}

// ============================================
// STAGE 7: ACTION PLAN
// ============================================

export async function createActionPlan(
  fullData: any,
  keepScore: number,
  birs: number,
  context: {
    executive: ExecutiveAnalysis;
    security?: PillarAnalysis;
    legal?: PillarAnalysis;
    access?: PillarAnalysis;
    maintenance?: PillarAnalysis;
    patterns?: PatternsAnalysis;
  }
): Promise<ActionPlan> {
  // Dynamic action count based on severity
  const getActionGuidance = (score: number) => {
    if (score < 30) return {
      count: "7-10 critical actions",
      urgency: "EMERGENCY - Every gap is a critical failure point"
    };
    if (score < 50) return {
      count: "5-7 priority actions",
      urgency: "HIGH RISK - Multiple serious vulnerabilities"
    };
    if (score < 70) return {
      count: "3-5 targeted actions",
      urgency: "MODERATE - Key improvements needed"
    };
    return {
      count: "2-3 refinements",
      urgency: "GOOD - Minor optimizations only"
    };
  };

  const guidance = getActionGuidance(keepScore);

  // Count actual gaps identified
  const gapCount = [
    ...(context.security?.gaps || []),
    ...(context.legal?.gaps || []),
    ...(context.access?.gaps || []),
    ...(context.maintenance?.gaps || [])
  ].length;

  // Determine exact number of actions to generate
  const actionCount = Math.min(10, Math.max(2, gapCount)); // Cap at 10, minimum 2

  const prompt = `Based on complete analysis of ${fullData.full_name}'s Bitcoin inheritance:
- Current: ${keepScore}/100 (${getTier(keepScore)})
- Risk: $${Math.round(birs).toLocaleString()}
- Primary concern: ${context.executive.primary_concern}
- Identified gaps: ${gapCount} critical issues found
- Severity: ${guidance.urgency}

Create dynamic action plan with EXACTLY ${actionCount} priority actions.

Each gap found:
${[...(context.security?.gaps || []), ...(context.legal?.gaps || []), ...(context.access?.gaps || []), ...(context.maintenance?.gaps || [])].map((gap, i) => `${i+1}. ${gap}`).join('\n')}

Generate ${actionCount} actions addressing the most critical gaps.

Return JSON:
{
  "priority_actions": [
    {
      "priority": "High",
      "action": "Action title addressing gap",
      "rationale": "How this fixes the gap",
      "timeline": "Immediate/This Week/This Month"
    }
  ],
  "roadmap": {
    "immediate": ["First 1-2 action titles"],
    "month_1": ["Next 2-3 action titles"],
    "quarter_1": ["Remaining action titles"]
  },
  "gap_coverage": "${actionCount} of ${gapCount} critical gaps addressed"
}`;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 2000,
    system: "You are a Bitcoin inheritance expert. Return only valid JSON.",
    messages: [{ role: 'user', content: prompt }]
  });

  return parseJSON(extractTextFromResponse(response));
}

// ============================================
// STAGE 8: RISK SCENARIOS
// ============================================

export async function createScenarios(
  fullData: any,
  keepScore: number,
  context: {
    executive: ExecutiveAnalysis;
    patterns?: PatternsAnalysis;
  }
): Promise<ScenariosAnalysis> {
  const prompt = `Create 2 risk scenarios for ${fullData.full_name} (KEEP score: ${keepScore}/100):

Consider:
- Primary concern: ${context.executive.primary_concern}
- Patterns: ${context.patterns?.systemic_patterns}

Return JSON:
{
  "scenarios": [
    {
      "title": "Scenario name",
      "trigger": "What causes it",
      "cascade": "How it unfolds",
      "outcome": "Final result",
      "prevention": "How to prevent"
    }
  ]
}`;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 800,
    system: "You are a Bitcoin inheritance expert. Return only valid JSON.",
    messages: [{ role: 'user', content: prompt }]
  });

  return parseJSON(extractTextFromResponse(response));
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function extractTextFromResponse(response: any): string {
  const textBlock = response.content.find((block: any) => block.type === 'text');
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('No text response from AI');
  }
  return textBlock.text;
}

function parseJSON(text: string): any {
  const cleaned = text.replace(/```json\n?/gi, '').replace(/```\n?/gi, '').trim();

  const match = cleaned.match(/\{(?:[^{}]|(?:\{(?:[^{}]|(?:\{[^{}]*\})*)*\}))*\}/);
  if (match) {
    try {
      return JSON.parse(match[0]);
    } catch (e) {
      // Continue
    }
  }

  try {
    return JSON.parse(cleaned);
  } catch (error) {
    console.error('JSON parse failed:', error);
    throw new Error(`Failed to parse AI response: ${text.substring(0, 200)}...`);
  }
}

export function getTier(score: number): string {
  if (score >= 86) return 'Institutional Grade';
  if (score >= 71) return 'Strong Foundation';
  if (score >= 51) return 'Exposed';
  if (score >= 31) return 'Major Gaps';
  return 'Critical Risk';
}

function getPillarDetails(pillar: string, fullData: any, scores: any): string {
  const details: Record<string, string> = {
    security: `Score: ${scores.secure}/10 (30% weight)
Wallet: ${fullData.primary_wallet_type}
Key distribution: ${fullData.q1_key_distribution}/3
Backup strategy: ${fullData.q2_backup_strategy}/3
Awareness: ${fullData.q3_keyholder_awareness}/3`,

    legal: `Score: ${scores.legal}/10 (25% weight)
Has will/trust: ${fullData.has_will_or_trust}
Bitcoin mentioned: ${fullData.bitcoin_explicitly_mentioned}
Integration: ${fullData.q4_legal_integration}/3
Governance: ${fullData.q5_governance_alignment}/3`,

    access: `Score: ${scores.access}/10 (25% weight)
Emergency access: ${fullData.q6_emergency_access}/3
Testing: ${fullData.q7_inheritance_testing}/3
Who can access: ${fullData.who_can_access_today}`,

    maintenance: `Score: ${scores.maintenance || scores.future}/10 (20% weight)
Succession: ${fullData.q8_succession_planning}/3
Reviews: ${fullData.q9_governance_reviews}/3
Last update: ${fullData.last_estate_plan_update || 'Unknown'}`
  };

  return details[pillar] || '';
}

function getPillarKey(pillar: string): string {
  const keys: Record<string, string> = {
    security: 'secure',
    legal: 'legal',
    access: 'access',
    maintenance: 'future'
  };
  return keys[pillar] || pillar;
}

function getPillarWeight(pillar: string): string {
  const weights: Record<string, string> = {
    security: '30%',
    legal: '25%',
    access: '25%',
    maintenance: '20%'
  };
  return weights[pillar] || '0%';
}
