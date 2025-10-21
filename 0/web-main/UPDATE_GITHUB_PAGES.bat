@echo off
title UPDATE GITHUB PAGES
color 0E

echo.
echo ========================================
echo    UPDATE GITHUB PAGES
echo ========================================
echo.

echo [1/4] Building project...
cd home/ubuntu/forex-signals-app
call npm run build
if %errorlevel% neq 0 (
    echo ERROR: Build failed
    pause
    exit /b 1
)

echo.
echo [2/4] Copying files...
cd ../../github-pages
xcopy /Y /E /I "..\home\ubuntu\forex-signals-app\dist\*" "."

echo.
echo [3/4] Creating archive...
cd ..
powershell -Command "Compress-Archive -Path 'github-pages\*' -DestinationPath 'github-pages-update.zip' -Force"

echo.
echo [4/4] Done!
echo.
echo ========================================
echo    FILES READY FOR UPLOAD
echo ========================================
echo.
echo Folder: github-pages\
echo Archive: github-pages-update.zip
echo.
echo To update GitHub Pages:
echo 1. Go to your GitHub repository
echo 2. Upload files from github-pages\ folder
echo.
echo Website will be available at:
echo    https://app.nomoneynohoney.online
echo.
pause
