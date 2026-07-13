'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

interface OtaRecord {
  url?: string;
  filename?: string;
  size?: number;
  notes?: string;
  uploadedAt?: number;
  flashedAt?: number;
  status?: 'pending' | 'flashing' | 'done' | 'failed';
  errorDetail?: string | null;
}

interface OtaStatusResponse {
  pending: OtaRecord | null;
  last:    OtaRecord | null;
}

function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}

function timeAgo(ts: number) {
  const s = Math.round((Date.now() - ts) / 1000);
  if (s < 60)   return `${s}s ago`;
  if (s < 3600) return `${Math.round(s / 60)}m ago`;
  return `${Math.round(s / 3600)}h ago`;
}

const STATUS_COLORS: Record<string, string> = {
  pending:  'text-[#d29922] bg-[#d29922]/10 border-[#d29922]/30',
  flashing: 'text-[#58a6ff] bg-[#58a6ff]/10 border-[#58a6ff]/30',
  done:     'text-[#3fb950] bg-[#3fb950]/10 border-[#3fb950]/30',
  failed:   'text-[#f85149] bg-[#f85149]/10 border-[#f85149]/30',
};

const STATUS_LABELS: Record<string, string> = {
  pending:  '⏳ Pending — waiting for ESP32 to pick up',
  flashing: '⚡ Flashing — ESP32 is writing the firmware',
  done:     '✓ Done — ESP32 flashed and rebooted',
  failed:   '✗ Failed — see error detail below',
};

export default function DeveloperPage() {
  const [secret, setSecret]       = useState('');
  const [authed, setAuthed]       = useState(false);
  const [file, setFile]           = useState<File | null>(null);
  const [notes, setNotes]         = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [status, setStatus]       = useState<OtaStatusResponse | null>(null);
  const fileRef  = useRef<HTMLInputElement>(null);
  const pollRef  = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/ota/status', { method: 'POST' });
      if (res.ok) setStatus(await res.json());
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    if (!authed) return;
    void fetchStatus();
    pollRef.current = setInterval(() => void fetchStatus(), 10_000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [authed, fetchStatus]);

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch('/api/ota/status', { method: 'POST' });
    if (res.ok) {
      setAuthed(true);
      setStatus(await res.json());
    } else {
      alert('Could not reach /api/ota/status — check deployment.');
    }
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    setUploadMsg(null);

    const form = new FormData();
    form.append('firmware', file);
    form.append('notes', notes);

    try {
      const res = await fetch('/api/ota/upload', {
        method:  'POST',
        headers: { Authorization: `Bearer ${secret}` },
        body:    form,
      });
      const data = await res.json();
      if (res.ok) {
        setUploadMsg({ ok: true, text: `Uploaded ${formatBytes(data.size as number)} — ESP32 will pick it up within 60s.` });
        setFile(null);
        setNotes('');
        if (fileRef.current) fileRef.current.value = '';
        void fetchStatus();
      } else {
        setUploadMsg({ ok: false, text: (data.error as string) || 'Upload failed.' });
      }
    } catch {
      setUploadMsg({ ok: false, text: 'Network error during upload.' });
    } finally {
      setUploading(false);
    }
  }

  async function handleCancel() {
    if (!confirm('Cancel the pending OTA update?')) return;
    await fetch('/api/ota/upload', {
      method:  'DELETE',
      headers: { Authorization: `Bearer ${secret}` },
    });
    void fetchStatus();
    setUploadMsg(null);
  }

  // ---------- Auth gate ----------
  if (!authed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0f1419] p-6">
        <div className="w-full max-w-sm rounded-xl border border-[#2a3441] bg-[#1a2129] p-6">
          <h2 className="mb-1 font-mono text-sm font-semibold tracking-[0.1em] text-[#e6edf3]">
            DEVELOPER ACCESS
          </h2>
          <p className="mb-5 font-mono text-[11px] text-[#8b96a3]">
            Enter your DEVICE_SECRET to continue.
          </p>
          <form onSubmit={(e) => void handleAuth(e)} className="flex flex-col gap-3">
            <input
              type="password"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              placeholder="sk_live_…"
              className="rounded-lg border border-[#2a3441] bg-[#0d1117] px-3 py-2 font-mono text-sm text-[#e6edf3] placeholder-[#3d4b5a] outline-none focus:border-[#3fb950]/60"
            />
            <button
              type="submit"
              className="rounded-lg bg-[#1f4f8a] px-4 py-2 font-mono text-[11px] font-semibold uppercase tracking-[0.1em] text-[#e6edf3] hover:bg-[#255c9d]"
            >
              Unlock
            </button>
          </form>
        </div>
      </div>
    );
  }

  const pending    = status?.pending ?? null;
  const last       = status?.last    ?? null;
  const hasPending = !!pending && pending.status !== 'done' && pending.status !== 'failed';

  return (
    <div className="min-h-screen bg-[#0f1419] p-6 text-[#e6edf3]">
      <div className="mx-auto max-w-2xl flex flex-col gap-6">

        {/* Header */}
        <div>
          <h1 className="font-mono text-lg font-semibold tracking-[0.1em]">DEVELOPER</h1>
          <p className="mt-1 font-mono text-[11px] tracking-[0.05em] text-[#8b96a3]">
            OTA firmware update &middot; status polls every 10s
          </p>
        </div>

        {/* Current OTA status */}
        {(pending || last) && (
          <div className="rounded-xl border border-[#2a3441] bg-[#1a2129] p-5 flex flex-col gap-4">
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.1em] text-[#8b96a3]">
              Current Status
            </p>

            {pending && (
              <div className={`rounded-lg border px-4 py-3 ${STATUS_COLORS[pending.status ?? 'pending']}`}>
                <p className="font-mono text-[12px] font-semibold">
                  {STATUS_LABELS[pending.status ?? 'pending']}
                </p>
                <p className="mt-1 font-mono text-[11px] opacity-80">
                  {pending.filename} &middot; {formatBytes(pending.size ?? 0)} &middot; uploaded {timeAgo(pending.uploadedAt ?? 0)}
                </p>
                {pending.notes && (
                  <p className="mt-1 font-mono text-[11px] opacity-70 italic">{pending.notes}</p>
                )}
              </div>
            )}

            {pending?.status === 'pending' && (
              <button
                onClick={() => void handleCancel()}
                className="self-start rounded-lg border border-[#f85149]/40 bg-[#f85149]/10 px-3 py-1.5 font-mono text-[11px] font-semibold text-[#f85149] hover:bg-[#f85149]/20"
              >
                Cancel Update
              </button>
            )}

            {last && !hasPending && (
              <div className={`rounded-lg border px-4 py-3 ${STATUS_COLORS[last.status ?? 'done']}`}>
                <p className="font-mono text-[12px] font-semibold">
                  Last update: {STATUS_LABELS[last.status ?? 'done']}
                </p>
                <p className="mt-1 font-mono text-[11px] opacity-80">
                  {last.filename} &middot; {formatBytes(last.size ?? 0)} &middot; flashed {timeAgo(last.flashedAt ?? 0)}
                </p>
                {last.errorDetail && (
                  <p className="mt-2 font-mono text-[11px]">Error: {last.errorDetail}</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Upload form */}
        <div className="rounded-xl border border-[#2a3441] bg-[#1a2129] p-5">
          <p className="mb-4 font-mono text-[11px] font-semibold uppercase tracking-[0.1em] text-[#8b96a3]">
            Upload Firmware
          </p>

          {hasPending ? (
            <p className="font-mono text-[11px] text-[#d29922]">
              ⚠ Cancel or wait for the current update to complete before uploading a new one.
            </p>
          ) : (
            <form onSubmit={(e) => void handleUpload(e)} className="flex flex-col gap-4">

              {/* Drop zone */}
              <label className="flex flex-col items-center justify-center gap-2 cursor-pointer rounded-lg border-2 border-dashed border-[#2a3441] bg-[#0d1117] py-8 text-center hover:border-[#3fb950]/50 transition-colors">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#8b96a3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                <span className="font-mono text-[11px] text-[#8b96a3]">
                  {file
                    ? <span className="text-[#3fb950]">{file.name} ({formatBytes(file.size)})</span>
                    : 'Click to select firmware .bin'
                  }
                </span>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".bin"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                />
              </label>

              {/* Release notes */}
              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-[10px] uppercase tracking-[0.1em] text-[#8b96a3]">
                  Release notes (optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="e.g. Fixed BLE reconnect bug, slowed cloud push to 60s"
                  className="resize-none rounded-lg border border-[#2a3441] bg-[#0d1117] px-3 py-2 font-mono text-[11px] text-[#e6edf3] placeholder-[#3d4b5a] outline-none focus:border-[#3fb950]/60"
                />
              </div>

              <button
                type="submit"
                disabled={!file || uploading}
                className="rounded-lg bg-[#1f4f8a] px-4 py-2.5 font-mono text-[11px] font-semibold uppercase tracking-[0.1em] text-[#e6edf3] hover:bg-[#255c9d] disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
              >
                {uploading ? 'Uploading…' : 'Upload & Deploy to ESP32'}
              </button>

              {uploadMsg && (
                <p className={`font-mono text-[11px] ${uploadMsg.ok ? 'text-[#3fb950]' : 'text-[#f85149]'}`}>
                  {uploadMsg.ok ? '✓' : '✗'} {uploadMsg.text}
                </p>
              )}
            </form>
          )}
        </div>

        {/* How it works */}
        <div className="rounded-xl border border-[#2a3441] bg-[#1a2129] p-5">
          <p className="mb-3 font-mono text-[11px] font-semibold uppercase tracking-[0.1em] text-[#8b96a3]">
            How it works
          </p>
          <ol className="flex flex-col gap-2">
            {[
              'Build firmware → Sketch → Export Compiled Binary → grab the .bin',
              'Upload it here — stored in Vercel Blob',
              'ESP32 polls /api/ota/status every 60s',
              'Sees the pending update, downloads and flashes the binary',
              'Calls /api/ota/confirm then reboots — status updates here automatically',
            ].map((step, i) => (
              <li key={i} className="flex gap-3 font-mono text-[11px] text-[#8b96a3]">
                <span className="shrink-0 text-[#3fb950]">{i + 1}.</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>

      </div>
    </div>
  );
}
