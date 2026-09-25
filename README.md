# KisanGyan · किसान मित्र

A Hindi-first farming companion built with React, Tailwind CSS, Framer Motion, FastAPI and MongoDB.

## Included

- Guest-accessible voice companion, market catalog, mandi tracker, crop scanner and government helpline.
- Hindi/English interface; Hindi, English, Marathi and Punjabi sample voice answers.
- Optional demo profiles with persisted farm details, question history and crop reports.
- Callback and product enquiry records saved in MongoDB with reference numbers.
- Responsive desktop and mobile layouts, keyboard-accessible dialogs and thumb-friendly bottom navigation.

## Application status

This is an interactive demonstration edition. Voice responses, OTP/Google identity verification, disease inference, prices and field telemetry are **simulated** and labeled accordingly in the app. Each login creates an isolated demo profile; it is not production identity verification. Images are validated but not analyzed or stored. Callback and product requests are saved, **not dispatched**. Payments, delivery and WhatsApp AI are not connected. Browser speech output depends on installed voices. Real services and verified agricultural data must be connected before offering this as a live advisory service.

## Repository

```
backend/       FastAPI application, models and pinned Python dependencies
frontend/      React application and Vercel configuration
render.yaml    Render API + optional static frontend Blueprint
DEPLOYMENT.md  Exact hosting setup and verification steps
```

## Hosting setup

Follow [DEPLOYMENT.md](DEPLOYMENT.md). The prepared primary layout is **Vercel frontend + Render backend**, with a managed MongoDB database. The Blueprint also includes a Render static frontend if you choose to keep both services there.

The hosting files do not create accounts, provision a database, or publish an application automatically. No real service credentials are included.

## Local development

Use Node.js 22 and Python 3.11. The base `.env` files contain only non-secret development defaults needed by the build platform. For your own local settings, copy each `.env.example` to an ignored `.env.local` file and fill every value there, or export the values in your shell. Both apps honor local overrides without overriding host-supplied variables. Never place real credentials in the base `.env` files.

Backend:

```
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn server:app --host 0.0.0.0 --port "$PORT"
```

Set `PORT` in your local shell before starting. The existing managed development environment runs the API on port 8001 through its supervisor; do not start an additional server there.

Frontend:

```
cd frontend
yarn install --frozen-lockfile
yarn start
```

The frontend reads `REACT_APP_BACKEND_URL` at build time. All API routes are prefixed `/api`; the variable must contain only the backend origin, without that suffix.

## Verification

- `GET /api/health` checks both the API and MongoDB connectivity.
- `yarn build` creates the frontend production bundle.
- API regression tests live in `backend/tests/test_kisangyan_api.py`. Install `pytest` and `requests` for development tests, export `REACT_APP_BACKEND_URL`, `MONGO_URL`, and `DB_NAME`, then run `pytest backend/tests -q`.
- Demo OTP: `123456` (no SMS). Never enter a real Google password or any sensitive account credentials.

## Data and safety

Production MongoDB connection strings belong only in server-side environment settings. Base `.env` files are allowed in the repository only because they contain non-secret local defaults; `.env.local` and production override files remain git-ignored. No secrets belong in any `REACT_APP_*` variable because these values are embedded into the public JavaScript bundle. Use an explicit frontend origin for CORS. Crop treatment quantities are intentionally not invented: consult a registered product label and qualified agricultural expert.