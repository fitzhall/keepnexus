import { NextRequest, NextResponse } from 'next/server';

// API authentication
const API_KEY = process.env.AUDIT_API_KEY || 'btc-inherit-2024-secure';

// Airtable configuration from environment variables
const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_TABLE_NAME = process.env.AIRTABLE_TABLE_NAME || 'Audit Intake';

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

    // Check Airtable configuration
    if (!AIRTABLE_TOKEN || !AIRTABLE_BASE_ID) {
      return NextResponse.json(
        { error: 'Airtable not configured' },
        { status: 500 }
      );
    }

    // Fetch from Airtable
    const response = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE_NAME)}?sort[0][field]=Submitted&sort[0][direction]=desc`,
      {
        headers: {
          'Authorization': `Bearer ${AIRTABLE_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Airtable error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Submissions fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch submissions', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
