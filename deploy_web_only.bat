@echo off
echo ========================================
echo ДЕПЛОЙ ТОЛЬКО ВЕБ-ИЗМЕНЕНИЙ
echo ========================================

echo.
echo 1. Добавляем только веб-файлы...
git add src/
git add web/
git add index.html
git add package.json
git add vite.config.js

echo.
echo 2. Коммитим веб-изменения...
git commit -m "Web: Серверная привязка активных сигналов - защита от обхода"

echo.
echo 3. Пушим в main ветку...
git push origin main

echo.
echo ========================================
echo ВЕБ-ДЕПЛОЙ ЗАВЕРШЕН!
echo ========================================
pause

