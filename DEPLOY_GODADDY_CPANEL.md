# FinReady Deployment to GoDaddy cPanel

This project supports two cPanel deployment tracks:

- `Track A (recommended):` Node.js app + Next.js + MySQL (full backend/auth/API mode)
- `Track B:` Static HTML mode (UI-only + local browser storage fallback)

## Track A: Node.js + MySQL (full app)

## 1. Prerequisites in cPanel

Confirm your hosting includes all of these:

- `Setup Node.js App` (or `Application Manager`)
- `MySQL Databases`
- SSH access (recommended)

If Node.js app setup is missing, this full stack (Next + API + DB auth) cannot run as-is.

## 2. Create MySQL database and user

In cPanel:

1. Open `MySQL Databases`.
2. Create database, for example `finready_db`.
3. Create user, for example `finready_user`.
4. Add user to database with `ALL PRIVILEGES`.

Keep these values for `DATABASE_URL`.

## 3. Upload project

Upload code to application root, for example `~/finready`.

Include:

- `app/`, `assets/`, `public/`, `lib/`, `prisma/`, `scripts/`, `data/`
- Root HTML files (`index.html`, `ai-tools.html`, etc.)
- `package.json`, `package-lock.json`, `next.config.mjs`, `jsconfig.json`, `app.js`

Do not upload `node_modules` or `.next`.

## 4. Install/build on server

```bash
cd ~/finready
npm ci
npm run build
```

## 5. Environment variables

Set in cPanel Node app environment (or `.env`):

- `NODE_ENV=production`
- `HOSTNAME=0.0.0.0`
- `DATABASE_URL=mysql://DB_USER:DB_PASSWORD@localhost:3306/DB_NAME`
- `ADMIN_EMAIL=admin@finready.ai`
- `ADMIN_PASSWORD=<strong-random-password>`
- `ADMIN_NAME=FinReady Admin`
- optional: `FINREADY_CRM_WEBHOOK_URL=<https webhook>`

## 6. Initialize database schema

Run once after setting `DATABASE_URL`:

```bash
cd ~/finready
npm run prisma:push
npm run prisma:seed
```

If migrating existing local file data (`data/app-data.json`, `data/form-submissions.ndjson`):

```bash
node scripts/migrate-file-data-to-db.mjs
```

## 7. Configure Node app in cPanel

In `Setup Node.js App`:

- Node.js version: `20+`
- Mode: `Production`
- App root: `finready`
- Startup file: `app.js`
- App URL: your domain/subdomain

Restart app after save.

## 8. Verify

Check:

- `/` loads styled homepage
- `/enterprise`, `/team-dashboard`, `/help-center` load
- register/login works
- `/api/app-data` returns `storageMode: "database"`
- admin leads endpoint `/api/forms?limit=10` works only with admin session
- `/api/dashboard/summary`, `/api/payroll-requests`, `/api/recruitment-requests` respond

## 9. Update deployment

```bash
cd ~/finready
git pull
npm ci
npm run build
npm run prisma:migrate || npm run prisma:push
```

Restart app in cPanel.

## Track B: Static HTML (if Node app is unavailable)

Use this only when cPanel does not provide Node.js application hosting.

1. Upload these to `public_html/finready`:
- all root `*.html` files
- `assets/`
- `data/` (optional, for local migration files)

2. Open `https://your-domain/finready/index.html`.

3. Behavior in static mode:
- UI/UX pages, navigation, and styling work
- forms are saved in browser local storage fallback
- dashboard cards use local browser metrics fallback
- DB-backed auth/API features do not run server-side in this mode

4. Before any Next.js build/deploy, run:

```bash
npm run sync:assets
```
