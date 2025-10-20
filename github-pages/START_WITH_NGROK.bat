@echo off
chcp 65001 >nul
cls
echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║                                                                ║
echo ║        🌐 ЗАПУСК СИСТЕМЫ С NGROK (HTTPS) 🌐                  ║
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
echo  5. 🔗 Ngrok Tunnel           (HTTPS для Telegram)
echo.
echo ════════════════════════════════════════════════════════════════
echo.
echo  ⚠️  ТРЕБУЕТСЯ NGROK!
echo  📥 Скачай: https://ngrok.com/download
echo  🔑 Получи токен: https://dashboard.ngrok.com/get-started/your-authtoken
echo.
echo ════════════════════════════════════════════════════════════════
echo.
timeout /t 3 >nul

REM Запуск Telegram бота
echo [1/5] 🤖 Запускаю Telegram Bot...
start "Telegram Bot" cmd /k "cd /d e:\TelegramBot_RDP && chcp 65001 >nul && python run_telegram_bot.py"
timeout /t 3 >nul

REM Запуск Auth API
echo [2/5] 🔐 Запускаю Auth API (порт 5001)...
start "Auth API - Port 5001" cmd /k "cd /d %~dp0backend && chcp 65001 >nul && python auth_api.py"
timeout /t 2 >nul

REM Запуск Signal API  
echo [3/5] 📊 Запускаю Signal API (порт 5002)...
start "Signal API - Port 5002" cmd /k "cd /d %~dp0backend && chcp 65001 >nul && python signal_api.py"
timeout /t 2 >nul

REM Запуск Frontend
echo [4/5] 🌐 Запускаю Frontend (порт 5173)...
start "Frontend WebApp - Port 5173" cmd /k "cd /d %~dp0 && npm run dev"
timeout /t 5 >nul

REM Запуск Ngrok
echo [5/5] 🔗 Запускаю Ngrok Tunnel...
start "Ngrok Tunnel" cmd /k "ngrok http 5173 --log=stdout"

cls
echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║                                                                ║
echo ║             ✅ СИСТЕМА ЗАПУЩЕНА С NGROK! ✅                  ║
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
echo  ✅ Ngrok Tunnel          https://xxx.ngrok.io
echo.
echo ════════════════════════════════════════════════════════════════
echo.
echo  🌐 ОТКРОЙ В БРАУЗЕРЕ:
echo     http://localhost:5173
echo.
echo  🔗 NGROK URL:
echo     Смотри в окне "Ngrok Tunnel"
echo     Скопируй https://xxx.ngrok.io
echo.
echo  🤖 ОБНОВИ URL В БОТЕ:
echo     1. Открой telegram_bot.py
echo     2. Замени web_app_url на ngrok URL
echo     3. Перезапусти бота
echo.
echo ════════════════════════════════════════════════════════════════
echo.
echo  ⚠️  НЕ ЗАКРЫВАЙ ОТКРЫВШИЕСЯ ОКНА!
echo.
echo  ❌ Для остановки всей системы:
echo     Закрой все 5 окон с серверами
echo.
echo ════════════════════════════════════════════════════════════════
echo.
pause
