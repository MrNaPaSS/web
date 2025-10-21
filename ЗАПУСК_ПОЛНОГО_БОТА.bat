@echo off
chcp 65001 >nul
title Trading Signals Pro - Полный запуск

echo.
echo ===============================================
echo   🚀 TRADING SIGNALS PRO - ПОЛНЫЙ ЗАПУСК
echo ===============================================
echo.

echo [1/4] Остановка старых процессов...
taskkill /F /IM python.exe 2>nul
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo [2/4] Запуск Backend (FastAPI)...
start "Backend" cmd /k "cd /d e:\TelegramBot_RDP\webapp\backend && python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload"
timeout /t 3 /nobreak >nul

echo [3/4] Запуск Frontend (Production)...
start "Frontend" cmd /k "cd /d e:\TelegramBot_RDP && python serve_production.py"
timeout /t 3 /nobreak >nul

echo [4/4] Запуск Telegram Bot...
start "Telegram Bot" cmd /k "cd /d e:\TelegramBot_RDP && python run_telegram_bot.py"
timeout /t 2 /nobreak >nul

echo.
echo ===============================================
echo   ✅ ВСЁ ЗАПУЩЕНО УСПЕШНО!
echo ===============================================
echo.
echo 📊 Backend:    http://localhost:8000
echo 🌐 Frontend:   http://localhost:3005
echo 🤖 Bot:        @Devil_Signal_PRO_bot
echo 🌍 Web App:    https://devil-signals-pro.loca.lt
echo.
echo 💡 Откройте Telegram и найдите бота!
echo 💡 Нажмите "🌐 Web App" для доступа к приложению!
echo.
echo ⚠️  Для остановки закройте все окна терминала
echo.
pause
