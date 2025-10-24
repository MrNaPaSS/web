@echo off
chcp 65001 > nul
title CLOUDFLARE ТУННЕЛЬ ДЛЯ TELEGRAM WEBAPP

echo.
echo ═══════════════════════════════════════════════════════════════════
echo    🌐 ЗАПУСК CLOUDFLARE ТУННЕЛЯ 🌐
echo ═══════════════════════════════════════════════════════════════════
echo.

echo Проверяю статус сервисов...
netstat -an | findstr ":5173" | findstr "LISTENING" >nul
if %errorlevel% == 0 (
    echo ✅ Frontend работает на порту 5173
) else (
    echo ❌ Frontend НЕ запущен! Сначала запусти Frontend!
    pause
    exit
)

echo.
echo Запускаю Cloudflare туннель...
echo Ожидайте 10-15 секунд...
echo.

start cmd /k "cloudflared.exe tunnel --url http://localhost:5173"

timeout /t 15 /nobreak > nul

if exist current_tunnel_url.txt (
    echo.
    echo ✅ ТУННЕЛЬ СОЗДАН!
    echo.
    for /f "delims=" %%i in (current_tunnel_url.txt) do set TUNNEL_URL=%%i
    echo 🌐 HTTPS URL: %TUNNEL_URL%
    echo.
    echo Открываю веб-приложение...
    start %TUNNEL_URL%
    echo.
    echo ═══════════════════════════════════════════════════════════════════
    echo    ✅ TELEGRAM WEBAPP ГОТОВ! ✅
    echo ═══════════════════════════════════════════════════════════════════
    echo.
    echo  🌐 URL: %TUNNEL_URL%
    echo.
    echo  📱 Для Telegram WebApp используй этот HTTPS URL
    echo  🔗 Открой этот URL в браузере для тестирования
    echo.
) else (
    echo ❌ Ошибка создания туннеля!
    echo Проверьте что cloudflared.exe запущен
)

echo.
pause

