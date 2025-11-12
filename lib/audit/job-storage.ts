/**
 * Job Storage - Airtable-based job persistence for serverless
 * Uses Airtable to persist jobs across serverless invocations
 */

// Airtable configuration
const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_JOBS_TABLE = process.env.AIRTABLE_JOBS_TABLE || 'Audit Jobs';

interface AirtableRecord {
  id: string;
  fields: {
    jobId: string;
    status: string;
    createdAt: string;
    completedAt?: string;
    failedAt?: string;
    data?: string;
    error?: string;
  };
  createdTime: string;
}

/**
 * Get Airtable headers
 */
function getHeaders() {
  return {
    'Authorization': `Bearer ${AIRTABLE_TOKEN}`,
    'Content-Type': 'application/json'
  };
}

/**
 * Get base URL for Airtable API
 */
function getBaseUrl() {
  return `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_JOBS_TABLE)}`;
}

/**
 * Find record by jobId
 */
async function findRecordByJobId(jobId: string): Promise<AirtableRecord | null> {
  try {
    const filterFormula = `{jobId}='${jobId}'`;
    const url = `${getBaseUrl()}?filterByFormula=${encodeURIComponent(filterFormula)}`;

    const response = await fetch(url, {
      headers: getHeaders()
    });

    if (!response.ok) {
      console.error('Airtable find error:', response.status);
      return null;
    }

    const data = await response.json();
    return data.records && data.records.length > 0 ? data.records[0] : null;
  } catch (error) {
    console.error('Error finding record:', error);
    return null;
  }
}

/**
 * Save job to Airtable
 */
export async function saveJob(jobId: string, jobData: any): Promise<void> {
  try {
    if (!AIRTABLE_TOKEN || !AIRTABLE_BASE_ID) {
      throw new Error('Airtable not configured');
    }

    console.log(`[saveJob] Saving job ${jobId}, status: ${jobData.status}`);

    // Check if record already exists
    const existingRecord = await findRecordByJobId(jobId);

    const fields = {
      jobId,
      status: jobData.status,
      createdAt: jobData.createdAt,
      completedAt: jobData.completedAt || null,
      failedAt: jobData.failedAt || null,
      data: jobData.data ? JSON.stringify(jobData.data) : null,
      error: jobData.error || null
    };

    if (existingRecord) {
      console.log(`[saveJob] Updating existing record for ${jobId}`);
      // Update existing record
      const response = await fetch(`${getBaseUrl()}/${existingRecord.id}`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ fields })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[saveJob] Update failed: ${response.status} - ${errorText}`);
        throw new Error(`Airtable update error: ${response.status}`);
      }
      console.log(`[saveJob] Successfully updated ${jobId}`);
    } else {
      console.log(`[saveJob] Creating new record for ${jobId}`);
      // Create new record
      const response = await fetch(getBaseUrl(), {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ fields })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[saveJob] Create failed: ${response.status} - ${errorText}`);
        throw new Error(`Airtable create error: ${response.status}`);
      }
      console.log(`[saveJob] Successfully created ${jobId}`);
    }
  } catch (error) {
    console.error(`[saveJob] Error saving job ${jobId}:`, error);
    throw error;
  }
}

/**
 * Get job from Airtable
 */
export async function getJob(jobId: string): Promise<any | null> {
  try {
    if (!AIRTABLE_TOKEN || !AIRTABLE_BASE_ID) {
      console.error('Airtable not configured');
      return null;
    }

    const record = await findRecordByJobId(jobId);
    if (!record) {
      return null;
    }

    return {
      status: record.fields.status,
      createdAt: record.fields.createdAt,
      completedAt: record.fields.completedAt,
      failedAt: record.fields.failedAt,
      data: record.fields.data ? JSON.parse(record.fields.data) : null,
      error: record.fields.error
    };
  } catch (error) {
    console.error('Error getting job:', error);
    return null;
  }
}

/**
 * Delete job from Airtable
 */
export async function deleteJob(jobId: string): Promise<void> {
  try {
    if (!AIRTABLE_TOKEN || !AIRTABLE_BASE_ID) {
      return;
    }

    const record = await findRecordByJobId(jobId);
    if (!record) {
      return;
    }

    const response = await fetch(`${getBaseUrl()}/${record.id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });

    if (!response.ok) {
      console.error('Airtable delete error:', response.status);
    }
  } catch (error) {
    console.error('Error deleting job:', error);
  }
}

/**
 * List all job IDs
 */
export async function listJobs(): Promise<string[]> {
  try {
    if (!AIRTABLE_TOKEN || !AIRTABLE_BASE_ID) {
      return [];
    }

    const response = await fetch(getBaseUrl(), {
      headers: getHeaders()
    });

    if (!response.ok) {
      console.error('Airtable list error:', response.status);
      return [];
    }

    const data = await response.json();
    return data.records.map((record: AirtableRecord) => record.fields.jobId);
  } catch (error) {
    console.error('Error listing jobs:', error);
    return [];
  }
}

/**
 * Clean up old jobs (keep last N)
 */
export async function cleanupOldJobs(keep: number = 100): Promise<void> {
  try {
    if (!AIRTABLE_TOKEN || !AIRTABLE_BASE_ID) {
      return;
    }

    // Get all records sorted by creation time
    const url = `${getBaseUrl()}?sort[0][field]=createdAt&sort[0][direction]=asc`;
    const response = await fetch(url, {
      headers: getHeaders()
    });

    if (!response.ok) {
      console.error('Airtable cleanup fetch error:', response.status);
      return;
    }

    const data = await response.json();
    const records: AirtableRecord[] = data.records;

    if (records.length <= keep) {
      return;
    }

    // Delete oldest records
    const toDelete = records.slice(0, records.length - keep);

    // Airtable allows batch delete up to 10 records at a time
    for (let i = 0; i < toDelete.length; i += 10) {
      const batch = toDelete.slice(i, i + 10);
      const recordIds = batch.map(r => r.id).join('&records[]=');

      await fetch(`${getBaseUrl()}?records[]=${recordIds}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
    }
  } catch (error) {
    console.error('Failed to cleanup old jobs:', error);
  }
}
