# 🚀 Deploy OpenCode Web UI - Complete Guide

Your OpenCode web UI is **built and ready**. Follow these steps to get a live URL.

## Step 1: Create GitHub Repository (Manual)

1. Go to https://github.com/new
2. Repository name: `opencode-web`
3. Description: "Claude-style web UI for OpenCode"
4. Select **Public** (for free Railway deployment)
5. Click **Create repository**
6. Copy the HTTPS URL (looks like: `https://github.com/YOUR_USERNAME/opencode-web.git`)

## Step 2: Push Code to GitHub

Open PowerShell in `C:\Users\marvi\OneDrive\Documents\Opencode.ai` and run:

```powershell
# Set your GitHub credentials (one time)
&"C:\Program Files\Git\bin\git.exe" config --global credential.helper wincred

# Add remote (replace YOUR_USERNAME)
&"C:\Program Files\Git\bin\git.exe" remote add origin https://github.com/YOUR_USERNAME/opencode-web.git

# Push to GitHub
&"C:\Program Files\Git\bin\git.exe" branch -M main
&"C:\Program Files\Git\bin\git.exe" push -u origin main

# When prompted: Enter your GitHub username and personal access token
```

**Don't have a GitHub token?**
1. Go to https://github.com/settings/tokens/new
2. Name: `opencode-deploy`
3. Select scopes: `repo` (all)
4. Generate token
5. Copy and paste when prompted

## Step 3: Deploy to Railway (Easiest - Free)

1. Go to https://railway.app
2. Click **Create New Project**
3. Select **Deploy from GitHub repo**
4. Authorize Railway with GitHub
5. Select `opencode-web` repo
6. Click **Deploy**

Railway will:
- Auto-detect Node.js
- Run `npm install`
- Build with `npm run build`
- Start with `npm start`
- Give you a live URL in ~2 minutes

## Step 4: Get Your Live URL

After Railway deploys:
1. Go to your Railway dashboard
2. Click your project
3. Click **Settings** → **Domains**
4. Copy the auto-generated URL (like `https://opencode-web.railway.app`)

**Share this URL!** 🎉

---

## Alternative: Deploy Frontend Only (Cloudflare Pages + Vercel)

### Cloudflare Pages (Free Frontend Hosting)

1. Go to https://dash.cloudflare.com → Pages
2. **Upload files**
3. Upload all files from `C:\Users\marvi\OneDrive\Documents\Opencode.ai\dist\`
4. Get free URL: `https://opencode-web.pages.dev`

**Problem**: Backend won't work (needs Node.js)

### Solution: Separate Backend on Vercel

1. Create `.vercel.json`:
```json
{
  "version": 2,
  "builds": [
    { "src": "server/index.mjs", "use": "@vercel/node" }
  ],
  "routes": [
    { "src": "/(.*)", "dest": "server/index.mjs" }
  ]
}
```

2. Deploy to Vercel: https://vercel.com/import → Select your GitHub repo
3. Get Vercel URL (like `https://opencode-web.vercel.app`)
4. Update frontend `.env.production`:
```
VITE_BACKEND_URL=https://opencode-web.vercel.app
```
5. Rebuild: `npm run build`
6. Redeploy to Cloudflare Pages

---

## Quick Command Reference

**Git operations (PowerShell):**
```powershell
# Check status
&"C:\Program Files\Git\bin\git.exe" status

# View log
&"C:\Program Files\Git\bin\git.exe" log --oneline

# Pull latest changes
&"C:\Program Files\Git\bin\git.exe" pull origin main
```

**Local testing:**
```powershell
cd "C:\Users\marvi\OneDrive\Documents\Opencode.ai"
npm install
npm run dev
# Visit http://localhost:5173
```

---

## Deployment Status Checklist

- [ ] GitHub repo created
- [ ] Code pushed to GitHub
- [ ] Railway project created
- [ ] Railway deployed successfully
- [ ] Live URL obtained
- [ ] Tested in browser
- [ ] Shared with team

---

## What You Get

✅ **Live URL** like `https://opencode-web.railway.app`
✅ **Full functionality**: Chat, streaming, file uploads
✅ **Always on**: Railway backend runs 24/7 (free tier)
✅ **No credit card needed** (for Railway free tier)

---

## Support

If deployment fails:

1. **Railway logs**: Dashboard → Logs tab
2. **GitHub repo**: Make sure all files pushed
3. **Environment**: Node.js 20+ required
4. **Start command**: Should be `npm start`

---

## Your Project Files

📁 **Location**: `C:\Users\marvi\OneDrive\Documents\Opencode.ai\`

📝 **Key files**:
- `server/index.mjs` - Backend (auto-starts OpenCode)
- `src/App.tsx` - Frontend React app
- `dist/` - Built production files
- `package.json` - Dependencies + scripts

✅ **Status**: Production-ready, built, and Git-committed

---

## After You Get the URL

1. **Test it**: Visit your Railway URL in browser
2. **Create a chat**: Click "New chat"
3. **Type a message**: Should stream in real-time
4. **Share the link**: Anyone can now use your OpenCode UI!

**Example live URL**: `https://opencode-web.railway.app`

---

**Next Action**: Create GitHub repo and push code. Railway will handle the rest! 🚀
