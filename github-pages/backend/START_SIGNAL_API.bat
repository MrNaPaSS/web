@echo off
chcp 65001 >nul
echo ============================================
echo 📊 ЗАПУСК SIGNAL API SERVER
echo ============================================
echo.

cd /d "%~dp0"

echo 📦 Проверка зависимостей...
pip install flask flask-cors requests >nul 2>&1

echo.
echo 🚀 Запуск Signal API на порту 5002...
echo 📡 URL: http://localhost:5002
echo.
echo ⚡ ГЕНЕРАЦИЯ РЕАЛЬНЫХ СИГНАЛОВ:
echo    - Forex: Twelvedata API
echo    - OTC: PowerfulOTCGenerator
echo.
echo ⚠️  НЕ ЗАКРЫВАЙТЕ ЭТО ОКНО!
echo.
echo ============================================
echo.

python signal_api.py

pause

