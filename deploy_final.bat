@echo off
echo 🚀 Final deployment...

echo 📦 Adding files...
git add backend/signal_api.py
git add src/components/admin/UserSubscriptionManager.jsx
git add src/App.jsx
git add deploy.py
git add git_push.py
git add git_commit.cmd
git add simple_deploy.bat
git add build_and_deploy.bat
git add fix_subscription_endpoints.bat
git add deploy_final.bat

echo 💾 Committing changes...
git commit -m "🔧 FIX: Add subscription endpoints to signal_api.py + fix hasActiveSubscription logic"

echo 🚀 Pushing to GitHub...
git push origin main

echo ✅ Deployment complete!
echo 🌐 Site: https://app.nomoneynohoney.online
echo 🔄 GitHub Pages will update automatically
pause
