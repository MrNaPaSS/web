@echo off
echo ========================================
echo ИСПРАВЛЕНИЕ GIT И ДЕПЛОЙ
echo ========================================

echo.
echo 1. Проверяем статус...
git status

echo.
echo 2. Добавляем все веб-файлы...
git add src/
git add web/
git add index.html
git add package.json
git add vite.config.js
git add public/

echo.
echo 3. Создаем первый коммит...
git commit -m "Web: Серверная привязка активных сигналов - защита от обхода"

echo.
echo 4. Переименовываем ветку в main...
git branch -M main

echo.
echo 5. Пушим в main ветку...
git push -u origin main

echo.
echo ========================================
echo ДЕПЛОЙ ЗАВЕРШЕН!
echo ========================================
pause

