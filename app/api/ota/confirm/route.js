import { Redis } from '@upstash/redis';
import { NextResponse } from 'next/server';

const redis = Redis.fromEnv();

// ESP32 calls POST /api/ota/confirm after a successful flash (before rebooting).
// Body: { success: true|false, error?: "reason" }
export async function POST(request) {
  const auth = request.headers.get('authorization') || '';
  if (auth !== `Bearer ${process.env.DEVICE_SECRET}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const raw  = await redis.get('ota:pending');
  const record = raw
    ? (typeof raw === 'string' ? JSON.parse(raw) : raw)
    : {};

  // Archive the result so the developer page can show flash history.
  const result = {
    ...record,
    status:      body.success ? 'done' : 'failed',
    flashedAt:   Date.now(),
    errorDetail: body.error || null,
  };

  await redis.set('ota:last', JSON.stringify(result));
  await redis.del('ota:pending');

  return NextResponse.json({ ok: true });
}
