@echo off
echo ========================================
echo    INFO BOT @info_xm_trust_bot - STARTUP
echo ========================================
echo.
echo 💰 РЕГИСТРАЦИЯ НА ПЛАТФОРМЕ:
echo https://u3.shortink.io/register?utm_campaign=827841^&utm_source=affiliate^&utm_medium=sr^&a=CQQJpdvm2ya9dU^&ac=tggg^&code=50START
echo.
echo 💵 УСЛОВИЯ:
echo • Минимальный депозит: 50$
echo • Бонус: +50%% к первому депозиту
echo • Промокод: 50START
echo.
echo 🎯 ПРИМЕР:
echo Депозит 50$ → получите 75$ на счет
echo Депозит 100$ → получите 150$ на счет
echo.
echo 📞 Поддержка: @kaktotakxm
echo ========================================
echo.

cd /d "%~dp0"
echo Текущая папка: %CD%
echo.

echo Проверка файлов бота инфо...
if not exist "telegram_bot_handler.py" (
    echo ОШИБКА: файл telegram_bot_handler.py не найден!
    pause
    exit /b 1
)

echo Все файлы найдены.
echo.

echo Запуск инфо бота @info_xm_trust_bot...
echo Для остановки нажмите Ctrl+C
echo.

python telegram_bot_handler.py

echo.
echo Бот был остановлен.
pause
