/**
 * Job Storage - File-based job persistence for serverless
 * Uses /tmp directory (writable on Vercel)
 */

import { promises as fs } from 'fs';
import path from 'path';

const JOBS_DIR = path.join('/tmp', 'jobs');

// Ensure jobs directory exists
async function ensureJobsDir() {
  try {
    await fs.mkdir(JOBS_DIR, { recursive: true });
  } catch (error) {
    // Directory might already exist, that's fine
  }
}

/**
 * Save job to file
 */
export async function saveJob(jobId: string, jobData: any): Promise<void> {
  await ensureJobsDir();
  const jobPath = path.join(JOBS_DIR, `${jobId}.json`);
  await fs.writeFile(jobPath, JSON.stringify(jobData, null, 2), 'utf-8');
}

/**
 * Get job from file
 */
export async function getJob(jobId: string): Promise<any | null> {
  try {
    const jobPath = path.join(JOBS_DIR, `${jobId}.json`);
    const data = await fs.readFile(jobPath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // Job not found or read error
    return null;
  }
}

/**
 * Delete job file
 */
export async function deleteJob(jobId: string): Promise<void> {
  try {
    const jobPath = path.join(JOBS_DIR, `${jobId}.json`);
    await fs.unlink(jobPath);
  } catch (error) {
    // File might not exist, that's fine
  }
}

/**
 * List all job IDs
 */
export async function listJobs(): Promise<string[]> {
  try {
    await ensureJobsDir();
    const files = await fs.readdir(JOBS_DIR);
    return files
      .filter(f => f.endsWith('.json'))
      .map(f => f.replace('.json', ''));
  } catch (error) {
    return [];
  }
}

/**
 * Clean up old jobs (keep last N)
 */
export async function cleanupOldJobs(keep: number = 100): Promise<void> {
  try {
    const jobs = await listJobs();

    if (jobs.length <= keep) {
      return;
    }

    // Sort by job ID (which includes timestamp)
    const sortedJobs = jobs.sort();

    // Delete oldest jobs
    const toDelete = sortedJobs.slice(0, jobs.length - keep);
    await Promise.all(toDelete.map(jobId => deleteJob(jobId)));
  } catch (error) {
    console.error('Failed to cleanup old jobs:', error);
  }
}
