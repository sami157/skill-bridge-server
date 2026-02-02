# Fix 403 Invalid origin on Vercel (sign-in)

The backend is already configured to **disable** origin/CSRF checks and to **allow** your frontend origin. If you still get `403 INVALID_ORIGIN`, Vercel is almost certainly running an **old build**.

## Do this (in order)

### 1. Build locally

```bash
npm run build
```

This updates `api/vercel.mjs` with the current auth config (including `disableOriginCheck: true`, `disableCSRFCheck: true`, and the `trustedOrigins` function).

### 2. Commit and push everything

```bash
git add src/lib/auth.ts api/vercel.mjs
git status   # confirm both are staged
git commit -m "fix: disable Better Auth origin check, allow frontend origin"
git push
```

If `api/` is in `.gitignore`, remove it for `api/vercel.mjs` (or use a Vercel build step that runs `npm run build` on deploy so `api/vercel.mjs` is built on Vercel).

### 3. Force Vercel to use the new build (clear cache)

1. Open **Vercel** → your **skill-bridge-server** project.
2. Go to **Deployments**.
3. Open the **⋯** menu on the latest deployment (or the one you just pushed).
4. Click **Redeploy**.
5. **Check “Clear build cache”** (or “Redeploy with existing build cache cleared”).
6. Confirm **Redeploy**.

Without clearing the cache, Vercel may reuse an old `api/vercel.mjs` and you’ll keep getting 403.

### 4. Try sign-in again

From `https://skill-bridge-one-pi.vercel.app`, try signing in again. The 403 should stop after the redeploy with cleared cache.

---

**If you use “Build and Output Settings” on Vercel:** set **Build Command** to `npm run build` and **Output Directory** to the root (or wherever `api/vercel.mjs` ends up). Then every deploy runs the latest `src/lib/auth.ts` and overwrites `api/vercel.mjs`, so you don’t rely on a committed `api/vercel.mjs` and cache is less of an issue.
