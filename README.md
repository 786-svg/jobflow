# JobFlow

A quality-first job search dashboard. Aggregates fresh listings from RemoteOK, Greenhouse, Lever, and Ashby, scores each one against your résumé, and skips the noise.

Editorial design, local-first (no accounts, no servers know who you are), free to run.

## What's inside

- **Feed** — paginated, filterable, with optional AI fit-scoring once you add a résumé
- **Résumé** — paste yours; stored only in your browser
- **Tailor** — Claude rewrites your résumé for a specific job (without inventing skills)
- **ATS Check** — 7-factor compatibility score with specific fixes
- **Tracker** — Kanban for your job funnel
- **Settings** — bring-your-own Anthropic key, export data, erase data

## Deploy to Vercel (the easy way)

The whole point of this project is that you don't need to mess with a terminal. Here's the path:

### 1. Make accounts (free, ~3 minutes total)

- **GitHub** — https://github.com/signup
- **Vercel** — https://vercel.com/signup → click "Continue with GitHub"

### 2. Get the code into GitHub

The simplest way, no terminal:

1. On GitHub, click the **+** in the top right → **New repository**
2. Name it `jobflow`, leave it public, click **Create repository**
3. On the next page, click **"uploading an existing file"** (it's a link in the middle of the page)
4. Drag the entire contents of the **unzipped** `jobflow-web` folder into the upload area — every file and folder
5. Scroll down, click **Commit changes**

### 3. Deploy

1. Go to https://vercel.com/new
2. You'll see your `jobflow` repo — click **Import**
3. Vercel auto-detects Next.js. Leave all settings as default.
4. (Optional) Click **Environment Variables** and add `ANTHROPIC_API_KEY` with your key from https://console.anthropic.com if you want the Tailor feature to work without each user supplying their own.
5. Click **Deploy**

In ~90 seconds you get a URL like `jobflow-yourname.vercel.app`. Bookmark it.

Every time you push a change to GitHub, Vercel redeploys automatically.

## Local dev (optional, if you want a terminal)

```bash
npm install
cp .env.example .env.local   # add ANTHROPIC_API_KEY if you want
npm run dev
# open http://localhost:3000
```

## The Anthropic key (for résumé tailoring)

The Tailor feature (tab 03) calls Claude to rewrite your résumé. Two ways to provide a key:

1. **In the app's Settings tab** — paste your key once, it stays in your browser. Best for personal use.
2. **As a Vercel env var** — set `ANTHROPIC_API_KEY` in Vercel project settings. Best if you want anyone visiting your site to be able to use Tailor (they'll all share your usage).

Cost is roughly $0.001 per résumé tailored (Claude Haiku). $1 of credits = ~1,000 tailorings.

Without a key, every other feature still works — feed, fit-scoring, ATS check, tracker.

## Expanding the company list

Edit `lib/companies.js`. The seed lists ship with ~100 companies; the universe is ~12,000 across Greenhouse + Lever + Ashby. Add slugs and redeploy.

Discovery sources:
- `https://www.greenhouse.io/customers`
- `https://www.lever.co/customers`
- YC + Crunchbase for Ashby-using startups

## Design notes

- **Typography:** Fraunces (display serif) + Inter Tight (sans) + JetBrains Mono (data)
- **Palette:** warm cream paper, deep ink, single coral accent for action, leaf green for "good," amber for "ok"
- **Aesthetic:** editorial/classifieds — numbered sections, vertical rules, generous whitespace, no AI-gradient slop

## Privacy

- Your résumé, applications, and API key live in your browser's localStorage. Nothing is synced or stored on a server.
- The only server-side calls are: (a) fetching public job listings, (b) calling Anthropic when you tailor (with your key going straight to them, not stored).
- Export your data anytime from Settings; erase anytime.
