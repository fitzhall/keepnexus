import { NextRequest, NextResponse } from 'next/server';
import { analyzeAudit } from '@/lib/audit/analyzer';

// Simple in-memory storage for jobs
const jobStore = new Map<string, any>();

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
    jobStore.set(jobId, {
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

    const job = jobStore.get(jobId);
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

    // Update job status
    jobStore.set(jobId, {
      status: 'completed',
      createdAt: jobStore.get(jobId)?.createdAt,
      completedAt: new Date().toISOString(),
      data: analysis,
      error: null
    });

    // Clean up old jobs (keep last 100)
    if (jobStore.size > 100) {
      const sortedJobs = Array.from(jobStore.entries())
        .sort((a, b) => a[0].localeCompare(b[0]));

      // Remove oldest jobs
      while (jobStore.size > 100) {
        const [oldestJobId] = sortedJobs.shift()!;
        jobStore.delete(oldestJobId);
      }
    }

  } catch (error) {
    // Update job status with error
    jobStore.set(jobId, {
      status: 'failed',
      createdAt: jobStore.get(jobId)?.createdAt,
      failedAt: new Date().toISOString(),
      data: null,
      error: error instanceof Error ? error.message : 'Analysis failed'
    });
  }
}