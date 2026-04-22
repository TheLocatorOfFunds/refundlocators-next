import { NextRequest, NextResponse } from 'next/server';

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Protect /admin/* routes
  if (pathname.startsWith('/admin')) {
    const token = req.cookies.get('admin_token')?.value;
    const expected = process.env.ADMIN_SECRET;
    if (!expected || token !== expected) {
      const login = req.nextUrl.clone();
      login.pathname = '/admin/login';
      login.searchParams.set('from', pathname);
      return NextResponse.redirect(login);
    }
  }

  // Protect /api/admin/* routes
  if (pathname.startsWith('/api/admin')) {
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
