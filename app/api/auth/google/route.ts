import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { origin } = request.nextUrl;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const redirectTo = `${origin}/auth/callback`;

  const url = `${supabaseUrl}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(redirectTo)}`;

  return Response.redirect(url, 302);
}
