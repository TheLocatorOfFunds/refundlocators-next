import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/lauren/list?limit=50&offset=0&converted=1
 *
 * Returns recent Lauren conversations for the admin viewer. Auth gated by
 * the proxy.ts admin cookie check.
 *
 * Each row includes a synthesized `first_question` for the list preview —
 * the first user message in the transcript.
 */
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const limit  = Math.min(Math.max(parseInt(sp.get('limit')  || '50', 10), 1), 200);
  const offset = Math.max(parseInt(sp.get('offset') || '0',  10), 0);
  const convertedOnly = sp.get('converted') === '1';

  const db = getServiceClient();

  let q = db
    .from('lauren_conversations')
    .select('id, visitor_id, started_at, last_message_at, page_origin, token, seed_message, transcript, message_count, submitted_claim', { count: 'exact' })
    .order('started_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (convertedOnly) q = q.eq('submitted_claim', true);

  const { data, error, count } = await q;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Synthesize a preview field (first user message) so the list view
  // doesn't have to ship the full transcript.
  const rows = (data || []).map(row => {
    interface Msg { role: string; content: string }
    const transcript = Array.isArray(row.transcript) ? row.transcript as Msg[] : [];
    const firstUserMsg = transcript.find(m => m && m.role === 'user');
    return {
      id:                row.id,
      visitor_id:        row.visitor_id,
      started_at:        row.started_at,
      last_message_at:   row.last_message_at,
      page_origin:       row.page_origin,
      token:             row.token,
      seed_message:      row.seed_message,
      message_count:     row.message_count,
      submitted_claim:   row.submitted_claim,
      first_question:    firstUserMsg ? firstUserMsg.content.slice(0, 140) : null,
    };
  });

  return NextResponse.json({
    rows,
    total: count ?? rows.length,
    limit,
    offset,
  });
}
