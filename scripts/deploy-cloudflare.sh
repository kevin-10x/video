#!/bin/bash
# Cloudflare Deployment Script for AfroToon AI
# Usage: ./scripts/deploy-cloudflare.sh [preview|production]

set -e

ENV=${1:-preview}
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "🚀 Deploying AfroToon AI to Cloudflare ($ENV)..."

# Check wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler not found. Installing..."
    npm install -g wrangler
fi

# Login check
if ! wrangler whoami &> /dev/null; then
    echo "🔐 Please login to Cloudflare:"
    wrangler login
fi

# Build and deploy API Worker
echo "📦 Building API Worker..."
cd "$ROOT_DIR/workers/api"
npm ci
npm run deploy:$ENV

# Build and deploy AI Consumer Worker
echo "📦 Building AI Consumer Worker..."
cd "$ROOT_DIR/workers/api-consumer"
npm ci
npm run deploy:$ENV

# Build and deploy Frontend to Pages
echo "📦 Building Frontend for Cloudflare Pages..."
cd "$ROOT_DIR/client"
npm ci
npm run build
npx wrangler pages deploy ./vercel-output --project-name=afrotoon-frontend --branch=$ENV

echo "✅ Deployment complete!"
echo ""
echo "📋 Deployment Summary ($ENV):"
echo "   API Worker: https://afrotoon-api.$ENV.your-subdomain.workers.dev"
echo "   AI Consumer: https://afrotoon-ai-consumer.$ENV.your-subdomain.workers.dev"
echo "   Frontend: https://afrotoon-frontend.$ENV.pages.dev"
echo ""
echo "🔧 Next steps:"
echo "   1. Set secrets: wrangler secret put JWT_SECRET --env $ENV"
echo "   2. Set secrets: wrangler secret put DATABASE_URL --env $ENV"
echo "   3. Set secrets: wrangler secret put MINIO_SECRET_KEY --env $ENV"
echo "   4. Configure custom domains in Cloudflare Dashboard"
echo "   5. Set up D1 database: wrangler d1 execute afrotoon-db --file=./database/schema.sql --env=$ENV"