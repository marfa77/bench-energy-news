# Deployment Guide for Bench Energy Website

## Overview

This project combines:
- **Next.js website** with FreightTender product pages and news section
- **Automated news sync** from Notion via GitHub Actions
- **Vercel deployment** for production hosting

## ⚠️ ВАЖНО: Правила деплоя

**Деплой на Vercel происходит ТОЛЬКО через GitHub интеграцию.**

- ✅ Push в ветку `main` → автоматический деплой на Vercel
- ❌ НЕ использовать Vercel CLI для деплоя (`vercel deploy`)
- ❌ НЕ использовать ручной деплой через Vercel Dashboard
- ✅ Все изменения должны быть закоммичены и запушены в GitHub

## Architecture

```
bench-energy-news/
├── app/                    # Next.js App Router
│   ├── page.tsx           # Landing page
│   ├── news/              # News section
│   │   ├── page.tsx       # News list
│   │   └── [slug]/        # Individual articles
│   └── freighttender/     # FreightTender product pages
├── posts/                  # Generated HTML articles (from Notion)
├── bot/                    # Python scripts for news sync
└── .github/workflows/      # GitHub Actions for automation
```

## Setup Instructions

### 1. Vercel Configuration

**⚠️ ВАЖНО: Деплой на Vercel происходит ТОЛЬКО через GitHub интеграцию.**

1. **Connect repository to Vercel (ОБЯЗАТЕЛЬНО через GitHub):**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Import your GitHub repository (НЕ создавать проект вручную)
   - Configure project settings
   - Убедитесь, что включен "Automatic deployments from Git"

2. **Set Environment Variables in Vercel:**
   - `NOTION_API_KEY` - Your Notion integration API key
   - `NOTION_DATABASE_ID` - Your Notion database ID
   - `SITE_URL` - `https://www.bench.energy` (optional, defaults to this)

3. **Vercel Project Settings:**
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `out`
   - Install Command: `npm install`

### 2. GitHub Secrets

Add the following secrets in GitHub repository settings (Settings → Secrets and variables → Actions):

- `NOTION_API_KEY` - Your Notion integration API key
- `NOTION_DATABASE_ID` - Your Notion database ID
- `VERCEL_TOKEN` - Vercel authentication token (get from Vercel → Settings → Tokens)
- `VERCEL_ORG_ID` - Your Vercel organization ID
- `VERCEL_PROJECT_ID` - Your Vercel project ID

**How to get Vercel credentials:**
1. Vercel Token: Vercel Dashboard → Settings → Tokens → Create Token
2. Org ID & Project ID: After connecting repo, check project settings URL or use Vercel CLI: `vercel link`

### 3. Local Development

```bash
# Install dependencies
npm install

# Install Python dependencies (for news sync)
cd bot
pip install -r requirements.txt
cd ..

# Run development server
npm run dev
```

### 4. Build Process

The build process works as follows:

1. **GitHub Actions** (`deploy-vercel.yml`):
   - Syncs news from Notion to `posts/` directory
   - Generates RSS feed (`feed.xml`)
   - Commits changes to repository
   - Triggers Vercel deployment

2. **Vercel Build**:
   - Installs Node.js dependencies
   - Builds Next.js static site
   - Deploys to `bench.energy`

## Workflow

### Automatic Deployment Flow

**⚠️ ПРАВИЛО: Деплой на Vercel происходит ТОЛЬКО через GitHub push.**

```
1. News published in Notion
   ↓
2. GitHub Actions runs (every hour or on push)
   ↓
3. notion_sync.py fetches from Notion
   ↓
4. Generates HTML files in posts/
   ↓
5. Updates feed.xml, sitemap.xml
   ↓
6. Commits to GitHub
   ↓
7. Push to GitHub main branch
   ↓
8. Vercel автоматически обнаруживает push через GitHub интеграцию
   ↓
9. Vercel builds and deploys Next.js site
```

**Процесс деплоя:**
1. Все изменения должны быть закоммичены: `git commit -m "message"`
2. Отправлены в GitHub: `git push origin main`
3. Vercel автоматически запускает деплой при push в `main`
4. НЕ использовать `vercel deploy` или ручной деплой через Dashboard

### Manual Sync

To manually sync news from Notion:

```bash
cd bot
python3 notion_sync.py
```

## URL Structure

- `https://www.bench.energy/` - Landing page
- `https://www.bench.energy/news` - News list
- `https://www.bench.energy/news/[slug]` - Individual article
- `https://www.bench.energy/freighttender` - FreightTender product page
- `https://www.bench.energy/freighttender/capabilities` - Capabilities page
- `https://www.bench.energy/feed.xml` - RSS feed
- `https://www.bench.energy/sitemap.xml` - Sitemap

## Troubleshooting

### News not appearing

1. Check GitHub Actions logs for sync errors
2. Verify Notion API credentials in GitHub Secrets
3. Check `posts/` directory has HTML files
4. Verify Vercel build logs

### Build fails on Vercel

1. Check Node.js version (should be 20+)
2. Verify `package.json` dependencies
3. Check build logs for specific errors
4. Ensure `posts/` directory exists (even if empty)

### RSS feed not updating

1. Verify `generate_rss.py` runs in GitHub Actions
2. Check `feed.xml` is committed to repository
3. Verify `SITE_URL` is set correctly

## Maintenance

### Updating Dependencies

```bash
# Node.js
npm update

# Python
cd bot
pip install --upgrade -r requirements.txt
```

### Adding New Pages

1. Create page in `app/` directory
2. Update navigation in `app/components/Header.tsx`
3. Rebuild and deploy

## Support

For issues or questions:
- Email: support@bench.energy
- Telegram: @freightTender_sales
