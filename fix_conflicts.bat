@echo off
chcp 65001
echo.
echo ========================================
echo    РЕШЕНИЕ КОНФЛИКТОВ GIT
echo ========================================
echo.

echo [1/4] Удаляем конфликтующие файлы...
git rm -r backend/
if %errorlevel% neq 0 echo ОШИБКА: Не удалось удалить backend/

git rm package-lock.json
if %errorlevel% neq 0 echo ОШИБКА: Не удалось удалить package-lock.json

git rm -r web/
if %errorlevel% neq 0 echo ОШИБКА: Не удалось удалить web/

echo.
echo [2/4] Pull с --allow-unrelated-histories...
git pull origin main --allow-unrelated-histories
if %errorlevel% neq 0 echo ОШИБКА: Не удалось выполнить pull

echo.
echo [3/4] Push в GitHub...
git push -u origin main
if %errorlevel% neq 0 echo ОШИБКА: Не удалось выполнить push

echo.
echo [4/4] Проверяем статус...
git status

echo.
echo ========================================
echo    ГОТОВО! GitHub Pages обновится
echo ========================================
echo.
pause

