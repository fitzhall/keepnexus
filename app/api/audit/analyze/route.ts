import { NextRequest, NextResponse } from 'next/server';
import {
  analyzeExecutive,
  analyzePillar,
  analyzePatterns,
  createActionPlan,
  createScenarios,
  getTier,
  ExecutiveAnalysis,
  PillarAnalysis,
  PatternsAnalysis,
  ActionPlan,
  ScenariosAnalysis
} from '@/lib/audit/analyzer';
import { saveJob, getJob, cleanupOldJobs } from '@/lib/audit/job-storage';

// API authentication
const API_KEY = process.env.AUDIT_API_KEY || 'btc-inherit-2024-secure';

export async function POST(request: NextRequest) {
  try {
    // Check API key
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || authHeader !== `Bearer ${API_KEY}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const requestBody = await request.json();

    // Admin sends: { fullData, pillarScores, keepScore, birs }
    // Extract all components
    const { fullData, pillarScores, keepScore, birs } = requestBody;

    if (!fullData) {
      return NextResponse.json(
        { error: 'Missing fullData in request' },
        { status: 400 }
      );
    }

    // Generate job ID
    const jobId = `job-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    console.log(`[Job ${jobId}] Creating initial job status...`);

    // Store initial job status with section tracking
    await saveJob(jobId, {
      status: 'processing',
      createdAt: new Date().toISOString(),
      progress: 0,
      sections: {
        executive: { status: 'pending' },
        security: { status: 'pending' },
        legal: { status: 'pending' },
        access: { status: 'pending' },
        maintenance: { status: 'pending' },
        patterns: { status: 'pending' },
        actions: { status: 'pending' },
        scenarios: { status: 'pending' }
      },
      results: {},
      data: null,
      error: null
    });

    console.log(`[Job ${jobId}] Job created in Airtable, starting background analysis...`);

    // Process async (don't await) - wrap to catch unhandled rejections
    processAnalysis(jobId, { fullData, pillarScores, keepScore, birs }).catch(err => {
      console.error(`[Job ${jobId}] Unhandled error in background process:`, err);
    });

    // Return job ID immediately
    return NextResponse.json({
      jobId,
      status: 'processing',
      message: 'Analysis started'
    });

  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: 'Analysis failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// GET endpoint to check job status
export async function GET(request: NextRequest) {
  try {
    // Check API key
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || authHeader !== `Bearer ${API_KEY}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get job ID from query params
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');

    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID required' },
        { status: 400 }
      );
    }

    const job = await getJob(jobId);
    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(job);

  } catch (error) {
    console.error('Status check error:', error);
    return NextResponse.json(
      { error: 'Status check failed' },
      { status: 500 }
    );
  }
}

// ============================================
// ASYNC PROCESSING - 8 STAGES
// ============================================

async function processAnalysis(jobId: string, payload: {
  fullData: any;
  pillarScores: any;
  keepScore: number;
  birs: number;
}) {
  const startTime = Date.now();
  console.log(`[Job ${jobId}] Background processing started`);

  const { fullData, pillarScores, keepScore, birs } = payload;

  try {
    // STAGE 1: Executive Summary
    console.log(`[Job ${jobId}] Stage 1/8: Executive Summary`);
    await updateJobSection(jobId, 'executive', 'processing');
    const executive = await analyzeExecutive(fullData, keepScore, birs);
    await saveJobResult(jobId, 'executive', executive);
    console.log(`[Job ${jobId}] ✓ Executive complete`);

    // STAGE 2: Security Pillar
    console.log(`[Job ${jobId}] Stage 2/8: Security Analysis`);
    await updateJobSection(jobId, 'security', 'processing');
    const security = await analyzePillar('security', fullData, pillarScores, { executive });
    await saveJobResult(jobId, 'security', security);
    console.log(`[Job ${jobId}] ✓ Security complete`);

    // STAGE 3: Legal Pillar
    console.log(`[Job ${jobId}] Stage 3/8: Legal Analysis`);
    await updateJobSection(jobId, 'legal', 'processing');
    const legal = await analyzePillar('legal', fullData, pillarScores, { executive, security });
    await saveJobResult(jobId, 'legal', legal);
    console.log(`[Job ${jobId}] ✓ Legal complete`);

    // STAGE 4: Access Pillar
    console.log(`[Job ${jobId}] Stage 4/8: Access Analysis`);
    await updateJobSection(jobId, 'access', 'processing');
    const access = await analyzePillar('access', fullData, pillarScores, { executive, security, legal });
    await saveJobResult(jobId, 'access', access);
    console.log(`[Job ${jobId}] ✓ Access complete`);

    // STAGE 5: Maintenance Pillar
    console.log(`[Job ${jobId}] Stage 5/8: Maintenance Analysis`);
    await updateJobSection(jobId, 'maintenance', 'processing');
    const maintenance = await analyzePillar('maintenance', fullData, pillarScores, { executive, security, legal, access });
    await saveJobResult(jobId, 'maintenance', maintenance);
    console.log(`[Job ${jobId}] ✓ Maintenance complete`);

    // STAGE 6: Patterns Analysis
    console.log(`[Job ${jobId}] Stage 6/8: Patterns Analysis`);
    await updateJobSection(jobId, 'patterns', 'processing');
    const patterns = await analyzePatterns({ security, legal, access, maintenance });
    await saveJobResult(jobId, 'patterns', patterns);
    console.log(`[Job ${jobId}] ✓ Patterns complete`);

    // STAGE 7: Action Plan
    console.log(`[Job ${jobId}] Stage 7/8: Action Plan`);
    await updateJobSection(jobId, 'actions', 'processing');
    const actions = await createActionPlan(fullData, keepScore, birs, {
      executive,
      security,
      legal,
      access,
      maintenance,
      patterns
    });
    await saveJobResult(jobId, 'actions', actions);
    console.log(`[Job ${jobId}] ✓ Actions complete`);

    // STAGE 8: Risk Scenarios
    console.log(`[Job ${jobId}] Stage 8/8: Risk Scenarios`);
    await updateJobSection(jobId, 'scenarios', 'processing');
    const scenarios = await createScenarios(fullData, keepScore, { executive, patterns });
    await saveJobResult(jobId, 'scenarios', scenarios);
    console.log(`[Job ${jobId}] ✓ Scenarios complete`);

    // Build final analysis combining all stages
    const finalAnalysis = buildFinalAnalysis({
      fullData,
      keepScore,
      birs,
      executive,
      security,
      legal,
      access,
      maintenance,
      patterns,
      actions,
      scenarios
    });

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`[Job ${jobId}] All stages complete in ${duration}s`);

    // Get existing job data
    const existingJob = await getJob(jobId);

    // Update job status with complete results
    await saveJob(jobId, {
      status: 'completed',
      createdAt: existingJob?.createdAt || new Date().toISOString(),
      completedAt: new Date().toISOString(),
      progress: 100,
      sections: existingJob?.sections || {},
      results: existingJob?.results || {},
      data: finalAnalysis,
      error: null
    });

    console.log(`[Job ${jobId}] ✅ Job completed successfully`);

    // Clean up old jobs (keep last 100)
    await cleanupOldJobs(100);

  } catch (error) {
    console.error(`[Job ${jobId}] ❌ Processing failed:`, error);
    console.error(`[Job ${jobId}] Error details:`, {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });

    // Get existing job data
    const existingJob = await getJob(jobId);

    // Update job status with error
    await saveJob(jobId, {
      status: 'failed',
      createdAt: existingJob?.createdAt || new Date().toISOString(),
      failedAt: new Date().toISOString(),
      progress: 0,
      sections: existingJob?.sections || {},
      results: existingJob?.results || {},
      data: null,
      error: error instanceof Error ? error.message : 'Analysis failed'
    });

    console.log(`[Job ${jobId}] Job marked as failed in Airtable`);
  }
}

// Update job section status
async function updateJobSection(jobId: string, section: string, status: 'pending' | 'processing' | 'completed') {
  const job = await getJob(jobId);
  if (!job) return;

  const sections = job.sections || {};
  sections[section] = { status, updated: new Date().toISOString() };

  // Calculate progress
  const totalSections = 8;
  const completedSections = Object.values(sections).filter((s: any) => s.status === 'completed').length;
  const progress = Math.round((completedSections / totalSections) * 100);

  await saveJob(jobId, {
    ...job,
    sections,
    progress
  });
}

// Save result for a section
async function saveJobResult(jobId: string, section: string, result: any) {
  const job = await getJob(jobId);
  if (!job) return;

  const sections = job.sections || {};
  sections[section] = { status: 'completed', completed: new Date().toISOString() };

  const results = job.results || {};
  results[section] = result;

  // Calculate progress
  const totalSections = 8;
  const completedSections = Object.values(sections).filter((s: any) => s.status === 'completed').length;
  const progress = Math.round((completedSections / totalSections) * 100);

  await saveJob(jobId, {
    ...job,
    sections,
    results,
    progress
  });
}

// Build final analysis from all stages
function buildFinalAnalysis(data: {
  fullData: any;
  keepScore: number;
  birs: number;
  executive: ExecutiveAnalysis;
  security: PillarAnalysis;
  legal: PillarAnalysis;
  access: PillarAnalysis;
  maintenance: PillarAnalysis;
  patterns: PatternsAnalysis;
  actions: ActionPlan;
  scenarios: ScenariosAnalysis;
}) {
  const { fullData, keepScore, birs, executive, security, legal, access, maintenance, patterns, actions, scenarios } = data;

  return {
    framework: 'KEEP Analysis',
    client: fullData.full_name || 'Bitcoin Holder',
    generated: new Date().toISOString(),

    current_state: {
      keep_score: keepScore,
      tier: getTier(keepScore),
      birs: Math.round(birs),
      holdings: fullData.btc_value_usd,
      btc_value: fullData.btc_value_usd,
      tier_description: getTierDescription(keepScore),
      tier_range: getTierRange(keepScore),
      success_rate: Math.max(5, Math.min(95, keepScore)),
      birs_percentage: Math.round((birs / fullData.btc_value_usd) * 100)
    },

    executive: {
      executive_summary: executive.executive_summary,
      primary_concern: executive.primary_concern,
      urgency_factor: executive.urgency_factor,
      key_insight: executive.key_insight
    },

    security: {
      score: security.score,
      tier: getPillarTier(security.score),
      risk_level: getPillarRiskLevel(security.score),
      gaps: security.gaps,
      analysis: security.analysis,
      weight: '30%'
    },

    legal: {
      score: legal.score,
      tier: getPillarTier(legal.score),
      risk_level: getPillarRiskLevel(legal.score),
      gaps: legal.gaps,
      analysis: legal.analysis,
      weight: '25%'
    },

    access: {
      score: access.score,
      tier: getPillarTier(access.score),
      risk_level: getPillarRiskLevel(access.score),
      gaps: access.gaps,
      analysis: access.analysis,
      weight: '25%'
    },

    maintenance: {
      score: maintenance.score,
      tier: getPillarTier(maintenance.score),
      risk_level: getPillarRiskLevel(maintenance.score),
      gaps: maintenance.gaps,
      analysis: maintenance.analysis,
      weight: '20%'
    },

    patterns: {
      systemic_patterns: patterns.systemic_patterns,
      compound_risks: patterns.compound_risks,
      critical_vulnerability: patterns.critical_vulnerability
    },

    actions: {
      priority_actions: actions.priority_actions,
      roadmap: actions.roadmap,
      gap_coverage: actions.gap_coverage
    },

    scenarios: {
      scenarios: scenarios.scenarios
    },

    // Legacy compatibility fields
    recommendations: {
      immediate: (actions.priority_actions || [])
        .filter(a => a.priority === 'High')
        .map(a => a.action),
      short_term: (actions.priority_actions || [])
        .filter(a => a.priority === 'Medium')
        .map(a => a.action),
      long_term: (actions.priority_actions || [])
        .filter(a => a.priority === 'Low')
        .map(a => a.action)
    }
  };
}

function getTierDescription(keepScore: number): string {
  if (keepScore >= 86) return '95%+ inheritance success rate';
  if (keepScore >= 71) return '70-94% inheritance success rate';
  if (keepScore >= 51) return '40-69% inheritance success rate';
  if (keepScore >= 31) return '10-39% inheritance success rate';
  return '<10% inheritance success rate';
}

function getTierRange(keepScore: number): string {
  if (keepScore >= 86) return '86-100';
  if (keepScore >= 71) return '71-85';
  if (keepScore >= 51) return '51-70';
  if (keepScore >= 31) return '31-50';
  return '0-30';
}

function getPillarTier(score: number): string {
  if (score >= 8.6) return 'Secure';
  if (score >= 7.1) return 'Attention';
  if (score >= 5.6) return 'Elevated';
  if (score >= 4.1) return 'Vulnerable';
  return 'Critical';
}

function getPillarRiskLevel(score: number): string {
  if (score >= 8.6) return 'Low Risk';
  if (score >= 7.1) return 'Moderate Risk';
  if (score >= 5.6) return 'Elevated Risk';
  if (score >= 4.1) return 'High Risk';
  return 'Critical Risk';
}
