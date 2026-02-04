import { NextRequest, NextResponse } from 'next/server';
import { getJob, listJobs, deleteJob } from '@/lib/audit/job-storage';

// API authentication
const API_KEY = process.env.AUDIT_API_KEY || 'btc-inherit-2024-secure';

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
      const jobIds = await listJobs();
      const jobs = await Promise.all(
        jobIds.map(async (id) => {
          const data = await getJob(id);
          return {
            id,
            status: data?.status,
            createdAt: data?.createdAt,
            completedAt: data?.completedAt,
            failedAt: data?.failedAt
          };
        })
      );

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

    const job = await getJob(jobId);
    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    // Calculate section progress for frontend progress bar
    const sections = job.sections || {};
    const totalSections = 8; // executive, security, legal, access, maintenance, patterns, actions, scenarios
    const completedSections = Object.values(sections).filter((s: any) => s?.status === 'completed').length;

    return NextResponse.json({
      ...job,
      sectionsCompleted: completedSections,
      sectionsTotal: totalSections
    });

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
      const jobIds = await listJobs();
      const count = jobIds.length;
      await Promise.all(jobIds.map(id => deleteJob(id)));
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

    const job = await getJob(jobId);
    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    await deleteJob(jobId);
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