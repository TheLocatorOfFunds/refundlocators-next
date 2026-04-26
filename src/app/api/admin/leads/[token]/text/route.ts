import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

interface Params { params: Promise<{ token: string }> }

/**
 * POST /api/admin/leads/[token]/text
 *
 * Marks a personalized_link as texted_at = now(). Called by the admin
 * "Ready to text" UI right after Nathan clicks the click-to-text button
 * (we trust him to actually send — there's no way to verify from a
 * tel:/sms: link). Idempotent: if already texted, just returns ok.
 */
export async function POST(_req: NextRequest, { params }: Params) {
  const { token } = await params;
  if (!token) return NextResponse.json({ error: 'token required' }, { status: 400 });

  const db = getServiceClient();
  const { error } = await db
    .from('personalized_links')
    .update({ texted_at: new Date().toISOString() })
    .eq('token', token)
    .is('texted_at', null);   // only set on first send

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

/**
 * DELETE /api/admin/leads/[token]/text
 *
 * Resets texted_at = NULL — useful when a number bounces and we want
 * the lead to come back to the "Ready to text" queue.
 */
export async function DELETE(_req: NextRequest, { params }: Params) {
  const { token } = await params;
  if (!token) return NextResponse.json({ error: 'token required' }, { status: 400 });

  const db = getServiceClient();
  const { error } = await db
    .from('personalized_links')
    .update({ texted_at: null })
    .eq('token', token);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
