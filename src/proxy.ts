import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET!
);

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const host = request.headers.get('host') || '';

    // API Auth Logic - protect admin/affiliate API routes
    const isPublicAuthRoute = pathname.match(/^\/api\/auth\/(send-otp|verify-otp|login|register|logout|me)/);

    if (!isPublicAuthRoute && (pathname.startsWith('/api/admin') || pathname.startsWith('/api/affiliate'))) {
        const token = request.cookies.get('auth-token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
        }

        try {
            const { payload } = await jwtVerify(token, JWT_SECRET);
            const userRole = payload.role as string;

            if (pathname.startsWith('/api/admin') && userRole !== 'ADMIN') {
                return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
            }

            if (pathname.startsWith('/api/affiliate') && userRole !== 'AFFILIATE' && userRole !== 'ADMIN') {
                return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
            }

            const response = NextResponse.next();
            response.headers.set('x-user-id', payload.userId as string);
            response.headers.set('x-user-role', userRole);
            return response;
        } catch (error) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }
    }

    // Custom Domain Routing
    const mainDomain = process.env.MAIN_DOMAIN || 'localhost:3000';
    const isCustomDomain = host !== mainDomain && !host.endsWith('.vercel.app');

    if (isCustomDomain && !pathname.startsWith('/api') && !pathname.startsWith('/_next') && !pathname.startsWith('/public')) {
        return NextResponse.rewrite(new URL(`/p/${host}${pathname}`, request.url));
    }

    // Protect frontend routes
    if (!pathname.startsWith('/api') && !pathname.startsWith('/_next') && !pathname.startsWith('/public')) {
        const isAdminRoute = pathname.startsWith('/admin');
        const isAffiliateRoute = pathname.startsWith('/affiliate');

        if (isAdminRoute || isAffiliateRoute) {
            const token = request.cookies.get('auth-token')?.value;

            if (!token) {
                return NextResponse.redirect(new URL('/login', request.url));
            }

            try {
                const { payload } = await jwtVerify(token, JWT_SECRET);
                const userRole = payload.role as string;

                if (isAdminRoute && userRole !== 'ADMIN') {
                    return NextResponse.redirect(new URL('/login', request.url));
                }

                if (isAffiliateRoute && userRole !== 'AFFILIATE' && userRole !== 'ADMIN') {
                    return NextResponse.redirect(new URL('/login', request.url));
                }
            } catch (error) {
                return NextResponse.redirect(new URL('/login', request.url));
            }
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/api/admin/:path*',
        '/api/affiliate/:path*',
        '/api/auth/me',
        '/((?!api|_next|_vercel|.*\\..*).*)',
    ],
};
