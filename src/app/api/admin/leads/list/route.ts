import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/leads/list?status=ready|texted|all&limit=&offset=
 *
 * Surfaces personalized_links rows for the click-to-text workflow.
 *
 *  status=ready  → has phone AND texted_at IS NULL (queue to send)
 *  status=texted → texted_at IS NOT NULL          (sent, awaiting tap)
 *  status=all    → everything with a phone        (full history)
 */
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const status = sp.get('status') || 'ready';
  const limit  = Math.min(Math.max(parseInt(sp.get('limit')  || '50', 10), 1), 200);
  const offset = Math.max(parseInt(sp.get('offset') || '0',  10), 0);

  const db = getServiceClient();

  let q = db
    .from('personalized_links')
    .select(
      'token, first_name, last_name, phone, property_address, county, ' +
      'sale_date, estimated_surplus_low, estimated_surplus_high, ' +
      'case_number, source, created_at, texted_at, ' +
      'first_viewed_at, last_viewed_at, view_count, ' +
      'responded_at, claim_submitted_at',
      { count: 'exact' },
    )
    .not('phone', 'is', null)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (status === 'ready')  q = q.is('texted_at', null);
  if (status === 'texted') q = q.not('texted_at', 'is', null);
  // status=all → no filter on texted_at

  const { data, error, count } = await q;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    rows: data || [],
    total: count ?? (data || []).length,
    limit,
    offset,
    status,
  });
}
