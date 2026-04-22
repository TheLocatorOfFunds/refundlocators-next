import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';
import { generateToken, tokenExpiresAt } from '@/lib/token';

// This endpoint is called by GHL automations — requires Bearer auth
export async function POST(req: NextRequest) {
  // Auth check
  const authHeader = req.headers.get('authorization') || '';
  const token = authHeader.replace('Bearer ', '').trim();
  if (token !== process.env.CAPTURE_API_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: {
    first_name: string;
    last_name?: string;
    phone: string;
    property_address?: string;
    county?: string;
    case_number?: string;
    sale_date?: string;
    sale_price?: number;
    estimated_surplus_low?: number;
    estimated_surplus_high?: number;
    judgment_amount?: number;
    ghl_contact_id?: string;
    source?: string;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (!body.first_name || !body.phone) {
    return NextResponse.json(
      { error: 'first_name and phone are required' },
      { status: 400 }
    );
  }

  const db = getServiceClient();

  // Try to find matching case if case_number provided
  let case_id: string | null = null;
  if (body.case_number) {
    const { data: fc } = await db
      .from('foreclosure_cases')
      .select('id')
      .eq('case_number', body.case_number)
      .single();
    if (fc) case_id = fc.id;
  }

  // Generate unique token (retry up to 5 times on collision)
  let linkToken = '';
  for (let i = 0; i < 5; i++) {
    const candidate = generateToken();
    const { data: existing } = await db
      .from('personalized_links')
      .select('token')
      .eq('token', candidate)
      .single();
    if (!existing) {
      linkToken = candidate;
      break;
    }
  }

  if (!linkToken) {
    return NextResponse.json({ error: 'Token generation failed' }, { status: 500 });
  }

  const { error } = await db.from('personalized_links').insert({
    token: linkToken,
    case_id,
    first_name: body.first_name,
    last_name: body.last_name || null,
    phone: body.phone,
    property_address: body.property_address || null,
    county: body.county || null,
    sale_date: body.sale_date || null,
    sale_price: body.sale_price || null,
    estimated_surplus_low: body.estimated_surplus_low || null,
    estimated_surplus_high: body.estimated_surplus_high || null,
    judgment_amount: body.judgment_amount || null,
    case_number: body.case_number || null,
    ghl_contact_id: body.ghl_contact_id || null,
    source: body.source || 'ghl',
    expires_at: tokenExpiresAt().toISOString(),
  });

  if (error) {
    console.error('personalized_links insert error:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }

  const url = `https://refundlocators.com/s/${linkToken}`;
  return NextResponse.json({
    token: linkToken,
    url,
    expires_at: tokenExpiresAt().toISOString(),
  });
}
