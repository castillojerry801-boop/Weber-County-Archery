// In-memory rate limiter — swap for Redis when Postgres/Upstash is set up
type Entry = { count: number; resetAt: number };

declare global {
  // eslint-disable-next-line no-var
  var __rateLimitStore: Map<string, Entry> | undefined;
}
if (!global.__rateLimitStore) global.__rateLimitStore = new Map();

const store = () => global.__rateLimitStore!;

export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): { allowed: boolean; remaining: number; retryAfterMs: number } {
  const now = Date.now();
  const existing = store().get(key);

  if (!existing || existing.resetAt < now) {
    store().set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, retryAfterMs: 0 };
  }

  if (existing.count >= limit) {
    return { allowed: false, remaining: 0, retryAfterMs: existing.resetAt - now };
  }

  existing.count += 1;
  return { allowed: true, remaining: limit - existing.count, retryAfterMs: 0 };
}

// Purge expired entries periodically to avoid memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store().entries()) {
    if (entry.resetAt < now) store().delete(key);
  }
}, 60_000);
