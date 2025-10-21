@echo off
chcp 65001 > nul

title Forex Signals Pro - Simple Start

echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║                                                                ║
echo ║        🚀 ПРОСТОЙ ЗАПУСК FOREX SIGNALS PRO 🚀               ║
echo ║                                                                ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

echo ════════════════════════════════════════════════════════════════
echo  🚀 ЗАПУСКАЮ ВСЕ СЕРВИСЫ:
echo ════════════════════════════════════════════════════════════════
echo.

echo [1/4] 🤖 Запускаю Telegram Bot...
start "Telegram Bot" cmd /k "cd /d e:\TelegramBot_RDP && python run_telegram_bot.py"

echo [2/4] 🔐 Запускаю Auth API...
start "Auth API" cmd /k "cd /d C:\Users\Admin\Downloads\home\ubuntu\forex-signals-app\backend && python auth_api.py"

echo [3/4] 📊 Запускаю Signal API...
start "Signal API" cmd /k "cd /d C:\Users\Admin\Downloads\home\ubuntu\forex-signals-app\backend && python signal_api.py"

echo [4/4] 🌐 Запускаю Frontend...
start "Frontend" cmd /k "cd /d C:\Users\Admin\Downloads\home\ubuntu\forex-signals-app && npm run dev"

echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║                                                                ║
echo ║             ✅ ВСЕ СЕРВИСЫ ЗАПУЩЕНЫ! ✅                     ║
echo ║                                                                ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

echo ════════════════════════════════════════════════════════════════
echo  📡 ЗАПУЩЕННЫЕ СЕРВИСЫ:
echo ════════════════════════════════════════════════════════════════
echo.
echo  ✅ Telegram Bot          e:\TelegramBot_RDP
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
echo  ⚠️  НЕ ЗАКРЫВАЙ ОТКРЫВШИЕСЯ ОКНА!
echo.
echo ════════════════════════════════════════════════════════════════
echo.

pause
