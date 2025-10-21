@echo off
chcp 65001 >nul
title 🛑 TELEGRAM BOT - PRODUCTION STOP

echo.
echo ============================================================
echo 🛑 TELEGRAM BOT - PRODUCTION STOP
echo ============================================================
echo.

echo [1/4] Остановка Telegram бота...
taskkill /f /im python.exe /fi "WINDOWTITLE eq Telegram Bot*" >nul 2>&1
echo ✅ Telegram бот остановлен

echo.
echo [2/4] Остановка API сервера...
taskkill /f /im python.exe /fi "WINDOWTITLE eq API Server*" >nul 2>&1
echo ✅ API сервер остановлен

echo.
echo [3/4] Остановка Cloudflare туннеля...
taskkill /f /im cloudflared.exe >nul 2>&1
taskkill /f /im python.exe /fi "WINDOWTITLE eq Cloudflare Tunnel*" >nul 2>&1
echo ✅ Cloudflare туннель остановлен

echo.
echo [4/4] Очистка процессов...
REM Остановка всех процессов Python связанных с проектом
for /f "tokens=2" %%i in ('tasklist /fi "imagename eq python.exe" /fo csv ^| find "python.exe"') do (
    set pid=%%i
    set pid=!pid:"=!
    taskkill /f /pid !pid! >nul 2>&1
)
echo ✅ Все процессы остановлены

echo.
echo ============================================================
echo ✅ ВСЕ СЕРВИСЫ ОСТАНОВЛЕНЫ!
echo ============================================================
echo.
echo 🎯 Система полностью остановлена
echo 📝 Все процессы Python и Cloudflare завершены
echo.
pause
