@echo off
title РАБОЧАЯ СИСТЕМА - АВТОМАТИЧЕСКИЙ ЗАПУСК
color 0A

echo.
echo ========================================
echo    🚀 РАБОЧАЯ СИСТЕМА ЗАПУСКАЕТСЯ
echo ========================================
echo.

echo [1/4] Остановка старых процессов...
taskkill /f /im python.exe >nul 2>&1
taskkill /f /im cloudflared.exe >nul 2>&1
timeout /t 2 >nul

echo [2/4] Запуск Telegram бота...
start "Telegram Bot" cmd /k "python run_telegram_bot.py"
timeout /t 3 >nul

echo [3/4] Запуск API сервера...
start "API Server" cmd /k "python backend/signal_api.py"
timeout /t 5 >nul

echo [4/4] Запуск постоянного туннеля...
start "Cloudflare Tunnel" cmd /k ".\cloudflared.exe tunnel --config config.yml run nomoneynohoney-tunnel"

echo.
echo ========================================
echo    ✅ СИСТЕМА ЗАПУЩЕНА УСПЕШНО!
echo ========================================
echo.
echo 📊 СТАТУС СИСТЕМЫ:
echo   • Telegram бот: @Bin_ByB1million_bot
echo   • API: https://bot.nomoneynohoney.online
echo   • Веб-сайт: https://app.nomoneynohoney.online
echo   • Постоянный туннель: nomoneynohoney-tunnel
echo.
echo 🔍 ПРОВЕРКА:
echo   • API Health: https://bot.nomoneynohoney.online/api/health
echo   • Пользователи: https://bot.nomoneynohoney.online/api/users/all
echo.
echo ⚠️  НЕ ЗАКРЫВАЙТЕ ОКНА СЕРВИСОВ!
echo    Они должны работать постоянно.
echo.
pause
