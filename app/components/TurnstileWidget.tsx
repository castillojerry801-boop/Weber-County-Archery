'use client';

import { useEffect, useRef } from 'react';
import { Turnstile } from '@marsidev/react-turnstile';

type Props = {
  onVerify: (token: string) => void;
  onExpire?: () => void;
};

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? '1x00000000000000000000AA';
const IS_TEST_KEY = SITE_KEY === '1x00000000000000000000AA';

export function TurnstileWidget({ onVerify, onExpire }: Props) {
  const called = useRef(false);

  // Test key auto-verifies immediately so the button is never stuck disabled
  useEffect(() => {
    if (IS_TEST_KEY && !called.current) {
      called.current = true;
      onVerify('test-token');
    }
  }, [onVerify]);

  return (
    <Turnstile
      siteKey={SITE_KEY}
      onSuccess={onVerify}
      onExpire={onExpire}
      options={{ theme: 'dark', size: 'flexible' }}
    />
  );
}
