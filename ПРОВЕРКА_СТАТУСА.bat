@echo off
title ПРОВЕРКА СТАТУСА СИСТЕМЫ
color 0E

echo.
echo ========================================
echo    📊 ПРОВЕРКА СТАТУСА СИСТЕМЫ
echo ========================================
echo.

echo [1/4] Проверка Python процессов...
tasklist /fi "imagename eq python.exe" | find /i "python.exe" >nul
if %errorlevel% equ 0 (
    echo ✅ Python процессы запущены
) else (
    echo ❌ Python процессы НЕ запущены
)

echo.
echo [2/4] Проверка Cloudflare туннеля...
tasklist /fi "imagename eq cloudflared.exe" | find /i "cloudflared.exe" >nul
if %errorlevel% equ 0 (
    echo ✅ Cloudflare туннель запущен
) else (
    echo ❌ Cloudflare туннель НЕ запущен
)

echo.
echo [3/4] Проверка API доступности...
curl -s -o nul -w "%%{http_code}" https://bot.nomoneynohoney.online/api/health 2>nul | find "200" >nul
if %errorlevel% equ 0 (
    echo ✅ API доступен
) else (
    echo ❌ API НЕ доступен
)

echo.
echo [4/4] Проверка Telegram бота...
echo ⚠️  Проверьте вручную: @Bin_ByB1million_bot

echo.
echo ========================================
echo    📋 СВОДКА СТАТУСА
echo ========================================
echo.
echo 🌐 URL для проверки:
echo   • API Health: https://bot.nomoneynohoney.online/api/health
echo   • Веб-приложение: https://app.nomoneynohoney.online
echo   • Telegram бот: @Bin_ByB1million_bot
echo.
echo 🔧 Если что-то не работает:
echo   1. Запустите: ЗАПУСК_РАБОЧЕЙ_СИСТЕМЫ.bat
echo   2. Подождите 30 секунд
echo   3. Проверьте снова
echo.
pause
