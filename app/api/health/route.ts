import { db } from '@/lib/supabase';

export async function GET() {
  try {
    const { error } = await db.from('members').select('id').limit(1);
    if (error) return Response.json({ ok: false, error: error.message }, { status: 500 });
    return Response.json({ ok: true, supabase: 'connected' });
  } catch (e) {
    return Response.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
