import { NextResponse } from 'next/server';

const ALLOWED_ORIGINS = [
  process.env.NEXT_PUBLIC_APP_URL,
  process.env.NEXT_PUBLIC_SITE_URL,
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5500',
  'http://127.0.0.1:5500',
].filter(Boolean) as string[];

export function jsonWithCors<T>(data: T, requestOrigin?: string | null, status = 200) {
  const origin = requestOrigin && ALLOWED_ORIGINS.some((o) => requestOrigin.startsWith(o.replace(/\/$/, '')))
    ? requestOrigin
    : ALLOWED_ORIGINS[0] ?? '*';

  return NextResponse.json(data, {
    status,
    headers: {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
    },
  });
}

export function optionsCors(requestOrigin?: string | null) {
  return jsonWithCors({}, requestOrigin, 204);
}
