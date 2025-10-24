@echo off
chcp 65001
echo.
echo ========================================
echo    ОТЛАДКА ПРОБЛЕМЫ С GIT
echo ========================================
echo.

echo [1/6] Проверяем статус git...
git status

echo.
echo [2/6] Проверяем последний коммит...
git log --oneline -5

echo.
echo [3/6] Проверяем что изменилось в index.html...
git diff HEAD~1 index.html

echo.
echo [4/6] Проверяем содержимое index.html...
type index.html

echo.
echo [5/6] Проверяем что в папке assets...
dir assets

echo.
echo [6/6] Принудительно добавляем все файлы...
git add -f .
git status

echo.
echo ========================================
echo    ОТЛАДКА ЗАВЕРШЕНА
echo ========================================
echo.
pause

