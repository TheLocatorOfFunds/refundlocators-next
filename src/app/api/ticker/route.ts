import { NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  const db = getServiceClient();

  const { data } = await db
    .from('recoveries')
    .select('amount, county, recovered_at, display_name')
    .eq('is_public', true)
    .order('recovered_at', { ascending: false });

  if (!data) {
    return NextResponse.json({ total: 0, last: null, count: 0 });
  }

  const total = data.reduce((sum, r) => sum + Number(r.amount), 0);
  const last = data[0] || null;

  return NextResponse.json({
    total,
    count: data.length,
    last: last
      ? {
          amount: last.amount,
          county: last.county,
          recovered_at: last.recovered_at,
          display_name: last.display_name,
        }
      : null,
  });
}
