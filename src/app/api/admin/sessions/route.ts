import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';

// ─── Shapes ──────────────────────────────────────────────────────────────────
//
// /admin/train was originally written against `lauren_sessions` (homeowner
// chat + the legacy "internal" session type). On 2026-04-27 Justin shipped a
// Lauren refactor that put internal team chat into a new schema:
//
//   team_threads (id, title, thread_type, deal_id, lauren_enabled, ...)
//   team_messages (thread_id, sender_id, sender_kind, body, deleted_at, ...)
//
// where thread_type ∈ {channel, dm, deal, lauren_dm, lauren_room}. Internal
// chats now flow into team_messages instead of lauren_sessions.messages.
//
// This handler reads from BOTH sources and shapes the team_threads side to
// match the existing UI's Session shape, so /admin/train just keeps working.
// (Belongs to Justin's lane long-term — see JUSTIN_FIX_ADMIN_TRAIN_AFTER_LAUREN_REFACTOR.md.)

type ChatMessage = { role: 'user' | 'assistant'; content: string };

type SessionRow = {
  id: string;
  session_type: string;
  visitor_id: string | null;
  deal_id: string | null;
  ghl_contact_id?: string | null;
  metadata?: Record<string, unknown> | null;
  msg_count: number;
  preview: string;
  created_at: string;
  updated_at: string;
  messages: ChatMessage[];
};

type DB = ReturnType<typeof getServiceClient>;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function mapSenderKindToRole(senderKind: string): 'user' | 'assistant' {
  return senderKind === 'lauren' ? 'assistant' : 'user';
}

// Shape a single team_thread + its messages into the Session shape the UI expects.
async function fetchTeamThreadAsSession(db: DB, threadId: string): Promise<SessionRow | null> {
  const { data: thread, error: threadErr } = await db
    .from('team_threads')
    .select('id, title, thread_type, deal_id, created_at, lauren_enabled, archived_at')
    .eq('id', threadId)
    .maybeSingle();
  if (threadErr || !thread) return null;

  const { data: msgs } = await db
    .from('team_messages')
    .select('sender_kind, body, created_at')
    .eq('thread_id', thread.id)
    .is('deleted_at', null)
    .order('created_at', { ascending: true });

  const messages: ChatMessage[] = (msgs || []).map((m) => ({
    role: mapSenderKindToRole(m.sender_kind as string),
    content: (m.body as string) || '',
  }));
  const firstUser = messages.find((m) => m.role === 'user');
  const lastMsgAt = msgs && msgs.length > 0 ? (msgs[msgs.length - 1].created_at as string) : thread.created_at;

  return {
    id: thread.id,
    session_type: 'internal',
    visitor_id: null,
    deal_id: (thread.deal_id as string | null) ?? null,
    metadata: { thread_type: thread.thread_type, title: thread.title, source: 'team_thread' },
    msg_count: messages.length,
    preview: firstUser?.content?.slice(0, 80) || `(${thread.title})`,
    created_at: thread.created_at,
    updated_at: lastMsgAt,
    messages,
  };
}

// List Lauren-enabled team_threads as SessionRows.
async function listTeamThreadsAsSessions(db: DB, limit: number): Promise<SessionRow[]> {
  const { data: threads, error } = await db
    .from('team_threads')
    .select('id, title, thread_type, deal_id, created_at, lauren_enabled, archived_at')
    .eq('lauren_enabled', true)
    .is('archived_at', null)
    .order('created_at', { ascending: false })
    .limit(limit * 2);
  if (error || !threads || threads.length === 0) return [];

  const out: SessionRow[] = [];
  for (const thread of threads) {
    const { data: msgs } = await db
      .from('team_messages')
      .select('sender_kind, body, created_at')
      .eq('thread_id', thread.id as string)
      .is('deleted_at', null)
      .order('created_at', { ascending: true });
    if (!msgs || msgs.length === 0) continue;

    const messages: ChatMessage[] = msgs.map((m) => ({
      role: mapSenderKindToRole(m.sender_kind as string),
      content: (m.body as string) || '',
    }));
    const firstUser = messages.find((m) => m.role === 'user');
    out.push({
      id: thread.id as string,
      session_type: 'internal',
      visitor_id: null,
      deal_id: (thread.deal_id as string | null) ?? null,
      metadata: { thread_type: thread.thread_type, title: thread.title, source: 'team_thread' },
      msg_count: messages.length,
      preview: firstUser?.content?.slice(0, 80) || `(${thread.title})`,
      created_at: thread.created_at as string,
      updated_at: msgs[msgs.length - 1].created_at as string,
      messages,
    });
  }
  return out;
}

// ─── Route ───────────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const id = searchParams.get('id');
  const type = searchParams.get('type'); // 'homeowner' | 'internal' | null = all
  const limit = parseInt(searchParams.get('limit') || '40');

  const db = getServiceClient();

  // ── Single-session lookup ──────────────────────────────────────────────────
  if (id) {
    // Try lauren_sessions first (legacy / homeowner)
    const { data: legacyRow } = await db
      .from('lauren_sessions')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (legacyRow) return NextResponse.json({ session: legacyRow });

    // Fall back to team_threads (new internal team chat)
    const teamSession = await fetchTeamThreadAsSession(db, id);
    if (teamSession) {
      return NextResponse.json({ session: { ...teamSession, messages: teamSession.messages } });
    }

    return NextResponse.json({ error: 'session not found' }, { status: 404 });
  }

  // ── List mode (merged) ─────────────────────────────────────────────────────
  const merged: SessionRow[] = [];

  // 1. lauren_sessions (legacy + homeowner). Always queried.
  let legacyQuery = db
    .from('lauren_sessions')
    .select('id, session_type, visitor_id, deal_id, ghl_contact_id, metadata, created_at, updated_at, messages')
    .order('updated_at', { ascending: false })
    .limit(limit);
  if (type) legacyQuery = legacyQuery.eq('session_type', type);
  const { data: legacyRows, error: legacyErr } = await legacyQuery;
  if (legacyErr) return NextResponse.json({ error: legacyErr.message }, { status: 500 });

  for (const s of legacyRows || []) {
    const msgs: ChatMessage[] = Array.isArray(s.messages) ? (s.messages as ChatMessage[]) : [];
    const firstUser = msgs.find((m) => m.role === 'user');
    merged.push({
      id: s.id as string,
      session_type: s.session_type as string,
      visitor_id: (s.visitor_id as string | null) ?? null,
      deal_id: (s.deal_id as string | null) ?? null,
      ghl_contact_id: (s.ghl_contact_id as string | null) ?? null,
      metadata: (s.metadata as Record<string, unknown> | null) ?? null,
      msg_count: msgs.length,
      preview: firstUser?.content?.slice(0, 80) || '(no messages)',
      created_at: s.created_at as string,
      updated_at: s.updated_at as string,
      messages: msgs,
    });
  }

  // 2. team_threads (new internal team chat). Only when listing all or 'internal'.
  if (!type || type === 'internal') {
    const teamSessions = await listTeamThreadsAsSessions(db, limit);
    merged.push(...teamSessions);
  }

  // Sort merged by updated_at desc; cap at limit.
  merged.sort((a, b) => (b.updated_at || '').localeCompare(a.updated_at || ''));
  return NextResponse.json({ sessions: merged.slice(0, limit) });
}
