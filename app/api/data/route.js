import { Redis } from '@upstash/redis';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const redis = Redis.fromEnv();

export async function GET() {
  const data = await redis.get('latest-reading');
  const timestamp = await redis.get('latest-timestamp');

  if (!data) {
    return NextResponse.json({ error: 'no data yet' }, { status: 404 });
  }

  // The ESP32 now posts { bms: [...], srne: {...} } instead of a bare array.
  // Fall back to treating `data` itself as the packs array for backward
  // compatibility with older firmware that hasn't been reflashed yet.
  const isLegacyArray = Array.isArray(data);

  return NextResponse.json({
    packs: isLegacyArray ? data : (data.bms ?? []),
    srne: isLegacyArray ? null : (data.srne ?? null),
    ageMs: Date.now() - Number(timestamp)
  });
}