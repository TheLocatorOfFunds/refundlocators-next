import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';

/**
 * POST /api/s/respond
 *
 * Called client-side when a homeowner clicks "Yes — let's do it" on their
 * personalized /s/[token] page. Fire-and-forget from the browser — the UI
 * doesn't wait on this response.
 *
 * Actions:
 *  1. Mark personalized_links.responded_at (idempotent)
 *  2. Find the linked deal via personalized_links.deal_id
 *  3. Update deals.sales_stage → 'responded' (only if currently 'new' or 'texted')
 *  4. Insert an activity row so the DCC timeline shows the response
 *
 * No auth required — the token is the credential. Rate limiting handled
 * by idempotency (double-click does nothing after first respond_at is set).
 */
export async function POST(req: NextRequest) {
  let token: string;
  try {
    const body = await req.json();
    token = (body.token || '').trim();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (!token) {
    return NextResponse.json({ error: 'token required' }, { status: 400 });
  }

  const db = getServiceClient();

  // 1. Fetch the personalized_link row
  const { data: link, error: linkErr } = await db
    .from('personalized_links')
    .select('token, deal_id, responded_at, first_name')
    .eq('token', token)
    .single();

  if (linkErr || !link) {
    return NextResponse.json({ error: 'token not found' }, { status: 404 });
  }

  // Idempotent — already responded
  if (link.responded_at) {
    return NextResponse.json({ ok: true, already_responded: true });
  }

  const now = new Date().toISOString();

  // 2. Mark responded_at on the link
  await db
    .from('personalized_links')
    .update({ responded_at: now })
    .eq('token', token);

  if (!link.deal_id) {
    // No deal linked (old GHL token) — response recorded, nothing else to do
    return NextResponse.json({ ok: true });
  }

  // 3. Advance sales_stage only if still in early stages
  const { data: deal } = await db
    .from('deals')
    .select('sales_stage, name')
    .eq('id', link.deal_id)
    .single();

  const advanceFrom = ['new', 'texted', null, undefined];
  if (deal && advanceFrom.includes(deal.sales_stage)) {
    await db
      .from('deals')
      .update({ sales_stage: 'responded' })
      .eq('id', link.deal_id);
  }

  // 4. Log to activity table
  await db.from('activity').insert({
    deal_id:     link.deal_id,
    type:        'response',
    description: `${link.first_name} clicked "Yes — let's do it" on their personalized refundlocators.com page`,
    metadata:    { token, source: 'personalized_page' },
    created_at:  now,
  });

  return NextResponse.json({ ok: true });
}
