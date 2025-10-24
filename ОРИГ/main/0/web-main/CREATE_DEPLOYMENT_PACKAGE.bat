@echo off
chcp 65001 >nul
title 📦 CREATE DEPLOYMENT PACKAGE

echo.
echo ============================================================
echo 📦 СОЗДАНИЕ ПАКЕТА ДЛЯ РАЗВЕРТЫВАНИЯ
echo ============================================================
echo.

set PACKAGE_NAME=TelegramBot_Production_%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%

echo 📦 Создание пакета: %PACKAGE_NAME%
echo.

REM Создание папки для пакета
if not exist "DEPLOYMENT_PACKAGE" mkdir "DEPLOYMENT_PACKAGE"
cd "DEPLOYMENT_PACKAGE"

echo [1/6] Копирование основных файлов...

REM Основные файлы
copy "..\telegram_bot.py" . >nul
copy "..\requirements.txt" . >nul
copy "..\authorized_users.json" . >nul
copy "..\signal_stats.json" . >nul
copy "..\access_requests.json" . >nul

REM Файлы запуска
copy "..\START_PRODUCTION.bat" . >nul
copy "..\STOP_PRODUCTION.bat" . >nul
copy "..\CHECK_STATUS.bat" . >nul
copy "..\QUICK_START.bat" . >nul
copy "..\PRODUCTION_DEPLOYMENT.md" . >nul

echo ✅ Основные файлы скопированы

echo.
echo [2/6] Копирование API сервера...
if not exist "home\ubuntu\forex-signals-app\backend" mkdir "home\ubuntu\forex-signals-app\backend"
copy "..\home\ubuntu\forex-signals-app\backend\signal_api.py" "home\ubuntu\forex-signals-app\backend\" >nul
echo ✅ API сервер скопирован

echo.
echo [3/6] Копирование Cloudflare туннеля...
if exist "..\cloudflared.exe" (
    copy "..\cloudflared.exe" . >nul
    echo ✅ Cloudflare туннель скопирован
) else (
    echo ⚠️  Cloudflare туннель не найден
)

echo.
echo [4/6] Создание инструкций...
(
echo # 🚀 ИНСТРУКЦИЯ ПО ЗАПУСКУ
echo.
echo ## Быстрый запуск:
echo 1. Запустите QUICK_START.bat
echo 2. Или запустите START_PRODUCTION.bat для полного запуска
echo.
echo ## Остановка:
echo - Запустите STOP_PRODUCTION.bat
echo.
echo ## Проверка статуса:
echo - Запустите CHECK_STATUS.bat
echo.
echo ## Подробная инструкция:
echo - Читайте PRODUCTION_DEPLOYMENT.md
echo.
echo ## Важные файлы:
echo - authorized_users.json - пользователи
echo - signal_stats.json - статистика
echo - access_requests.json - запросы доступа
echo.
echo ## Веб-приложение:
echo https://accessibility-gallery-column-olympus.trycloudflare.com
) > README.txt

echo ✅ Инструкции созданы

echo.
echo [5/6] Проверка пакета...
dir /b > files_list.txt
echo ✅ Список файлов создан

echo.
echo [6/6] Создание архива...
cd ..
powershell -Command "Compress-Archive -Path 'DEPLOYMENT_PACKAGE\*' -DestinationPath '%PACKAGE_NAME%.zip' -Force"
echo ✅ Архив создан: %PACKAGE_NAME%.zip

echo.
echo ============================================================
echo ✅ ПАКЕТ ДЛЯ РАЗВЕРТЫВАНИЯ СОЗДАН!
echo ============================================================
echo.
echo 📦 Файл: %PACKAGE_NAME%.zip
echo 📁 Содержимое:
type "DEPLOYMENT_PACKAGE\files_list.txt"
echo.
echo 🚀 Инструкция по развертыванию:
echo 1. Скопируйте %PACKAGE_NAME%.zip на удаленный сервер
echo 2. Распакуйте архив
echo 3. Запустите QUICK_START.bat
echo.
echo ⚠️  ВАЖНО: Убедитесь что на удаленном сервере установлен Python 3.8+
echo.
pause
