import { NextRequest } from 'next/server';
import { jsonWithCors, optionsCors } from '@/lib/betting-providers/cors';
import { getAggregatedDashboard } from '@/lib/betting-providers';

export async function GET(request: NextRequest) {
  const origin = request.headers.get('origin');
  try {
    const data = await getAggregatedDashboard();
    return jsonWithCors(data, origin);
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to load betting dashboard';
    return jsonWithCors({ error: message }, origin, 500);
  }
}

export async function OPTIONS(request: NextRequest) {
  return optionsCors(request.headers.get('origin'));
}
