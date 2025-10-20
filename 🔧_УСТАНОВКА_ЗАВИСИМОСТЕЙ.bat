@echo off
chcp 65001 > nul
title УСТАНОВКА ВСЕХ ЗАВИСИМОСТЕЙ

echo.
echo ═══════════════════════════════════════════════════════════════════
echo    🔧 УСТАНОВКА ВСЕХ ЗАВИСИМОСТЕЙ 🔧
echo ═══════════════════════════════════════════════════════════════════
echo.

cd /d e:\TelegramBot_RDP

echo [1/3] 📦 Установка Python зависимостей для основного бота...
echo.
pip install -r requirements.txt
if %errorlevel% == 0 (
    echo ✅ Python зависимости для бота установлены
) else (
    echo ❌ Ошибка установки Python зависимостей
    pause
    exit /b 1
)

echo.
echo [2/3] 📦 Установка Python зависимостей для Backend API...
echo.
cd home\ubuntu\forex-signals-app\backend
pip install flask flask-cors requests python-telegram-bot
if %errorlevel% == 0 (
    echo ✅ Python зависимости для Backend установлены
) else (
    echo ❌ Ошибка установки Backend зависимостей
    pause
    exit /b 1
)

echo.
echo [3/3] 📦 Установка Node.js зависимостей для Frontend...
echo.
cd ..
npm install
if %errorlevel% == 0 (
    echo ✅ Node.js зависимости для Frontend установлены
) else (
    echo ❌ Ошибка установки Frontend зависимостей
    pause
    exit /b 1
)

cd /d e:\TelegramBot_RDP

echo.
echo ═══════════════════════════════════════════════════════════════════
echo    ✅ ВСЕ ЗАВИСИМОСТИ УСТАНОВЛЕНЫ! ✅
echo ═══════════════════════════════════════════════════════════════════
echo.
echo Теперь можно запускать систему: 🚀_ЗАПУСК_СИСТЕМЫ.bat
echo.
pause

