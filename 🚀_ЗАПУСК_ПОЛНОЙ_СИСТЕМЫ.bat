@echo off
chcp 65001 > nul
title 🚀 ЗАПУСК ПОЛНОЙ СИСТЕМЫ TELEGRAM БОТА

echo.
echo ============================================================
echo 🚀 ЗАПУСК ПОЛНОЙ СИСТЕМЫ TELEGRAM БОТА
echo ============================================================
echo.

echo [1/5] 🔧 Остановка всех процессов...
taskkill /f /im python.exe > nul 2>&1
taskkill /f /im node.exe > nul 2>&1
taskkill /f /im cloudflared.exe > nul 2>&1
timeout 2 > nul

echo [2/5] 🌐 Запуск Cloudflare туннеля...
start "Cloudflare Tunnel" /min cmd /c "cd /d e:\TelegramBot_RDP && .\cloudflared.exe tunnel --url http://localhost:5173"
timeout 5 > nul

echo [3/5] 🔐 Запуск Auth API (порт 5001)...
start "Auth API" cmd /c "cd /d e:\TelegramBot_RDP\home\ubuntu\forex-signals-app\backend && python auth_api.py"
timeout 3 > nul

echo [4/5] 📊 Запуск Signal API (порт 5002)...
start "Signal API" cmd /c "cd /d e:\TelegramBot_RDP\home\ubuntu\forex-signals-app\backend && python signal_api.py"
timeout 3 > nul

echo [5/5] 🎯 Запуск Frontend (порт 5173)...
start "Frontend" cmd /c "cd /d e:\TelegramBot_RDP\home\ubuntu\forex-signals-app && npm run dev"
timeout 5 > nul

echo.
echo ✅ ВСЕ СЕРВИСЫ ЗАПУЩЕНЫ!
echo.
echo 📱 ДОЖДИСЬ ПОЯВЛЕНИЯ URL В ОКНЕ "Cloudflare Tunnel"
echo 🌐 ОТКРОЙ БРАУЗЕР И ПЕРЕЙДИ ПО ЭТОМУ URL
echo 🤖 ЗАТЕМ ЗАПУСТИ TELEGRAM БОТА:
echo.
echo    cd e:\TelegramBot_RDP
echo    python run_telegram_bot.py
echo.
echo ============================================================
echo 🎉 СИСТЕМА ГОТОВА К РАБОТЕ!
echo ============================================================
echo.
pause
