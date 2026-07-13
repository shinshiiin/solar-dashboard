import { Redis } from '@upstash/redis';
import { NextResponse } from 'next/server';

const redis = Redis.fromEnv();

export async function GET() {
  // Single redis.get instead of two separate gets (was: get('latest-reading') + get('latest-timestamp')).
  // Data and timestamp are now stored together in one key by /api/update.
  const record = await redis.get('latest-reading');

  if (!record) {
    return NextResponse.json({ error: 'no data yet' }, { status: 404 });
  }

  // Support both the new merged format { payload, ts } and the old split format
  // (plain data object stored without a timestamp key) so the dashboard works
  // without needing a simultaneous firmware + frontend deploy.
  let data, ts;
  if (record && typeof record === 'object' && 'payload' in record && 'ts' in record) {
    data = record.payload;
    ts   = record.ts;
  } else {
    // Legacy: old firmware stored raw data; no timestamp available.
    data = record;
    ts   = null;
  }

  const isLegacyArray = Array.isArray(data);

  const response = NextResponse.json({
    packs:     isLegacyArray ? data          : (data?.bms  ?? []),
    srne:      isLegacyArray ? null          : (data?.srne ?? null),
    ageMs:     ts !== null   ? Date.now() - Number(ts) : null,
    receivedAt: ts,
  });

  // Cache at Vercel's edge for 30s — every browser tab and phone shares this
  // one cached response instead of each one hitting Redis independently.
  // stale-while-revalidate lets the CDN serve the cached copy while it refreshes
  // in the background, so there's no visible delay on the client.
  response.headers.set('Cache-Control', 's-maxage=30, stale-while-revalidate=10');

  return response;
}
