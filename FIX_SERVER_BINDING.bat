@echo off
chcp 65001
echo.
echo ========================================
echo    ИСПРАВЛЕНИЕ СЕРВЕРНОЙ ПРИВЯЗКИ
echo ========================================
echo.

echo [1/4] Собираем проект с исправлением...
npm run build
if %errorlevel% neq 0 echo ОШИБКА: Не удалось собрать проект

echo.
echo [2/4] Копируем исправленные файлы в web/...
xcopy /E /Y dist\* web\
if %errorlevel% neq 0 echo ОШИБКА: Не удалось скопировать файлы

echo.
echo [3/4] Переходим в папку web и коммитим...
cd web
git add .
git commit -m "Fix: Исправлена серверная привязка - localStorage не очищается при восстановлении сигнала"

echo.
echo [4/4] Пушим исправление...
git push origin main

echo.
echo ========================================
echo    ИСПРАВЛЕНИЕ ЗАВЕРШЕНО!
echo    Сайт: https://app.nomoneynohoney.online
echo ========================================
echo.
pause

