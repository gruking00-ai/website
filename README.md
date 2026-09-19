# OpenCode Web UI

A Claude-style web interface for OpenCode with real-time chat, file attachments, and streaming responses.

## Features

- **Claude-like Chat Interface**: Dark theme, persistent sidebar with conversation history
- **Real-time Streaming**: Server-sent events for live message updates
- **File Attachments**: Upload and attach files to messages
- **Model Selection**: Choose from available AI models
- **Session Management**: Create, view, and manage chat sessions
- **Auto-starting Server**: Backend automatically starts OpenCode server on port 4096

## Local Development

### Prerequisites
- Node.js 20+
- npm or yarn
- OpenCode CLI installed globally (`npm install -g opencode-ai`)

### Setup

```bash
npm install
npm run dev          # Start Vite dev server (port 5173) + backend
npm run server       # Start backend only (port 6090)
```

### Build

```bash
npm run build        # TypeScript + Vite build
npm start            # Run production backend (serves dist/)
```

## Architecture

### Frontend (src/)
- React 18 + TypeScript
- Vite for bundling
- Tailwind-inspired custom CSS (dark theme)
- EventSource for real-time streaming

### Backend (server/index.mjs)
- Express.js HTTP server
- Auto-starts OpenCode server via `createOpencodeServer()` from SDK
- Reverse proxies all requests (HTTP + SSE) to OpenCode
- Serves static dist/ in production
- File upload handling: `/api/upload`
- Health check: `/api/health`
- Project switching: `/api/switch-project`

## Deployment to Cloudflare Pages

### Option 1: Direct Upload (Quickest)

1. Build locally:
   ```bash
   npm run build
   ```

2. Upload `dist/` folder to Cloudflare Pages:
   - Go to [dash.cloudflare.com](https://dash.cloudflare.com)
   - Pages → Create a project → Upload files
   - Select all files in `dist/`
   - Deploy

3. Since backend is Node.js, you'll need to host it separately:
   - Build: `npm run build`
   - Start: `npm start`
   - Deploy to Vercel, Railway, or similar Node.js host
   - Update frontend API calls to point to backend URL

### Option 2: GitHub Integration (Recommended)

1. Push to GitHub:
   ```bash
   git init
   git add .
   git commit -m "OpenCode web UI"
   git remote add origin https://github.com/YOUR_USERNAME/opencode-web.git
   git push -u origin main
   ```

2. Connect to Cloudflare Pages:
   - Go to Pages → Create project → Connect to Git
   - Select repo
   - Build command: `npm run build`
   - Build output: `dist`
   - Deploy

3. Backend deployment (separate):
   - Use Vercel, Railway, Render, or Heroku
   - Environment: Node.js
   - Build: `npm run build`
   - Start: `npm start`
   - Set `OPENCODE_WEB_PORT=3000` (or your server's port)

### Important Notes

**Cloudflare Pages Static Hosting Limitation:**
- Cloudflare Pages (free tier) hosts static files only (HTML/CSS/JS)
- The Node.js backend (`server/index.mjs`) cannot run on Cloudflare Pages
- You must host the backend separately

**Local-Only Setup:**
- For local testing, run both frontend and backend on your machine:
  ```bash
  npm run dev          # Terminal 1: Vite + backend
  # Or in separate terminals:
  npm run server       # Terminal 1: backend only
  npx vite            # Terminal 2: frontend dev server
  ```

## API Integration

The frontend connects to:
- `/event` — Server-sent events stream (real-time messages)
- `/session` — Session CRUD
- `/provider` — Model/provider list
- `/api/health` — Backend health check
- `/api/upload` — File upload
- `/api/switch-project` — Workspace switching

All proxied through the backend to the OpenCode server.

## Environment Variables

Backend (`server/index.mjs`):
- `OPENCODE_WEB_PORT` — Backend port (default: 6090)
- `OPENCODE_SERVER_PASSWORD` — Password protect OpenCode server (optional)
- `OPENCODE_SERVER_USERNAME` — Username for OpenCode auth (default: opencode)

## File Structure

```
Opencode.ai/
├── src/
│   ├── main.tsx                    # React entry point
│   ├── App.tsx                     # Main app component
│   ├── styles.css                  # Dark theme CSS
│   ├── lib/
│   │   ├── api.ts                  # HTTP API wrappers
│   │   ├── types.ts                # TypeScript types
│   │   └── util.ts                 # Utility functions
│   └── components/
│       └── icons.tsx               # SVG icon components
├── server/
│   └── index.mjs                   # Express backend + OpenCode spawner
├── dist/                           # Build output (gitignored)
├── vite.config.ts                  # Vite config
├── tsconfig.json                   # TypeScript config
├── package.json                    # Dependencies
└── index.html                      # HTML entry point
```

## Troubleshooting

**"OpenCode server not reachable"**
- Ensure `opencode` CLI is installed: `npm install -g opencode-ai`
- Check backend logs for errors
- Verify port 4096 isn't already in use

**Build errors about Node modules**
- Vite frontend can't bundle Node.js-only modules
- Solution: Backend and frontend are separate (backend is Express, frontend is Vite)

**EventSource (SSE) 404**
- Ensure backend proxy is running
- Frontend dev: proxy to `http://127.0.0.1:6090` (see vite.config.ts)
- Production: backend must serve both API and static files

## License

MIT
