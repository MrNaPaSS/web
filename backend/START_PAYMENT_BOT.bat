@echo off
chcp 65001 >nul
echo ╔═══════════════════════════════════════════════════════════╗
echo ║     🚀 ЗАПУСК TELEGRAM БОТА С CRYPTOBOT ПЛАТЕЖАМИ        ║
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
echo [3/3] Запуск бота...
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo ✅ Бот запущен!
echo 💳 API: 7812637462:AAEAC-GizoyEczsNeb3IJgo8mCcKbhPnWLg
echo.
echo ⚠️  ВАЖНО: Не забудьте заменить CRYPTO_BOT_TOKEN в telegram_payment_bot.py
echo.
echo Для остановки нажмите Ctrl+C
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.

python telegram_payment_bot.py

pause

