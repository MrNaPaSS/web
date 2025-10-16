# Обновление GitHub Pages

## Инструкция по обновлению:

1. **Скопируйте все файлы из папки `github-pages` в ваш GitHub репозиторий**

2. **Или используйте Git команды:**
   ```bash
   cd github-pages
   git add .
   git commit -m "Update frontend with API proxy support"
   git push
   ```

3. **Или используйте GitHub Desktop:**
   - Откройте папку `github-pages` в GitHub Desktop
   - Сделайте коммит с сообщением "Update frontend"
   - Нажмите "Push origin"

## Что изменилось:

- ✅ Добавлена поддержка API Proxy (порт 5000)
- ✅ Исправлена авторизация через `api.nomoneynohoney.online`
- ✅ Обновлена конфигурация для продакшена

## После обновления:

1. Подождите 2-3 минуты для распространения изменений
2. Откройте https://app.nomoneynohoney.online
3. Авторизация должна работать через Telegram WebApp

## Проверка:

- Frontend: https://app.nomoneynohoney.online
- API: https://api.nomoneynohoney.online/health
