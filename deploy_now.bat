@echo off
echo 🚀 Deploying changes...

echo 📦 Adding files...
git add backend/signal_api.py
git add src/components/admin/UserSubscriptionManager.jsx
git add src/App.jsx

echo 💾 Committing...
git commit -m "🔧 FIX: Add subscription endpoints to signal_api.py + fix hasActiveSubscription logic"

echo 🚀 Pushing to GitHub...
git push origin main

echo ✅ Deployment complete!
echo 🌐 Site: https://app.nomoneynohoney.online
echo 🔄 GitHub Pages will update automatically
pause
