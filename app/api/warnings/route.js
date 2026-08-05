import { NextResponse } from 'next/server';

const LOCAL_API_URL = 'https://server.tail8a9f83.ts.net/api/warnings';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const count = searchParams.get('count') || '100';

  try {
    const res = await fetch(`${LOCAL_API_URL}?count=${count}`, { cache: 'no-store' });
    if (!res.ok) {
      return NextResponse.json({ error: 'upstream unavailable' }, { status: 502 });
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: 'upstream unreachable' }, { status: 502 });
  }
}