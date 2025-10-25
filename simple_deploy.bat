@echo off
echo Deploying changes...

git add backend/signal_api.py
git add src/components/admin/UserSubscriptionManager.jsx
git add src/App.jsx
git add deploy.py
git add simple_deploy.bat

git commit -m "FIX: Add subscription endpoints to signal_api.py + fix hasActiveSubscription logic"

git push origin main

echo Deployment complete!
pause
