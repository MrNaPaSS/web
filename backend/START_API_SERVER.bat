@echo off
chcp 65001 >nul
echo ╔═══════════════════════════════════════════════════════════╗
echo ║        🚀 ЗАПУСК API СЕРВЕРА ДЛЯ CRYPTOBOT ПЛАТЕЖЕЙ      ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.

echo [1/3] Проверка Python...
python --version
if errorlevel 1 (
    echo ❌ Python не найден!
    pause
    exit /b 1
)

echo.
echo [2/3] Установка зависимостей...
pip install -r requirements_payment.txt
if errorlevel 1 (
    echo ❌ Ошибка установки зависимостей!
    pause
    exit /b 1
)

echo.
echo [3/3] Запуск API сервера...
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo ✅ API сервер запущен!
echo 📡 Endpoint: http://localhost:5000
echo 💳 CryptoBot интеграция активна
echo.
echo ⚠️  ВАЖНО: Не забудьте заменить CRYPTO_BOT_TOKEN в api_payment_server.py
echo.
echo 🔗 Доступные endpoints:
echo    GET  /api/health - Проверка сервера
echo    GET  /api/cryptobot/status - Статус CryptoBot
echo    GET  /api/currencies - Доступные валюты
echo    POST /api/payment/create - Создание инвойса
echo    GET  /api/payment/check/<id> - Проверка платежа
echo    GET  /api/subscriptions/<user_id> - Подписки пользователя
echo    POST /webhook/cryptobot - Webhook от CryptoBot
echo.
echo Для остановки нажмите Ctrl+C
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.

python api_payment_server.py

pause
