import { Redis } from '@upstash/redis';
import { NextResponse } from 'next/server';

const redis = Redis.fromEnv();

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date'); // e.g. "2026-08-05"

  if (!date) {
    return NextResponse.json({ error: 'missing date param' }, { status: 400 });
  }

  const raw = await redis.get(`history:daily:${date}`);
  return NextResponse.json({ date, reading: raw ?? null });
}