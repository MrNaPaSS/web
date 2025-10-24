@echo off
chcp 65001
echo.
echo ========================================
echo    ИСПРАВЛЕНИЕ ПРОБЛЕМЫ С ПАПКОЙ
echo ========================================
echo.

echo [1/4] Возвращаемся в правильную папку...
cd E:\РАЗРАБОТКА\ForexSignalsPro_Production_FINAL\ForexSignalsPro_Production\web

echo.
echo [2/4] Проверяем что мы в правильной папке...
dir

echo.
echo [3/4] Проверяем статус git...
git status

echo.
echo [4/4] Принудительно добавляем все изменения...
git add -A
git status

echo.
echo ========================================
echo    ПРОВЕРКА ЗАВЕРШЕНА
echo ========================================
echo.
pause

