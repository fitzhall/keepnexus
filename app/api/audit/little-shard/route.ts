import { NextRequest, NextResponse } from 'next/server';
import { generateLittleShard } from '@/lib/audit/little-shard-generator';

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
    const { analysis, formData } = await request.json();

    if (!analysis || !formData) {
      return NextResponse.json(
        { error: 'Missing required data' },
        { status: 400 }
      );
    }

    // Generate Little Shard
    const littleShard = generateLittleShard(analysis, formData);

    // Return Little Shard data
    return NextResponse.json({
      littleShard,
      filename: `little-shard-${littleShard.client_id}-${Date.now()}.json`,
      mimeType: 'application/json'
    });

  } catch (error) {
    console.error('Little Shard generation error:', error);
    return NextResponse.json(
      { error: 'Little Shard generation failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}