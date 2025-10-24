@echo off
echo Решение конфликтов Git...

echo Удаляем конфликтующие файлы...
git rm -r backend/
git rm package-lock.json  
git rm -r web/

echo Pull с --allow-unrelated-histories...
git pull origin main --allow-unrelated-histories

echo Push в GitHub...
git push -u origin main

echo Готово!
pause

