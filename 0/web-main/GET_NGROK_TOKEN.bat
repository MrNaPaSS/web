@echo off
chcp 65001 >nul
cls
echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║                                                                ║
echo ║        🔑 ПОЛУЧЕНИЕ NGROK API КЛЮЧА 🔑                       ║
echo ║                                                                ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.
echo.
echo ════════════════════════════════════════════════════════════════
echo  📋 ИНСТРУКЦИЯ ПО ПОЛУЧЕНИЮ NGROK TOKEN:
echo ════════════════════════════════════════════════════════════════
echo.
echo  1. 🌐 Открой браузер: https://dashboard.ngrok.com/signup
echo  2. 📝 Зарегистрируйся (бесплатно)
echo  3. 🔑 Скопируй API ключ с https://dashboard.ngrok.com/get-started/your-authtoken
echo  4. 💾 Сохрани ключ в безопасном месте
echo.
echo ════════════════════════════════════════════════════════════════
echo.
echo  ⚠️  ВНИМАНИЕ:
echo     • Ngrok бесплатный аккаунт дает временные домены
echo     • Домены меняются при каждом перезапуске
echo     • Для постоянного домена нужна платная подписка
echo.
echo ════════════════════════════════════════════════════════════════
echo.
echo  🚀 ПОСЛЕ ПОЛУЧЕНИЯ ТОКЕНА:
echo     1. Запусти SETUP_NGROK.bat
echo     2. Введи новый API ключ
echo     3. Система автоматически настроится
echo.
echo ════════════════════════════════════════════════════════════════
echo.
echo  🌐 ОТКРЫВАЮ NGROK DASHBOARD...
echo.
start https://dashboard.ngrok.com/signup
timeout /t 3 >nul
start https://dashboard.ngrok.com/get-started/your-authtoken
echo.
echo  ⏳ Жду пока получишь токен...
echo.
pause
echo.
echo ════════════════════════════════════════════════════════════════
echo  🔄 ТЕПЕРЬ ЗАПУСКАЮ СИСТЕМУ БЕЗ NGROK:
echo ════════════════════════════════════════════════════════════════
echo.
echo  ✅ Telegram Bot работает
echo  ✅ WebApp доступен в браузере: http://localhost:5173
echo  ❌ WebApp в Telegram пока недоступен (нужен HTTPS)
echo.
echo ════════════════════════════════════════════════════════════════
echo.
pause
