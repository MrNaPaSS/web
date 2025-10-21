@echo off
chcp 65001 >nul
title 🛑 ОСТАНОВКА ВСЕХ ПРОЦЕССОВ

echo.
echo ==========================================
echo   🛑 ОСТАНОВКА ВСЕХ ПРОЦЕССОВ
echo ==========================================
echo.

echo 🔄 Останавливаем все процессы...

:: Остановка Python процессов (Telegram бот)
echo 🐍 Останавливаем Python процессы...
taskkill /F /IM python.exe >nul 2>&1

:: Остановка Node.js процессов (Frontend)
echo 🟢 Останавливаем Node.js процессы...
taskkill /F /IM node.exe >nul 2>&1

:: Остановка Cloudflare процессов (Туннель)
echo ☁️ Останавливаем Cloudflare процессы...
taskkill /F /IM cloudflared.exe >nul 2>&1

:: Остановка всех процессов в папке проекта
echo 📁 Останавливаем процессы в папке проекта...
for /f "tokens=2" %%i in ('tasklist /fi "imagename eq python.exe" /fo csv ^| find "python.exe"') do (
    wmic process where "ProcessId=%%i" get CommandLine 2>nul | find "e:\TelegramBot_RDP" >nul && taskkill /F /PID %%i >nul 2>&1
)

for /f "tokens=2" %%i in ('tasklist /fi "imagename eq node.exe" /fo csv ^| find "node.exe"') do (
    wmic process where "ProcessId=%%i" get CommandLine 2>nul | find "e:\TelegramBot_RDP" >nul && taskkill /F /PID %%i >nul 2>&1
)

echo.
echo ==========================================
echo   ✅ ВСЕ ПРОЦЕССЫ ОСТАНОВЛЕНЫ!
echo ==========================================
echo.

:: Проверка что все остановлено
echo 🔍 Проверяем статус процессов:
tasklist | findstr /i "python.exe node.exe cloudflared.exe"

if errorlevel 1 (
    echo ✅ Все процессы успешно остановлены!
) else (
    echo ⚠️ Некоторые процессы всё ещё работают
)

echo.
pause