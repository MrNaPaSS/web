@echo off
chcp 65001
echo.
echo ========================================
echo    СБОРКА И ДЕПЛОЙ В GITHUB PAGES
echo ========================================
echo.

echo [1/6] Устанавливаем зависимости...
npm install
if %errorlevel% neq 0 echo ОШИБКА: Не удалось установить зависимости

echo.
echo [2/6] Собираем проект...
npm run build
if %errorlevel% neq 0 echo ОШИБКА: Не удалось собрать проект

echo.
echo [3/6] Копируем собранные файлы в web/...
xcopy /E /Y dist\* web\
if %errorlevel% neq 0 echo ОШИБКА: Не удалось скопировать файлы

echo.
echo [4/6] Переходим в папку web...
cd web

echo.
echo [5/6] Проверяем статус git...
git status

echo.
echo [6/6] Добавляем изменения...
git add .
git commit -m "Fix: Серверная привязка активных сигналов - защита от обхода пользователями"
git push origin main

echo.
echo ========================================
echo    ДЕПЛОЙ ЗАВЕРШЕН!
echo    Сайт: https://app.nomoneynohoney.online
echo ========================================
echo.
pause

