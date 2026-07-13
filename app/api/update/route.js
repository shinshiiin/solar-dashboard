import { Redis } from '@upstash/redis';
import { NextResponse } from 'next/server';

const redis = Redis.fromEnv();

export async function POST(request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.DEVICE_SECRET}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const data = await request.json();

  // Store data + timestamp together in one key = 1 Redis command instead of 2.
  await redis.set('latest-reading', JSON.stringify({ payload: data, ts: Date.now() }));

  return NextResponse.json({ ok: true });
}