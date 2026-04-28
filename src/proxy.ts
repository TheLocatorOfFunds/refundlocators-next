import { NextRequest, NextResponse } from 'next/server';

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Protect /admin/* routes (except /admin/login itself, and except
  // /admin/lauren which is a public redirect to DCC's Lauren Control
  // Center — DCC has its own auth, no point gating the bounce-page).
  const ADMIN_PUBLIC = new Set(['/admin/login', '/admin/lauren']);
  if (pathname.startsWith('/admin') && !ADMIN_PUBLIC.has(pathname)) {
    const token = req.cookies.get('admin_token')?.value;
    const expected = process.env.ADMIN_SECRET;
    if (!expected || token !== expected) {
      const login = req.nextUrl.clone();
      login.pathname = '/admin/login';
      login.searchParams.set('from', pathname);
      return NextResponse.redirect(login);
    }
  }

  // Protect /api/admin/* routes — except /api/admin/auth itself, which IS
  // the login endpoint. Without this exception, no one could ever log in.
  if (pathname.startsWith('/api/admin') && pathname !== '/api/admin/auth') {
    const token = req.cookies.get('admin_token')?.value;
    const expected = process.env.ADMIN_SECRET;
    if (!expected || token !== expected) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
