# Docker Build + Login Flow — Demo Report

**Date:** 2026-05-10
**Repo:** MarvelousME/MSP
**Branch:** `devin/1778418114-fix-docker-build-exclude-mobile`
**PR:** https://github.com/MarvelousME/MSP/pull/1

## TL;DR

End-to-end Docker demo **succeeds**. The front page is served from `http://localhost:3000`, an ADMIN user logs in via the OTP flow, and the post-login admin dashboard renders fully.

Two latent bugs were discovered and fixed during the demo:

1. **Auth cookie was set `Secure` over plain HTTP** — Chrome silently rejected it, so even though `verify-otp` returned 200 with a valid JWT, no cookie was stored and the next request looked unauthenticated.
2. **i18n middleware was rewriting `/api/auth/me` → `/en/api/auth/me`** — the admin page's auth-check API call 404'd, causing an instant client-side redirect back to `/login`.

Both fixes are in this branch.

---

## 1. Environment

| Component | Value |
|---|---|
| App image | `msp-app` (built locally from `./Dockerfile`) |
| Database | `postgres:16-alpine` |
| App URL | http://localhost:3000 |
| Postgres URL (host) | `postgresql://mystableprime:mystableprime@localhost:5433/mystableprime` |
| Postgres URL (in-net) | `postgresql://mystableprime:mystableprime@db:5432/mystableprime` |
| `NODE_ENV` (runner) | `production` |
| `RESEND_API_KEY` | `re_dummy_key_for_local_dev` (forces the localhost OTP fallback path) |
| `JWT_SECRET` | compose default (32-char placeholder) |

## 2. Build & Run

```bash
docker compose build
# Service app  Built

RESEND_API_KEY=re_dummy_key_for_local_dev docker compose up -d

docker compose ps
# NAME                STATUS
# mystableprime-app   Up
# mystableprime-db    Up (healthy)
```

`curl -L http://localhost:3000/` → HTTP 200 (redirects 307 → `/en` → 200 with title `My Stable Prime - Modern Affiliate Marketing Platform`).

## 3. DB setup

Schema applied to the running DB from the host:

```bash
DATABASE_URL="postgresql://mystableprime:mystableprime@localhost:5433/mystableprime" \
  npx prisma db push --accept-data-loss --skip-generate
# 🚀  Your database is now in sync with your Prisma schema.
```

Seed an ADMIN user (no Resend / mailbox needed — OTP is read from DB):

```bash
DATABASE_URL=... node scratch/create-admin.mjs
# {
#   "id": "cmp067yuv0000qhidhf63oaub",
#   "email": "admin@mystableprime.test",
#   "role": "ADMIN",
#   "status": "ACTIVE"
# }
```

## 4. OTP flow

Since no SMTP / Resend is configured locally, OTPs are read straight from the Postgres `otps` table:

```bash
docker exec mystableprime-db psql -U mystableprime -d mystableprime -t -A \
  -c "SELECT code FROM otps WHERE email='admin@mystableprime.test' AND is_used=false ORDER BY created_at DESC LIMIT 1;"
```

The `send-otp` API also conveniently echoes the code back in its response message when running on localhost:

```json
{"success":true,"message":"OTP generated (Check server logs for code: 993503)"}
```

This is intentional dev behavior in `src/app/api/auth/send-otp/route.ts` — only fires when `NEXT_PUBLIC_APP_URL` includes `localhost` AND Resend errors.

## 5. End-to-end browser flow

| Step | Action | Result |
|---|---|---|
| 1 | Open `http://localhost:3000` | 307 → `/en/login`, login form rendered |
| 2 | Enter `admin@mystableprime.test`, click "Proceed to Auth" | POST `/api/auth/send-otp` → 200, UI switches to "Security Shield" / 6-digit code input |
| 3 | Read OTP from DB (`993503`), type into form, click "Authorize Entry" | POST `/api/auth/verify-otp` → 200 with `Set-Cookie: auth-token=…` |
| 4 | Browser navigates to `/admin` | 307 → `/en/admin`, "Control Node" dashboard renders, sidebar shows "Marvin / ADMIN" |

### Screenshots

**Front page (login form):**
![Front page](https://app.devin.ai/attachments/d42fff7e-0b34-46b1-8b34-ab742033adb2/msp-frontpage.png)

**OTP entry step (after submitting email):**
![OTP form](https://app.devin.ai/attachments/98ec764c-6000-4d8a-8858-78847b3c63fe/msp-otp-form.png)

**Post-login admin dashboard (`/en/admin`):**
![Admin dashboard](https://app.devin.ai/attachments/5a282eb9-599f-40b1-b8bb-60724b3da444/msp-admin-dashboard.png)

**Admin dashboard scrolled — Manage.Partners / Payout.Engine / Reports widgets:**
![Admin dashboard 2](https://app.devin.ai/attachments/b20564aa-35a5-4e4b-91fe-12ea98832ff2/msp-admin-dashboard-2.png)

## 6. Bugs found and fixed during this demo

### 6.1 Auth cookies set as `Secure` on plain HTTP

**Symptom:** Browser POSTed `/api/auth/verify-otp`, server returned 200 with `Set-Cookie: auth-token=…; Secure; HttpOnly; SameSite=lax`. Chrome dropped the cookie (because `Secure` is forbidden over `http://`). The follow-up `router.push('/admin')` was made without the cookie → proxy redirected back to `/login`.

**Root cause:**
```ts
secure: process.env.NODE_ENV === 'production'
```
The Dockerfile pins `NODE_ENV=production` (line 29). The Docker compose stack is HTTP-only on the loopback. So `Secure` was always set, always rejected by the browser.

**Fix:** detect the actual request scheme (`x-forwarded-proto` header for proxied prod, `request.nextUrl.protocol` otherwise) and set `Secure` only when the request really is HTTPS. Applied in:

- `src/app/api/auth/verify-otp/route.ts`
- `src/app/api/auth/login/route.ts`
- `src/app/api/auth/logout/route.ts`

```ts
const proto = request.headers.get('x-forwarded-proto')
  || request.nextUrl.protocol.replace(':', '');
response.cookies.set('auth-token', token, {
  httpOnly: true,
  secure: proto === 'https',
  sameSite: 'lax',
  maxAge: 86400,
  path: '/',
});
```

On Vercel and any HTTPS prod deploy, `x-forwarded-proto: https` → `Secure` stays on. Behind no reverse proxy on HTTPS, `request.nextUrl.protocol === 'https:'` → `Secure` stays on. Only local HTTP loses the flag. No security regression.

### 6.2 i18n middleware rewrote `/api/auth/me` → `/en/api/auth/me`

**Symptom:** With a valid cookie in hand, `/en/admin` rendered (HTTP 200), but the admin page immediately client-side redirected to `/login` ~1 sec later.

**Network trace from a Playwright run:**
```
[307] GET /admin
[200] GET /en/admin              ← page rendered fine
[200] GET /_next/static/...      ← JS chunks
[307] GET /api/auth/me           ← admin page's "am I still logged in?" check
[404] GET /en/api/auth/me        ← THE BUG: locale prefix got added
[307] GET /login?_rsc=...        ← client thought we were logged out
[200] GET /en/login
```

**Root cause:** the proxy at `src/proxy.ts` auth-gates `/api/auth/me` correctly, but after verifying the JWT it does `intlMiddleware(request)` to populate the response with locale headers. `next-intl`'s middleware sees a path without a locale prefix and rewrites it to `/en/api/auth/me`, which doesn't exist.

**Fix:** for `/api/*` routes, skip `intlMiddleware` and just `NextResponse.next()` so the request is delivered as-is. For pages, keep the existing `intlMiddleware` behavior. Applied in `src/proxy.ts`:

```ts
// For API routes, skip i18n rewriting (it would 404 the route).
// For pages, run the i18n middleware so locale prefix is applied.
const response = pathname.startsWith('/api/')
  ? NextResponse.next()
  : intlMiddleware(request);
response.headers.set('x-user-id', payload.userId as string);
response.headers.set('x-user-role', userRole);
return response;
```

Verified with curl after rebuild:
```
$ curl -i --cookie "auth-token=…" http://localhost:3000/api/auth/me
HTTP/1.1 200 OK
x-user-id: cmp067yuv0000qhidhf63oaub
x-user-role: ADMIN
```

## 7. Reproducing this demo

```bash
# 1. Build & start
docker compose build
RESEND_API_KEY=re_dummy_key_for_local_dev docker compose up -d

# 2. Apply schema
DATABASE_URL="postgresql://mystableprime:mystableprime@localhost:5433/mystableprime" \
  npx prisma db push --accept-data-loss --skip-generate

# 3. Seed an ADMIN
DATABASE_URL="postgresql://mystableprime:mystableprime@localhost:5433/mystableprime" \
  node scratch/create-admin.mjs

# 4. Open browser
open http://localhost:3000   # macOS
# or: xdg-open http://localhost:3000

# 5. Enter email admin@mystableprime.test, submit.
# 6. Grab OTP:
docker exec mystableprime-db psql -U mystableprime -d mystableprime -t -A \
  -c "SELECT code FROM otps WHERE email='admin@mystableprime.test' AND is_used=false ORDER BY created_at DESC LIMIT 1;"

# 7. Paste OTP, click "Authorize Entry" → lands on /en/admin
```

## 8. Files changed in this demo session

| File | Change |
|---|---|
| `src/proxy.ts` | Skip i18n rewriting for `/api/*` routes after auth verification. |
| `src/app/api/auth/verify-otp/route.ts` | Set `Secure` cookie only when request is actually HTTPS. |
| `src/app/api/auth/login/route.ts` | Same. |
| `src/app/api/auth/logout/route.ts` | Same. |

## 9. Status

- Front page on localhost:3000 — **renders**
- Email entry, OTP request — **works**
- OTP retrieval (DB / send-otp response message) — **works**
- OTP verification + cookie set — **works**
- Redirect to `/admin` — **works**
- Admin dashboard rendering — **works**
- All Docker containers — **healthy**
