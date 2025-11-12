import { NextRequest, NextResponse } from 'next/server';

// API authentication
const API_KEY = process.env.AUDIT_API_KEY || 'btc-inherit-2024-secure';

// Shared job storage (same as used in audit/analyze)
const jobStore = new Map<string, any>();

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
    const listAll = searchParams.get('listAll');

    // If listing all jobs
    if (listAll === 'true') {
      const jobs = Array.from(jobStore.entries()).map(([id, data]) => ({
        id,
        status: data.status,
        createdAt: data.createdAt,
        completedAt: data.completedAt,
        failedAt: data.failedAt
      }));

      return NextResponse.json({
        jobs,
        total: jobs.length
      });
    }

    // Single job lookup
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
    console.error('Job status error:', error);
    return NextResponse.json(
      { error: 'Job status check failed' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
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
    const clearAll = searchParams.get('clearAll');

    // Clear all jobs
    if (clearAll === 'true') {
      const count = jobStore.size;
      jobStore.clear();
      return NextResponse.json({
        message: 'All jobs cleared',
        cleared: count
      });
    }

    // Delete single job
    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID required' },
        { status: 400 }
      );
    }

    if (!jobStore.has(jobId)) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    jobStore.delete(jobId);
    return NextResponse.json({
      message: 'Job deleted',
      jobId
    });

  } catch (error) {
    console.error('Job deletion error:', error);
    return NextResponse.json(
      { error: 'Job deletion failed' },
      { status: 500 }
    );
  }
}