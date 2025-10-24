@echo off
chcp 65001
echo.
echo ========================================
echo    ИСПРАВЛЕНИЕ GIT КОНФЛИКТОВ
echo ========================================
echo.

echo [1/4] Устанавливаем зависимости с --legacy-peer-deps...
npm install --legacy-peer-deps
if %errorlevel% neq 0 echo ОШИБКА: Не удалось установить зависимости

echo.
echo [2/4] Собираем проект...
npm run build
if %errorlevel% neq 0 echo ОШИБКА: Не удалось собрать проект

echo.
echo [3/4] Переходим в папку web и исправляем конфликты...
cd web
git pull origin main --allow-unrelated-histories
if %errorlevel% neq 0 echo ОШИБКА: Не удалось выполнить pull

echo.
echo [4/4] Копируем собранные файлы и пушим...
xcopy /E /Y ..\dist\* .
git add .
git commit -m "Fix: Обновление с серверной привязкой активных сигналов"
git push origin main

echo.
echo ========================================
echo    ГОТОВО! Сайт: https://app.nomoneynohoney.online
echo ========================================
echo.
pause

