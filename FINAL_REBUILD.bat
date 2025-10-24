@echo off
chcp 65001
echo.
echo ========================================
echo    ФИНАЛЬНАЯ ПЕРЕСБОРКА
echo ========================================
echo.

echo [1/5] Очищаем папку dist...
Remove-Item -Recurse -Force dist -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Name dist

echo.
echo [2/5] Собираем проект с исправленным index.html...
npm run build

echo.
echo [3/5] Проверяем что dist создался с файлами...
dir dist

echo.
echo [4/5] Копируем НОВЫЕ файлы в web/...
xcopy /E /Y dist\* web\

echo.
echo [5/5] Переходим в web и коммитим НОВЫЕ файлы...
cd web
git add -A
git status
git commit -m "Fix: ФИНАЛЬНАЯ СБОРКА - серверная привязка активных сигналов с исправлениями"
git push origin main

echo.
echo ========================================
echo    ФИНАЛЬНАЯ СБОРКА ЗАВЕРШЕНА!
echo    Сайт: https://app.nomoneynohoney.online
echo ========================================
echo.
pause

