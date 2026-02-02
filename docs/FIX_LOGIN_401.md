# Fix: Login returns 401 Unauthorized

## Cause

The backend was not matching auth routes because **Better Auth’s base URL must include `/api/auth`**. Without it, the path is not normalized correctly and sign-in can return 401 (or 404).

## Fix (backend on Vercel)

1. Open your **API** project on Vercel (skill-bridge-server).
2. Go to **Settings → Environment Variables**.
3. Set **BETTER_AUTH_URL** to your backend URL **including** `/api/auth`:
   - **Name:** `BETTER_AUTH_URL`
   - **Value:** `https://skill-bridge-server-eight.vercel.app/api/auth`  
     (use your real API URL; no trailing slash)
4. **Redeploy** the API (Deployments → ⋮ on latest → Redeploy).

## Verify

From your machine (replace the URL if different):

```bash
curl -X POST "https://skill-bridge-server-eight.vercel.app/api/auth/sign-in/email" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@skillbridge.demo","password":"Admin123!"}'
```

You should get **HTTP 200** and a JSON body with `token` and `user`. If you get 401, the env var is wrong or the deploy did not pick it up.

## Frontend: request must match

The frontend must call the **same** URL and body:

- **URL:** `https://<your-api-domain>/api/auth/sign-in/email`
- **Method:** `POST`
- **Header:** `Content-Type: application/json`
- **Body (JSON):** `{ "email": "...", "password": "..." }`
- **Credentials:** use `credentials: "include"` if you rely on cookies.

If login works with curl but not in the browser, the frontend URL, body, or headers are different from the curl above.
