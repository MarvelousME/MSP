import { NextRequest } from 'next/server';
import { jsonWithCors, optionsCors } from '@/lib/betting-providers/cors';
import { ALL_ADAPTERS } from '@/lib/betting-providers';

export async function GET(request: NextRequest) {
  const origin = request.headers.get('origin');
  try {
    const operators = await Promise.all(
      ALL_ADAPTERS.map(async (a) => ({
        ...(await a.getMeta()),
        stats: await a.getStats(),
      }))
    );
    return jsonWithCors({ updatedAt: new Date().toISOString(), operators }, origin);
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to load operators';
    return jsonWithCors({ error: message }, origin, 500);
  }
}

export async function OPTIONS(request: NextRequest) {
  return optionsCors(request.headers.get('origin'));
}
