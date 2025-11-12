import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

interface AuditAnalysis {
  current_state: {
    keep_score: number;
    holdings: number;
    btc_value: number;
    birs: number;
    tier: string;
    critical_gaps: string[];
  };
  executive: {
    executive_summary: string;
    primary_concern: string;
  };
  security: {
    score: number;
    gaps: string[];
    analysis: string;
  };
  legal: {
    score: number;
    gaps: string[];
    analysis: string;
  };
  access: {
    score: number;
    gaps: string[];
    analysis: string;
  };
  maintenance: {
    score: number;
    gaps: string[];
    analysis: string;
  };
  recommendations: {
    immediate: string[];
    short_term: string[];
    long_term: string[];
  };
}

/**
 * Analyze audit form data using AI
 */
export async function analyzeAudit(formData: any): Promise<AuditAnalysis> {
  // Calculate basic scores from form data
  const scores = calculateBasicScores(formData);

  // Build the analysis prompt
  const prompt = buildAnalysisPrompt(formData, scores);

  try {
    // Call Anthropic API for analysis
    const response = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 4000,
      temperature: 0.3,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    // Parse the AI response
    const aiAnalysis = parseAIResponse(response.content[0]);

    // Combine with calculated scores
    const criticalGaps = identifyCriticalGaps(formData, scores);
    const fullAnalysis: AuditAnalysis = {
      current_state: {
        keep_score: scores.keepScore,
        holdings: formData.btc_value_usd || 100000,
        btc_value: formData.btc_value_usd || 100000,
        birs: calculateBIRS(scores.keepScore, formData.btc_value_usd || 100000),
        tier: getTier(scores.keepScore),
        critical_gaps: criticalGaps
      },
      executive: {
        executive_summary: aiAnalysis.executive_summary || generateExecutiveSummary(formData, scores),
        primary_concern: criticalGaps.length > 0 ? criticalGaps[0] : 'Review complete inheritance framework'
      },
      security: {
        score: scores.security,
        gaps: aiAnalysis.security?.gaps || generateSecurityGaps(formData),
        analysis: aiAnalysis.security?.analysis || generateSecurityAnalysis(formData, scores.security)
      },
      legal: {
        score: scores.legal,
        gaps: aiAnalysis.legal?.gaps || generateLegalGaps(formData),
        analysis: aiAnalysis.legal?.analysis || generateLegalAnalysis(formData, scores.legal)
      },
      access: {
        score: scores.access,
        gaps: aiAnalysis.access?.gaps || generateAccessGaps(formData),
        analysis: aiAnalysis.access?.analysis || generateAccessAnalysis(formData, scores.access)
      },
      maintenance: {
        score: scores.maintenance,
        gaps: aiAnalysis.maintenance?.gaps || generateMaintenanceGaps(formData),
        analysis: aiAnalysis.maintenance?.analysis || generateMaintenanceAnalysis(formData, scores.maintenance)
      },
      recommendations: {
        immediate: aiAnalysis.recommendations?.immediate || generateImmediateRecs(formData, scores),
        short_term: aiAnalysis.recommendations?.short_term || generateShortTermRecs(formData, scores),
        long_term: aiAnalysis.recommendations?.long_term || generateLongTermRecs(formData, scores)
      }
    };

    return fullAnalysis;

  } catch (error) {
    console.error('AI analysis error:', error);
    // Return fallback analysis if AI fails
    return generateFallbackAnalysis(formData, scores);
  }
}

/**
 * Calculate basic scores from form data
 */
function calculateBasicScores(formData: any) {
  let security = 5;
  let legal = 5;
  let access = 5;
  let maintenance = 5;

  // Security scoring
  if (formData.primary_wallet_type === 'single-sig') security -= 2;
  if (formData.primary_wallet_type?.includes('multisig')) security += 2;
  if (formData.number_of_keys >= 3) security += 1;
  if (formData.backup_locations >= 2) security += 1;
  if (formData.cryptographic_proof_created) security += 1;

  // Legal scoring
  if (formData.has_will_or_trust) legal += 2;
  if (formData.bitcoin_explicitly_mentioned) legal += 2;
  if (formData.rufadaa_authority_added) legal += 1;
  if (formData.attorney_name) legal += 1;

  // Access scoring
  if (formData.keyholder_list) access += 1;
  if (formData.access_instructions_format) access += 2;
  if (formData.emergency_contacts_documented) access += 1;
  if (formData.rehearsed_recovery_plan) access += 1;

  // Maintenance scoring
  if (formData.tracks_cost_basis) maintenance += 2;
  if (formData.annual_review_scheduled) maintenance += 2;
  if (formData.timestamped_evidence_exists) maintenance += 1;

  // Normalize scores to 0-10 range
  security = Math.min(10, Math.max(0, security));
  legal = Math.min(10, Math.max(0, legal));
  access = Math.min(10, Math.max(0, access));
  maintenance = Math.min(10, Math.max(0, maintenance));

  // Calculate KEEP score (average of all pillars)
  const keepScore = Math.round((security + legal + access + maintenance) * 2.5);

  return {
    security,
    legal,
    access,
    maintenance,
    keepScore
  };
}

/**
 * Build analysis prompt for AI
 */
function buildAnalysisPrompt(formData: any, scores: any): string {
  return `Analyze this Bitcoin inheritance audit submission and provide detailed insights.

Client Information:
- Name: ${formData.full_name}
- BTC Holdings: $${formData.btc_value_usd || 100000}
- Location: ${formData.location_state}, ${formData.location_country || 'USA'}

Current Setup:
- Wallet Type: ${formData.primary_wallet_type}
- Custody Platform: ${formData.primary_custody_platform}
- Number of Keys: ${formData.number_of_keys}
- Has Will/Trust: ${formData.has_will_or_trust}
- Bitcoin Mentioned in Docs: ${formData.bitcoin_explicitly_mentioned}
- RUFADAA Authority: ${formData.rufadaa_authority_added}

Calculated Scores:
- Security: ${scores.security}/10
- Legal: ${scores.legal}/10
- Access: ${scores.access}/10
- Maintenance: ${scores.maintenance}/10
- KEEP Score: ${scores.keepScore}/100

Please provide:
1. Detailed analysis for each KEEP pillar (Security, Legal, Access, Maintenance)
2. Specific gaps and vulnerabilities identified
3. Actionable recommendations (immediate, short-term, long-term)
4. Executive summary of the inheritance posture

Format your response as structured JSON with sections for each pillar, recommendations, and summary.`;
}

/**
 * Parse AI response into structured format
 */
function parseAIResponse(content: any): any {
  try {
    // If AI returns JSON, parse it
    if (content.type === 'text' && content.text) {
      const jsonMatch = content.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    }
  } catch (error) {
    console.error('Error parsing AI response:', error);
  }

  // Return empty object if parsing fails
  return {};
}

/**
 * Calculate Bitcoin Inheritance Risk Score (BIRS)
 */
function calculateBIRS(keepScore: number, btcValue: number): number {
  // BIRS = Expected loss based on KEEP score
  // Lower KEEP score = Higher risk of loss
  const riskPercentage = (100 - keepScore) / 100;
  return Math.round(btcValue * riskPercentage);
}

/**
 * Get tier based on KEEP score (matches original implementation)
 */
function getTier(keepScore: number): string {
  if (keepScore >= 86) return 'Institutional Grade';
  if (keepScore >= 71) return 'Strong Foundation';
  if (keepScore >= 56) return 'Basic Protection';
  if (keepScore >= 41) return 'Vulnerable';
  return 'Critical Risk';
}

/**
 * Identify critical gaps from form data
 */
function identifyCriticalGaps(formData: any, scores: any): string[] {
  const gaps: string[] = [];

  if (!formData.has_will_or_trust) {
    gaps.push('No will or trust in place');
  }
  if (!formData.bitcoin_explicitly_mentioned) {
    gaps.push('Bitcoin not mentioned in legal documents');
  }
  if (formData.primary_wallet_type === 'single-sig') {
    gaps.push('Single-signature wallet presents single point of failure');
  }
  if (!formData.keyholder_list || formData.number_of_keys < 2) {
    gaps.push('Insufficient key distribution for recovery');
  }
  if (!formData.access_instructions_format) {
    gaps.push('No documented access instructions');
  }

  return gaps;
}

// Gap generation functions
function generateSecurityGaps(formData: any): string[] {
  const gaps: string[] = [];
  if (formData.primary_wallet_type === 'single-sig') {
    gaps.push('Single-signature wallet vulnerability');
  }
  if (formData.backup_locations < 2) {
    gaps.push('Insufficient backup locations');
  }
  if (!formData.cryptographic_proof_created) {
    gaps.push('No cryptographic proof of ownership');
  }
  return gaps;
}

function generateLegalGaps(formData: any): string[] {
  const gaps: string[] = [];
  if (!formData.has_will_or_trust) {
    gaps.push('No estate planning documents');
  }
  if (!formData.bitcoin_explicitly_mentioned) {
    gaps.push('Digital assets not addressed in legal docs');
  }
  if (!formData.rufadaa_authority_added) {
    gaps.push('Missing RUFADAA digital asset authority');
  }
  return gaps;
}

function generateAccessGaps(formData: any): string[] {
  const gaps: string[] = [];
  if (!formData.keyholder_list) {
    gaps.push('Key holders not documented');
  }
  if (!formData.access_instructions_format) {
    gaps.push('No recovery instructions provided');
  }
  if (!formData.rehearsed_recovery_plan) {
    gaps.push('Recovery plan never tested');
  }
  return gaps;
}

function generateMaintenanceGaps(formData: any): string[] {
  const gaps: string[] = [];
  if (!formData.tracks_cost_basis) {
    gaps.push('Cost basis not tracked for tax purposes');
  }
  if (!formData.annual_review_scheduled) {
    gaps.push('No regular review process');
  }
  return gaps;
}

// Analysis generation functions
function generateSecurityAnalysis(formData: any, score: number): string {
  return `Security posture scores ${score}/10. ${
    score < 5 ? 'Critical vulnerabilities detected requiring immediate attention.' :
    score < 8 ? 'Moderate security measures in place with room for improvement.' :
    'Strong security foundation with industry best practices.'
  } Key findings include wallet architecture assessment and backup redundancy evaluation.`;
}

function generateLegalAnalysis(formData: any, score: number): string {
  return `Legal integration scores ${score}/10. ${
    formData.has_will_or_trust ? 'Estate planning documents exist' : 'No formal estate planning'
  }. Bitcoin ${formData.bitcoin_explicitly_mentioned ? 'is' : 'is not'} explicitly mentioned in legal documents. RUFADAA compliance ${
    formData.rufadaa_authority_added ? 'achieved' : 'pending'
  }.`;
}

function generateAccessAnalysis(formData: any, score: number): string {
  return `Access framework scores ${score}/10. Recovery procedures ${
    formData.access_instructions_format ? 'documented' : 'not documented'
  }. ${formData.number_of_keys || 1} key(s) distributed among holders. Emergency protocols ${
    formData.emergency_contacts_documented ? 'established' : 'need development'
  }.`;
}

function generateMaintenanceAnalysis(formData: any, score: number): string {
  return `Maintenance practices score ${score}/10. Cost basis tracking ${
    formData.tracks_cost_basis ? 'active' : 'not implemented'
  }. Regular review cycles ${
    formData.annual_review_scheduled ? 'scheduled' : 'not established'
  }. Documentation currency requires attention.`;
}

// Recommendation generation functions
function generateImmediateRecs(formData: any, scores: any): string[] {
  const recs: string[] = [];
  if (scores.keepScore < 40) {
    recs.push('Schedule emergency planning session');
  }
  if (!formData.has_will_or_trust) {
    recs.push('Consult estate planning attorney immediately');
  }
  if (formData.primary_wallet_type === 'single-sig') {
    recs.push('Implement multisignature wallet architecture');
  }
  return recs;
}

function generateShortTermRecs(formData: any, scores: any): string[] {
  const recs: string[] = [];
  recs.push('Document comprehensive recovery procedures');
  recs.push('Establish key holder coordination protocol');
  recs.push('Create encrypted backup strategy');
  return recs;
}

function generateLongTermRecs(formData: any, scores: any): string[] {
  const recs: string[] = [];
  recs.push('Implement annual review and update cycle');
  recs.push('Develop beneficiary education program');
  recs.push('Create succession planning framework');
  return recs;
}

function generateExecutiveSummary(formData: any, scores: any): string {
  return `Bitcoin inheritance audit reveals a KEEP score of ${scores.keepScore}/100 (${
    getTier(scores.keepScore)
  }). Holdings of $${formData.btc_value_usd || 100000} face expected loss exposure of $${
    calculateBIRS(scores.keepScore, formData.btc_value_usd || 100000)
  }. Primary concerns include ${
    identifyCriticalGaps(formData, scores).slice(0, 2).join(' and ')
  }. Immediate action required to secure inheritance framework.`;
}

/**
 * Generate fallback analysis if AI fails
 */
function generateFallbackAnalysis(formData: any, scores: any): AuditAnalysis {
  const criticalGaps = identifyCriticalGaps(formData, scores);
  return {
    current_state: {
      keep_score: scores.keepScore,
      holdings: formData.btc_value_usd || 100000,
      btc_value: formData.btc_value_usd || 100000,
      birs: calculateBIRS(scores.keepScore, formData.btc_value_usd || 100000),
      tier: getTier(scores.keepScore),
      critical_gaps: criticalGaps
    },
    executive: {
      executive_summary: generateExecutiveSummary(formData, scores),
      primary_concern: criticalGaps.length > 0 ? criticalGaps[0] : 'Review complete inheritance framework'
    },
    security: {
      score: scores.security,
      gaps: generateSecurityGaps(formData),
      analysis: generateSecurityAnalysis(formData, scores.security)
    },
    legal: {
      score: scores.legal,
      gaps: generateLegalGaps(formData),
      analysis: generateLegalAnalysis(formData, scores.legal)
    },
    access: {
      score: scores.access,
      gaps: generateAccessGaps(formData),
      analysis: generateAccessAnalysis(formData, scores.access)
    },
    maintenance: {
      score: scores.maintenance,
      gaps: generateMaintenanceGaps(formData),
      analysis: generateMaintenanceAnalysis(formData, scores.maintenance)
    },
    recommendations: {
      immediate: generateImmediateRecs(formData, scores),
      short_term: generateShortTermRecs(formData, scores),
      long_term: generateLongTermRecs(formData, scores)
    }
  };
}