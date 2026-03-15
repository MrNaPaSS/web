@echo off
chcp 65001 >nul
title БЫСТРЫЙ СТАРТ СИСТЕМЫ
color 0A

echo.
echo ========================================
echo    🚀 БЫСТРЫЙ СТАРТ СИСТЕМЫ
echo ========================================
echo.

echo Выберите действие:
echo.
echo [1] Установить зависимости
echo [2] Запустить систему
echo [3] Проверить статус
echo [4] Остановить систему
echo [5] Выход
echo.

set /p choice="Введите номер (1-5): "

if "%choice%"=="1" (
    call "УСТАНОВКА_ЗАВИСИМОСТЕЙ.bat"
    goto :menu
)

if "%choice%"=="2" (
    call "ЗАПУСК_РАБОЧЕЙ_СИСТЕМЫ.bat"
    goto :menu
)

if "%choice%"=="3" (
    call "ПРОВЕРКА_СТАТУСА.bat"
    goto :menu
)

if "%choice%"=="4" (
    call "ОСТАНОВКА_СИСТЕМЫ.bat"
    goto :menu
)

if "%choice%"=="5" (
    echo До свидания!
    exit /b 0
)

echo Неверный выбор! Попробуйте снова.
timeout /t 2 >nul
goto :menu

:menu
echo.
echo Нажмите любую клавишу для возврата в меню...
pause >nul
cls
goto :eof
