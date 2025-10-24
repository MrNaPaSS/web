@echo off
chcp 65001 > nul

title Quick Bot Update

echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║                                                                ║
echo ║        🔄 БЫСТРОЕ ОБНОВЛЕНИЕ БОТА 🔄                        ║
echo ║                                                                ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

echo ════════════════════════════════════════════════════════════════
echo  📋 ИНСТРУКЦИЯ:
echo ════════════════════════════════════════════════════════════════
echo.
echo  1. Открой http://localhost:4040 в браузере
echo  2. Скопируй URL туннеля (https://xxx.trycloudflare.com)
echo  3. Вставь URL ниже
echo.
echo ════════════════════════════════════════════════════════════════
echo.

set /p NEW_URL="Введи новый URL туннеля: "

if "%NEW_URL%"=="" (
    echo ❌ URL не введен!
    pause
    exit /b 1
)

echo.
echo 🔄 Обновляю бота с URL: %NEW_URL%

python -c "import re; file_path = 'e:\\TelegramBot_RDP\\telegram_bot.py'; content = open(file_path, 'r', encoding='utf-8').read(); new_content = re.sub(r'self\.web_app_url = \".*\"', r'self.web_app_url = \"%NEW_URL%\"', content); open(file_path, 'w', encoding='utf-8').write(new_content)"

if %errorlevel% == 0 (
    echo ✅ Бот обновлен успешно!
    echo.
    echo 🔄 Перезапускаю бота...
    taskkill /f /im python.exe > nul 2>&1
    timeout /t 2 /nobreak > nul
    start cmd /k "cd /d e:\TelegramBot_RDP && python run_telegram_bot.py"
    echo.
    echo ✅ Готово! Бот перезапущен с новым URL
) else (
    echo ❌ Ошибка обновления бота!
)

echo.
pause
