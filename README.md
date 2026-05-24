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

## Deploy on Hostinger VPS (Docker + existing Nginx)

Run OmniConvert in Docker on port **3001** on the host loopback only. Add a **new** Nginx `server` block for your subdomain; do not edit the config for your other site.

### Prerequisites on Ubuntu VPS

```bash
sudo apt update
sudo apt install -y ca-certificates curl git
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER
# log out and back in, then:
docker compose version
```

If the Compose plugin is missing:

```bash
sudo apt install -y docker-compose-plugin
```

### Deploy OmniConvert

```bash
sudo mkdir -p /var/www/omniconvert
sudo chown $USER:$USER /var/www/omniconvert
cd /var/www/omniconvert
git clone https://github.com/sohaib110dot/OmniConvert-fixed.git .
mkdir -p uploads
```

Create `/var/www/omniconvert/.env` on the server (never commit this file). Example keys only:

```env
NODE_ENV=production
PORT=3000
MONGODB_URI=your_mongodb_connection_string
REDIS_URL=
S3_ACCESS_KEY=
S3_SECRET_KEY=
S3_ENDPOINT=
S3_REGION=auto
S3_BUCKET=omni-convert-uploads
S3_PUBLIC_URL=
GEMINI_API_KEY=
```

Build and start:

```bash
cd /var/www/omniconvert
docker compose up -d --build
docker compose logs -f
```

Health check (from the VPS):

```bash
curl http://127.0.0.1:3001/api/v1/health
```

The container listens on **3000** internally; Docker maps **127.0.0.1:3001 → 3000**. The `./uploads` volume persists local storage fallback when S3/R2 is not configured.

### Nginx (separate site — do not modify other projects)

Create a new file, e.g. `/etc/nginx/sites-available/omniconvert`:

```nginx
server {
    listen 80;
    server_name convert.example.com;

    client_max_body_size 100M;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable and reload (leave your existing site configs unchanged):

```bash
sudo ln -s /etc/nginx/sites-available/omniconvert /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
sudo certbot --nginx -d convert.example.com
```

Replace `convert.example.com` with your real subdomain and point DNS to the VPS.

### Update after code changes

```bash
cd /var/www/omniconvert
git pull
docker compose up -d --build
```
