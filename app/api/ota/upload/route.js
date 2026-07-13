import { put } from '@vercel/blob';
import { Redis } from '@upstash/redis';
import { NextResponse } from 'next/server';

const redis = Redis.fromEnv();

export const maxDuration = 60; // allow time for large .bin uploads

export async function POST(request) {
  // Protect with the same secret used by the ESP32.
  const auth = request.headers.get('authorization') || '';
  if (auth !== `Bearer ${process.env.DEVICE_SECRET}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  // Check there is no other update already pending — prevent accidents.
  const existing = await redis.get('ota:pending');
  if (existing) {
    return NextResponse.json(
      { error: 'An update is already pending. Cancel it before uploading a new one.' },
      { status: 409 }
    );
  }

  const formData = await request.formData();
  const file     = formData.get('firmware'); // <input name="firmware">
  const notes    = formData.get('notes') || '';

  if (!file || typeof file === 'string') {
    return NextResponse.json({ error: 'No firmware file received.' }, { status: 400 });
  }
  if (!file.name.endsWith('.bin')) {
    return NextResponse.json({ error: 'File must be a .bin firmware image.' }, { status: 400 });
  }

  // Store the binary in Vercel Blob (publicly readable so the ESP32 can
  // download it directly without needing auth on the blob URL).
  const blob = await put(`ota/${Date.now()}-${file.name}`, file, {
    access: 'public',
    contentType: 'application/octet-stream',
  });

  // Record the pending update in Redis so /api/ota/status can return it.
  const record = {
    url:        blob.url,
    filename:   file.name,
    size:       file.size,
    notes,
    uploadedAt: Date.now(),
    status:     'pending',  // → 'flashing' → 'done' | 'failed'
  };

  await redis.set('ota:pending', JSON.stringify(record));

  return NextResponse.json({ ok: true, url: blob.url, size: file.size });
}

// Cancel a pending update (called from the developer page cancel button).
export async function DELETE(request) {
  const auth = request.headers.get('authorization') || '';
  if (auth !== `Bearer ${process.env.DEVICE_SECRET}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  await redis.del('ota:pending');
  return NextResponse.json({ ok: true });
}
