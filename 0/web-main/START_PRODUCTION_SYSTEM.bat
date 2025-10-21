@echo off
chcp 65001 > nul

title Forex Signals Pro - Production System Launcher

echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║                                                                ║
echo ║        🚀 ЗАПУСК ПРОДАКШЕН СИСТЕМЫ FOREX SIGNALS PRO 🚀       ║
echo ║                                                                ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

echo ════════════════════════════════════════════════════════════════
echo  📋 ПРОВЕРКА СЕРВИСОВ:
echo ════════════════════════════════════════════════════════════════
echo.

REM Проверка Telegram Bot
echo [1/4] 🤖 Проверяю Telegram Bot...
tasklist | findstr python.exe > nul
if %errorlevel% == 0 (
    echo ✅ Telegram Bot: Работает
) else (
    echo ❌ Telegram Bot: Не запущен
    echo    Запускаю Telegram Bot...
    start cmd /k "cd /d e:\TelegramBot_RDP && python run_telegram_bot.py"
    timeout /t 3 /nobreak > nul
)

REM Проверка Auth API
echo [2/4] 🔐 Проверяю Auth API...
netstat -an | findstr ":5001" > nul
if %errorlevel% == 0 (
    echo ✅ Auth API: Работает на порту 5001
) else (
    echo ❌ Auth API: Не запущен
    echo    Запускаю Auth API...
    start cmd /k "cd /d e:\TelegramBot_RDP\home\ubuntu\forex-signals-app\backend && python auth_api.py"
    timeout /t 3 /nobreak > nul
)

REM Проверка Signal API
echo [3/4] 📊 Проверяю Signal API...
netstat -an | findstr ":5002" > nul
if %errorlevel% == 0 (
    echo ✅ Signal API: Работает на порту 5002
) else (
    echo ❌ Signal API: Не запущен
    echo    Запускаю Signal API...
    start cmd /k "cd /d e:\TelegramBot_RDP\home\ubuntu\forex-signals-app\backend && python signal_api.py"
    timeout /t 3 /nobreak > nul
)

REM Проверка Frontend
echo [4/4] 🌐 Проверяю Frontend...
netstat -an | findstr ":5173" > nul
if %errorlevel% == 0 (
    echo ✅ Frontend: Работает на порту 5173
) else (
    echo ❌ Frontend: Не запущен
    echo    Запускаю Frontend...
    start cmd /k "cd /d e:\TelegramBot_RDP\home\ubuntu\forex-signals-app && npm run dev"
    timeout /t 5 /nobreak > nul
)

echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║                                                                ║
echo ║             ✅ ПРОДАКШЕН СИСТЕМА ЗАПУЩЕНА! ✅                ║
echo ║                                                                ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

echo ════════════════════════════════════════════════════════════════
echo  📡 ЗАПУЩЕННЫЕ СЕРВИСЫ:
echo ════════════════════════════════════════════════════════════════
echo.
echo  ✅ Telegram Bot          Работает
echo  ✅ Auth API              http://localhost:5001
echo  ✅ Signal API            http://localhost:5002
echo  ✅ Frontend WebApp       http://localhost:5173
echo.
echo ════════════════════════════════════════════════════════════════
echo.

echo  🌐 ОТКРОЙ В БРАУЗЕРЕ:
echo     http://localhost:5173
echo.
echo  🤖 ОТКРОЙ БОТА В TELEGRAM:
echo     @твой_бот
echo     Команда: /webapp
echo.
echo ════════════════════════════════════════════════════════════════
echo.

echo  ⚠️  ДЛЯ ПРОДАКШЕНА НУЖЕН HTTPS ТУННЕЛЬ:
echo     1. Установи Cloudflare Tunnel (cloudflared)
echo     2. Или настрой ngrok с правильным токеном
echo     3. Обнови web_app_url в telegram_bot.py
echo.
echo  ❌ Для остановки всей системы:
echo     Закрой все окна с серверами
echo.
echo ════════════════════════════════════════════════════════════════
echo.

pause
