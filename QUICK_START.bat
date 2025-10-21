@echo off
chcp 65001 >nul
title 🚀 QUICK START - TELEGRAM BOT

echo.
echo 🚀 TELEGRAM BOT - QUICK START
echo.

echo ⚡ Быстрый запуск всех сервисов...
echo.

REM Запуск API сервера в фоне
echo [1/3] Запуск API сервера...
start "API Server" /min cmd /c "python home/ubuntu/forex-signals-app/backend/signal_api.py"

REM Ожидание
timeout /t 3 /nobreak >nul

REM Запуск Telegram бота
echo [2/3] Запуск Telegram бота...
start "Telegram Bot" cmd /c "python run_telegram_bot.py"

REM Ожидание
timeout /t 2 /nobreak >nul

REM Запуск туннеля (если есть)
echo [3/3] Запуск туннеля...
if exist "cloudflared.exe" (
    start "Cloudflare Tunnel" /min cmd /c "cloudflared.exe tunnel --url http://localhost:5000"
    echo ✅ Cloudflare туннель запущен
) else (
    echo ⚠️  Cloudflare туннель не найден
)

echo.
echo ✅ ВСЕ СЕРВИСЫ ЗАПУЩЕНЫ!
echo.
echo 📋 Окна сервисов:
echo • API Server - API сервер
echo • Telegram Bot - Telegram бот
echo • Cloudflare Tunnel - Туннель (если найден)
echo.
echo 🌐 Веб-приложение: https://accessibility-gallery-column-olympus.trycloudflare.com
echo.
echo ⚠️  Не закрывайте окна сервисов!
echo.
pause
