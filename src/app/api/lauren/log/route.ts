import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

/**
 * POST /api/lauren/log
 *
 * Persists a Lauren conversation to `lauren_conversations`.
 *
 * Called fire-and-forget by <LaurenSheet /> on every meaningful change
 * (debounced client-side ~1.5s). The first call creates a row; subsequent
 * calls update it via the returned `conversation_id`.
 *
 * Body:
 *   {
 *     conversation_id?: string,    // omit on first call; supply on updates
 *     visitor_id:        string,
 *     page_origin?:      string,   // '/' or '/s/{token}'
 *     token?:            string,
 *     seed_message?:     string,
 *     transcript:        ChatMsg[],
 *   }
 *
 * Returns: { id }
 *
 * Safe-fail: if `lauren_conversations` table doesn't exist yet (migration
 * pending), this responds 200 with `{ id: null, deferred: true }` so the
 * client never sees an error and the chat keeps working.
 */

interface ChatMsg { role: 'user' | 'assistant'; content: string }

interface Body {
  conversation_id?: string | null;
  visitor_id?: string;
  page_origin?: string;
  token?: string | null;
  seed_message?: string | null;
  transcript?: ChatMsg[];
}

function getIP(req: NextRequest): string | null {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    null
  );
}

export async function POST(req: NextRequest) {
  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const visitorId = (body.visitor_id || '').trim();
  const transcript = Array.isArray(body.transcript) ? body.transcript : [];
  if (!visitorId) {
    return NextResponse.json({ error: 'visitor_id required' }, { status: 400 });
  }

  const db = getServiceClient();
  const now = new Date().toISOString();
  const messageCount = transcript.length;

  try {
    if (body.conversation_id) {
      // Update existing row — append-style: replace transcript with the latest
      // full version, advance message_count + last_message_at.
      const { error } = await db
        .from('lauren_conversations')
        .update({
          transcript,
          message_count: messageCount,
          last_message_at: now,
        })
        .eq('id', body.conversation_id);

      if (error) {
        // Most likely cause: table doesn't exist yet. Treat as deferred.
        return NextResponse.json({ id: body.conversation_id, deferred: true });
      }
      return NextResponse.json({ id: body.conversation_id });
    }

    // New conversation — insert
    const { data, error } = await db
      .from('lauren_conversations')
      .insert({
        visitor_id:    visitorId,
        page_origin:   body.page_origin || null,
        token:         body.token       || null,
        seed_message:  body.seed_message || null,
        transcript,
        message_count: messageCount,
        last_message_at: now,
        user_agent:    req.headers.get('user-agent'),
        ip:            getIP(req),
      })
      .select('id')
      .single();

    if (error || !data) {
      // Table missing → deferred. Client can still call us; once the
      // migration runs, capture starts working with no client change.
      return NextResponse.json({ id: null, deferred: true });
    }
    return NextResponse.json({ id: data.id });
  } catch {
    return NextResponse.json({ id: null, deferred: true });
  }
}
