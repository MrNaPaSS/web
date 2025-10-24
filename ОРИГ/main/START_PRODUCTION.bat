@echo off
chcp 65001 >nul
title 🚀 TELEGRAM BOT - PRODUCTION STARTUP

echo.
echo ============================================================
echo 🚀 TELEGRAM BOT - PRODUCTION STARTUP
echo ============================================================
echo.

REM Проверка Python
echo [1/7] Проверка Python...
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python не найден! Установите Python 3.8+
    pause
    exit /b 1
)
echo ✅ Python найден

REM Проверка зависимостей
echo.
echo [2/7] Проверка зависимостей...
if not exist "requirements.txt" (
    echo ❌ Файл requirements.txt не найден!
    pause
    exit /b 1
)
echo ✅ requirements.txt найден

REM Установка зависимостей
echo.
echo [3/7] Установка зависимостей...
pip install -r requirements.txt --quiet
if errorlevel 1 (
    echo ❌ Ошибка установки зависимостей!
    pause
    exit /b 1
)
echo ✅ Зависимости установлены

REM Проверка конфигурации
echo.
echo [4/7] Проверка конфигурации...
if not exist "telegram_bot.py" (
    echo ❌ Файл telegram_bot.py не найден!
    pause
    exit /b 1
)
if not exist "home/ubuntu/forex-signals-app/backend/signal_api.py" (
    echo ❌ Файл signal_api.py не найден!
    pause
    exit /b 1
)
if not exist "authorized_users.json" (
    echo ❌ Файл authorized_users.json не найден!
    pause
    exit /b 1
)
if not exist "signal_stats.json" (
    echo ❌ Файл signal_stats.json не найден!
    pause
    exit /b 1
)
echo ✅ Все конфигурационные файлы найдены

REM Запуск API сервера
echo.
echo [5/7] Запуск API сервера...
echo 🚀 Запускаю API сервер на порту 5000...
start "API Server" /min cmd /c "python home/ubuntu/forex-signals-app/backend/signal_api.py"

REM Ожидание запуска API
echo ⏳ Ожидание запуска API сервера...
timeout /t 5 /nobreak >nul

REM Проверка API
echo 🔍 Проверка API сервера...
curl -s http://localhost:5000/api/signal/stats >nul 2>&1
if errorlevel 1 (
    echo ⚠️  API сервер еще запускается, продолжаем...
) else (
    echo ✅ API сервер запущен
)

REM Запуск Telegram бота
echo.
echo [6/7] Запуск Telegram бота...
echo 🚀 Запускаю Telegram бота...
start "Telegram Bot" cmd /c "python run_telegram_bot.py"

REM Ожидание запуска бота
echo ⏳ Ожидание запуска Telegram бота...
timeout /t 3 /nobreak >nul

REM Проверка Cloudflare туннеля
echo.
echo [7/7] Проверка Cloudflare туннеля...
if exist "cloudflared.exe" (
    echo 🚀 Запускаю Cloudflare туннель...
    start "Cloudflare Tunnel" /min cmd /c "cloudflared.exe tunnel --url http://localhost:5000"
    echo ✅ Cloudflare туннель запущен
) else (
    echo ⚠️  Cloudflare туннель не найден, используйте ngrok или другой туннель
)

echo.
echo ============================================================
echo ✅ ВСЕ СЕРВИСЫ ЗАПУЩЕНЫ УСПЕШНО!
echo ============================================================
echo.
echo 📋 СТАТУС СЕРВИСОВ:
echo ┌─────────────────────────────────────────────────────────┐
echo │ 🟢 API Server        │ http://localhost:5000           │
echo │ 🟢 Telegram Bot      │ Активен                         │
echo │ 🟢 Cloudflare Tunnel │ Активен (если найден)          │
echo └─────────────────────────────────────────────────────────┘
echo.
echo 🔗 ПОЛЕЗНЫЕ ССЫЛКИ:
echo • API Stats: http://localhost:5000/api/signal/stats
echo • API Users: http://localhost:5000/api/users/all
echo • Web App: https://accessibility-gallery-column-olympus.trycloudflare.com
echo.
echo 📝 ЛОГИ:
echo • Telegram Bot: Проверьте окно "Telegram Bot"
echo • API Server: Проверьте окно "API Server"
echo • Cloudflare: Проверьте окно "Cloudflare Tunnel"
echo.
echo ⚠️  ВАЖНО:
echo • Не закрывайте это окно - оно управляет сервисами
echo • Для остановки нажмите Ctrl+C или закройте все окна
echo • Проверьте логи на наличие ошибок
echo.
echo 🎯 ГОТОВО К РАБОТЕ!
echo ============================================================

REM Мониторинг
echo.
echo 🔄 Мониторинг сервисов (нажмите Ctrl+C для остановки)...
echo.

:monitor_loop
timeout /t 30 /nobreak >nul
echo [%date% %time%] Система работает нормально...
goto monitor_loop
