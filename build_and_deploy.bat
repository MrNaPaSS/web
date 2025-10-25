@echo off
echo 🔨 Building frontend...
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Build failed
    pause
    exit /b 1
)

echo ✅ Build successful
echo 📦 Committing changes...
git add .
git commit -m "🔧 FIX: Add subscription endpoints to signal_api.py + fix hasActiveSubscription logic"
git push origin main

echo 🚀 Deployment complete!
echo 🌐 Site will be updated at: https://app.nomoneynohoney.online
pause