import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
// Cache successful images for 24h on the Vercel edge — same address asked
// twice is the same image, no point paying Google twice.
const EDGE_CACHE_SECONDS = 60 * 60 * 24;

/**
 * GET /api/streetview?address=2624+Maple+Ave,+Cincinnati,+OH&w=640&h=400
 *
 * Server-side proxy to Google Street View Static API. Hides the API key
 * from the client and lets us cache + gracefully fall back when:
 *  - GOOGLE_MAPS_API_KEY isn't set (returns 404, page hides the image)
 *  - Address has no Street View coverage (Google returns the "no imagery"
 *    placeholder; we detect this with metadata API and 404)
 *
 * Costs $7 per 1000 distinct addresses in real US dollars; cached images
 * are free. At 100 new leads/month: ~$0.70/mo.
 */

const STATIC_URL = 'https://maps.googleapis.com/maps/api/streetview';
const META_URL   = 'https://maps.googleapis.com/maps/api/streetview/metadata';

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const address = (sp.get('address') || '').trim();
  const w = Math.min(Math.max(parseInt(sp.get('w') || '640', 10), 64), 640);
  const h = Math.min(Math.max(parseInt(sp.get('h') || '400', 10), 64), 640);

  if (!address) return NextResponse.json({ error: 'address required' }, { status: 400 });

  const key = process.env.GOOGLE_MAPS_API_KEY;
  if (!key) {
    // Soft-disable: client will see 404 and just not render the image.
    return NextResponse.json({ error: 'streetview disabled' }, { status: 404 });
  }

  // Step 1: cheap metadata check — Google charges $0 for this and tells us
  // whether real imagery exists at the address. Skips paying for the
  // "no imagery available" placeholder.
  try {
    const metaUrl = new URL(META_URL);
    metaUrl.searchParams.set('location', address);
    metaUrl.searchParams.set('key', key);
    const metaRes = await fetch(metaUrl.toString(), { cache: 'no-store' });
    const meta = await metaRes.json();
    if (meta.status !== 'OK') {
      return NextResponse.json({ error: 'no imagery', status: meta.status }, { status: 404 });
    }
  } catch {
    return NextResponse.json({ error: 'metadata check failed' }, { status: 502 });
  }

  // Step 2: fetch the actual image bytes and stream them through.
  const imgUrl = new URL(STATIC_URL);
  imgUrl.searchParams.set('size', `${w}x${h}`);
  imgUrl.searchParams.set('location', address);
  imgUrl.searchParams.set('fov', '70');     // slightly wider than default for a "front of house" feel
  imgUrl.searchParams.set('pitch', '0');
  imgUrl.searchParams.set('return_error_code', 'true');
  imgUrl.searchParams.set('key', key);

  const imgRes = await fetch(imgUrl.toString());
  if (!imgRes.ok) {
    return NextResponse.json({ error: 'streetview fetch failed', status: imgRes.status }, { status: imgRes.status });
  }

  const buf = await imgRes.arrayBuffer();
  return new NextResponse(buf, {
    status: 200,
    headers: {
      'content-type':  imgRes.headers.get('content-type') || 'image/jpeg',
      'cache-control': `public, s-maxage=${EDGE_CACHE_SECONDS}, stale-while-revalidate=86400`,
    },
  });
}
