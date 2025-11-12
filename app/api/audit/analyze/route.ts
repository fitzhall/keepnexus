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

    console.log(`[Job ${jobId}] Creating initial job status...`);

    // Store initial job status
    await saveJob(jobId, {
      status: 'processing',
      createdAt: new Date().toISOString(),
      data: null,
      error: null
    });

    console.log(`[Job ${jobId}] Job created in Airtable, starting background analysis...`);

    // Process async (don't await) - wrap to catch unhandled rejections
    processAnalysis(jobId, formData).catch(err => {
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

// Async processing function
async function processAnalysis(jobId: string, formData: any) {
  const startTime = Date.now();
  console.log(`[Job ${jobId}] Background processing started`);

  try {
    console.log(`[Job ${jobId}] Calling analyzeAudit...`);

    // Perform the analysis
    const analysis = await analyzeAudit(formData);

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`[Job ${jobId}] Analysis completed in ${duration}s`);

    // Get existing job data
    console.log(`[Job ${jobId}] Retrieving existing job data from Airtable...`);
    const existingJob = await getJob(jobId);

    console.log(`[Job ${jobId}] Updating job status to completed...`);

    // Update job status
    await saveJob(jobId, {
      status: 'completed',
      createdAt: existingJob?.createdAt || new Date().toISOString(),
      completedAt: new Date().toISOString(),
      data: analysis,
      error: null
    });

    console.log(`[Job ${jobId}] ✓ Job completed successfully`);

    // Clean up old jobs (keep last 100)
    await cleanupOldJobs(100);

  } catch (error) {
    console.error(`[Job ${jobId}] ✗ Processing failed:`, error);
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
      data: null,
      error: error instanceof Error ? error.message : 'Analysis failed'
    });

    console.log(`[Job ${jobId}] Job marked as failed in Airtable`);
  }
}