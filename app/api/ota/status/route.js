import { Redis } from '@upstash/redis';
import { NextResponse } from 'next/server';

const redis = Redis.fromEnv();

// ESP32 calls GET /api/ota/status every 60s.
// Returns { pending: false } or { pending: true, url, size, filename, notes }.
export async function GET(request) {
  const auth = request.headers.get('authorization') || '';
  if (auth !== `Bearer ${process.env.DEVICE_SECRET}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const raw = await redis.get('ota:pending');
  if (!raw) {
    // Cache the "nothing pending" response for 30s to avoid unnecessary Redis reads.
    const res = NextResponse.json({ pending: false });
    res.headers.set('Cache-Control', 's-maxage=30, stale-while-revalidate=10');
    return res;
  }

  const record = typeof raw === 'string' ? JSON.parse(raw) : raw;

  // Mark as 'flashing' so the dashboard shows the right state.
  if (record.status === 'pending') {
    record.status = 'flashing';
    await redis.set('ota:pending', JSON.stringify(record));
  }

  return NextResponse.json({
    pending:  true,
    url:      record.url,
    size:     record.size,
    filename: record.filename,
    notes:    record.notes,
  });
}

// Developer page also polls this (unauthenticated) to show current status.
export async function POST() {
  const raw = await redis.get('ota:pending');
  const history = await redis.get('ota:last');

  return NextResponse.json({
    pending: raw ? (typeof raw === 'string' ? JSON.parse(raw) : raw) : null,
    last:    history ? (typeof history === 'string' ? JSON.parse(history) : history) : null,
  });
}
