# FinReady Architecture

## Runtime Modes

- `Next.js + Node` (recommended production):
  - server entry: `app.js`
  - dynamic route loader: `app/[[...slug]]/page.js`
  - APIs: `app/api/*`
- `Static HTML` fallback (`/finready/*.html` in Apache/XAMPP):
  - rendered directly from root HTML files
  - JS rewrites links for static mode automatically
  - request forms persist to local storage when APIs are unavailable
  - dashboard summary cards read local browser data in static mode

## Data Storage

### Production (recommended)

- Database: MySQL via Prisma
- Schema: `prisma/schema.prisma`
- Client: `@prisma/client` through `lib/server/prisma.js`
- Auth sessions: `Session` table + httpOnly cookie (`finready_session`)

### Local fallback (no `DATABASE_URL`)

- Users: `data/app-data.json`
- Lead submissions: `data/form-submissions.ndjson`

## Security Controls

- Password hashing: `bcryptjs`
- Session cookie: httpOnly + sameSite
- Admin-gated lead listing (DB mode): `/api/forms?limit=...`
- In-memory rate limiting:
  - forms API
  - auth API
- Input validation with Zod:
  - form payload
  - register/login payloads

## Page Structure

### Marketing

- `/`, `/ai-tools`, `/tool-detail`, `/courses`, `/course-detail`
- `/certifications`, `/pricing`, `/about`, `/blog`, `/contact`, `/careers`
- `/case-studies`, `/roi-calculator`, `/enterprise`

### Product / User

- `/login`, `/register`, `/dashboard`
- `/my-courses`, `/my-certificates`
- `/team-dashboard`, `/reports`
- `/payroll-ai`, `/recruitment-ai`
- `/book-demo`, `/thank-you`, `/admin`
- Admin suite:
  - `/admin` (overview)
  - `/admin-leads`
  - `/admin-users`
  - `/admin-operations`
  - `/admin-analytics`

### Support / Legal

- `/help-center`, `/faq`, `/privacy`, `/terms`

## Database Bootstrap

1. Set `DATABASE_URL` in environment
2. `npm run prisma:push`
3. `npm run prisma:seed`
4. optional: `npm run db:migrate-files`

## Optimization Status

Current:

- Shared CSS/JS architecture working for static + Next modes
- Route-level static generation for all mapped pages
- Security headers configured in `next.config.mjs`
- `dashboard-module.js` extracted from `main.js` for dashboard/admin/request concerns
- Asset sync automation for dual runtime support:
  - `npm run sync:assets`
  - mirrored into `predev`, `prebuild`, `prestart:next`

Next optimization steps:

1. Split remaining `main.js` logic into `forms/auth` and `catalog/filters` modules.
2. Move repeated inline styles into reusable CSS classes.
3. Introduce API caching strategy for public datasets.
4. Add E2E smoke tests for auth + forms + admin flows.
5. Add image optimization (`next/image`) if transitioning from static HTML fragments to full React components.
