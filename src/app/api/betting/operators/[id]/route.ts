import { NextRequest } from 'next/server';
import { jsonWithCors, optionsCors } from '@/lib/betting-providers/cors';
import { getProviderStats, type ProviderId } from '@/lib/betting-providers';

const VALID: ProviderId[] = [
  'racevolt',
  '10bet',
  'playabets',
  'betxchange',
  'hollywoodbets',
  'raventrack',
];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const origin = request.headers.get('origin');
  const { id } = await params;

  if (!VALID.includes(id as ProviderId)) {
    return jsonWithCors({ error: `Unknown operator. Valid: ${VALID.join(', ')}` }, origin, 404);
  }

  try {
    const data = await getProviderStats(id as ProviderId);
    return jsonWithCors(data, origin);
  } catch (err) {
    console.error('[betting/operators/id]', err);
    return jsonWithCors({ error: 'Failed to load operator' }, origin, 500);
  }
}

export async function OPTIONS(request: NextRequest) {
  return optionsCors(request.headers.get('origin'));
}
