import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

/**
 * GET /api/lauren/recent-history?visitor_id=<uuid>
 *
 * Returns whether this anonymous visitor has chatted with Lauren
 * recently (≤30 days), plus a tiny hint string the chat sheet uses
 * to soften the greeting on a return visit.
 *
 * The `visitor_id` is the UUID stored in the visitor's own
 * localStorage by `LaurenSheet`. Only that visitor can supply it
 * (anonymous, opaque, browser-local). The endpoint:
 *
 * - Returns NOTHING if no visitor_id is supplied or no rows match.
 * - Returns ONLY counts + the most recent first user message,
 *   truncated to 140 chars. No transcripts, no addresses, no PII
 *   beyond what the visitor themselves typed.
 * - Excludes opt-out conversations (any STOP / unsubscribe / opt-out
 *   keyword in the most recent transcript) so we don't appear to be
 *   following someone who asked us to leave them alone.
 *
 * Cache-busted (force-dynamic) since the answer changes per visitor.
 *
 * Safe-fail: if the table doesn't exist or any query errors, returns
 * `{ has_history: false }` — never blocks the chat sheet from rendering.
 */

interface ChatMsg { role: 'user' | 'assistant'; content: string }

const OPT_OUT_PATTERNS = /\b(stop|unsubscribe|opt[\s-]?out|leave me alone|don'?t (text|call|contact))\b/i;

function firstUserMsg(transcript: unknown): string | null {
  if (!Array.isArray(transcript)) return null;
  for (const m of transcript) {
    if (m && typeof m === 'object' && (m as ChatMsg).role === 'user') {
      const c = String((m as ChatMsg).content || '').trim();
      if (c) return c;
    }
  }
  return null;
}

function transcriptHasOptOut(transcript: unknown): boolean {
  if (!Array.isArray(transcript)) return false;
  for (const m of transcript) {
    if (m && typeof m === 'object' && (m as ChatMsg).role === 'user') {
      if (OPT_OUT_PATTERNS.test(String((m as ChatMsg).content || ''))) return true;
    }
  }
  return false;
}

export async function GET(req: NextRequest) {
  const visitor_id = req.nextUrl.searchParams.get('visitor_id');

  // Guard rails: must look like a uuid, must be present.
  if (!visitor_id || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(visitor_id)) {
    return NextResponse.json({ has_history: false });
  }

  let db;
  try {
    db = getServiceClient();
  } catch {
    return NextResponse.json({ has_history: false });
  }

  try {
    const sinceIso = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const { data, error } = await db
      .from('lauren_conversations')
      .select('id, started_at, last_message_at, transcript, message_count, submitted_claim, page_origin, token')
      .eq('visitor_id', visitor_id)
      .gte('started_at', sinceIso)
      .order('last_message_at', { ascending: false })
      .limit(5);

    if (error || !data || data.length === 0) {
      return NextResponse.json({ has_history: false });
    }

    // If the most recent conversation contained an opt-out, do NOT
    // surface returning-visitor framing. They asked us to back off.
    if (transcriptHasOptOut(data[0].transcript)) {
      return NextResponse.json({ has_history: false, suppressed: 'opt_out' });
    }

    const last = data[0];
    const hint = firstUserMsg(last.transcript);

    return NextResponse.json({
      has_history: true,
      conversation_count: data.length,
      last_at: last.last_message_at,
      last_topic_hint: hint ? hint.slice(0, 140) : null,
      last_was_token_mode: !!last.token,
      submitted_claim_recently: data.some((r: { submitted_claim?: boolean | null }) => !!r.submitted_claim),
    });
  } catch {
    return NextResponse.json({ has_history: false });
  }
}
