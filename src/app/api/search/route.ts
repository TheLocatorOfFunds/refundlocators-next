import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient, SearchResult } from '@/lib/supabase';

// Rate limit store (in-memory; upgrade to Upstash Redis for production scale).
// Limits intentionally generous — a real homeowner might check 5+ addresses
// (their own + relatives + comparing variants). The 5/hr cap from the
// original launch was so aggressive Nathan was locking himself out testing.
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const HOURLY_LIMIT = 60;
const DAILY_LIMIT = 200;

function getIP(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  );
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 3600_000 });
    return false;
  }
  if (entry.count >= HOURLY_LIMIT) return true;
  entry.count++;
  return false;
}

function normalizeAddress(address: string): string {
  return address
    .toLowerCase()
    .replace(/\b(street|st\.?)\b/g, 'st')
    .replace(/\b(avenue|ave\.?)\b/g, 'ave')
    .replace(/\b(road|rd\.?)\b/g, 'rd')
    .replace(/\b(drive|dr\.?)\b/g, 'dr')
    .replace(/\b(lane|ln\.?)\b/g, 'ln')
    .replace(/\b(court|ct\.?)\b/g, 'ct')
    .replace(/\b(boulevard|blvd\.?)\b/g, 'blvd')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export async function POST(req: NextRequest) {
  const ip = getIP(req);

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: 'Too many searches. Please try again in an hour.' },
      { status: 429 }
    );
  }

  let address: string;
  try {
    const body = await req.json();
    address = (body.address || '').trim();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!address || address.length < 5) {
    return NextResponse.json({ error: 'Please enter a full property address.' }, { status: 400 });
  }

  const db = getServiceClient();
  const normalized = normalizeAddress(address);

  // 1. Try exact/FTS match in foreclosure_cases
  const { data: cases } = await db
    .from('foreclosure_cases')
    .select('*')
    .textSearch('property_address_normalized', normalized, { type: 'plain', config: 'english' })
    .limit(3);

  if (cases && cases.length > 0) {
    const match = cases[0];

    // Confirmed surplus
    if (match.surplus_confirmed && match.surplus_confirmed_amount) {
      const result: SearchResult = {
        status: 'confirmed',
        case: match,
        county: match.county,
        estimated_surplus: {
          low: match.surplus_confirmed_amount,
          high: match.surplus_confirmed_amount,
        },
        next_action: 'claim',
      };
      return NextResponse.json(result);
    }

    // Likely surplus (estimated)
    if (match.estimated_surplus_low && match.estimated_surplus_high) {
      const result: SearchResult = {
        status: 'likely',
        case: match,
        county: match.county,
        estimated_surplus: {
          low: match.estimated_surplus_low,
          high: match.estimated_surplus_high,
        },
        next_action: 'chat',
      };
      return NextResponse.json(result);
    }
  }

  // 2. Extract county hint from address string
  const ohioCounties = [
    'hamilton', 'franklin', 'cuyahoga', 'montgomery', 'summit', 'lucas', 'butler',
    'stark', 'lorain', 'lake', 'mahoning', 'medina', 'warren', 'greene', 'clark',
    'ross', 'trumbull', 'fairfield', 'licking', 'allen', 'richland',
  ];
  const addressLower = address.toLowerCase();
  const countyHint = ohioCounties.find(c => addressLower.includes(c));

  // 3. No match found
  const result: SearchResult = {
    status: 'needs_verification',
    county: countyHint || undefined,
    next_action: 'intake',
  };
  return NextResponse.json(result);
}
