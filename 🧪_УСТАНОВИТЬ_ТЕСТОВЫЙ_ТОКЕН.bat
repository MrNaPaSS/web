@echo off
chcp 65001 >nul
echo.
echo ═══════════════════════════════════════════════════════════════
echo 🧪 УСТАНОВКА ТЕСТОВОГО ТОКЕНА TELEGRAM БОТА
echo ═══════════════════════════════════════════════════════════════
echo.
echo ✅ Это установит ТЕСТОВЫЙ токен для безопасного тестирования
echo.
echo Текущий (рабочий):  8282095848:AAHVEMFWNFxap8yZ7pFYhF3rqm7pSWkZGlo
echo Будет установлен:   8365963410:AAFVnrFboehOUxWmkeivDVvC4nft_hjjcCQ
echo.
echo ═══════════════════════════════════════════════════════════════
echo.
set /p confirm="Установить тестовый токен? (y/n): "
if /i not "%confirm%"=="y" (
    echo.
    echo ❌ Отменено пользователем
    pause
    exit /b
)

echo.
echo 🔄 Заменяю токены в config.py...

REM Замена в основном config.py
powershell -Command "(Get-Content 'config.py') -replace '8282095848:AAHVEMFWNFxap8yZ7pFYhF3rqm7pSWkZGlo', '8365963410:AAFVnrFboehOUxWmkeivDVvC4nft_hjjcCQ' -replace 'РАБОЧИЙ', 'ТЕСТОВЫЙ' | Set-Content 'config.py'"

echo ✅ config.py обновлён

REM Замена в webapp/backend/config.py
powershell -Command "(Get-Content 'webapp\backend\config.py') -replace '8282095848:AAHVEMFWNFxap8yZ7pFYhF3rqm7pSWkZGlo', '8365963410:AAFVnrFboehOUxWmkeivDVvC4nft_hjjcCQ' -replace 'РАБОЧИЙ', 'ТЕСТОВЫЙ' | Set-Content 'webapp\backend\config.py'"

echo ✅ webapp\backend\config.py обновлён

echo.
echo ═══════════════════════════════════════════════════════════════
echo ✅ ТЕСТОВЫЙ ТОКЕН УСТАНОВЛЕН!
echo ═══════════════════════════════════════════════════════════════
echo.
echo 🧪 Теперь можно безопасно тестировать бота
echo ✅ Рабочий бот на сервере НЕ затронут
echo.
echo 🚀 Для запуска тестового бота:
echo    START_BOT.bat
echo.
echo 💡 Для возврата рабочего токена используйте:
echo    🔄_ВЕРНУТЬ_РАБОЧИЙ_ТОКЕН.bat
echo.
pause

