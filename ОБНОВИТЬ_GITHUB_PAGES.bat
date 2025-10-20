@echo off
title ОБНОВЛЕНИЕ GITHUB PAGES
color 0E

echo.
echo ========================================
echo    📤 ОБНОВЛЕНИЕ GITHUB PAGES
echo ========================================
echo.

echo [1/4] Сборка проекта...
cd home/ubuntu/forex-signals-app
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Ошибка сборки проекта
    pause
    exit /b 1
)

echo.
echo [2/4] Копирование файлов...
cd ../../github-pages
xcopy /Y /E /I "..\home\ubuntu\forex-signals-app\dist\*" "."

echo.
echo [3/4] Создание архива для загрузки...
cd ..
powershell -Command "Compress-Archive -Path 'github-pages\*' -DestinationPath 'github-pages-update.zip' -Force"

echo.
echo [4/4] Готово!
echo.
echo ========================================
echo    ✅ ФАЙЛЫ ГОТОВЫ К ЗАГРУЗКЕ
echo ========================================
echo.
echo 📁 Папка с файлами: github-pages\
echo 📦 Архив для загрузки: github-pages-update.zip
echo.
echo 🌐 Для обновления GitHub Pages:
echo 1. Зайди на https://github.com/твой-username/твой-репозиторий
echo 2. Перейди в раздел Settings → Pages
echo 3. Загрузи файлы из папки github-pages\
echo.
echo 🔗 После загрузки сайт будет доступен по адресу:
echo    https://app.nomoneynohoney.online
echo.
pause
