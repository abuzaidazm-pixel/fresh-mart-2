# Deploying FreshMart Local

Pre-flight checks already done: `npm install` + `npm run build` complete cleanly,
all 16 routes compile, `.gitignore` correctly excludes `node_modules`, `.next`, and `.env*`.

---

## Step 1 — Use the empty `fresh-mart-2` repo

`fresh-mart-2` already exists and is empty — that is exactly what we need.

**Do not use `FRESH-MART`.** That repo contains only documentation and config
(`README.md`, `QUICKSTART.md`, `DEPLOYMENT.md`, `vercel.json`, `.env.production`,
`.dockerignore`, `.npmrc`) — there is **no `package.json` and no `src/`** in it, so
there is nothing for Vercel to build. Its `vercel.json` also uses the retired
`"@secret"` syntax, which is what produces:

> Environment Variable "NEXT_PUBLIC_SUPABASE_URL" references Secret
> "next_public_supabase_url", which does not exist.

Vercel deleted legacy Secrets, so any `@name` reference in `vercel.json` now hard-fails.
Our repo has no `vercel.json` at all — Vercel auto-detects Next.js instead.

---

## Step 2 — Push the code

Open **PowerShell**:

```powershell
cd "$env:USERPROFILE\OneDrive\Desktop\New folder"

git add package.json package-lock.json DEPLOY.md
git commit -m "Bump Next.js to 14.2.35 (security patch); add deploy guide"

git branch -M main
git remote add origin https://github.com/abuzaidazm-pixel/fresh-mart-2.git
git push -u origin main
```

**If it says "remote origin already exists":**

```powershell
git remote set-url origin https://github.com/abuzaidazm-pixel/fresh-mart-2.git
git push -u origin main
```

Refresh the repo page — you should see **53 files**, with `package.json`,
`next.config.mjs`, and `src/` sitting at the top level, not nested in a subfolder.

---

## Step 3 — Deploy on Vercel

1. Go to **https://vercel.com/new**
2. Sign in with **Continue with GitHub** (first time: authorise the Vercel GitHub app)
3. Find `fresh-mart-2` in the repo list and click **Import**
4. **Check that Application Preset reads `Next.js`, not `Other`.** "Other" means
   Vercel can't see a `package.json` at the root — stop and check the push worked.
   Leave everything else at its default:
   - Framework Preset: `Next.js`
   - Build Command: `next build`
   - Output Directory: `.next`
   - Install Command: `npm install`
5. **Environment Variables: leave empty.** The app is built to run in zero-config
   demo mode with the seeded catalogue when no Supabase keys are present.
6. Click **Deploy**

The build takes roughly 2 minutes. You get a live URL of the form
`https://freshmart-local-<hash>.vercel.app`.

---

## Step 4 — Connect Supabase

With no keys set the app runs on seeded demo data in localStorage. These steps
switch it to a real database with real accounts.

### 4a. Create the project

1. Sign in at **supabase.com** → **New Project**
2. Name it `freshmart`, set a strong database password, pick the region nearest
   your customers
3. Wait for provisioning (~2 minutes)

### 4b. Run the schema

1. **SQL Editor → New Query**
2. Paste the entire contents of `supabase/schema.sql` and click **Run**
3. You should see `Success. No rows returned`

That creates 7 tables, the RLS policies, and three transactional functions
(`place_order`, `admin_adjust_stock`, `admin_cancel_order`), then seeds 9
departments and 15 products.

### 4c. Add the keys to Vercel

1. Supabase → **Project Settings → API**, copy the **Project URL** and the
   **`anon` public** key
2. Vercel → **Project → Settings → Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. **Deployments → ⋯ → Redeploy**

> **Never add `SUPABASE_SERVICE_ROLE_KEY`.** It bypasses every RLS policy, and
> anything named `NEXT_PUBLIC_*` is shipped to the browser — publishing it hands
> every visitor full read/write on your database. The app never uses it.

The `anon` key is *designed* to be public. RLS is what protects the data, which
is why the policies matter more than the key does.

### 4d. Make yourself an admin

Roles are never self-assigned — the signup trigger hard-codes every new profile
to `customer`, so nobody can register as staff.

1. Open the deployed site and **sign up** with your own email
2. In the Supabase **SQL Editor**, run:

```sql
update public.profiles set role = 'admin' where email = 'you@example.com';
```

3. Sign out, sign back in, and `/admin` opens

To check who has access at any time:

```sql
select email, role, created_at from public.profiles order by created_at;
```

### 4e. Email confirmation

By default Supabase emails a confirmation link before the first sign-in. For a
demo, turn it off under **Authentication → Providers → Email → Confirm email**
so accounts work immediately. Leave it **on** for anything real.

---

## What changes once Supabase is connected

| | Demo mode (no keys) | Supabase connected |
|---|---|---|
| Data | localStorage, per browser | Postgres, shared by everyone |
| Sign-in | Any email, no password check | Real Supabase Auth |
| Admin access | `admin123` passcode | `profiles.role = 'admin'`, enforced by RLS |
| Role switcher / Reset Demo | Shown | Hidden — they'd be meaningless or destructive |
| Checkout | Priced in the browser | Priced by `place_order()` in the database |
| Overselling | Possible under concurrency | Blocked by row locks |
| Failed writes | Silent | Surfaced as an error toast |

### Why checkout goes through a database function

The browser sends only product ids and quantities. `place_order()` recomputes
prices, delivery fee, tax and total from the `products` table, checks stock under
a `FOR UPDATE` row lock, then writes the order, its line items, the stock
deduction and the audit rows in a single transaction.

That matters because anything the browser sends can be edited. If the client
computed the total, a tampered request could buy a full basket for one cent — and
two shoppers taking the last item at the same moment would both succeed. The
delivery fee (3.99), free-delivery threshold (35) and tax rate (8%) inside the
function are kept in step with `src/context/CartContext.tsx`; **if you change one,
change the other**, or the shopper is charged a different total than they saw.

---

## After this, deployment is automatic

Every `git push` to `main` triggers a fresh production deploy. Pushes to any
other branch get their own preview URL.

```powershell
git add -A
git commit -m "your message"
git push
```

---

## Troubleshooting

| Symptom | Cause / fix |
|---|---|
| Vercel build fails on `next/font` | Transient Google Fonts fetch failure. Redeploy. |
| `Support for the experimental syntax...` | Node version mismatch — set Node 20.x in Vercel → Settings → General |
| Images don't load | Host must be listed in `next.config.mjs` → `images.remotePatterns` |
| Push rejected, "fetch first" | The GitHub repo wasn't empty. `git push -u origin main --force` (safe here — yours is the only history) |
| `references Secret "...", which does not exist` | A `vercel.json` in the repo uses the retired `@secret` syntax. Delete the `"env"` block from it, or use a repo that has no `vercel.json`. |
| Application Preset shows `Other` | No `package.json` at the repo root — the push didn't land, or the code is nested one folder deep. Set **Root Directory** to that subfolder, or re-push from the correct directory. |
| Site still shows demo data after adding keys | Env vars are read at build time. Redeploy after adding them. |
| `/admin` says "Staff access required" | Your profile is still `customer`. Run the `update public.profiles …` statement in 4d, then sign out and in. |
| "Adding the product was blocked" | You're signed in as a customer, or the session expired. RLS refused the write — that message is the safeguard working. |
| Sign-in does nothing, no error | Email confirmation is on and the link hasn't been clicked. See 4e. |
| `Only 3 left of …` at checkout | Real stock check from the database. Someone bought it, or the catalogue quantity is low. |
| Orders empty for a signed-out visitor | Guest orders have `user_id = null` and the RLS SELECT policy only returns your own. The receipt still shows because `place_order()` returns the order directly. |
