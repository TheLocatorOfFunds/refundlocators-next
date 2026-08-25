import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

/**
 * POST /api/s/event
 *
 * Funnel + view tracking for /s/[token], fired from the browser.
 * Body: { token, event }
 *
 * Events:
 *  - 'viewed'             → increments view_count, stamps first/last_viewed_at.
 *                           This replaced the server-render increment so SMS
 *                           link-preview bots (iMessage/Android fetch the page
 *                           to build the preview card) don't pollute the
 *                           "who actually opened it" data — only a real
 *                           browser running our JS lands here.
 *  - 'claim_modal_opened' → opened the claim form (follow-up signal if no
 *                           claim_submitted_at ever lands)
 *  - 'lauren_opened'      → opened the Lauren AI sheet
 *  - 'wrong_person'       → recipient says the text reached the wrong person
 *
 * Non-view events go to the link_events table (best-effort until DCC ships
 * it — see the DCC ticket) and, when a deal is linked, onto the DCC
 * activity timeline like /api/s/claim does.
 *
 * No auth — the unguessable token is the credential, same as /api/s/respond.
 */

const EVENTS = ['viewed', 'claim_modal_opened', 'lauren_opened', 'wrong_person'] as const;
type LinkEvent = (typeof EVENTS)[number];

const ACTIVITY_DESCRIPTIONS: Record<Exclude<LinkEvent, 'viewed'>, string> = {
  claim_modal_opened: 'opened the "Start my claim" form on their personalized page',
  lauren_opened: 'opened the Lauren chat on their personalized page',
  wrong_person: 'tapped "wrong person" on their personalized page — number may be stale',
};

export async function POST(req: NextRequest) {
  let body: { token?: string; event?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const token = (body.token || '').trim();
  const event = (body.event || '').trim() as LinkEvent;

  if (!token) return NextResponse.json({ error: 'token required' }, { status: 400 });
  if (!EVENTS.includes(event)) {
    return NextResponse.json({ error: 'unknown event' }, { status: 400 });
  }

  const db = getServiceClient();

  const { data: link, error: linkErr } = await db
    .from('personalized_links')
    .select('token, deal_id, first_name, last_name, view_count, first_viewed_at')
    .eq('token', token)
    .single();

  if (linkErr || !link) {
    return NextResponse.json({ error: 'token not found' }, { status: 404 });
  }

  const now = new Date().toISOString();

  if (event === 'viewed') {
    await db
      .from('personalized_links')
      .update({
        view_count: (link.view_count || 0) + 1,
        last_viewed_at: now,
        first_viewed_at: link.first_viewed_at ?? now,
      })
      .eq('token', token);
    return NextResponse.json({ ok: true });
  }

  // Dedicated event log — table lands via DCC; silent until then.
  try {
    await db.from('link_events').insert({ token, event, created_at: now });
  } catch { /* table may not exist yet */ }

  if (link.deal_id) {
    const who = [link.first_name, link.last_name].filter(Boolean).join(' ') || 'Recipient';
    await db.from('activity').insert({
      deal_id: link.deal_id,
      type: event,
      description: `${who} ${ACTIVITY_DESCRIPTIONS[event]}`,
      metadata: { token, source: 'personalized_page_event' },
      created_at: now,
    });
  }

  return NextResponse.json({ ok: true });
}
