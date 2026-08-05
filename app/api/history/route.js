import { NextResponse } from 'next/server';

const LOCAL_API_URL = 'https://server.tail8a9f83.ts.net/api/history';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date');

  if (!date) {
    return NextResponse.json({ error: 'missing date param' }, { status: 400 });
  }

  try {
    const res = await fetch(`${LOCAL_API_URL}/${date}`, { cache: 'no-store' });
    if (!res.ok) {
      return NextResponse.json({ error: 'upstream unavailable' }, { status: 502 });
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: 'upstream unreachable' }, { status: 502 });
  }
}