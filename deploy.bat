@echo off
echo Deploying to GitHub Pages...
git add .
git commit -m "Security fix: Remove ADMIN_TELEGRAM_ID from frontend"
git push
echo Deployment completed!
pause
