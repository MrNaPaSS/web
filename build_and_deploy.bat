@echo off
echo Building project...
call npm run build
echo Build completed!

echo Copying files to web directory...
if exist "dist\index.html" (
    copy "dist\index.html" "web\index.html"
    echo index.html copied
)

if exist "dist\assets" (
    if exist "web\assets" rmdir /s /q "web\assets"
    xcopy "dist\assets" "web\assets" /e /i
    echo assets copied
)

if exist "dist\favicon.ico" (
    copy "dist\favicon.ico" "web\favicon.ico"
    echo favicon.ico copied
)

echo Files copied successfully!
echo Now deploying to GitHub...

cd web
git add .
git commit -m "Security fix: Remove ADMIN_TELEGRAM_ID from frontend - $(date)"
git push

echo Deployment completed!
pause
