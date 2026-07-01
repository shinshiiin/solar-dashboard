import { Redis } from '@upstash/redis';
import { NextResponse } from 'next/server';

const redis = Redis.fromEnv();

export async function GET() {
  const data = await redis.get('latest-reading');
  const timestamp = await redis.get('latest-timestamp');

  if (!data) {
    return NextResponse.json({ error: 'no data yet' }, { status: 404 });
  }

  return NextResponse.json({
    packs: JSON.parse(data),
    ageMs: Date.now() - Number(timestamp)
  });
}