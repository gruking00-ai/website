# OpenCode Web UI - Project Complete ✓

## What Was Built

A **Claude.ai-style web interface** for OpenCode with:

✅ **Dark theme** matching Claude's design language
✅ **Persistent sidebar** with conversation history grouped by date
✅ **Real-time streaming** via Server-Sent Events (SSE)
✅ **File attachments** with upload support
✅ **Model selection** dropdown for provider/model switching
✅ **Auto-starting backend** that spawns OpenCode server
✅ **Session management** - create, view, manage chats
✅ **Responsive chat interface** with typing indicator and send button
✅ **Production build** - fully optimized and ready to deploy

## Project Structure

```
C:\Users\marvi\OneDrive\Documents\Opencode.ai\
├── src/                          # React frontend (TypeScript)
│   ├── main.tsx                  # Entry point
│   ├── App.tsx                   # Main app component (400+ lines)
│   ├── styles.css                # Complete dark theme CSS
│   ├── lib/
│   │   ├── api.ts               # HTTP API wrappers (no SDK for browser)
│   │   ├── types.ts             # TypeScript type definitions
│   │   └── util.ts              # Helper functions
│   └── components/
│       └── icons.tsx             # SVG icon library
├── server/
│   └── index.mjs                # Express backend (400+ lines)
│       └── Features: auto-spawn OpenCode, reverse proxy, file upload, health check
├── dist/                         # Production build (built ✓)
├── package.json                  # Dependencies + scripts
├── vite.config.ts               # Vite configuration with dev proxy
├── tsconfig.json                # TypeScript configuration
├── index.html                    # HTML entry point
├── README.md                     # Feature documentation
└── DEPLOY.md                     # Deployment guide

## Key Technologies

- **Frontend**: React 18, TypeScript, Vite, Custom CSS (no Tailwind)
- **Backend**: Node.js, Express.js, OpenCode SDK
- **API Integration**: Fetch API, EventSource (SSE)
- **Build**: Vite (34 modules, 150KB bundle gzipped to 48KB)
- **Styling**: ~500 lines of custom CSS (dark palette)

## How to Run Locally

```bash
# Install dependencies
npm install

# Development (both frontend + backend)
npm run dev           # Vite on :5173 + Backend on :6090

# Or separately:
npm run server        # Backend only (:6090)
npx vite             # Frontend dev server (:5173)

# Production build
npm run build         # Creates dist/ folder

# Production server
npm start            # Serves dist/ + backend on port from env

# Type checking
npm run typecheck
```

## Deployment Options

### Option 1: Cloudflare Pages (Frontend Only - FREE)
- Build: `npm run build`
- Deploy `dist/` folder to Cloudflare Pages
- **Result**: Static site hosted FREE
- **Limitation**: Backend (Node.js) must be hosted separately

### Option 2: Full Stack on Railway (Easy)
- Deploy entire repo to Railway
- Railway auto-detects Node.js
- Runs `npm start` → serves both frontend + backend
- **Result**: Full working app
- **Cost**: Free tier available (~$5/month after)

### Option 3: Vercel + Cloudflare Pages
- Frontend: Deploy `dist/` to Cloudflare Pages (FREE)
- Backend: Deploy to Vercel serverless (FREE tier)
- Update frontend `.env.production` with Vercel URL

## Deployment Steps (Recommended: Railway)

1. **Push to GitHub** (requires git):
   ```bash
   git init
   git add .
   git commit -m "OpenCode web UI"
   git push origin main
   ```

2. **Deploy to Railway**:
   - Go to https://railway.app
   - New Project → Deploy from GitHub
   - Select this repo
   - Railway auto-detects Node.js
   - Set start command: `npm start`
   - Deploy

3. **Get your URL**:
   - Railway provides: `https://your-app-name.railway.app`
   - Share this link!

## What Works

✅ List all OpenCode sessions
✅ Create new chat sessions
✅ Load conversation history
✅ Send messages with real-time streaming
✅ Upload file attachments
✅ Select AI model/provider
✅ Auto-scroll during streaming
✅ Dark theme with accent colors
✅ Responsive sidebar
✅ Empty state with example prompts
✅ Session grouping by date (Today, Yesterday, etc.)

## What Doesn't (Out of Scope)

- Reasoning block rendering (can add)
- Tool execution visualization (can add)
- Markdown rendering with syntax highlighting (can add with react-markdown + highlight.js)
- Permission prompts UI (API ready, UI skipped)
- Project/workspace switching UI (API ready, UI skipped)

These are quick adds if needed.

## API Endpoints Used

- `GET /event` — SSE event stream
- `GET /session` — List sessions
- `POST /session` — Create session
- `GET /session/{id}/message` — Load messages
- `POST /session/{id}/prompt_async` — Send message (async)
- `GET /provider` — List models/providers
- `POST /api/health` — Backend health check
- `PUT /api/upload` — Upload files
- `POST /api/switch-project` — Switch workspace

## Build Stats

```
Frontend Build Output:
  dist/index.html                 0.44 kB
  dist/assets/index-W2q_emeu.css  7.25 kB (gzipped: 1.80 kB)
  dist/assets/index-DwjyCWSo.js   150.98 kB (gzipped: 48.89 kB)
  ✓ built in 1.95s
```

## Next Steps to Deploy

1. **GitHub** (if deploying to Railway):
   - Install Git: https://git-scm.com/download/win
   - `git init && git add . && git commit -m "..."`
   - Create repo on GitHub
   - `git push origin main`

2. **Railway**:
   - Sign up: https://railway.app
   - Connect GitHub repo
   - Deploy
   - Share Railway URL

3. **Done!** Your OpenCode web UI is live.

## File Locations

- **Frontend source**: `C:\Users\marvi\OneDrive\Documents\Opencode.ai\src\`
- **Backend source**: `C:\Users\marvi\OneDrive\Documents\Opencode.ai\server\index.mjs`
- **Built frontend**: `C:\Users\marvi\OneDrive\Documents\Opencode.ai\dist\`
- **Config**: `C:\Users\marvi\OneDrive\Documents\Opencode.ai\package.json`

## Support

For issues:
1. Check `DEPLOY.md` troubleshooting section
2. Verify `npm install` completed
3. Run `npm run build` to check for build errors
4. Backend logs available when running `npm start`

---

**Status**: ✅ Complete, Built, and Ready to Deploy

**Project Path**: `C:\Users\marvi\OneDrive\Documents\Opencode.ai\`

**Next Action**: Push to GitHub and deploy to Railway for a live URL.
