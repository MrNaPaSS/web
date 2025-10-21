@echo off
chcp 65001 >nul
title 🚀 ЗАПУСК ПОЛНОЙ СИСТЕМЫ

echo.
echo ==========================================
echo   🚀 ЗАПУСК ПОЛНОЙ СИСТЕМЫ FOREX BOT
echo ==========================================
echo.

:: Остановка всех процессов
echo 🔄 Останавливаем все процессы...
taskkill /F /IM python.exe >nul 2>&1
taskkill /F /IM node.exe >nul 2>&1
taskkill /F /IM cloudflared.exe >nul 2>&1
timeout /t 2 /nobreak >nul

:: Проверка зависимостей
echo 📦 Проверяем зависимости...

:: Frontend зависимости
if not exist "webapp\frontend\node_modules" (
    echo 📦 Устанавливаем зависимости frontend...
    cd webapp\frontend
    call npm install --force
    cd ..\..
)

:: Python зависимости
echo 📦 Проверяем Python зависимости...
python -c "import telegram, flask, requests" >nul 2>&1
if errorlevel 1 (
    echo 📦 Устанавливаем Python зависимости...
    pip install -r requirements.txt
)

:: Запуск Frontend
echo 🌐 Запускаем Frontend (порт 5173)...
cd webapp\frontend
start "Frontend" cmd /c "npm run dev"
cd ..\..

:: Ждём запуска frontend
echo ⏳ Ждём запуска frontend (10 сек)...
timeout /t 10 /nobreak >nul

:: Запуск Cloudflare Tunnel
echo 🌍 Запускаем Cloudflare Tunnel...
start "Cloudflare Tunnel" cmd /c "cd /d e:\TelegramBot_RDP && .\cloudflared.exe tunnel run forex-signals-bot"

:: Ждём запуска туннеля
echo ⏳ Ждём запуска туннеля (15 сек)...
timeout /t 15 /nobreak >nul

:: Получаем новый URL туннеля
echo 🔍 Получаем URL туннеля...
python get_working_url.py >nul 2>&1

:: Обновляем URL в боте
echo 🔄 Обновляем URL в боте...
python get_latest_tunnel_url.py >nul 2>&1

:: Запуск Telegram бота
echo 🤖 Запускаем Telegram бота...
start "Telegram Bot" cmd /c "cd /d e:\TelegramBot_RDP && python run_telegram_bot.py"

echo.
echo ==========================================
echo   ✅ ВСЁ ЗАПУЩЕНО!
echo ==========================================
echo.
echo 📱 Frontend: http://localhost:5173
echo 🌍 Tunnel: Проверьте логи Cloudflare
echo 🤖 Bot: Запущен и работает
echo.
echo 💡 Для остановки всех процессов:
echo    taskkill /F /IM python.exe /IM node.exe /IM cloudflared.exe
echo.
echo 🎯 Проверьте Telegram бота:
echo    1. Откройте бота
echo    2. Напишите /start
echo    3. Нажмите кнопку "Web App"
echo.

pause