@echo off
chcp 65001 >nul
cls
echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║                                                                ║
echo ║        🚀 ЗАПУСК ПОЛНОЙ СИСТЕМЫ FOREX SIGNALS PRO 🚀          ║
echo ║                                                                ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.
echo.

echo ════════════════════════════════════════════════════════════════
echo  📋 ЧТО БУДЕТ ЗАПУЩЕНО:
echo ════════════════════════════════════════════════════════════════
echo.
echo  1. 🤖 Telegram Bot           (основной бот)
echo  2. 🔐 Auth API               (порт 5001)
echo  3. 📊 Signal API             (порт 5002)
echo  4. 🌐 Frontend WebApp        (порт 5173)
echo.
echo ════════════════════════════════════════════════════════════════
echo.
timeout /t 2 >nul

REM Запуск Telegram бота
echo [1/4] 🤖 Запускаю Telegram Bot...
start "Telegram Bot" cmd /k "cd /d e:\TelegramBot_RDP && chcp 65001 >nul && python run_telegram_bot.py"
timeout /t 3 >nul

REM Запуск Auth API
echo [2/4] 🔐 Запускаю Auth API (порт 5001)...
start "Auth API - Port 5001" cmd /k "cd /d %~dp0backend && chcp 65001 >nul && python auth_api.py"
timeout /t 2 >nul

REM Запуск Signal API  
echo [3/4] 📊 Запускаю Signal API (порт 5002)...
start "Signal API - Port 5002" cmd /k "cd /d %~dp0backend && chcp 65001 >nul && python signal_api.py"
timeout /t 2 >nul

REM Запуск Frontend
echo [4/4] 🌐 Запускаю Frontend (порт 5173)...
start "Frontend WebApp - Port 5173" cmd /k "cd /d %~dp0 && npm run dev"
timeout /t 3 >nul

cls
echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║                                                                ║
echo ║             ✅ ВСЯ СИСТЕМА ЗАПУЩЕНА УСПЕШНО! ✅               ║
echo ║                                                                ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.
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
echo  ⚠️  НЕ ЗАКРЫВАЙ ОТКРЫВШИЕСЯ ОКНА!
echo.
echo  ❌ Для остановки всей системы:
echo     Закрой все 4 окна с серверами
echo.
echo ════════════════════════════════════════════════════════════════
echo.
pause

