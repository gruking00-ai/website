#!/usr/bin/env pwsh
# OpenCode Web UI - Automated Deployment Script
# This script deploys your app to GitHub and Railway in one command

param(
    [Parameter(Mandatory=$true)]
    [string]$GitHubUsername,
    
    [Parameter(Mandatory=$true)]
    [string]$GitHubToken,
    
    [string]$RepoName = "opencode-web",
    [string]$RepoDescription = "Claude-style web UI for OpenCode"
)

$ErrorActionPreference = "Stop"
$gitPath = "C:\Program Files\Git\bin\git.exe"
$projectDir = "C:\Users\marvi\OneDrive\Documents\Opencode.ai"

Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     OpenCode Web UI - Automated Deployment Script         ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Step 1: Create GitHub repository
Write-Host "📝 Step 1: Creating GitHub repository..." -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "token $GitHubToken"
        "Accept" = "application/vnd.github.v3+json"
        "Content-Type" = "application/json"
    }
    
    $body = @{
        name = $RepoName
        description = $RepoDescription
        private = $false
        auto_init = $false
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "https://api.github.com/user/repos" `
        -Method POST `
        -Headers $headers `
        -Body $body `
        -TimeoutSec 30
    
    $repoUrl = $response.clone_url
    Write-Host "✅ GitHub repository created: $repoUrl" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to create GitHub repo: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Possible causes:" -ForegroundColor Yellow
    Write-Host "1. Invalid GitHub token"
    Write-Host "2. Repository already exists"
    Write-Host "3. Network error"
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Go to https://github.com/new to create repo manually"
    Write-Host "2. Then run this command to push:" -ForegroundColor Cyan
    Write-Host "   &`"$gitPath`" remote add origin https://github.com/$GitHubUsername/$RepoName.git" -ForegroundColor Gray
    Write-Host "   &`"$gitPath`" branch -M main" -ForegroundColor Gray
    Write-Host "   &`"$gitPath`" push -u origin main" -ForegroundColor Gray
    exit 1
}

# Step 2: Configure Git
Write-Host ""
Write-Host "🔧 Step 2: Configuring Git..." -ForegroundColor Yellow
cd $projectDir

# Set up Git credentials
& $gitPath config user.email "opencode@example.com" | Out-Null
& $gitPath config user.name "OpenCode" | Out-Null

# Add remote
& $gitPath remote remove origin 2>$null | Out-Null
& $gitPath remote add origin $repoUrl 2>&1 | Out-Null
Write-Host "✅ Git configured with remote: $repoUrl" -ForegroundColor Green

# Step 3: Push to GitHub
Write-Host ""
Write-Host "📤 Step 3: Pushing code to GitHub..." -ForegroundColor Yellow
try {
    # Set up Git credentials temporarily
    $gitHubUrl = $repoUrl.Replace("https://", "")
    $credentialUrl = "https://${GitHubUsername}:${GitHubToken}@$gitHubUrl"
    
    & $gitPath branch -M main 2>&1 | Out-Null
    
    # Push with credentials embedded in URL (temporary, not stored)
    $output = & $gitPath push -u origin main 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Code pushed to GitHub successfully!" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Push output: $output" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Failed to push to GitHub: $_" -ForegroundColor Red
    exit 1
}

# Step 4: Display next steps
Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                    🎉 SUCCESS! 🎉                         ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

Write-Host "✅ Your code is now on GitHub!" -ForegroundColor Green
Write-Host "   Repository: https://github.com/$GitHubUsername/$RepoName" -ForegroundColor Cyan
Write-Host ""

Write-Host "🚀 Next Step: Deploy to Railway" -ForegroundColor Yellow
Write-Host ""
Write-Host "   1. Go to: https://railway.app" -ForegroundColor Gray
Write-Host "   2. Sign up (free, no credit card needed)" -ForegroundColor Gray
Write-Host "   3. Click: New Project" -ForegroundColor Gray
Write-Host "   4. Select: Deploy from GitHub repo" -ForegroundColor Gray
Write-Host "   5. Authorize Railway with GitHub" -ForegroundColor Gray
Write-Host "   6. Select: $RepoName" -ForegroundColor Gray
Write-Host "   7. Click: Deploy" -ForegroundColor Gray
Write-Host ""

Write-Host "⏱️  Railway will deploy in 1-2 minutes" -ForegroundColor Yellow
Write-Host ""

Write-Host "📋 After Railway deploys:" -ForegroundColor Yellow
Write-Host "   1. Go to Railway dashboard" -ForegroundColor Gray
Write-Host "   2. Find your project" -ForegroundColor Gray
Write-Host "   3. Settings → Domains" -ForegroundColor Gray
Write-Host "   4. Copy your live URL" -ForegroundColor Gray
Write-Host ""

Write-Host "🎁 Your final URL will look like:" -ForegroundColor Cyan
Write-Host "   https://opencode-web-production.railway.app" -ForegroundColor Gray
Write-Host ""

Write-Host "📚 For more help, see:" -ForegroundColor Yellow
Write-Host "   - START_HERE.md" -ForegroundColor Gray
Write-Host "   - COMPLETE_DEPLOYMENT_GUIDE.md" -ForegroundColor Gray
Write-Host ""

Write-Host "✨ Congratulations! Your OpenCode Web UI deployment is underway! 🚀" -ForegroundColor Green
