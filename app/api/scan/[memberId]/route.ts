import type { NextRequest } from 'next/server';
import { headers } from 'next/headers';
import { z } from 'zod';
import { userStore, membershipStore, punchStore, checkInStore } from '@/lib/memberStore';
import { checkRateLimit } from '@/lib/rateLimit';
import type { ScanResult } from '@/data/memberTypes';

const memberIdSchema = z.string().min(1).max(50).regex(/^WCAP-[A-Z0-9]+$/, 'Invalid member ID format');

function daysUntil(dateStr: string): number {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ memberId: string }> },
) {
  const headerList = await headers();
  const ip = headerList.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown';

  // Rate limit kiosk: 60 scans per minute per IP (generous for a real scanner)
  const rl = checkRateLimit(`scan:${ip}`, 60, 60 * 1000);
  if (!rl.allowed) {
    return Response.json({ result: 'red', title: 'Slow Down', message: 'Too many scans. Wait a moment.' });
  }

  const { memberId: raw } = await params;
  const parsed = memberIdSchema.safeParse(raw);
  if (!parsed.success) {
    return Response.json({ result: 'red' as ScanResult, title: 'Invalid Code', message: 'QR code not recognized.', name: null });
  }
  const memberId = parsed.data;

  const user = userStore.findByMemberId(memberId);
  if (!user) {
    return Response.json({ result: 'red' as ScanResult, title: 'Not Found', message: 'Member ID not recognized.', name: null });
  }

  const membership = membershipStore.findActiveForMember(user.id, user.email);
  if (membership) {
    const days = daysUntil(membership.endDate);
    const result: ScanResult = days <= 7 ? 'yellow' : 'green';
    const label = membership.type === 'monthly' ? 'Monthly Pass'
      : membership.type === 'annual' ? 'Annual Pass'
      : 'Household Annual Pass';

    checkInStore.add({
      id: crypto.randomUUID(),
      memberId,
      userId: user.id,
      passType: 'membership',
      result,
      note: `${label} · ${days}d remaining`,
      checkedInAt: new Date().toISOString(),
    });

    return Response.json({
      result,
      title: result === 'green' ? 'Welcome!' : 'Expiring Soon',
      message: result === 'yellow'
        ? `${label} expires in ${days} day${days === 1 ? '' : 's'}`
        : `${label} · Valid through ${membership.endDate}`,
      name: user.name,
      passType: 'membership',
    });
  }

  const punch = punchStore.findActiveByUserId(user.id);
  if (punch && punch.punchesRemaining > 0) {
    const remaining = punchStore.deduct(punch.id);
    const result: ScanResult = remaining <= 2 ? 'yellow' : 'green';

    checkInStore.add({
      id: crypto.randomUUID(),
      memberId,
      userId: user.id,
      passType: 'punch',
      result,
      note: `Punch used · ${remaining} remaining`,
      checkedInAt: new Date().toISOString(),
    });

    return Response.json({
      result,
      title: result === 'green' ? 'Welcome!' : 'Running Low',
      message: remaining === 0
        ? 'Last punch used — please renew your pass'
        : `${remaining} punch${remaining === 1 ? '' : 'es'} remaining`,
      name: user.name,
      passType: 'punch',
      punchesRemaining: remaining,
    });
  }

  checkInStore.add({
    id: crypto.randomUUID(),
    memberId,
    userId: user.id,
    passType: 'membership',
    result: 'red',
    note: 'No active pass',
    checkedInAt: new Date().toISOString(),
  });

  return Response.json({
    result: 'red' as ScanResult,
    title: 'No Active Pass',
    message: 'Please purchase a membership or punch pass to enter.',
    name: user.name,
    passType: null,
  });
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ memberId: string }> },
) {
  const { memberId } = await params;
  const user = userStore.findByMemberId(memberId);
  if (!user) return Response.json({ valid: false });

  const membership = membershipStore.findActiveForMember(user.id, user.email);
  const punch = punchStore.findActiveByUserId(user.id);

  return Response.json({
    valid: !!(membership || (punch && punch.punchesRemaining > 0)),
    name: user.name,
    membership: membership ?? null,
    punchPass: punch ?? null,
  });
}
