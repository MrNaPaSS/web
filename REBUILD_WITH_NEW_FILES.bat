@echo off
chcp 65001
echo.
echo ========================================
echo    ПЕРЕСБОРКА С НОВЫМИ ФАЙЛАМИ
echo ========================================
echo.

echo [1/6] Возвращаемся в корневую папку...
cd E:\РАЗРАБОТКА\ForexSignalsPro_Production_FINAL\ForexSignalsPro_Production

echo.
echo [2/6] Очищаем папку dist...
rmdir /S /Q dist
mkdir dist

echo.
echo [3/6] Собираем проект заново...
npm run build

echo.
echo [4/6] Проверяем что dist создался...
dir dist

echo.
echo [5/6] Копируем НОВЫЕ файлы в web/...
xcopy /E /Y dist\* web\

echo.
echo [6/6] Переходим в web и коммитим НОВЫЕ файлы...
cd web
git add -A
git status
git commit -m "Fix: НОВАЯ СБОРКА - серверная привязка активных сигналов с исправлениями"
git push origin main

echo.
echo ========================================
echo    НОВАЯ СБОРКА ЗАВЕРШЕНА!
echo    Сайт: https://app.nomoneynohoney.online
echo ========================================
echo.
pause

