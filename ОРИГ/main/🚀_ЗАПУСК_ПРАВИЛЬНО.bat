@echo off
chcp 65001 > nul
title ПРАВИЛЬНЫЙ ЗАПУСК СИСТЕМЫ

echo.
echo ═══════════════════════════════════════════════════════════════════
echo    🚀 ПРАВИЛЬНЫЙ ЗАПУСК СИСТЕМЫ 🚀
echo ═══════════════════════════════════════════════════════════════════
echo.

cd /d e:\TelegramBot_RDP

echo [1/5] 🛑 Останавливаю все процессы...
taskkill /F /IM python.exe /T 2>nul
taskkill /F /IM node.exe /T 2>nul
timeout /t 2 /nobreak > nul

echo [2/5] 🔐 Запускаю Auth API (порт 5001)...
start "Auth API" cmd /k "cd /d e:\TelegramBot_RDP\home\ubuntu\forex-signals-app\backend && python auth_api.py"
timeout /t 5 /nobreak > nul

echo [3/5] 📊 Запускаю Signal API (порт 5002)...
start "Signal API" cmd /k "cd /d e:\TelegramBot_RDP\home\ubuntu\forex-signals-app\backend && python signal_api.py"
timeout /t 5 /nobreak > nul

echo [4/5] 🌐 Запускаю Frontend (порт 5173)...
start "Frontend" cmd /k "cd /d e:\TelegramBot_RDP\home\ubuntu\forex-signals-app && npm run dev"
timeout /t 8 /nobreak > nul

echo [5/5] 🤖 Запускаю Telegram Bot...
start "Telegram Bot" cmd /k "cd /d e:\TelegramBot_RDP && python run_telegram_bot.py"
timeout /t 3 /nobreak > nul

echo.
echo ═══════════════════════════════════════════════════════════════════
echo    ✅ СИСТЕМА ЗАПУЩЕНА ПРАВИЛЬНО! ✅
echo ═══════════════════════════════════════════════════════════════════
echo.
echo  📡 СЕРВИСЫ:
echo    ✅ Auth API      - http://localhost:5001
echo    ✅ Signal API    - http://localhost:5002
echo    ✅ Frontend      - http://localhost:5173
echo    ✅ Telegram Bot  - Работает
echo.
echo  🌐 ОТКРОЙ ВЕБ-ПРИЛОЖЕНИЕ:
echo    http://localhost:5173
echo.
echo  🤖 TELEGRAM БОТ:
echo    Найди бота в Telegram: /start
echo.
echo ═══════════════════════════════════════════════════════════════════
echo.
pause

