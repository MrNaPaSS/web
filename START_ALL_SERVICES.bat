@echo off
echo ========================================
echo    ЗАПУСК ВСЕХ СЕРВИСОВ TELEGRAM BOT
echo ========================================
echo.

echo [1/4] Останавливаем все процессы...
taskkill /f /im python.exe 2>nul
taskkill /f /im node.exe 2>nul
taskkill /f /im cloudflared.exe 2>nul
timeout /t 2 /nobreak >nul

echo [2/4] Запускаем Telegram бота...
start "Telegram Bot" cmd /k "cd /d e:\TelegramBot_RDP && python run_telegram_bot.py"
timeout /t 3 /nobreak >nul

echo [3/4] Запускаем Backend API...
start "Backend API" cmd /k "cd /d e:\TelegramBot_RDP\webapp\backend && python main.py"
timeout /t 5 /nobreak >nul

echo [4/4] Запускаем Cloudflare туннель...
start "Cloudflare Tunnel" cmd /k "cd /d e:\TelegramBot_RDP && .\cloudflared.exe tunnel --url http://localhost:8000"
timeout /t 3 /nobreak >nul

echo.
echo ========================================
echo         ВСЕ СЕРВИСЫ ЗАПУЩЕНЫ!
echo ========================================
echo.
echo Telegram Bot: Работает
echo Backend API: http://localhost:8000
echo Cloudflare Tunnel: Создается...
echo.
echo Ожидайте 10 секунд для полной инициализации...
timeout /t 10 /nobreak >nul

echo.
echo Проверяем статус сервисов...
curl -s http://localhost:8000/api/health >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ Backend API: РАБОТАЕТ
) else (
    echo ❌ Backend API: НЕ РАБОТАЕТ
)

echo.
echo ========================================
echo      ГОТОВО! Все сервисы запущены
echo ========================================
echo.
echo Откройте браузер и перейдите на ваш домен
echo для проверки авторизации через Telegram
echo.
pause
