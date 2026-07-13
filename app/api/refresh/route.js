import { Redis } from '@upstash/redis';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const redis = Redis.fromEnv();
const REFRESH_KEY = 'refresh-request';

export async function POST() {
  await redis.set(REFRESH_KEY, '1');
  await redis.expire(REFRESH_KEY, 60);
  return NextResponse.json({ ok: true });
}

export async function GET() {
  const request = await redis.get(REFRESH_KEY);
  if (!request) {
    return NextResponse.json({ request: false });
  }

  await redis.del(REFRESH_KEY);
  return NextResponse.json({ request: true });
}
