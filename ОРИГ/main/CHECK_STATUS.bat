@echo off
chcp 65001 >nul
title 📊 TELEGRAM BOT - STATUS CHECK

echo.
echo ============================================================
echo 📊 TELEGRAM BOT - STATUS CHECK
echo ============================================================
echo.

echo [1/5] Проверка процессов Python...
tasklist /fi "imagename eq python.exe" | find "python.exe" >nul
if errorlevel 1 (
    echo ❌ Python процессы не найдены
) else (
    echo ✅ Python процессы запущены
    tasklist /fi "imagename eq python.exe" /fo table
)

echo.
echo [2/5] Проверка API сервера...
curl -s http://localhost:5000/api/signal/stats >nul 2>&1
if errorlevel 1 (
    echo ❌ API сервер недоступен на порту 5000
) else (
    echo ✅ API сервер работает на http://localhost:5000
    echo 📊 Получение статистики...
    curl -s http://localhost:5000/api/signal/stats
    echo.
)

echo.
echo [3/5] Проверка пользователей...
curl -s http://localhost:5000/api/users/all >nul 2>&1
if errorlevel 1 (
    echo ❌ API пользователей недоступен
) else (
    echo ✅ API пользователей работает
    echo 👥 Получение списка пользователей...
    curl -s http://localhost:5000/api/users/all
    echo.
)

echo.
echo [4/5] Проверка Cloudflare туннеля...
tasklist /fi "imagename eq cloudflared.exe" | find "cloudflared.exe" >nul
if errorlevel 1 (
    echo ❌ Cloudflare туннель не запущен
) else (
    echo ✅ Cloudflare туннель активен
    if exist "current_tunnel_url.txt" (
        echo 🔗 URL туннеля:
        type current_tunnel_url.txt
    )
)

echo.
echo [5/5] Проверка файлов конфигурации...
if exist "authorized_users.json" (
    echo ✅ authorized_users.json найден
) else (
    echo ❌ authorized_users.json не найден
)

if exist "signal_stats.json" (
    echo ✅ signal_stats.json найден
) else (
    echo ❌ signal_stats.json не найден
)

if exist "access_requests.json" (
    echo ✅ access_requests.json найден
) else (
    echo ❌ access_requests.json не найден
)

echo.
echo ============================================================
echo 📊 ПРОВЕРКА ЗАВЕРШЕНА
echo ============================================================
echo.
pause
