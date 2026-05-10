import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import createIntlMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET!
);

const intlMiddleware = createIntlMiddleware(routing);

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const host = request.headers.get('host') || '';

    // 1. Custom Domain Routing
    const mainDomain = process.env.MAIN_DOMAIN || 'localhost:3000';
    const isCustomDomain = host !== mainDomain && !host.endsWith('.vercel.app');

    if (isCustomDomain && !pathname.startsWith('/api') && !pathname.startsWith('/_next') && !pathname.startsWith('/public')) {
        return NextResponse.rewrite(new URL(`/p/${host}${pathname}`, request.url));
    }

    // 2. Auth Logic
    const isAdminRoute = pathname.match(/^\/(?:en|es)?\/admin/) || pathname.startsWith('/api/admin');
    const isAffiliateRoute = pathname.match(/^\/(?:en|es)?\/affiliate/) || pathname.startsWith('/api/affiliate');
    const isAuthMeRoute = pathname === '/api/auth/me';

    if (isAdminRoute || isAffiliateRoute || isAuthMeRoute) {
        const token = request.cookies.get('auth-token')?.value;

        if (!token) {
            if (pathname.startsWith('/api/')) {
                return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
            }
            return NextResponse.redirect(new URL('/login', request.url));
        }

        try {
            const { payload } = await jwtVerify(token, JWT_SECRET);
            const userRole = payload.role as string;

            if (isAdminRoute && userRole !== 'ADMIN') {
                if (pathname.startsWith('/api/')) {
                    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
                }
                return NextResponse.redirect(new URL('/login', request.url));
            }

            if (isAffiliateRoute && userRole !== 'AFFILIATE' && userRole !== 'ADMIN') {
                if (pathname.startsWith('/api/')) {
                    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
                }
                return NextResponse.redirect(new URL('/login', request.url));
            }

            // Inject headers and proceed to intlMiddleware
            const response = intlMiddleware(request);
            response.headers.set('x-user-id', payload.userId as string);
            response.headers.set('x-user-role', userRole);
            return response;
        } catch (error) {
            if (pathname.startsWith('/api/')) {
                return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
            }
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    // Default: Apply i18n middleware
    return intlMiddleware(request);
}

export const config = {
    matcher: [
        // Match all pathnames except for
        // - … if they start with `/api`, `/_next` or `/_vercel`
        // - … the ones containing a dot (e.g. `favicon.ico`)
        '/((?!api|_next|_vercel|.*\\..*).*)',
        // However, we still want to match these specific API routes for auth
        '/api/admin/:path*',
        '/api/affiliate/:path*',
        '/api/auth/me',
    ],
};
