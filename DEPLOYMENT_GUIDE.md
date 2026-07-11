# 🚀 AfroToon AI - Complete Deployment Guide

## Architecture Overview
```
┌──────────────┐     ┌──────────────────┐     ┌──────────────┐
│   Vercel     │────▶│     Railway      │────▶│ PostgreSQL   │
│  (Next.js)   │     │  (Express API)   │     │   + Redis    │
└──────────────┘     └──────────────────┘     └──────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │   Railway    │
                    │  (FastAPI)   │
                    └──────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │   MinIO/S3   │
                    │  (Storage)   │
                    └──────────────┘
```

---

## Prerequisites
- GitHub account with repo: `https://github.com/kevin-10x/video`
- Vercel account (free tier)
- Railway account (free $5/month credit)
- Domain names (optional but recommended)

---

## PART 1: Deploy Backend to Railway (Do This First)

### Step 1: Create Railway Project
```bash
# 1. Go to https://railway.app and sign up with GitHub
# 2. Click "New Project" → "Deploy from GitHub repo"
# 3. Select: kevin-10x/video
# 4. Select folder: /server (for Express API)
```

### Step 2: Add Databases
```bash
# In Railway dashboard:
# 1. Click "+ New" → "Database" → "PostgreSQL"
# 2. Click "+ New" → "Database" → "Redis"
# 3. Note the connection URLs (auto-injected as env vars)
```

### Step 3: Configure Environment Variables (Railway Dashboard → Variables)
```env
# Auto-provided by Railway (DON'T CHANGE):
DATABASE_URL=postgresql://...
REDIS_URL=redis://...

# YOU MUST SET THESE:
NODE_ENV=production
PORT=3001
JWT_SECRET=generate-64-char-random-string-here
ENCRYPTION_KEY=generate-32-char-random-string
MINIO_ENDPOINT=your-minio-host.com
MINIO_PORT=443
MINIO_USE_SSL=true
MINIO_ACCESS_KEY=your-access-key
MINIO_SECRET_KEY=your-secret-key
MINIO_BUCKET=adamae
MINIO_PUBLIC_URL=https://your-minio-host.com/adamae
AI_SERVICE_URL=https://your-ai-service.railway.app
AI_SERVICE_TOKEN=generate-random-token
CLIENT_URL=https://your-frontend.vercel.app
API_URL=https://your-api.railway.app
GOOGLE_CLIENT_ID=your-google-oauth-id
GOOGLE_CLIENT_SECRET=your-google-oauth-secret
GITHUB_CLIENT_ID=your-github-oauth-id
GITHUB_CLIENT_SECRET=your-github-oauth-secret
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
EMAIL_FROM=AfroToon AI <noreply@yourdomain.com>
FREE_CREDITS=100
CREDIT_RESET_DAYS=30
```

### Step 4: Configure Build Settings
```bash
# In Railway Settings:
# Build Command: npm run build
# Start Command: npm start
# Watch Paths: server/**
```

### Step 5: Deploy Express API
```bash
# Railway auto-deploys on push to main
# Or manually: railway up --service=server
```

---

## PART 2: Deploy AI Service to Railway

### Step 1: Add Second Service
```bash
# In same Railway project:
# 1. Click "+ New" → "Service" → "GitHub Repo"
# 2. Select: kevin-10x/video
# 3. Select folder: /ai
# 4. Name: "ai-service"
```

### Step 2: Configure AI Service Variables
```env
REDIS_URL=redis://... (same as Express)
MINIO_ENDPOINT=your-minio-host.com
MINIO_PORT=443
MINIO_USE_SSL=true
MINIO_ACCESS_KEY=your-access-key
MINIO_SECRET_KEY=your-secret-key
MINIO_BUCKET=adamae
DEVICE=cpu
MAX_CONCURRENT_JOBS=2
AI_SERVICE_TOKEN=same-token-as-express-api
PYTHONUNBUFFERED=1
```

### Step 3: AI Service Build Settings
```bash
# Build: Docker (uses Dockerfile)
# Start: uvicorn main:app --host 0.0.0.0 --port 8000 --workers 1
```

---

## PART 3: Configure MinIO Storage

### Option A: Railway MinIO (Easiest)
```bash
# 1. In Railway: "+ New" → "Service" → "Docker Image"
# 2. Image: minio/minio:latest
# 3. Command: server /data --console-address ":9001"
# 4. Variables:
MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=super-secret-password
# 5. Expose ports 9000, 9001
# 6. Add custom domain for MinIO console
```

### Option B: Cloudflare R2 (Cheaper, No Server Management)
```bash
# 1. Go to Cloudflare Dashboard → R2
# 2. Create bucket: "adamae"
# 3. Create API token with R2 permissions
# 4. Use these in Railway variables:
MINIO_ENDPOINT=your-account-id.r2.cloudflarestorage.com
MINIO_PORT=443
MINIO_USE_SSL=true
MINIO_ACCESS_KEY=your-r2-access-key
MINIO_SECRET_KEY=your-r2-secret-key
MINIO_PUBLIC_URL=https://pub-your-bucket.r2.dev
```

---

## PART 4: Deploy Frontend to Vercel

### Step 1: Import Project
```bash
# 1. Go to https://vercel.com/new
# 2. Import from GitHub: kevin-10x/video
# 3. Root Directory: client
# 4. Framework: Next.js (auto-detected)
```

### Step 2: Configure Environment Variables (Vercel Dashboard → Settings → Environment Variables)
```env
# REQUIRED:
NEXT_PUBLIC_API_URL=https://your-api.railway.app
NEXT_PUBLIC_AI_URL=https://your-ai.railway.app

# OPTIONAL (if using auth on frontend):
NEXT_PUBLIC_APP_URL=https://your-frontend.vercel.app
```

### Step 3: Deploy
```bash
# Click "Deploy" - Vercel builds and deploys automatically
# Custom domain: Settings → Domains → Add yourdomain.com
```

---

## PART 5: Connect Everything

### Update CORS in Express (server/src/index.ts)
```typescript
app.use(cors({
  origin: [
    'https://your-frontend.vercel.app',
    'https://your-custom-domain.com',
    'http://localhost:3000'  // for local dev
  ],
  credentials: true,
}));
```

### Update MinIO CORS Policy
```bash
# In MinIO console or via mc CLI:
mc alias set myminio https://your-minio-host.com ACCESS_KEY SECRET_KEY
mc anonymous set download myminio/adamae
# Set bucket policy for public read on assets
```

---

## PART 6: Custom Domains (Optional)

### Vercel (Frontend)
```bash
# 1. Vercel Dashboard → Settings → Domains
# 2. Add: app.yourdomain.com
# 3. Add DNS records:
#    Type: CNAME
#    Name: app
#    Value: cname.vercel-dns.com
```

### Railway (API & AI)
```bash
# 1. Railway Dashboard → Settings → Domains
# 2. Add: api.yourdomain.com (for Express)
# 3. Add: ai.yourdomain.com (for FastAPI)
# 4. Add DNS CNAME records pointing to Railway
```

---

## PART 7: Verify Deployment

### Health Checks
```bash
# Test all endpoints:
curl https://api.yourdomain.com/api/health
# {"server":"ok","database":"ok","redis":"ok","storage":"ok"}

curl https://ai.yourdomain.com/health
# {"status":"healthy","device":"cpu","models_loaded":true}

curl https://app.yourdomain.com
# Returns HTML
```

### Test Full Flow
```bash
# 1. Open https://app.yourdomain.com
# 2. Register account
# 3. Go to Dashboard → Video to Cartoon
# 4. Upload test video
# 5. Select "AFRICAN_CARTOON" style
# 6. Click "Start Processing"
# 7. Watch progress in real-time
# 8. Download result when complete
```

---

## PART 8: CI/CD (Automatic Deployments)

### GitHub Actions Already Configured
```yaml
# .github/workflows/ci-cd.yml triggers on push to main:
# 1. Lint + Test all services
# 2. Build Docker images
# 3. Push to ghcr.io
# 4. Deploy to Railway (via API)
# 5. Deploy to Vercel (automatic)
```

### Railway Auto-Deploy
```bash
# Settings → Deploy → "Auto-deploy on push" = ON
# Branch: main
```

### Vercel Auto-Deploy
```bash
# Automatic on push to main
# Preview deployments on PRs
```

---

## 🔐 Generate Secure Secrets

```bash
# Run these locally to generate secrets:
# JWT Secret (64 chars)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Encryption Key (32 chars)
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"

# AI Service Token
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 💰 Cost Estimate (Monthly)

| Service | Free Tier | Paid Estimate |
|---------|-----------|---------------|
| Vercel | ✅ Hobby | $20/mo Pro |
| Railway | $5 credit | $10-20/mo |
| PostgreSQL | Included | Included |
| Redis | Included | Included |
| MinIO (Railway) | Included | Included |
| **Total** | **$0** | **~$20-40/mo** |

---

## 🆘 Troubleshooting

| Issue | Solution |
|-------|----------|
| CORS errors | Check Express CORS origin matches Vercel domain exactly |
| 502 Bad Gateway | Check Railway logs: `railway logs --service=server` |
| AI jobs stuck | Check Redis connection, GPU memory (use CPU) |
| MinIO upload fails | Check bucket policy, CORS, public URL format |
| Prisma errors | Run `npx prisma migrate deploy` in Railway shell |

---

## 📋 Quick Checklist

- [ ] Railway project created
- [ ] PostgreSQL + Redis added
- [ ] Express API deployed (server/)
- [ ] AI Service deployed (ai/)
- [ ] MinIO/R2 configured
- [ ] All env vars set in Railway
- [ ] Vercel project imported (client/)
- [ ] Vercel env vars set
- [ ] Custom domains configured
- [ ] CORS updated in Express
- [ ] Test full flow works
- [ ] SSL certificates active

---

## 🎉 You're Live!

**Frontend:** https://app.yourdomain.com
**API:** https://api.yourdomain.com
**AI:** https://ai.yourdomain.com
**MinIO Console:** https://minio.yourdomain.com

**Next Steps:**
1. Set up monitoring (Sentry, LogRocket)
2. Add rate limiting
3. Configure backups for PostgreSQL
4. Set up staging environment