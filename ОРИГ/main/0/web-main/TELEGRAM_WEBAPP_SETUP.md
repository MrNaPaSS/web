# 🤖 Настройка Telegram WebApp

## ШАГ 1: Настрой WebApp URL в боте

### Через BotFather:

1. Открой чат с **@BotFather** в Telegram
2. Отправь команду `/mybots`
3. Выбери своего бота
4. Нажми **Bot Settings**
5. Нажми **Menu Button**
6. Нажми **Edit menu button URL**
7. Введи URL своего веб-приложения:
   ```
   https://твой-домен.com
   или
   https://ngrok-url.ngrok.io
   ```

### Альтернативный способ - через команду:

Отправь боту команду с inline кнопкой:

```python
from telegram import InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo

keyboard = [
    [InlineKeyboardButton(
        "🚀 Открыть Forex Signals Pro", 
        web_app=WebAppInfo(url="https://твой-url.com")
    )]
]
reply_markup = InlineKeyboardMarkup(keyboard)
```

## ШАГ 2: Настрой NGROK (для локальной разработки)

### 1. Скачай ngrok:
https://ngrok.com/download

### 2. Запусти фронтенд:
```bash
npm run dev
```

### 3. Создай туннель:
```bash
ngrok http 5173
```

### 4. Получи HTTPS URL:
```
Forwarding: https://abc123.ngrok.io -> http://localhost:5173
```

### 5. Укажи этот URL в BotFather

## ШАГ 3: Обнови конфиг бота

В `config.py` добавь:

```python
class BotConfig:
    # ... существующие настройки ...
    
    # WebApp URL
    WEBAPP_URL = "https://твой-url.com"  # Твой ngrok или домен
```

## ШАГ 4: Добавь команду в бота

В `telegram_bot.py` добавь обработчик:

```python
async def webapp_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Открыть WebApp"""
    keyboard = [
        [InlineKeyboardButton(
            "🚀 Открыть Forex Signals Pro", 
            web_app=WebAppInfo(url=BotConfig.WEBAPP_URL)
        )]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    await update.message.reply_text(
        "Нажми кнопку ниже чтобы открыть веб-приложение:",
        reply_markup=reply_markup
    )

# Регистрация команды
application.add_handler(CommandHandler('webapp', webapp_command))
```

## ШАГ 5: Проверь работу

### 1. В консоли браузера должно быть:
```
🔍 Проверка Telegram WebApp...
✅ Telegram WebApp SDK загружен
📱 Platform: ios / android / web
🎨 Theme: dark / light
👤 User data: {id: 123456789, first_name: "John", ...}
✅ Пользователь найден: John (ID: 123456789)
✅ Авторизация через API успешна: John
```

### 2. Если видишь ошибки:

**❌ "Приложение не запущено в Telegram WebApp"**
- Открывай приложение ТОЛЬКО через кнопку в боте
- Не открывай напрямую в браузере

**❌ "Не удалось получить данные пользователя"**
- Проверь что URL правильный в BotFather
- Проверь что используешь HTTPS (ngrok дает HTTPS автоматически)

**❌ "Ошибка подключения к API"**
- Запусти `backend/START_ALL_APIS.bat`
- Проверь что Auth API работает на порту 5001

## ШАГ 6: Production деплой

### Для продакшн:

1. **Залей фронтенд на хостинг:**
   - Vercel (рекомендуется)
   - Netlify
   - GitHub Pages

2. **Запусти бэкенд на VPS:**
   ```bash
   # На сервере
   cd backend
   python auth_api.py &
   python signal_api.py &
   ```

3. **Обнови URL в коде:**
   ```javascript
   // App.jsx
   const API_URL = 'https://твой-сервер.com'
   
   fetch(`${API_URL}/api/auth/login`, ...)
   ```

4. **Укажи продакшн URL в BotFather**

## Проверка работы всей системы:

```
✅ Бот запущен (telegram_bot.py)
✅ Auth API запущен (порт 5001)
✅ Signal API запущен (порт 5002)
✅ Фронтенд запущен (npm run dev)
✅ Ngrok создал туннель
✅ URL указан в BotFather
✅ Команда /webapp добавлена в бота
```

## Готово! 🎉

Теперь пользователи могут:
1. Открыть бота в Telegram
2. Нажать кнопку WebApp
3. Автоматически авторизоваться
4. Получать РЕАЛЬНЫЕ сигналы!

