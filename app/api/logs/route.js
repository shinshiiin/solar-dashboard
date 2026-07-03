import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

const DEVICE_SECRET = process.env.DEVICE_SECRET; // set this in Vercel env vars
const LOG_KEY = 'logs:device';
const LOG_MAX_ENTRIES = 500; // keep last N pushes

export async function POST(request) {
  const authHeader = request.headers.get('authorization') || '';
  const token = authHeader.replace('Bearer ', '');

  if (!DEVICE_SECRET || token !== DEVICE_SECRET) {
    return Response.json({ error: 'unauthorized' }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'invalid json' }, { status: 400 });
  }

  const logs = body?.logs;
  if (typeof logs !== 'string' || logs.length === 0) {
    return Response.json({ error: 'missing logs field' }, { status: 400 });
  }

  const entry = JSON.stringify({
    receivedAt: Date.now(),
    text: logs,
  });

  // Push newest to the front, trim to keep the list bounded.
  await redis.lpush(LOG_KEY, entry);
  await redis.ltrim(LOG_KEY, 0, LOG_MAX_ENTRIES - 1);

  return Response.json({ ok: true });
}

export async function GET(request) {
  // Lets the viewer page pull recent log entries.
  const { searchParams } = new URL(request.url);
  const count = Math.min(parseInt(searchParams.get('count') || '100', 10), LOG_MAX_ENTRIES);

  const raw = await redis.lrange(LOG_KEY, 0, count - 1);

  // Redis returns newest-first (we lpush'd); reverse so the viewer can
  // just append in chronological order.
  const entries = raw
    .map((item) => {
      try {
        return typeof item === 'string' ? JSON.parse(item) : item;
      } catch {
        return null;
      }
    })
    .filter(Boolean)
    .reverse();

  return Response.json({ entries });
}