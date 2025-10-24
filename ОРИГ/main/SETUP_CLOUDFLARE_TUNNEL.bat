@echo off
chcp 65001 > nul

title Forex Signals Pro - Cloudflare Tunnel Setup

echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║                                                                ║
echo ║        🌐 НАСТРОЙКА CLOUDFLARE TUNNEL ДЛЯ PRODUCTION 🌐      ║
echo ║                                                                ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

echo ════════════════════════════════════════════════════════════════
echo  ШАГ 1: Скачивание cloudflared
echo ════════════════════════════════════════════════════════════════
echo.

if not exist "cloudflared.exe" (
    echo 📥 Скачиваю cloudflared для Windows...
    powershell -Command "Invoke-WebRequest -Uri 'https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe' -OutFile 'cloudflared.exe'"
    if exist "cloudflared.exe" (
        echo ✅ cloudflared скачан успешно!
    ) else (
        echo ❌ Ошибка скачивания cloudflared!
        echo    Скачай вручную: https://github.com/cloudflare/cloudflared/releases
        pause
        exit /b 1
    )
) else (
    echo ✅ cloudflared уже установлен
)

echo.
echo ════════════════════════════════════════════════════════════════
echo  ШАГ 2: Авторизация в Cloudflare
echo ════════════════════════════════════════════════════════════════
echo.

echo 🔐 Выполняю авторизацию в Cloudflare...
echo    (Откроется браузер для входа)
echo.
cloudflared.exe login

echo.
echo ════════════════════════════════════════════════════════════════
echo  ШАГ 3: Создание именованного туннеля
echo ════════════════════════════════════════════════════════════════
echo.

echo 🚇 Создаю именованный туннель...
cloudflared.exe tunnel create forex-signals-bot

echo.
echo ════════════════════════════════════════════════════════════════
echo  ШАГ 4: Настройка конфигурации
echo ════════════════════════════════════════════════════════════════
echo.

REM Создание директории конфигурации
if not exist "%USERPROFILE%\.cloudflared" mkdir "%USERPROFILE%\.cloudflared"

echo 📝 Создаю конфигурационный файл...

REM Получение ID туннеля из команды create
for /f "tokens=*" %%i in ('cloudflared.exe tunnel list ^| findstr forex-signals-bot') do set TUNNEL_ID=%%i
set TUNNEL_ID=%TUNNEL_ID:~0,36%

echo Tunnel ID: %TUNNEL_ID%

REM Создание config.yml
(
echo tunnel: %TUNNEL_ID%
echo credentials-file: %USERPROFILE%\.cloudflared\%TUNNEL_ID%.json
echo ingress:
echo   - service: http://localhost:5173
echo   - service: http_status:404
) > "%USERPROFILE%\.cloudflared\config.yml"

echo ✅ Конфигурация создана: %USERPROFILE%\.cloudflared\config.yml

echo.
echo ════════════════════════════════════════════════════════════════
echo  ШАГ 5: Установка cloudflared как службы
echo ════════════════════════════════════════════════════════════════
echo.

echo 🔧 Устанавливаю cloudflared как Windows службу...
cloudflared.exe service install

echo.
echo ════════════════════════════════════════════════════════════════
echo  ШАГ 6: Запуск туннеля
echo ════════════════════════════════════════════════════════════════
echo.

echo 🚀 Запускаю туннель...
echo    Это займет несколько секунд...
echo.
start /min cmd /k "cloudflared.exe tunnel run forex-signals-bot"

timeout /t 10 /nobreak > nul

echo.
echo ════════════════════════════════════════════════════════════════
echo  ШАГ 7: Получение публичного URL
echo ════════════════════════════════════════════════════════════════
echo.

echo 🔍 Получаю публичный URL туннеля...

REM Создание скрипта для получения URL
echo powershell -Command "$response = Invoke-WebRequest -Uri 'http://localhost:4040/api/tunnels' -UseBasicParsing; $json = $response.Content ^| ConvertFrom-Json; $tunnel = $json.tunnels ^| Where-Object { $_.config.addr -eq 'http://localhost:5173' }; if ($tunnel) { $tunnel.public_url } else { 'Tunnel not ready yet' }" > get_tunnel_url.ps1

for /L %%i in (1,1,10) do (
    powershell -ExecutionPolicy Bypass -File get_tunnel_url.ps1 > tunnel_url.txt 2>nul
    for /f "delims=" %%j in (tunnel_url.txt) do set TUNNEL_URL=%%j
    if not "%TUNNEL_URL%"=="Tunnel not ready yet" if not "%TUNNEL_URL%"=="" goto :url_found
    echo Ожидание туннеля... (%%i/10)
    timeout /t 3 /nobreak > nul
)

:url_found
if "%TUNNEL_URL%"=="" set TUNNEL_URL=https://trycloudflare.com

echo ✅ Публичный URL: %TUNNEL_URL%

echo.
echo ════════════════════════════════════════════════════════════════
echo  ШАГ 8: Обновление бота
echo ════════════════════════════════════════════════════════════════
echo.

echo 🔄 Обновляю web_app_url в telegram_bot.py...
python -c "import re; file_path = 'e:\\TelegramBot_RDP\\telegram_bot.py'; content = open(file_path, 'r', encoding='utf-8').read(); new_content = re.sub(r'self\.web_app_url = \".*\"', r'self.web_app_url = \"%TUNNEL_URL%\"', content); open(file_path, 'w', encoding='utf-8').write(new_content)"

echo ✅ Бот обновлен с новым URL: %TUNNEL_URL%

echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║                                                                ║
echo ║             ✅ CLOUDFLARE TUNNEL НАСТРОЕН! ✅                ║
echo ║                                                                ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

echo ════════════════════════════════════════════════════════════════
echo  📡 ИНФОРМАЦИЯ:
echo ════════════════════════════════════════════════════════════════
echo.
echo  🌐 Публичный URL: %TUNNEL_URL%
echo  🔧 Конфиг: %USERPROFILE%\.cloudflared\config.yml
echo  🚀 Служба: cloudflared (автозапуск)
echo.
echo ════════════════════════════════════════════════════════════════
echo.

echo  🧪 ТЕСТИРОВАНИЕ:
echo     1. Открой %TUNNEL_URL% в браузере
echo     2. Проверь, что веб-приложение загружается
echo     3. Перезапусти Telegram бота
echo     4. Протестируй кнопку "Web App" в Telegram
echo.
echo  ⚠️  ВАЖНО:
echo     - Туннель работает только пока запущен cloudflared
echo     - Для постоянной работы установи как службу
echo     - Привяжи домен через Cloudflare DNS для постоянного URL
echo.
echo ════════════════════════════════════════════════════════════════
echo.

REM Очистка временных файлов
del tunnel_url.txt get_tunnel_url.ps1 2>nul

pause
