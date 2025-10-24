@echo off
chcp 65001 >nul
title Trading Signals Pro - Статус сервисов

echo.
echo ================================================
echo    📊 TRADING SIGNALS PRO - СТАТУС 📊
echo ================================================
echo.

echo [1/4] Проверяем Python процессы...
tasklist | findstr python.exe >nul
if %errorlevel% equ 0 (
    echo ✅ Python процессы запущены:
    tasklist | findstr python.exe
) else (
    echo ❌ Python процессы не найдены
)

echo.
echo [2/4] Проверяем Node.js процессы...
tasklist | findstr node.exe >nul
if %errorlevel% equ 0 (
    echo ✅ Node.js процессы запущены:
    tasklist | findstr node.exe
) else (
    echo ❌ Node.js процессы не найдены
)

echo.
echo [3/4] Проверяем порты...
echo 📡 Порт 8000 (Backend):
netstat -an | findstr ":8000" >nul
if %errorlevel% equ 0 (
    echo ✅ Backend работает на порту 8000
    netstat -an | findstr ":8000"
) else (
    echo ❌ Backend не работает
)

echo.
echo 📡 Порт 3005 (Frontend):
netstat -an | findstr ":3005" >nul
if %errorlevel% equ 0 (
    echo ✅ Frontend работает на порту 3005
    netstat -an | findstr ":3005"
) else (
    echo ❌ Frontend не работает
)

echo.
echo [4/4] Проверяем доступность...
echo 🌐 Тестируем Backend API...
curl -s http://localhost:8000/docs >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Backend API доступен: http://localhost:8000/docs
) else (
    echo ❌ Backend API недоступен
)

echo 🌐 Тестируем Frontend...
curl -s http://localhost:3005 >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Frontend доступен: http://localhost:3005
) else (
    echo ❌ Frontend недоступен
)

echo.
echo ================================================
echo              📋 СТАТУС ЗАВЕРШЁН 📋
echo ================================================
echo.
echo 💡 Если что-то не работает:
echo    1. Запустите "🚀_ЗАПУСК_ВСЕГО.bat"
echo    2. Или перезагрузите компьютер
echo.
pause
