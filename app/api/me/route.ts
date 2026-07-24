import { cookies } from 'next/headers';
import { userStore, membershipStore, punchStore } from '@/lib/memberStore';

export async function GET() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('member_session')?.value;
  if (!userId) return Response.json({ error: 'Not authenticated' }, { status: 401 });

  const user = await userStore.findById(userId);
  if (!user) return Response.json({ error: 'User not found' }, { status: 404 });

  const [activeMembership, activePunchPass, allMemberships, allPunchPasses] = await Promise.all([
    membershipStore.findActiveByUserId(userId),
    punchStore.findActiveByUserId(userId),
    membershipStore.findByUserId(userId),
    punchStore.findByUserId(userId),
  ]);

  return Response.json({
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    memberId: user.memberId,
    createdAt: user.createdAt,
    activeMembership: activeMembership ?? null,
    activePunchPass: activePunchPass ?? null,
    memberships: allMemberships,
    punchPasses: allPunchPasses,
  });
}
