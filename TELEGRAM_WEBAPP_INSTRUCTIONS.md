# Telegram Web App - Инструкция

## Что уже сделано:

✅ **Добавлена кнопка Web App в Telegram бота**
- В главном меню бота есть кнопка "🌐 Web App"
- При нажатии откроется веб-приложение прямо в Telegram

✅ **Создано полнофункциональное веб-приложение**
- Премиум дизайн с футуристическим интерфейсом
- 20 языков мира
- Dashboard с аналитикой
- Генерация сигналов
- Real-time обновления

## Как запустить:

### 1. Запуск приложения:
```bash
# Backend (порт 8000)
cd e:\TelegramBot_RDP\webapp\backend
python main.py

# Frontend (порт 3001) 
cd e:\TelegramBot_RDP\webapp\frontend
npm run dev
```

### 2. Для Telegram Web App нужен HTTPS:

**Вариант 1: Ngrok (рекомендуется)**
```bash
# Установить ngrok
npm install -g ngrok

# Запустить туннель
ngrok http 3001

# Скопировать HTTPS URL (например: https://abc123.ngrok.io)
```

**Вариант 2: Локальный домен с SSL**
- Настроить локальный домен с SSL сертификатом
- Указать URL в telegram_bot.py

### 3. Обновить URL в боте:
```python
# В файле telegram_bot.py строка 102:
self.web_app_url = "https://your-ngrok-url.ngrok.io"
```

### 4. Перезапустить бота:
```bash
cd e:\TelegramBot_RDP
python run_telegram_bot.py
```

## Результат:

В Telegram боте появится кнопка "🌐 Web App". При нажатии:
- Откроется полноэкранное веб-приложение
- Будет доступен весь функционал
- Красивый премиум дизайн
- Мультиязычность
- Real-time данные

## Текущий статус:
- ✅ Web App создан и работает на http://localhost:3001
- ✅ Кнопка добавлена в Telegram бота
- ⏳ Нужен HTTPS URL для полной интеграции
- ⏳ Нужно перезапустить бота с новым URL

## Альтернатива для тестирования:
Можно открыть http://localhost:3001 в браузере и увидеть как будет выглядеть приложение в Telegram.
