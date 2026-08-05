import { Redis } from '@upstash/redis';
import { NextResponse } from 'next/server';
import { decodeSrneFaults } from '../../../bms/lib/srne-faults'; // adjust path if needed

const redis = Redis.fromEnv();

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const count = Math.min(parseInt(searchParams.get('count') || '100', 10), 1000);

  const raw = await redis.lrange('solar:warnings-log', 0, count - 1);

  const entries = raw
    .map((item) => {
      try {
        const parsed = typeof item === 'string' ? JSON.parse(item) : item;
        const srne = parsed?.reading?.srne ?? {};
        const warnings = decodeSrneFaults(srne.faultBits ?? 0);
        return {
          id: `${parsed.timestamp}-${srne.faultBits}`,
          timestamp: new Date(parsed.timestamp).toLocaleString(),
          warnings,
          reading: {
            soc: srne.soc,
            batteryVoltage: srne.batteryVoltage,
            chargingCurrent: srne.chargingCurrent,
            pvVoltage: srne.pvVoltage,
            pvCurrent: srne.pvCurrent,
            batteryTemp: srne.batteryTemp,
            controllerTemp: srne.controllerTemp,
            chargingStateName: srne.chargingStateName,
            faultBits: srne.faultBits,
          },
        };
      } catch {
        return null;
      }
    })
    .filter(Boolean);

  return NextResponse.json({ entries });
}