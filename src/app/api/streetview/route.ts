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
// Aerial fallback for addresses with no Street View coverage (rural roads the
// Street View car never drove). Satellite imagery covers ~everywhere, so the
// homeowner still sees their property instead of a blank page.
const STATIC_MAP_URL = 'https://maps.googleapis.com/maps/api/staticmap';

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
  // whether real Street View imagery exists at the address. Skips paying for
  // the "no imagery available" placeholder.
  let hasStreetView = true;
  try {
    const metaUrl = new URL(META_URL);
    metaUrl.searchParams.set('location', address);
    metaUrl.searchParams.set('key', key);
    const metaRes = await fetch(metaUrl.toString(), { cache: 'no-store' });
    const meta = await metaRes.json();
    // ZERO_RESULTS / NOT_FOUND etc. → no Street View here (rural road); fall
    // back to a satellite aerial below instead of 404-ing to a blank page.
    if (meta.status !== 'OK') hasStreetView = false;
  } catch {
    return NextResponse.json({ error: 'metadata check failed' }, { status: 502 });
  }

  // Step 2: fetch the image bytes — Street View if it exists, otherwise a
  // top-down satellite aerial of the address.
  let imgRes: Response;
  if (hasStreetView) {
    const imgUrl = new URL(STATIC_URL);
    imgUrl.searchParams.set('size', `${w}x${h}`);
    imgUrl.searchParams.set('location', address);
    imgUrl.searchParams.set('fov', '70');     // slightly wider than default for a "front of house" feel
    imgUrl.searchParams.set('pitch', '0');
    imgUrl.searchParams.set('return_error_code', 'true');
    imgUrl.searchParams.set('key', key);
    imgRes = await fetch(imgUrl.toString());
  } else {
    const satUrl = new URL(STATIC_MAP_URL);
    satUrl.searchParams.set('center', address);
    satUrl.searchParams.set('zoom', '18');         // property + immediate surroundings
    satUrl.searchParams.set('size', `${w}x${h}`);
    satUrl.searchParams.set('maptype', 'satellite');
    satUrl.searchParams.set('key', key);
    imgRes = await fetch(satUrl.toString());
  }
  if (!imgRes.ok) {
    // Both unavailable (e.g. Maps Static API not enabled on the key) — 404 so
    // the page keeps the dark background, the same graceful fallback as before.
    return NextResponse.json(
      { error: hasStreetView ? 'streetview fetch failed' : 'aerial fallback unavailable', status: imgRes.status },
      { status: imgRes.status },
    );
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
