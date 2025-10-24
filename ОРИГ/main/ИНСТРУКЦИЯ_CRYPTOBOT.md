# 🚀 ИНСТРУКЦИЯ ПО НАСТРОЙКЕ CRYPTOBOT ДЛЯ ОПЛАТЫ

## 📋 Что сделано:

### 1. **Создан Telegram бот**
- ✅ API Token: `7812637462:AAEAC-GizoyEczsNeb3IJgo8mCcKbhPnWLg`
- ✅ Интеграция с CryptoBot для приёма платежей

### 2. **Реализованная функциональность:**
- ✅ Выбор ML-модели из каталога
- ✅ Выбор типа подписки (ежемесячная/пожизненная)
- ✅ Выбор криптовалюты (BTC, ETH, USDT, TON)
- ✅ Автоматическое создание инвойсов через CryptoBot
- ✅ Проверка статуса оплаты
- ✅ Автоматическая активация подписки
- ✅ Уведомления админу о платежах

---

## 🔧 ПОШАГОВАЯ НАСТРОЙКА:

### Шаг 1: Получите CryptoBot API Token

1. **Откройте [@CryptoBot](https://t.me/CryptoBot)** в Telegram
2. Отправьте команду `/start`
3. Выберите **"Create App"** или отправьте `/newapp`
4. Введите название приложения (например: "ForexSignalsML")
5. **Скопируйте полученный API Token**

Пример токена: `12345:AABBccDDeeFFggHHiiJJkkLLmmNNooP`

---

### Шаг 2: Настройте Webhook (опционально)

Для автоматической обработки платежей:

1. В [@CryptoBot](https://t.me/CryptoBot) отправьте `/myapps`
2. Выберите ваше приложение
3. Нажмите **"Set Webhook"**
4. Введите URL вашего сервера: `https://yourdomain.com/webhook/cryptobot`

---

### Шаг 3: Установите зависимости

```bash
cd C:\Users\Admin\Downloads\home\ubuntu\forex-signals-app\backend
pip install -r requirements_payment.txt
```

---

### Шаг 4: Настройте конфигурацию

Откройте файл `telegram_payment_bot.py` и замените:

```python
# Строка 29:
CRYPTO_BOT_TOKEN = "ВСТАВЬТЕ_СЮДА_ВАШ_CRYPTOBOT_TOKEN"

# Строка 609:
YOUR_ADMIN_TELEGRAM_ID = 123456789  # Замените на ваш Telegram ID
```

**Как узнать ваш Telegram ID:**
- Напишите боту [@userinfobot](https://t.me/userinfobot)
- Он покажет ваш ID

---

### Шаг 5: Запустите бота

```bash
cd C:\Users\Admin\Downloads\home\ubuntu\forex-signals-app\backend
python telegram_payment_bot.py
```

Вы увидите:
```
🚀 Бот запущен!
```

---

## 💳 КАК РАБОТАЕТ СИСТЕМА ОПЛАТЫ:

### Для пользователя:

1. **Пользователь** открывает бота → `/start`
2. Выбирает **ML-модель** из каталога
3. Выбирает **тип подписки**:
   - ⭐ Ежемесячная (автопродление)
   - 👑 Пожизненная (одноразовая)
4. Выбирает **криптовалюту** (BTC/ETH/USDT/TON)
5. Получает **ссылку на оплату** от CryptoBot
6. Оплачивает → **Подписка активируется автоматически**

### Для админа:

1. **Запрос оплаты** → Получаете уведомление:
```
🔔 НОВЫЙ ЗАПРОС ОПЛАТЫ

👤 Пользователь: 123456789
🧠 Модель: ЛОГИСТИЧЕСКИЙ ШПИОН
💳 Тип: Ежемесячная подписка
💰 Цена: 19.99 USDT
```

2. **Успешная оплата** → Получаете уведомление:
```
✅ ОПЛАТА ПОДТВЕРЖДЕНА!

👤 Пользователь: 123456789
🧠 Модель: ЛОГИСТИЧЕСКИЙ ШПИОН
💰 Сумма: 19.99 USDT
🎉 Подписка активирована!
```

---

## 🔐 БЕЗОПАСНОСТЬ:

### CryptoBot преимущества:
- ✅ **Telegram не берёт комиссию** (0%)
- ✅ **Не хранит данные карт** - всё через криптовалюту
- ✅ **Мгновенные платежи** по блокчейну
- ✅ **Поддержка популярных криптовалют**:
  - Bitcoin (BTC)
  - Ethereum (ETH)
  - Tether (USDT)
  - TON Coin (TON)

### Webhook безопасность:
- Все webhook от CryptoBot подписаны HMAC-SHA256
- Автоматическая проверка подписи в коде

---

## 📊 МОДЕЛИ И ЦЕНЫ:

| Модель | Ежемесячно | Пожизненно |
|--------|------------|------------|
| 🕵️ ЛОГИСТИЧЕСКИЙ ШПИОН | $19.99/мес | $199.99 |
| 🌲 ЛЕСНОЙ НЕКРОМАНТ | $24.99/мес | $249.99 |
| 🌑 ТЕНЕВОЙ СТЕК | $29.99/мес | $299.99 |
| 🎭 СЕРЫЙ КАРДИНАЛ | $34.99/мес | $349.99 |
| 🔫 СНАЙПЕР 80Х | $99.99/мес | $999.99 |

---

## 🧪 ТЕСТИРОВАНИЕ:

### Тестовый режим CryptoBot:

1. В [@CryptoTestBot](https://t.me/CryptoTestBot) создайте тестовое приложение
2. Используйте тестовый токен для разработки
3. В тестовом режиме реальные деньги не списываются

### Проверка работы:

```bash
# Запустите тест
python crypto_bot_payment.py
```

Вы должны увидеть:
```
✅ Инвойс создан!
ID: 1234567
Ссылка для оплаты: https://pay.crypt.bot/...
```

---

## 🔄 АВТОМАТИЧЕСКОЕ ПРОДЛЕНИЕ:

### Ежемесячные подписки:

Для автоматического продления настройте cron-задачу:

```python
# В telegram_payment_bot.py добавьте:

async def check_expiring_subscriptions():
    """Проверка истекающих подписок"""
    for user_id, subscriptions in USER_SUBSCRIPTIONS.items():
        for sub in subscriptions:
            if sub['type'] == 'monthly':
                expires_at = datetime.fromisoformat(sub['expires_at'])
                if expires_at < datetime.now():
                    # Отправить уведомление о необходимости продления
                    await notify_subscription_expired(user_id, sub)
```

---

## 📞 ПОДДЕРЖКА:

### Если что-то не работает:

1. **Проверьте логи бота** - там будут ошибки
2. **Убедитесь что CryptoBot токен верный**
3. **Проверьте баланс** в CryptoBot: `/balance`
4. **Проверьте доступные валюты**: `/getcurrencies`

### Полезные команды CryptoBot:

- `/myapps` - Список приложений
- `/balance` - Баланс
- `/transfer` - Вывод средств
- `/help` - Помощь

---

## 🎯 ИНТЕГРАЦИЯ С ФРОНТЕНДОМ:

Для интеграции с React-приложением:

```javascript
// В App.jsx добавьте:

const initTelegramBot = () => {
  const tg = window.Telegram.WebApp;
  tg.ready();
  
  // Отправка данных боту
  tg.sendData(JSON.stringify({
    action: 'subscribe',
    model_id: 'logistic-spy',
    subscription_type: 'monthly'
  }));
};
```

---

## 📚 ДОКУМЕНТАЦИЯ:

- **CryptoBot API**: https://help.crypt.bot/crypto-pay-api
- **Telegram Bot API**: https://core.telegram.org/bots/api
- **Telegram Payments**: https://core.telegram.org/bots/payments

---

## ✅ ЧЕКЛИСТ ПЕРЕД ЗАПУСКОМ:

- [ ] Получен CryptoBot API Token
- [ ] Токен вставлен в `telegram_payment_bot.py`
- [ ] Установлены зависимости (`pip install -r requirements_payment.txt`)
- [ ] Заменён `YOUR_ADMIN_TELEGRAM_ID` на ваш ID
- [ ] Бот протестирован в тестовом режиме
- [ ] Настроены webhook (опционально)
- [ ] Проверены все 5 моделей
- [ ] Протестированы оба типа подписок (monthly/lifetime)
- [ ] Проверены все 4 криптовалюты (BTC/ETH/USDT/TON)

---

## 🚀 ГОТОВО К ЗАПУСКУ!

После выполнения всех шагов ваш бот полностью готов принимать платежи в криптовалюте!

**Вопросы?** Пишите в поддержку [@BotSupport](https://t.me/BotSupport)

