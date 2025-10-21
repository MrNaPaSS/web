@echo off
chcp 65001 > nul
echo ========================================
echo 🚀 ЗАПУСК ПОЛНОЙ СИСТЕМЫ
echo ========================================
echo.

REM Остановка всех процессов
echo [1/5] Остановка старых процессов...
taskkill /F /IM python.exe >nul 2>&1
taskkill /F /IM node.exe >nul 2>&1
taskkill /F /IM cloudflared.exe >nul 2>&1
timeout /t 2 >nul

REM Запуск Cloudflare туннеля
echo [2/5] Запуск Cloudflare туннеля (именованный)...
start /B cloudflared.exe tunnel --config cloudflare-config.yml run forex-signals
timeout /t 5 >nul

REM Запуск Backend API
echo [3/5] Запуск Backend API (порт 5002)...
start /B cmd /c "cd home\ubuntu\forex-signals-app\backend && python signal_api.py"
timeout /t 3 >nul

REM Запуск Frontend
echo [4/5] Запуск Frontend (порт 5173)...
start /B cmd /c "cd home\ubuntu\forex-signals-app && npm run dev"
timeout /t 5 >nul

REM Запуск Telegram бота
echo [5/5] Запуск Telegram бота...
start /B python run_telegram_bot.py
timeout /t 3 >nul

echo.
echo ========================================
echo ✅ ВСЁ ЗАПУЩЕНО!
echo ========================================
echo.
echo 🌐 Cloudflare туннель: проверяю URL...
findstr "trycloudflare" tunnel.log | findstr /C:"https://"
echo.
echo 🔧 Backend API: http://localhost:5002
echo 🎨 Frontend: http://localhost:5173
echo 🤖 Telegram бот: активен
echo.
echo Нажмите любую клавишу для выхода...
pause >nul

