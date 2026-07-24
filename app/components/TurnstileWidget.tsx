'use client';

import { useEffect, useRef } from 'react';
import { Turnstile } from '@marsidev/react-turnstile';

type Props = {
  onVerify: (token: string) => void;
  onExpire?: () => void;
};

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? '1x00000000000000000000AA';

export function TurnstileWidget({ onVerify, onExpire }: Props) {
  const fallbackFired = useRef(false);

  // If the widget hasn't verified within 4 seconds, unblock the form anyway.
  // Cloudflare verification is still done server-side; this just prevents a
  // broken widget from permanently disabling the submit button.
  useEffect(() => {
    const t = setTimeout(() => {
      if (!fallbackFired.current) {
        fallbackFired.current = true;
        onVerify('fallback');
      }
    }, 4000);
    return () => clearTimeout(t);
  }, [onVerify]);

  return (
    <Turnstile
      siteKey={SITE_KEY}
      onSuccess={(token) => { fallbackFired.current = true; onVerify(token); }}
      onExpire={onExpire}
      options={{ theme: 'dark', size: 'flexible' }}
    />
  );
}
