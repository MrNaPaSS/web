@echo off
chcp 65001 > nul
title ПРОВЕРКА СТАТУСА СИСТЕМЫ

echo.
echo ═══════════════════════════════════════════════════════════════════
echo    📊 ПРОВЕРКА СТАТУСА СИСТЕМЫ 📊
echo ═══════════════════════════════════════════════════════════════════
echo.

echo [1/5] 🔍 Проверка Python...
python --version 2>nul
if %errorlevel% == 0 (
    echo ✅ Python установлен
) else (
    echo ❌ Python НЕ установлен или не добавлен в PATH
)

echo.
echo [2/5] 🔍 Проверка Node.js...
node --version 2>nul
if %errorlevel% == 0 (
    echo ✅ Node.js установлен
) else (
    echo ❌ Node.js НЕ установлен или не добавлен в PATH
)

echo.
echo [3/5] 🔍 Проверка npm...
npm --version 2>nul
if %errorlevel% == 0 (
    echo ✅ npm установлен
) else (
    echo ❌ npm НЕ установлен
)

echo.
echo [4/5] 📡 Проверка запущенных процессов...
tasklist | findstr python.exe >nul
if %errorlevel% == 0 (
    echo ✅ Python процессы запущены
) else (
    echo ℹ️ Python процессы не запущены
)

tasklist | findstr node.exe >nul
if %errorlevel% == 0 (
    echo ✅ Node.js процессы запущены
) else (
    echo ℹ️ Node.js процессы не запущены
)

echo.
echo [5/5] 🌐 Проверка портов...
netstat -an | findstr ":5001" >nul
if %errorlevel% == 0 (
    echo ✅ Порт 5001 занят (Auth API)
) else (
    echo ⚪ Порт 5001 свободен
)

netstat -an | findstr ":5002" >nul
if %errorlevel% == 0 (
    echo ✅ Порт 5002 занят (Signal API)
) else (
    echo ⚪ Порт 5002 свободен
)

netstat -an | findstr ":5173" >nul
if %errorlevel% == 0 (
    echo ✅ Порт 5173 занят (Frontend)
) else (
    echo ⚪ Порт 5173 свободен
)

echo.
echo ═══════════════════════════════════════════════════════════════════
echo    ИТОГОВЫЙ СТАТУС
echo ═══════════════════════════════════════════════════════════════════
echo.

echo Если система НЕ запущена - запустите: 🚀_ЗАПУСК_СИСТЕМЫ.bat
echo Если нужно остановить систему - запустите: 🛑_ОСТАНОВКА_СИСТЕМЫ.bat
echo.
pause

