@echo off
echo 📦 Adding files to git...
git add .

echo 💾 Committing changes...
git commit -m "🔧 FIX: Add subscription endpoints to signal_api.py + fix hasActiveSubscription logic"

echo 🚀 Pushing to GitHub...
git push origin main

echo ✅ Deployment complete!
echo 🌐 Site: https://app.nomoneynohoney.online
pause
