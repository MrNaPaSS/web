@echo off
chcp 65001 > nul
title ОТКРЫТИЕ ВЕБ-ПРИЛОЖЕНИЯ

echo.
echo ═══════════════════════════════════════════════════════════════════
echo    🌐 ОТКРЫТИЕ ВЕБ-ПРИЛОЖЕНИЯ 🌐
echo ═══════════════════════════════════════════════════════════════════
echo.

echo Проверяю статус сервисов...
netstat -an | findstr ":5173" | findstr "LISTENING" >nul
if %errorlevel% == 0 (
    echo ✅ Frontend работает на порту 5173
) else (
    echo ❌ Frontend НЕ запущен
    echo Запускаю Frontend...
    start cmd /k "cd /d e:\TelegramBot_RDP\home\ubuntu\forex-signals-app && npm run dev"
    timeout /t 8 /nobreak > nul
)

netstat -an | findstr ":5001" | findstr "LISTENING" >nul
if %errorlevel% == 0 (
    echo ✅ Auth API работает на порту 5001
) else (
    echo ❌ Auth API НЕ запущен
)

netstat -an | findstr ":5002" | findstr "LISTENING" >nul
if %errorlevel% == 0 (
    echo ✅ Signal API работает на порту 5002
) else (
    echo ❌ Signal API НЕ запущен
)

echo.
echo Открываю веб-приложение...
start http://localhost:5173

echo.
echo ═══════════════════════════════════════════════════════════════════
echo    ✅ ВЕБ-ПРИЛОЖЕНИЕ ОТКРЫТО! ✅
echo ═══════════════════════════════════════════════════════════════════
echo.
echo  🌐 АДРЕС: http://localhost:5173
echo.
echo  📡 СТАТУС СЕРВИСОВ:
netstat -an | findstr ":5001 :5002 :5173" | findstr "LISTENING"
echo.
echo  💡 Если веб-приложение не открылось:
echo     1. Подождите 10-15 секунд
echo     2. Обновите страницу (F5)
echo     3. Проверьте что все сервисы запущены
echo.
pause

