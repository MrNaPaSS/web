@echo off
chcp 65001 >nul
echo ╔════════════════════════════════════════════════════════╗
echo ║   🚀 ЗАПУСК ВСЕХ API СЕРВЕРОВ                          ║
echo ╚════════════════════════════════════════════════════════╝
echo.

cd /d "%~dp0"

echo 📦 Проверка зависимостей...
pip install flask flask-cors requests >nul 2>&1

echo.
echo ════════════════════════════════════════════════════════
echo 🔐 Auth API (порт 5001) - Авторизация пользователей
echo 📊 Signal API (порт 5002) - РЕАЛЬНАЯ генерация сигналов
echo ════════════════════════════════════════════════════════
echo.

echo 🚀 Запуск Auth API Server...
start "Auth API - Port 5001" cmd /k "python auth_api.py"
timeout /t 2 >nul

echo 🚀 Запуск Signal API Server...
start "Signal API - Port 5002" cmd /k "python signal_api.py"
timeout /t 2 >nul

echo.
echo ════════════════════════════════════════════════════════
echo ✅ ВСЕ API ЗАПУЩЕНЫ!
echo ════════════════════════════════════════════════════════
echo.
echo 📡 Auth API:   http://localhost:5001
echo 📡 Signal API: http://localhost:5002
echo.
echo ⚠️  НЕ ЗАКРЫВАЙТЕ ОТКРЫВШИЕСЯ ОКНА!
echo.
echo Нажмите любую клавишу для завершения...
pause >nul

