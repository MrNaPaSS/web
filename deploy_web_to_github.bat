@echo off
chcp 65001
echo.
echo ========================================
echo    ДЕПЛОЙ ВЕБ-ПРИЛОЖЕНИЯ В GITHUB PAGES
echo ========================================
echo.

echo [1/5] Проверяем удаленный репозиторий...
git remote -v
if %errorlevel% neq 0 echo ОШИБКА: Не удалось проверить remote

echo.
echo [2/5] Добавляем только веб-файлы...
git add src/
git add index.html
git add vite.config.js
git add package.json
git add public/
if %errorlevel% neq 0 echo ОШИБКА: Не удалось добавить файлы

echo.
echo [3/5] Проверяем статус...
git status

echo.
echo [4/5] Создаем коммит...
git commit -m "Fix: Серверная привязка активных сигналов - защита от обхода пользователями"
if %errorlevel% neq 0 echo ОШИБКА: Не удалось создать коммит

echo.
echo [5/5] Push в GitHub Pages...
git push git@github.com:MrNaPaSS/web.git main
if %errorlevel% neq 0 echo ОШИБКА: Не удалось выполнить push

echo.
echo ========================================
echo    ДЕПЛОЙ ЗАВЕРШЕН!
echo    Сайт: https://app.nomoneynohoney.online
echo ========================================
echo.
pause

