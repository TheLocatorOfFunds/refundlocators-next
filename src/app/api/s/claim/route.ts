import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

/**
 * POST /api/s/claim
 *
 * Called when a homeowner submits the "Start my claim" modal on /s/[token].
 * Body: { token, name, address, phone }
 *
 * Actions:
 *  1. Update personalized_links with confirmed contact info
 *  2. Mark responded_at + claim_submitted_at (idempotent — last write wins for contact)
 *  3. Advance the linked deal stage → 'claim_submitted' (when present)
 *  4. Insert an activity row for the DCC timeline
 */
export async function POST(req: NextRequest) {
  let body: { token?: string; name?: string; address?: string; phone?: string; visitor_id?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const token = (body.token || '').trim();
  const name = (body.name || '').trim();
  const address = (body.address || '').trim();
  const phone = (body.phone || '').replace(/\D/g, '');

  if (!token) return NextResponse.json({ error: 'token required' }, { status: 400 });
  if (name.length < 2) return NextResponse.json({ error: 'name required' }, { status: 400 });
  if (phone.length !== 10) return NextResponse.json({ error: 'phone must be 10 digits' }, { status: 400 });

  const db = getServiceClient();

  // Look up the link
  const { data: link, error: linkErr } = await db
    .from('personalized_links')
    .select('token, deal_id, first_name, last_name, responded_at')
    .eq('token', token)
    .single();

  if (linkErr || !link) {
    return NextResponse.json({ error: 'token not found' }, { status: 404 });
  }

  const now = new Date().toISOString();

  // Split name (best-effort)
  const parts = name.split(/\s+/);
  const first = parts.shift() || link.first_name || '';
  const last = parts.join(' ') || link.last_name || '';

  // Update the link with what they confirmed.
  // We always overwrite contact details (their entry is the source of truth now)
  // and stamp responded_at if it's the first response.
  await db
    .from('personalized_links')
    .update({
      first_name: first,
      last_name: last,
      phone,
      mailing_address: address,
      claim_submitted_at: now,
      responded_at: link.responded_at || now,
    })
    .eq('token', token);

  // Advance the deal + log activity
  if (link.deal_id) {
    const { data: deal } = await db
      .from('deals')
      .select('sales_stage')
      .eq('id', link.deal_id)
      .single();

    const advanceFrom = ['new', 'texted', 'responded', null, undefined];
    if (deal && advanceFrom.includes(deal.sales_stage)) {
      await db
        .from('deals')
        .update({ sales_stage: 'claim_submitted' })
        .eq('id', link.deal_id);
    }

    await db.from('activity').insert({
      deal_id: link.deal_id,
      type: 'claim_submitted',
      description: `${first} ${last} submitted the "Start my claim" form on refundlocators.com/s/${token}`,
      metadata: { token, name, address, phone, source: 'personalized_page_claim_modal' },
      created_at: now,
    });
  }

  // Flag any in-progress Lauren conversation from this same browser as
  // converted. Best-effort, ignored if the table doesn't exist yet.
  const visitorId = (body.visitor_id || '').trim();
  if (visitorId) {
    try {
      await db
        .from('lauren_conversations')
        .update({ submitted_claim: true })
        .eq('visitor_id', visitorId)
        .gte('started_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
    } catch { /* table may not exist yet — silent */ }
  }

  return NextResponse.json({ ok: true });
}
