// Cloudflare Turnstile server-side verification
// Docs: https://developers.cloudflare.com/turnstile/get-started/server-side-validation/

export async function verifyTurnstile(token: string, ip?: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;

  // Skip verification in development if no key is set
  if (!secret || secret === 'dev') {
    console.warn('[Turnstile] No secret key set — skipping verification in dev');
    return true;
  }

  const body = new URLSearchParams({ secret, response: token });
  if (ip) body.append('remoteip', ip);

  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body,
    });
    const data = await res.json() as { success: boolean; 'error-codes'?: string[] };
    if (!data.success) {
      console.warn('[Turnstile] Verification failed:', data['error-codes']);
    }
    return data.success;
  } catch (err) {
    console.error('[Turnstile] Network error:', err);
    return false;
  }
}
