@echo off
chcp 65001 >nul
title УСТАНОВКА ЗАВИСИМОСТЕЙ
color 0B

echo.
echo ========================================
echo    📦 УСТАНОВКА ЗАВИСИМОСТЕЙ
echo ========================================
echo.

echo [1/3] Установка Python зависимостей...
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo ❌ Ошибка установки Python зависимостей!
    pause
    exit /b 1
)

echo.
echo [2/3] Установка Node.js зависимостей...
npm install
if %errorlevel% neq 0 (
    echo ❌ Ошибка установки Node.js зависимостей!
    pause
    exit /b 1
)

echo.
echo [3/3] Проверка установки...
python --version
node --version
npm --version

echo.
echo ========================================
echo    ✅ ЗАВИСИМОСТИ УСТАНОВЛЕНЫ УСПЕШНО!
echo ========================================
echo.
echo Теперь можно запустить: ЗАПУСК_РАБОЧЕЙ_СИСТЕМЫ.bat
echo.
pause
