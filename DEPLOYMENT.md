# KisanGyan hosting checklist

## Prepared architecture

```
Browser → React frontend (Vercel or Render static site)
        → HTTPS API (Render Python web service, routes /api/*)
        → Managed MongoDB
```

The current code supports this architecture without changing application source files. It remains the clearly labeled demonstration edition described in README.md, not a live AI/authentication/commerce integration.

The base `.env` files contain only non-secret development defaults and are included for build-platform compatibility. Never put production credentials in them. Secret-bearing `.env.local` and production override files remain ignored, and live credentials belong in host settings. Both hosting build paths also create a comment-only `.env` marker if absent; existing files are never overwritten, host environment values take priority and secrets are never written into generated files.

## 1. Prepare the database

Create a managed MongoDB database (for example, MongoDB Atlas), a database user with access limited to the chosen application database, and an appropriate network allowlist for the API service. Obtain its connection string from the provider. Percent-encode special characters in the username/password as instructed by the provider. Store the full URI only as backend `MONGO_URL`.

The development environment's `mongodb://localhost:27017` address cannot be used on Render: it refers to the Render container itself, which does not contain MongoDB. Do not overwrite the protected local development variables; set separate values in your hosting dashboards.

## 2. Backend on Render

Create a Python web service from the repository with these settings:

| Setting | Value |
|---|---|
| Root directory | `backend` |
| Python | `3.11.11` |
| Build command | `pip install -r requirements.txt && python prepare_env.py` |
| Start command | `uvicorn server:app --host 0.0.0.0 --port $PORT` |
| Health check | `/api/health` |

`PORT` is supplied by Render. Do not hardcode a port in the application. The managed local development supervisor continues to use its existing port 8001.

Required server environment variables:

| Variable | Value to supply |
|---|---|
| `MONGO_URL` | Your managed MongoDB connection string |
| `DB_NAME` | Your application database name |
| `CORS_ORIGINS` | Exact HTTPS frontend origin; comma-separate additional allowed origins. No paths or trailing slash. |

After creation, copy the actual API service origin from the dashboard. Verify `GET <API origin>/api/health` returns `{"status":"healthy","database":"connected"}`. A 503 response means the database settings, credentials or network allowlist need attention.

## 3. Frontend on Vercel

Create a frontend project from the same repository:

| Setting | Value |
|---|---|
| Root directory | `frontend` |
| Framework | Create React App |
| Node.js | `22.x` |
| Install command | `yarn install --frozen-lockfile` |
| Build command | `node scripts/validate-env.cjs && yarn build` |
| Output directory | `build` |

`frontend/vercel.json` supplies build settings, response headers and React-router rewrites. Set **`REACT_APP_BACKEND_URL` to the actual Render backend origin**. Do not append `/api`. Add the Vercel frontend origin to backend `CORS_ORIGINS` once it is known.

The checked-in development frontend origin is not your deployed API. Explicitly override it in Vercel/Render environment settings before building; otherwise the application will still contact the development preview.

Enable this variable for the relevant Vercel environments. Every time its value changes, rebuild the frontend: React embeds it at build time. Do not put database credentials, tokens or any secret in frontend environment variables.

Vercel preview URLs change between deployments. Add an exact preview origin to CORS when you need to test it; do not allow arbitrary origins simply to bypass a CORS error. A stable production domain avoids this issue.

## Alternative: frontend also on Render

The repository's `render.yaml` defines both the API service and an optional static frontend. Import it as a Blueprint and enter its required environment variables, or create the static site manually:

| Setting | Value |
|---|---|
| Root directory | `frontend` |
| Build command | `yarn install --frozen-lockfile && node scripts/validate-env.cjs && yarn build` |
| Publish directory | `build` |
| Environment | `REACT_APP_BACKEND_URL` = backend origin, `NODE_VERSION` = `22` |
| Rewrite | `/*` → `/index.html` |

Use the Render static frontend origin in API `CORS_ORIGINS`. If using Vercel, create only the API manually rather than importing the two-service Blueprint unnecessarily.

## Final smoke checks

1. Confirm `/api/health` responds successfully against the hosted database.
2. Open `/market`, `/voice`, `/scanner`, `/helpline` and `/farm` directly and refresh each page. Rewrites must preserve these routes.
3. Confirm the browser's network requests point to the new API, not the development preview origin. Missing frontend environment settings fail the build.
4. Create a demo profile with OTP `123456`, save farm details, refresh, and verify the values persist.
5. Submit a callback or product enquiry, retain its reference, and confirm the record exists in the managed database.
6. Check scanner uploads and voice responses. These remain simulations, with no external AI charges.
7. Check the interface on a phone and ensure no browser CORS/mixed-content errors appear.

## Common setup errors

- **CORS error:** use the exact current frontend origin in `CORS_ORIGINS`; no `/api`, paths, trailing slash or unlisted domain.
- **Database unavailable:** check database network rules and URI; do not use localhost on a remote host.
- **Blank frontend or incorrect API:** provide `REACT_APP_BACKEND_URL` before the build and rebuild after changing it.
- **404 after refresh:** keep the frontend rewrite to `/index.html`.
- **Import/build failure:** use the pinned Python dependency file and supported Node/Python versions. No Emergent integration package is required at runtime.

## Before a real farmer-facing production launch

Replace the demo authentication with verified identity, integrate approved agricultural advice and market/weather sources, connect WhatsApp/callback operations if needed, add abuse controls and retention policies, and perform a separate security/privacy review. The included deployment configuration does not itself turn sample advice or simulated authentication into live services.