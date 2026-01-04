# TruthLens AI - Ultimate Setup Automaton
# This script prepares the complete environment for TruthLens AI.

Write-Host "🛸 TruthLens AI: Initiating Ultimate Setup Protocol..." -ForegroundColor Cyan

# 1. Backend Setup
Write-Host "`n📦 Setting up AI Core (Backend)..." -ForegroundColor Yellow
npm install
npm run build

# 2. Frontend Setup
Write-Host "Rebuilding Backend..." -ForegroundColor Cyan
npm run build

Write-Host "Setup Complete! Launching TruthLens..." -ForegroundColor Greenllow
cd truthlens-ui
npm install
npm run build
cd ..

# 3. Environment Check
Write-Host "`n🔑 Verifying Environment Configuration..." -ForegroundColor Yellow
if (-Not (Test-Path .env)) {
    Write-Host "⚠️  WARNING: .env not found. Creating from .env.example..." -ForegroundColor Red
    Copy-Item .env.example .env
}

Write-Host "`n✅ MISSION READY: TruthLens AI is synchronized." -ForegroundColor Green
Write-Host "Run 'npm start' in the root for Backend." -ForegroundColor Cyan
Write-Host "Run 'npm run dev' in truthlens-ui for Frontend." -ForegroundColor Cyan
