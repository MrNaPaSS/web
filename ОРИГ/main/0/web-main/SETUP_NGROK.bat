@echo off
chcp 65001 >nul
cls
echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║                                                                ║
echo ║        🔧 НАСТРОЙКА NGROK ДЛЯ TELEGRAM WEBAPP 🔧              ║
echo ║                                                                ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

echo ════════════════════════════════════════════════════════════════
echo  🔑 УСТАНОВКА NGROK API КЛЮЧА:
echo ════════════════════════════════════════════════════════════════
echo.

ngrok config add-authtoken 33zJgcseIQyWjdS8O0cIN1B6IPV_3TGNg8WE5zg6pGGhmfiHT

if %errorlevel% == 0 (
    echo ✅ Ngrok API ключ установлен успешно!
) else (
    echo ❌ Ошибка установки API ключа
    pause
    exit /b 1
)

echo.
echo ════════════════════════════════════════════════════════════════
echo  🚀 ТЕПЕРЬ ЗАПУСКАЮ ПОЛНУЮ СИСТЕМУ:
echo ════════════════════════════════════════════════════════════════
echo.

timeout /t 2 >nul

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
echo  🔗 ПОЛУЧИ NGROK URL:
echo     1. Открой окно "Ngrok Tunnel"
echo     2. Скопируй https://xxx.ngrok.io
echo     3. Нажми любую клавишу для обновления бота
echo.
echo ════════════════════════════════════════════════════════════════
echo.
pause

echo.
echo ════════════════════════════════════════════════════════════════
echo  🔄 ОБНОВЛЕНИЕ URL В БОТЕ:
echo ════════════════════════════════════════════════════════════════
echo.
set /p NGROK_URL="Введи ngrok URL (https://xxx.ngrok.io): "

if "%NGROK_URL%"=="" (
    echo ❌ URL не введен!
    pause
    exit /b 1
)

echo.
echo 🔄 Обновляю URL в боте: %NGROK_URL%

REM Обновляем URL в telegram_bot.py
powershell -Command "(Get-Content 'e:\TelegramBot_RDP\telegram_bot.py') -replace 'self\.web_app_url = \".*\"', 'self.web_app_url = \"%NGROK_URL%\"' | Set-Content 'e:\TelegramBot_RDP\telegram_bot.py'"

echo ✅ URL обновлен в telegram_bot.py
echo.
echo 🔄 Перезапускаю бота...

REM Останавливаем старый процесс бота
taskkill /f /im python.exe >nul 2>&1
timeout /t 2 >nul

REM Запускаем бота заново
start "Telegram Bot - Updated" cmd /k "cd /d e:\TelegramBot_RDP && chcp 65001 >nul && python run_telegram_bot.py"

cls
echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║                                                                ║
echo ║             🎉 ВСЁ ГОТОВО К РАБОТЕ! 🎉                       ║
echo ║                                                                ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.
echo.
echo ════════════════════════════════════════════════════════════════
echo  📱 ТЕПЕРЬ МОЖЕШЬ:
echo ════════════════════════════════════════════════════════════════
echo.
echo  1. 🌐 Открыть в браузере: http://localhost:5173
echo  2. 🤖 Открыть бота в Telegram и нажать "🌐 Web App"
echo  3. ✅ WebApp будет работать через HTTPS!
echo.
echo ════════════════════════════════════════════════════════════════
echo.
echo  🔗 Ngrok URL: %NGROK_URL%
echo.
echo ════════════════════════════════════════════════════════════════
echo.
pause
