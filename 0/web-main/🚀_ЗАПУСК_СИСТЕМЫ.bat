@echo off
chcp 65001 > nul
title ЗАПУСК ПОЛНОЙ СИСТЕМЫ - Telegram Bot + WebApp

echo.
echo ═══════════════════════════════════════════════════════════════════
echo    🚀 ЗАПУСК ПОЛНОЙ СИСТЕМЫ - TELEGRAM BOT + WEBAPP 🚀
echo ═══════════════════════════════════════════════════════════════════
echo.

cd /d e:\TelegramBot_RDP

echo [1/4] 🤖 Запускаю Telegram Bot с сигналами...
start "Telegram Bot" cmd /k "cd /d e:\TelegramBot_RDP && python run_telegram_bot.py"
timeout /t 3 /nobreak > nul

echo [2/4] 🔐 Запускаю Auth API (порт 5001)...
start "Auth API" cmd /k "cd /d e:\TelegramBot_RDP\home\ubuntu\forex-signals-app\backend && python auth_api.py"
timeout /t 2 /nobreak > nul

echo [3/4] 📊 Запускаю Signal API (порт 5002)...
start "Signal API" cmd /k "cd /d e:\TelegramBot_RDP\home\ubuntu\forex-signals-app\backend && python signal_api.py"
timeout /t 2 /nobreak > nul

echo [4/4] 🌐 Запускаю Frontend WebApp (порт 5173)...
start "Frontend" cmd /k "cd /d e:\TelegramBot_RDP\home\ubuntu\forex-signals-app && npm run dev"
timeout /t 3 /nobreak > nul

echo.
echo ═══════════════════════════════════════════════════════════════════
echo    ✅ ВСЯ СИСТЕМА ЗАПУЩЕНА! ✅
echo ═══════════════════════════════════════════════════════════════════
echo.
echo  📡 ЗАПУЩЕННЫЕ СЕРВИСЫ:
echo    ✅ Telegram Bot        - Работает
echo    ✅ Auth API            - http://localhost:5001
echo    ✅ Signal API          - http://localhost:5002
echo    ✅ Frontend WebApp     - http://localhost:5173
echo.
echo  🌐 ОТКРОЙ В БРАУЗЕРЕ:
echo    http://localhost:5173
echo.
echo  🤖 ОТКРОЙ БОТА В TELEGRAM:
echo    Найди своего бота и используй команду /start
echo.
echo ═══════════════════════════════════════════════════════════════════
echo.
pause

