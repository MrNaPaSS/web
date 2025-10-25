@echo off
git add .
git commit -m "🔧 FIX: Add subscription endpoints to signal_api.py (port 5000)"
git push origin main
echo "✅ Subscription endpoints added to signal_api.py"
pause
