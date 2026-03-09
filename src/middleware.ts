import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ─── In-memory edge rate limiter ─────────────────────────────────────────────
// Stored as: key → { count, resetAt }
// This resets each time the serverless edge instance cold-starts, which is fine
// — it provides a best-effort burst guard without any paid external service.
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

/**
 * Returns true if the request should be blocked.
 * @param key      Unique identifier (e.g. "ip:subscribe")
 * @param limit    Max requests allowed in the window
 * @param windowMs Window size in milliseconds
 */
function isRateLimited(key: string, limit: number, windowMs: number): boolean {
    const now = Date.now();
    const entry = rateLimitStore.get(key);

    if (!entry || now > entry.resetAt) {
        // First request or window expired — start fresh
        rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
        return false;
    }

    if (entry.count >= limit) return true;

    entry.count += 1;
    return false;
}

function getIp(request: NextRequest): string {
    return (
        request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
        request.headers.get('x-real-ip') ||
        'unknown'
    );
}

// ─── Route-level limits ───────────────────────────────────────────────────────
const LIMITS: Record<string, { limit: number; windowMs: number }> = {
    // Login: 5 attempts per 15 minutes — prevents brute-forcing the secret key
    '/login': { limit: 5, windowMs: 15 * 60 * 1000 },
    // Subscribe: 3 attempts per hour per IP
    '/api/subscribe': { limit: 3, windowMs: 60 * 60 * 1000 },
    // Comments: handled in server actions, but add a burst guard here too
    '/api/comment': { limit: 10, windowMs: 60 * 60 * 1000 },
};

// Also protect every Next.js server action call (`_rsc` / `__NEXT_ROUTER_STATE_TREE__` etc.)
// by checking any POST/form action to known paths.
const ACTION_LIMITS: Record<string, { limit: number; windowMs: number }> = {
    // These match the `pathname` of server-action POST requests
    'subscribe': { limit: 3, windowMs: 60 * 60 * 1000 },
    'message': { limit: 5, windowMs: 24 * 60 * 60 * 1000 },
    'comment': { limit: 10, windowMs: 60 * 60 * 1000 },
    'login': { limit: 5, windowMs: 15 * 60 * 1000 },
};

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const ip = getIp(request);

    // ── 1. Protect /studio — must be logged in ──────────────────────────────
    if (pathname.startsWith('/studio')) {
        const adminAuth = request.cookies.get('admin_auth')?.value;
        if (adminAuth !== 'true') {
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    // ── 2. Rate-limit the login page itself ─────────────────────────────────
    if (pathname === '/login' && request.method === 'POST') {
        const key = `${ip}:login`;
        if (isRateLimited(key, 5, 15 * 60 * 1000)) {
            return new NextResponse('Too many login attempts. Try again later.', {
                status: 429,
                headers: { 'Retry-After': '900' },
            });
        }
    }

    // ── 3. Rate-limit Next.js Server Actions ────────────────────────────────
    // Server actions POST to the page URL with a special header.
    // We identify them by the Next-Action header and rate-limit by IP.
    const isServerAction = request.headers.get('next-action') !== null;
    if (isServerAction && request.method === 'POST') {
        // We can't read the body in middleware (streaming), so we gate by
        // page path. Actions on public pages (home, blog, login) are limited.
        let actionKey: string | null = null;
        if (pathname === '/' || pathname.startsWith('/blog')) {
            // subscribe / comment / message actions live under public pages
            actionKey = 'public_action';
        } else if (pathname === '/login') {
            actionKey = 'login';
        }

        if (actionKey) {
            // 30 server-action calls per minute per IP on any public page
            const limit = actionKey === 'login' ? 5 : 30;
            const window = actionKey === 'login' ? 15 * 60 * 1000 : 60 * 1000;
            const key = `${ip}:${actionKey}`;
            if (isRateLimited(key, limit, window)) {
                return new NextResponse(
                    JSON.stringify({ error: 'Too many requests. Please slow down.' }),
                    { status: 429, headers: { 'Content-Type': 'application/json', 'Retry-After': '60' } }
                );
            }
        }
    }

    return NextResponse.next();
}

export const config = {
    // Run middleware on all pages + API routes except static assets
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|logo_nav.png|.*\\.png|.*\\.jpg|.*\\.svg).*)',
    ],
};

