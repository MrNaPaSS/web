@echo off
chcp 65001 >nul
echo ============================================
echo 🔐 ЗАПУСК AUTH API SERVER
echo ============================================
echo.

cd /d "%~dp0"

echo 📦 Проверка зависимостей...
pip install flask flask-cors >nul 2>&1

echo.
echo 🚀 Запуск Auth API на порту 5001...
echo 📡 URL: http://localhost:5001
echo.
echo ⚠️  НЕ ЗАКРЫВАЙТЕ ЭТО ОКНО!
echo.
echo ============================================
echo.

python auth_api.py

pause

