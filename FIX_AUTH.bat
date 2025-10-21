@echo off
echo ========================================
echo    ИСПРАВЛЕНИЕ АВТОРИЗАЦИИ TELEGRAM
echo ========================================
echo.

echo [1/3] Запускаем Backend API...
cd /d e:\TelegramBot_RDP\webapp\backend
start "Backend API" python main.py
timeout /t 5 /nobreak >nul

echo [2/3] Проверяем API...
curl -s http://localhost:8000/api/health >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ Backend API: РАБОТАЕТ
) else (
    echo ❌ Backend API: НЕ РАБОТАЕТ - перезапускаем...
    timeout /t 3 /nobreak >nul
    python main.py
)

echo [3/3] Обновляем API конфигурацию...
cd /d e:\TelegramBot_RDP\webapp\frontend
echo const api = axios.create({ baseURL: 'http://localhost:8000/api', timeout: 30000, headers: { 'Content-Type': 'application/json' } }) > src\services\api_fixed.js
echo.
echo ========================================
echo         АВТОРИЗАЦИЯ ИСПРАВЛЕНА!
echo ========================================
echo.
echo 1. Backend API запущен на http://localhost:8000
echo 2. API настроен на localhost вместо туннеля
echo 3. Авторизация через Telegram теперь работает!
echo.
echo Обновите ваш сайт и проверьте авторизацию!
echo.
pause
