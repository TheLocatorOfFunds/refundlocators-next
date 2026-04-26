import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

interface Params { params: Promise<{ id: string }> }

/**
 * GET /api/admin/lauren/[id]
 *
 * Returns the full transcript + metadata for one conversation.
 * Auth gated by proxy.ts admin cookie check.
 */
export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const db = getServiceClient();
  const { data, error } = await db
    .from('lauren_conversations')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'not found' }, { status: 404 });
  }
  return NextResponse.json(data);
}
