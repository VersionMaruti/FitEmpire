// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // 1. Login page ko exclude karein taaki infinite redirect loop na bane
    if (pathname === '/admin/login') {
        return NextResponse.next();
    }

    // 2. Cookie se token check karein
    const token = request.cookies.get('fitempire_access_token')?.value;

    // 3. Agar token nahi hai, seedha login page par redirect karein (Server-side 307)
    if (!token) {
        const loginUrl = new URL('/admin/login', request.url);
        loginUrl.searchParams.set('from', pathname); // Redirect back after login
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

// Sirf /admin routes par run karein
export const config = {
    matcher: ['/admin/:path*'],
};
