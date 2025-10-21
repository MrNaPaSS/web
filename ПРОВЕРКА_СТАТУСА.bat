@echo off
title ПРОВЕРКА СТАТУСА СИСТЕМЫ
color 0B

echo.
echo ========================================
echo    📊 ПРОВЕРКА СТАТУСА СИСТЕМЫ
echo ========================================
echo.

echo [1/4] Проверка процессов Python...
tasklist /fi "imagename eq python.exe" | find "python.exe" >nul
if %errorlevel%==0 (
    echo ✅ Python процессы запущены
) else (
    echo ❌ Python процессы не найдены
)

echo.
echo [2/4] Проверка процессов Cloudflare...
tasklist /fi "imagename eq cloudflared.exe" | find "cloudflared.exe" >nul
if %errorlevel%==0 (
    echo ✅ Cloudflare туннель запущен
) else (
    echo ❌ Cloudflare туннель не найден
)

echo.
echo [3/4] Проверка порта 5000...
netstat -an | find ":5000" >nul
if %errorlevel%==0 (
    echo ✅ API сервер слушает порт 5000
) else (
    echo ❌ Порт 5000 не активен
)

echo.
echo [4/4] Проверка API через туннель...
powershell -Command "try { $response = Invoke-WebRequest -Uri 'https://bot.nomoneynohoney.online/api/health' -UseBasicParsing -TimeoutSec 10; if($response.StatusCode -eq 200) { Write-Host '✅ API доступен через туннель' } else { Write-Host '❌ API недоступен' } } catch { Write-Host '❌ Ошибка подключения к API' }"

echo.
echo ========================================
echo    📋 ИНФОРМАЦИЯ О СИСТЕМЕ
echo ========================================
echo.
echo 🌐 URL-адреса:
echo   • Telegram бот: @Bin_ByB1million_bot
echo   • API: https://bot.nomoneynohoney.online
echo   • Веб-сайт: https://app.nomoneynohoney.online
echo.
echo 🔧 Техническая информация:
echo   • Туннель ID: bedd1007-8e35-4ced-8091-bc186ce2a198
echo   • Конфиг файл: config.yml
echo   • API порт: 5000
echo.
pause
