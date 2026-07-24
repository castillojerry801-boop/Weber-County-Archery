import { NextRequest } from 'next/server';
import { getSession } from '@/lib/auth';
import { membershipStore, punchStore, checkInStore } from '@/lib/memberStore';

const PARK_LAT = parseFloat(process.env.PARK_LAT ?? '41.213167');
const PARK_LNG = parseFloat(process.env.PARK_LNG ?? '-111.995537');
const PARK_RADIUS_M = parseFloat(process.env.PARK_RADIUS_M ?? '800'); // ~half mile

function distanceMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function daysUntil(dateStr: string): number {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: 'not_logged_in' }, { status: 401 });
  }

  const body = await request.json() as { lat?: number; lng?: number; location?: string };
  const { lat, lng, location = 'outdoor-range' } = body;

  if (typeof lat !== 'number' || typeof lng !== 'number') {
    return Response.json({ error: 'location_required' }, { status: 400 });
  }

  const dist = distanceMeters(lat, lng, PARK_LAT, PARK_LNG);
  if (dist > PARK_RADIUS_M) {
    return Response.json(
      { error: 'too_far', distanceMeters: Math.round(dist) },
      { status: 403 },
    );
  }

  const user = session;

  const membership = await membershipStore.findActiveForMember(user.id, user.email);
  if (membership) {
    const days = daysUntil(membership.endDate);
    const result = days <= 7 ? 'yellow' : 'green';
    const label =
      membership.type === 'monthly' ? 'Monthly Pass'
      : membership.type === 'annual' ? 'Annual Pass'
      : 'Household Annual Pass';

    await checkInStore.add({
      id: crypto.randomUUID(),
      memberId: user.memberId,
      userId: user.id,
      passType: 'membership',
      result,
      note: `${label} · ${days}d remaining · ${location}`,
      checkedInAt: new Date().toISOString(),
    });

    return Response.json({
      result,
      title: result === 'green' ? 'Welcome!' : 'Expiring Soon',
      message:
        result === 'yellow'
          ? `${label} expires in ${days} day${days === 1 ? '' : 's'}`
          : `${label} · Valid through ${membership.endDate}`,
      name: user.name,
      passType: 'membership',
    });
  }

  const punch = await punchStore.findActiveByUserId(user.id);
  if (punch && punch.punchesRemaining > 0) {
    const remaining = await punchStore.deduct(punch.id);
    const result = remaining <= 2 ? 'yellow' : 'green';

    await checkInStore.add({
      id: crypto.randomUUID(),
      memberId: user.memberId,
      userId: user.id,
      passType: 'punch',
      result,
      note: `Punch used · ${remaining} remaining · ${location}`,
      checkedInAt: new Date().toISOString(),
    });

    return Response.json({
      result,
      title: result === 'green' ? 'Welcome!' : 'Running Low',
      message:
        remaining === 0
          ? 'Last punch used — please renew your pass'
          : `${remaining} punch${remaining === 1 ? '' : 'es'} remaining`,
      name: user.name,
      passType: 'punch',
      punchesRemaining: remaining,
    });
  }

  await checkInStore.add({
    id: crypto.randomUUID(),
    memberId: user.memberId,
    userId: user.id,
    passType: 'membership',
    result: 'red',
    note: `No active pass · ${location}`,
    checkedInAt: new Date().toISOString(),
  });

  return Response.json({
    result: 'red',
    title: 'No Active Pass',
    message: 'Please purchase a membership or punch pass to enter.',
    name: user.name,
    passType: null,
  });
}
