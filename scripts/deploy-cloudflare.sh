#!/bin/bash
# Cloudflare Deployment Script for AfroToon AI
# Usage: ./scripts/deploy-cloudflare.sh [preview|production]

set -e

ENV=${1:-preview}
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "🚀 Deploying AfroToon AI to Cloudflare ($ENV)..."

# Check wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "📦 Installing wrangler..."
    npm install -g wrangler
fi

# Login check
if ! wrangler whoami &> /dev/null; then
    echo "🔐 Please login to Cloudflare:"
    wrangler login
fi

# Deploy API Worker
echo "📦 Deploying API Worker..."
cd "$ROOT_DIR/workers/api"
npm ci
if [ "$ENV" = "production" ]; then
    wrangler deploy --env production
else
    wrangler deploy
fi

# Deploy AI Consumer Worker
echo "🤖 Deploying AI Consumer..."
cd "$ROOT_DIR/workers/api-consumer"
npm ci
if [ "$ENV" = "production" ]; then
    wrangler deploy --env production
else
    wrangler deploy
fi

# Build and Deploy Frontend to Pages
echo "🌐 Building Frontend for Cloudflare Pages..."
cd "$ROOT_DIR/client"
npm ci
npm run build:cf

echo "📦 Deploying to Cloudflare Pages..."
if [ "$ENV" = "production" ]; then
    npx wrangler pages deploy .vercel-output --project-name=afrotoon-frontend --branch=main
else
    npx wrangler pages deploy .vercel-output --project-name=afrotoon-frontend-preview --branch=preview
fi

echo "✅ Deployment complete!"
echo ""
echo "🔗 Your URLs:"
if [ "$ENV" = "production" ]; then
    echo "   Frontend: https://afrotoon-frontend.pages.dev"
    echo "   API: https://afrotoon-api.your-subdomain.workers.dev"
    echo "   AI Consumer: https://afrotoon-ai-consumer.your-subdomain.workers.dev"
else
    echo "   Frontend: https://afrotoon-frontend-preview.pages.dev"
    echo "   API: https://afrotoon-api-preview.your-subdomain.workers.dev"
    echo "   AI Consumer: https://afrotoon-ai-consumer-preview.your-subdomain.workers.dev"
fi