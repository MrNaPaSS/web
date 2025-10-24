@echo off
chcp 65001
echo.
echo ========================================
echo    ПРИНУДИТЕЛЬНЫЙ PUSH В GITHUB PAGES
echo ========================================
echo.

echo [1/5] Переходим в папку web...
cd web

echo.
echo [2/5] Проверяем статус...
git status

echo.
echo [3/5] Принудительно добавляем ВСЕ файлы...
git add -A
git add -f .

echo.
echo [4/5] Создаем коммит с принудительным флагом...
git commit -m "Fix: ПРИНУДИТЕЛЬНОЕ ОБНОВЛЕНИЕ - серверная привязка активных сигналов" --allow-empty

echo.
echo [5/5] Принудительно пушим в GitHub Pages...
git push origin main --force

echo.
echo ========================================
echo    ПРИНУДИТЕЛЬНЫЙ PUSH ЗАВЕРШЕН!
echo    Сайт: https://app.nomoneynohoney.online
echo ========================================
echo.
pause

