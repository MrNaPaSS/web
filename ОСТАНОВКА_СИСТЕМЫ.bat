@echo off
title ОСТАНОВКА СИСТЕМЫ
color 0C

echo.
echo ========================================
echo    🛑 ОСТАНОВКА СИСТЕМЫ
echo ========================================
echo.

echo [1/3] Остановка Python процессов...
taskkill /f /im python.exe >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Python процессы остановлены
) else (
    echo ⚠️  Python процессы не найдены
)

echo.
echo [2/3] Остановка Cloudflare туннеля...
taskkill /f /im cloudflared.exe >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Cloudflare туннель остановлен
) else (
    echo ⚠️  Cloudflare туннель не найден
)

echo.
echo [3/3] Очистка временных файлов...
if exist "*.log" del /q "*.log" >nul 2>&1
if exist "backend\*.log" del /q "backend\*.log" >nul 2>&1

echo.
echo ========================================
echo    ✅ СИСТЕМА ОСТАНОВЛЕНА УСПЕШНО!
echo ========================================
echo.
echo Все процессы завершены.
echo Временные файлы очищены.
echo.
pause
