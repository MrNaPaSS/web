@echo off
chcp 65001 > nul

echo ╔═══════════════════════════════════════════════════════════════╗
echo ║   🤖 ЗАПУСК TELEGRAM БОТА                                  ║
echo ╚═══════════════════════════════════════════════════════════════╝

echo [1/3] 🛑 Остановка предыдущих процессов...
taskkill /f /im python.exe /t > nul 2>&1
timeout /t 2 /nobreak > nul

echo [2/3] 📦 Проверка Python...
python --version > nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python не найден. Пожалуйста, установите Python 3.9+
    pause
    exit /b 1
)
echo ✅ Python найден

echo [3/3] 🚀 Запуск Telegram бота...
start "Telegram Bot" cmd /k "cd /d %~dp0 && python telegram_bot.py"

echo ╔═══════════════════════════════════════════════════════════════╗
echo ║   ✅ БОТ ЗАПУЩЕН!                                          ║
echo ║                                                               ║
echo ║   💬 Проверьте бота в Telegram: /start                      ║
echo ║   🚀 Для WebApp используйте: /webapp                        ║
echo ║                                                               ║
echo ║   💡 Для остановки закройте окно терминала                  ║
echo ╚═══════════════════════════════════════════════════════════════╝

pause