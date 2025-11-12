import { NextRequest, NextResponse } from 'next/server';
import { analyzeAudit } from '@/lib/audit/analyzer';
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
    const formData = await request.json();

    // Generate job ID
    const jobId = `job-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    // Store initial job status
    await saveJob(jobId, {
      status: 'processing',
      createdAt: new Date().toISOString(),
      data: null,
      error: null
    });

    // Process async (don't await)
    processAnalysis(jobId, formData);

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

// Async processing function
async function processAnalysis(jobId: string, formData: any) {
  try {
    // Perform the analysis
    const analysis = await analyzeAudit(formData);

    // Get existing job data
    const existingJob = await getJob(jobId);

    // Update job status
    await saveJob(jobId, {
      status: 'completed',
      createdAt: existingJob?.createdAt || new Date().toISOString(),
      completedAt: new Date().toISOString(),
      data: analysis,
      error: null
    });

    // Clean up old jobs (keep last 100)
    await cleanupOldJobs(100);

  } catch (error) {
    // Get existing job data
    const existingJob = await getJob(jobId);

    // Update job status with error
    await saveJob(jobId, {
      status: 'failed',
      createdAt: existingJob?.createdAt || new Date().toISOString(),
      failedAt: new Date().toISOString(),
      data: null,
      error: error instanceof Error ? error.message : 'Analysis failed'
    });
  }
}