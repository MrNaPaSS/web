@echo off
chcp 65001
echo.
echo ========================================
echo    ПЕРЕСБОРКА И ДЕПЛОЙ
echo ========================================
echo.

echo [1/5] Собираем проект...
npm run build
if %errorlevel% neq 0 (
    echo ОШИБКА: Не удалось собрать проект
    pause
    exit /b 1
)

echo.
echo [2/5] Проверяем что dist/ создался...
dir dist
if %errorlevel% neq 0 (
    echo ОШИБКА: Папка dist не создалась
    pause
    exit /b 1
)

echo.
echo [3/5] Копируем собранные файлы в web/...
xcopy /E /Y dist\* web\
if %errorlevel% neq 0 (
    echo ОШИБКА: Не удалось скопировать файлы
    pause
    exit /b 1
)

echo.
echo [4/5] Переходим в папку web и коммитим...
cd web
git add .
git commit -m "Fix: Исправлена серверная привязка - localStorage не очищается при восстановлении сигнала"

echo.
echo [5/5] Пушим в GitHub Pages...
git push origin main

echo.
echo ========================================
echo    ГОТОВО! Сайт: https://app.nomoneynohoney.online
echo ========================================
echo.
pause

