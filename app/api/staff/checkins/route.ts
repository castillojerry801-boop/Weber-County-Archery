import { getSession } from '@/lib/auth';
import { checkInStore } from '@/lib/memberStore';

export async function GET() {
  const session = await getSession();
  if (!session || !['volunteer', 'employee', 'admin'].includes(session.role)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const [todayCount, recent] = await Promise.all([
    checkInStore.todayCount(),
    checkInStore.recentWithNames(30),
  ]);

  return Response.json({ todayCount, recent });
}
