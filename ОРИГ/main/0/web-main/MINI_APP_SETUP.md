# 🚀 Настройка Telegram Mini App

## ✅ Что уже готово:
- Веб-приложение запущено на http://localhost:3005
- Backend API работает на http://localhost:8000
- Код бота готов для Mini App интеграции

## 🔧 Шаги для завершения:

### 1. Запустите ngrok в новом терминале:
```bash
ngrok.ps1 http 3005
```

### 2. Скопируйте HTTPS URL из вывода ngrok:
```
t=2024-01-01T12:00:00Z lvl=info msg="started tunnel" name=command_line addr=http://localhost:3005 url=https://abc123.ngrok.io
```

### 3. Обновите URL в боте:
Откройте файл `telegram_bot.py` и замените:
```python
self.web_app_url = "https://your-ngrok-url.ngrok.io"
```
на ваш реальный ngrok URL:
```python
self.web_app_url = "https://abc123.ngrok.io"  # Ваш реальный URL
```

### 4. Перезапустите бота:
```bash
python run_telegram_bot.py
```

## 🎯 Результат:
После этих шагов в Telegram появится кнопка "🌐 Web App", которая откроет полноценное приложение прямо в Telegram!

## 📱 Тестирование:
1. Откройте Telegram
2. Найдите вашего бота
3. Нажмите кнопку "🌐 Web App"
4. Приложение откроется прямо в Telegram!

## 🔍 Проверка ngrok:
Если ngrok не запускается, проверьте:
- Установлен ли ngrok: `ngrok version`
- Есть ли интернет соединение
- Не заблокирован ли порт 4040 файрволом

## 💡 Альтернатива:
Если ngrok не работает, можете использовать:
- **Cloudflare Tunnel** (бесплатно)
- **LocalTunnel** (npm install -g localtunnel)
- **Serveo** (ssh -R 80:localhost:3005 serveo.net)
