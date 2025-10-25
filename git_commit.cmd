@echo off
echo Adding files...
git add backend/signal_api.py
git add src/components/admin/UserSubscriptionManager.jsx  
git add src/App.jsx

echo Committing...
git commit -m "FIX: Add subscription endpoints to signal_api.py + fix hasActiveSubscription logic"

echo Pushing...
git push origin main

echo Done!
