@echo off
chcp 65001 >nul
echo.
echo ═══════════════════════════════════════════════════════════════
echo 🔄 ВОЗВРАТ РАБОЧЕГО ТОКЕНА TELEGRAM БОТА
echo ═══════════════════════════════════════════════════════════════
echo.
echo ⚠️  ВНИМАНИЕ: Это вернёт РАБОЧИЙ токен, который используется на сервере!
echo.
echo Текущий (тестовый): 8365963410:AAFVnrFboehOUxWmkeivDVvC4nft_hjjcCQ
echo Будет установлен:   8282095848:AAHVEMFWNFxap8yZ7pFYhF3rqm7pSWkZGlo
echo.
echo ═══════════════════════════════════════════════════════════════
echo.
set /p confirm="Вы уверены? (y/n): "
if /i not "%confirm%"=="y" (
    echo.
    echo ❌ Отменено пользователем
    pause
    exit /b
)

echo.
echo 🔄 Заменяю токены в config.py...

REM Замена в основном config.py
powershell -Command "(Get-Content 'config.py') -replace '8365963410:AAFVnrFboehOUxWmkeivDVvC4nft_hjjcCQ', '8282095848:AAHVEMFWNFxap8yZ7pFYhF3rqm7pSWkZGlo' -replace 'ТЕСТОВЫЙ', 'РАБОЧИЙ' | Set-Content 'config.py'"

echo ✅ config.py обновлён

REM Замена в webapp/backend/config.py
powershell -Command "(Get-Content 'webapp\backend\config.py') -replace '8365963410:AAFVnrFboehOUxWmkeivDVvC4nft_hjjcCQ', '8282095848:AAHVEMFWNFxap8yZ7pFYhF3rqm7pSWkZGlo' -replace 'ТЕСТОВЫЙ', 'РАБОЧИЙ' | Set-Content 'webapp\backend\config.py'"

echo ✅ webapp\backend\config.py обновлён

echo.
echo ═══════════════════════════════════════════════════════════════
echo ✅ РАБОЧИЙ ТОКЕН ВОССТАНОВЛЕН!
echo ═══════════════════════════════════════════════════════════════
echo.
echo 🚀 Теперь бот будет работать с РАБОЧИМ токеном
echo ⚠️  НЕ запускайте локально, если бот уже работает на сервере!
echo.
echo 💡 Для возврата к тестовому токену используйте:
echo    🔄_УСТАНОВИТЬ_ТЕСТОВЫЙ_ТОКЕН.bat
echo.
pause

