import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';

export async function GET() {
  const db = getServiceClient();
  const { data, error } = await db
    .from('lauren_knowledge')
    .select('id, source_type, topic, brand, title, content, created_at')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ entries: data || [] });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { topic, title, content, source_type = 'manual', brand = 'refundlocators' } = body;

  if (!content?.trim()) {
    return NextResponse.json({ error: 'content is required' }, { status: 400 });
  }

  const db = getServiceClient();
  const { data, error } = await db
    .from('lauren_knowledge')
    .insert({ topic: topic || null, title: title || null, content, source_type, brand })
    .select('id, topic, title, content, source_type, created_at')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ entry: data }, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { id, topic, title, content, source_type } = body;

  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  const db = getServiceClient();
  const update: Record<string, string> = {};
  if (topic !== undefined) update.topic = topic;
  if (title !== undefined) update.title = title;
  if (content !== undefined) update.content = content;
  if (source_type !== undefined) update.source_type = source_type;

  const { data, error } = await db
    .from('lauren_knowledge')
    .update(update)
    .eq('id', id)
    .select('id, topic, title, content, source_type, created_at')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ entry: data });
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  const db = getServiceClient();
  const { error } = await db.from('lauren_knowledge').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
