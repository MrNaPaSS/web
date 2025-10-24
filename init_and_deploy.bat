@echo off
echo ========================================
echo ИНИЦИАЛИЗАЦИЯ GIT И ДЕПЛОЙ
echo ========================================

echo.
echo 1. Инициализируем git репозиторий...
git init

echo.
echo 2. Добавляем удаленный репозиторий...
git remote add origin https://github.com/MrNaPaSS/web.git

echo.
echo 3. Добавляем только веб-файлы...
git add src/
git add web/
git add index.html
git add package.json
git add vite.config.js
git add public/

echo.
echo 4. Коммитим веб-изменения...
git commit -m "Web: Серверная привязка активных сигналов - защита от обхода"

echo.
echo 5. Пушим в main ветку...
git push -u origin main

echo.
echo ========================================
echo ДЕПЛОЙ ЗАВЕРШЕН!
echo ========================================
pause

