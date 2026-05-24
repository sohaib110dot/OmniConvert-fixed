# OmniConvert

Image conversion and compression (JPG, PNG, WEBP, AVIF, SVG) with optional MongoDB, Redis, and R2 storage.

## Run locally

**Prerequisites:** Node.js 20+

1. Install dependencies: `npm install`
2. Copy environment variables into a local `.env` file (see variables below; do not commit secrets).
3. Development: `npm run dev`
4. Production build locally: `npm run build` then `npm start`

## Deploy to Render (staging)

Use a **Web Service** connected to this repository.

| Setting | Value |
|--------|--------|
| **Environment** | Node |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm start` |
| **Health Check Path** | `/api/v1/health` |

Render sets `PORT` automatically; the server listens on `process.env.PORT || 3000` and binds to `0.0.0.0`.

### Environment variables (Render dashboard)

Set these in the service **Environment** tab (use staging values; never commit real secrets):

| Variable | Required | Notes |
|----------|----------|--------|
| `NODE_ENV` | Yes | `production` |
| `MONGODB_URI` | Yes | MongoDB connection string |
| `REDIS_URL` | Optional | Job progress / caching |
| `S3_ACCESS_KEY` | Optional | R2/S3 access key |
| `S3_SECRET_KEY` | Optional | R2/S3 secret |
| `S3_ENDPOINT` | Optional | e.g. Cloudflare R2 endpoint |
| `S3_REGION` | Optional | Default `auto` |
| `S3_BUCKET` | Optional | Default `omni-convert-uploads` |
| `S3_PUBLIC_URL` | Optional | Public asset base URL |
| `GEMINI_API_KEY` | Optional | AI features only |

### Deploy steps

1. In [Render](https://render.com), create a **Web Service** and connect `https://github.com/sohaib110dot/OmniConvert-fixed`.
2. Use the build and start commands above.
3. Add environment variables from the table.
4. Deploy. Confirm `/api/v1/health` returns `200` with `database` and optional service flags.
5. Open the service URL and smoke-test a JPG → WEBP conversion.

### Scripts reference

- `npm run build` — Vite client build + esbuild server bundle to `dist/server.cjs`
- `npm start` — `node dist/server.cjs` (production entrypoint)
