import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const id = searchParams.get('id');
  const type = searchParams.get('type'); // 'homeowner' | 'internal' | null = all
  const limit = parseInt(searchParams.get('limit') || '40');

  const db = getServiceClient();

  if (id) {
    const { data, error } = await db
      .from('lauren_sessions')
      .select('*')
      .eq('id', id)
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ session: data });
  }

  let query = db
    .from('lauren_sessions')
    .select('id, session_type, visitor_id, deal_id, ghl_contact_id, metadata, created_at, updated_at, messages')
    .order('updated_at', { ascending: false })
    .limit(limit);

  if (type) query = query.eq('session_type', type);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Return sessions with message count and preview
  const sessions = (data || []).map((s) => {
    const msgs = Array.isArray(s.messages) ? s.messages : [];
    const firstUser = msgs.find((m: { role: string; content: string }) => m.role === 'user');
    return {
      id: s.id,
      session_type: s.session_type,
      visitor_id: s.visitor_id,
      deal_id: s.deal_id,
      msg_count: msgs.length,
      preview: firstUser?.content?.slice(0, 80) || '(no messages)',
      created_at: s.created_at,
      updated_at: s.updated_at,
      messages: msgs,
    };
  });

  return NextResponse.json({ sessions });
}
