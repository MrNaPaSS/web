@echo off
echo ========================================
echo ЗАПУСК PRODUCTION СИСТЕМЫ
echo ========================================
echo.

REM Проверка наличия виртуального окружения
if not exist "venv\Scripts\activate.bat" (
    echo ❌ Виртуальное окружение не найдено!
    echo 💡 Создайте виртуальное окружение: python -m venv venv
    echo 💡 Установите зависимости: pip install -r requirements.txt
    pause
    exit /b 1
)

REM Активация виртуального окружения
echo 🔧 Активация виртуального окружения...
call venv\Scripts\activate.bat

REM Проверка БД
echo 🔍 Проверка подключения к PostgreSQL...
python backend\check_db.py
if %errorlevel% neq 0 (
    echo ❌ Ошибка подключения к базе данных!
    echo 💡 Убедитесь, что PostgreSQL запущен и настроен правильно
    echo 💡 Выполните: python backend\init_db.py
    pause
    exit /b 1
)

echo ✅ База данных готова к работе
echo.

REM Запуск Auth API (порт 5001)
echo 🚀 Запуск Auth API (порт 5001)...
start "Auth API" cmd /k "call venv\Scripts\activate.bat && cd backend && python auth_api.py"

REM Небольшая задержка
timeout /t 3 /nobreak > nul

REM Запуск Signal API (порт 5000)
echo 🚀 Запуск Signal API (порт 5000)...
start "Signal API" cmd /k "call venv\Scripts\activate.bat && cd backend && python signal_api.py"

REM Небольшая задержка
timeout /t 3 /nobreak > nul

REM Запуск WebSocket сервера (порт 8001)
echo 🚀 Запуск WebSocket сервера (порт 8001)...
start "WebSocket Server" cmd /k "call venv\Scripts\activate.bat && cd backend && python websocket_server.py"

REM Небольшая задержка
timeout /t 3 /nobreak > nul

echo ========================================
echo 🎉 ВСЕ СЕРВИСЫ ЗАПУЩЕНЫ!
echo ========================================
echo.
echo 📊 Статус сервисов:
echo   - Auth API: http://localhost:5001
echo   - Signal API: http://localhost:5000  
echo   - WebSocket: ws://localhost:8001
echo.
echo 🔧 Для остановки закройте все окна командной строки
echo.
echo 💡 Проверка статуса: python backend\check_db.py
echo.

REM Открываем браузер с приложением
echo 🌐 Открытие приложения в браузере...
start http://localhost:5173

echo.
echo ✅ Система готова к работе!
pause
