interface AuthRateLimitResult {
  allowed: boolean;
  resetAt: Date;
}

const buckets = new Map<string, { count: number; resetAt: number }>();

/**
 * In-memory rate limiter for auth routes.
 * Avoids coupling login/OTP to the database rate_limit_entries table.
 */
export function checkAuthRateLimit(
  identifier: string,
  endpoint: string,
  maxRequests: number,
  windowMs: number
): AuthRateLimitResult {
  const key = `${endpoint}:${identifier}`;
  const now = Date.now();
  const entry = buckets.get(key);

  if (!entry || entry.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, resetAt: new Date(now + windowMs) };
  }

  if (entry.count >= maxRequests) {
    return { allowed: false, resetAt: new Date(entry.resetAt) };
  }

  entry.count += 1;
  return { allowed: true, resetAt: new Date(entry.resetAt) };
}

export function getClientIp(request: Request): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}
