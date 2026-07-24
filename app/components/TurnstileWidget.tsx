'use client';

import { Turnstile } from '@marsidev/react-turnstile';

type Props = {
  onVerify: (token: string) => void;
  onExpire?: () => void;
};

// Test keys — replace with real keys from Cloudflare Dashboard → Turnstile
// Site key goes in NEXT_PUBLIC_TURNSTILE_SITE_KEY env var
// Secret key goes in TURNSTILE_SECRET_KEY env var
const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? '1x00000000000000000000AA';

export function TurnstileWidget({ onVerify, onExpire }: Props) {
  return (
    <Turnstile
      siteKey={SITE_KEY}
      onSuccess={onVerify}
      onExpire={onExpire}
      options={{ theme: 'dark', size: 'flexible' }}
    />
  );
}
