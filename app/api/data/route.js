import { NextResponse } from 'next/server';

const LOCAL_API_URL = 'https://server.tail8a9f83.ts.net/api/data';

export async function GET() {
  let record;
  try {
    const res = await fetch(LOCAL_API_URL, { cache: 'no-store' });
    if (!res.ok) {
      return NextResponse.json({ error: 'upstream unavailable' }, { status: 502 });
    }
    record = await res.json();
  } catch (err) {
    return NextResponse.json({ error: 'upstream unreachable' }, { status: 502 });
  }

  if (!record) {
    return NextResponse.json({ error: 'no data yet' }, { status: 404 });
  }

  const data = record;
  const ts = record.ts ?? null;

  const response = NextResponse.json({
    packs: data?.bms ?? [],
    srne: data?.srne ?? null,
    ageMs: ts !== null ? Date.now() - Number(ts) : null,
    receivedAt: ts,
  });

  response.headers.set('Cache-Control', 's-maxage=5, stale-while-revalidate=5');

  return response;
}