@echo off
chcp 65001 >nul
echo.
echo ═══════════════════════════════════════════════════════════════
echo 🔄 ВОССТАНОВЛЕНИЕ СОХРАНЁННЫХ ЯЗЫКОВ ПОЛЬЗОВАТЕЛЕЙ
echo ═══════════════════════════════════════════════════════════════
echo.
echo ⚠️  Это восстановит ранее сохранённые языки пользователей!
echo.
echo Текущий статус: ТЕСТОВЫЙ РЕЖИМ (языки очищены)
echo Будет восстановлено: РАБОЧИЕ ЯЗЫКИ пользователей
echo.
echo ═══════════════════════════════════════════════════════════════
echo.
set /p confirm="Восстановить языки пользователей? (y/n): "
if /i not "%confirm%"=="y" (
    echo.
    echo ❌ Отменено пользователем
    pause
    exit /b
)

echo.
echo 🔄 Восстанавливаю языки пользователей...

REM Восстанавливаем сохранённые языки
echo {> user_languages.json
echo   "511442168": "ru",>> user_languages.json
echo   "8428349451": "th",>> user_languages.json
echo   "6779913408": "ru",>> user_languages.json
echo   "7613535490": "th",>> user_languages.json
echo   "8344456953": "th",>> user_languages.json
echo   "292375460": "th">> user_languages.json
echo }>> user_languages.json

echo ✅ Языки пользователей восстановлены
echo.
echo 🔄 Перезапускаю бота...
taskkill /F /IM python.exe 2>nul
timeout /t 2 /nobreak >nul
start python run_telegram_bot.py

echo.
echo ✅ Готово! Бот перезапущен с восстановленными языками
echo.
pause
