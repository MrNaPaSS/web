
"""
Telegram бот для приёма платежей через CryptoBot
API бота: 7812637462:AAEAC-GizoyEczsNeb3IJgo8mCcKbhPnWLg
"""

import os
import json
import logging
from datetime import datetime, timedelta
from typing import Dict, Any, Optional

from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo
from telegram.ext import (
    Application,
    CommandHandler,
    CallbackQueryHandler,
    ContextTypes,
    MessageHandler,
    filters
)

from crypto_bot_payment import CryptoBotPayment, MLModelSubscription

# Настройка логирования
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)

# Конфигурация
TELEGRAM_BOT_TOKEN = "7812637462:AAEAC-GizoyEczsNeb3IJgo8mCcKbhPnWLg"
CRYPTO_BOT_TOKEN = "YOUR_CRYPTO_BOT_TOKEN_HERE"  # Получите от @CryptoBot

# База данных подписок (в продакшене использовать реальную БД)
USER_SUBSCRIPTIONS = {}

# Инициализация CryptoBot
crypto_bot = CryptoBotPayment(CRYPTO_BOT_TOKEN)
subscription_manager = MLModelSubscription(crypto_bot)

# Данные моделей
ML_MODELS = {
    "shadow-stack": {
        "emoji": "🌑",
        "name": "ТЕНЕВОЙ СТЕК",
        "description": "Ensemble модель - стабильный винрейт 65-70%",
        "monthly": 29.99,
        "lifetime": 299.99
    },
    "forest-necromancer": {
        "emoji": "🌲",
        "name": "ЛЕСНОЙ НЕКРОМАНТ",
        "description": "RandomForest - призванный из леса решений",
        "monthly": 24.99,
        "lifetime": 249.99
    },
    "grey-cardinal": {
        "emoji": "🎭",
        "name": "СЕРЫЙ КАРДИНАЛ",
        "description": "XGBoost - всё под контролем, винрейт ~66%",
        "monthly": 34.99,
        "lifetime": 349.99
    },
    "logistic-spy": {
        "emoji": "🕵️",
        "name": "ЛОГИСТИЧЕСКИЙ ШПИОН",
        "description": "LogisticRegression - старая школа, винрейт 60-65%",
        "monthly": 19.99,
        "lifetime": 199.99
    },
    "sniper-80x": {
        "emoji": "🔫",
        "name": "СНАЙПЕР 80Х",
        "description": "Легендарная модель - винрейт 80%+",
        "monthly": 99.99,
        "lifetime": 999.99
    }
}


async def start_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """
    Команда /start - главное меню
    """
    user = update.effective_user
    
    welcome_text = f"""
👋 Добро пожаловать, {user.first_name}!

🧠 Приватные ML-модели для торговли
💰 Оплата криптовалютой через CryptoBot

Доступные команды:
/models - Посмотреть все модели
/subscribe - Оформить подписку
/my_subscriptions - Мои подписки
/help - Помощь

💳 Принимаем: BTC, ETH, USDT, TON
    """
    
    keyboard = [
        [
            InlineKeyboardButton("🧠 Модели", callback_data="show_models"),
            InlineKeyboardButton("💳 Подписаться", callback_data="subscribe")
        ],
        [
            InlineKeyboardButton("📊 Мои подписки", callback_data="my_subscriptions"),
            InlineKeyboardButton("❓ Помощь", callback_data="help")
        ]
    ]
    
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    await update.message.reply_text(welcome_text, reply_markup=reply_markup)


async def show_models_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """
    Показать все доступные ML-модели
    """
    text = "🧠 КАТАЛОГ ПРИВАТНЫХ ML-МОДЕЛЕЙ\n\n"
    text += "💀 Только для своих. Каждый вход — осознанный риск.\n"
    text += "━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n"
    
    for model_id, model in ML_MODELS.items():
        text += f"{model['emoji']} {model['name']}\n"
        text += f"📝 {model['description']}\n"
        text += f"💰 {model['monthly']} USDT/мес или {model['lifetime']} USDT пожизненно\n"
        text += f"━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n"
    
    keyboard = [
        [InlineKeyboardButton("💳 Оформить подписку", callback_data="subscribe")],
        [InlineKeyboardButton("◀️ Назад", callback_data="start")]
    ]
    
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    if update.callback_query:
        await update.callback_query.edit_message_text(text, reply_markup=reply_markup)
    else:
        await update.message.reply_text(text, reply_markup=reply_markup)


async def subscribe_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """
    Выбор модели для подписки
    """
    text = "🧠 Выберите ML-модель:\n\n"
    
    keyboard = []
    for model_id, model in ML_MODELS.items():
        keyboard.append([
            InlineKeyboardButton(
                f"{model['emoji']} {model['name']}",
                callback_data=f"select_model:{model_id}"
            )
        ])
    
    keyboard.append([InlineKeyboardButton("◀️ Назад", callback_data="start")])
    
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    if update.callback_query:
        await update.callback_query.edit_message_text(text, reply_markup=reply_markup)
    else:
        await update.message.reply_text(text, reply_markup=reply_markup)


async def select_model_callback(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """
    Обработка выбора модели
    """
    query = update.callback_query
    await query.answer()
    
    model_id = query.data.split(":")[1]
    model = ML_MODELS.get(model_id)
    
    if not model:
        await query.edit_message_text("❌ Модель не найдена")
        return
    
    # Сохраняем выбранную модель в контекст
    context.user_data['selected_model'] = model_id
    
    text = f"""
{model['emoji']} {model['name']}

📝 {model['description']}

💰 Цены:
• Ежемесячно: {model['monthly']} USDT/мес
• Пожизненно: {model['lifetime']} USDT (одноразово)

Выберите тип подписки:
    """
    
    keyboard = [
        [
            InlineKeyboardButton(
                f"⭐ Месячная ({model['monthly']} USDT)",
                callback_data=f"payment:monthly:{model_id}"
            )
        ],
        [
            InlineKeyboardButton(
                f"👑 Пожизненная ({model['lifetime']} USDT)",
                callback_data=f"payment:lifetime:{model_id}"
            )
        ],
        [InlineKeyboardButton("◀️ Назад", callback_data="subscribe")]
    ]
    
    reply_markup = InlineKeyboardMarkup(keyboard)
    await query.edit_message_text(text, reply_markup=reply_markup)


async def payment_callback(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """
    Создание инвойса для оплаты
    """
    query = update.callback_query
    await query.answer()
    
    # Парсим данные: payment:type:model_id
    parts = query.data.split(":")
    subscription_type = parts[1]  # monthly или lifetime
    model_id = parts[2]
    
    user_id = update.effective_user.id
    model = ML_MODELS.get(model_id)
    
    if not model:
        await query.edit_message_text("❌ Модель не найдена")
        return
    
    # Выбор валюты
    text = f"""
💳 Оплата подписки

{model['emoji']} {model['name']}
{'⭐ Ежемесячная' if subscription_type == 'monthly' else '👑 Пожизненная'} подписка

Выберите криптовалюту для оплаты:
    """
    
    keyboard = [
        [
            InlineKeyboardButton("₿ Bitcoin", callback_data=f"crypto:BTC:{subscription_type}:{model_id}"),
            InlineKeyboardButton("Ξ Ethereum", callback_data=f"crypto:ETH:{subscription_type}:{model_id}")
        ],
        [
            InlineKeyboardButton("💵 USDT", callback_data=f"crypto:USDT:{subscription_type}:{model_id}"),
            InlineKeyboardButton("💎 TON", callback_data=f"crypto:TON:{subscription_type}:{model_id}")
        ],
        [InlineKeyboardButton("◀️ Назад", callback_data=f"select_model:{model_id}")]
    ]
    
    reply_markup = InlineKeyboardMarkup(keyboard)
    await query.edit_message_text(text, reply_markup=reply_markup)


async def crypto_payment_callback(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """
    Создание CryptoBot инвойса
    """
    query = update.callback_query
    await query.answer("⏳ Создание инвойса...")
    
    # Парсим: crypto:CURRENCY:type:model_id
    parts = query.data.split(":")
    currency = parts[1]
    subscription_type = parts[2]
    model_id = parts[3]
    
    user_id = update.effective_user.id
    model = ML_MODELS.get(model_id)
    
    if not model:
        await query.edit_message_text("❌ Модель не найдена")
        return
    
    # Создаём инвойс через CryptoBot
    invoice = subscription_manager.create_subscription_invoice(
        user_id=user_id,
        model_id=model_id,
        subscription_type=subscription_type,
        currency=currency
    )
    
    if not invoice.get("ok"):
        await query.edit_message_text(
            f"❌ Ошибка создания инвойса: {invoice.get('error', 'Unknown error')}"
        )
        return
    
    invoice_data = invoice['result']
    amount = model[subscription_type]
    
    text = f"""
✅ Инвойс создан!

{model['emoji']} {model['name']}
{'⭐ Ежемесячная' if subscription_type == 'monthly' else '👑 Пожизненная'} подписка

💰 Сумма: {amount} {currency}
⏰ Время на оплату: 10 минут
🔑 ID инвойса: {invoice_data['invoice_id']}

Нажмите кнопку ниже для оплаты:
    """
    
    keyboard = [
        [InlineKeyboardButton(f"💳 Оплатить {amount} {currency}", url=invoice_data['pay_url'])],
        [InlineKeyboardButton("🔄 Проверить оплату", callback_data=f"check:{invoice_data['invoice_id']}")],
        [InlineKeyboardButton("❌ Отменить", callback_data="subscribe")]
    ]
    
    reply_markup = InlineKeyboardMarkup(keyboard)
    await query.edit_message_text(text, reply_markup=reply_markup)
    
    # Уведомление админу
    await notify_admin_payment_request(context, user_id, model, subscription_type, currency, amount, invoice_data['invoice_id'])


async def check_payment_callback(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """
    Проверка статуса платежа
    """
    query = update.callback_query
    await query.answer("🔍 Проверка статуса...")
    
    invoice_id = query.data.split(":")[1]
    
    # Получаем статус инвойса
    invoice_info = crypto_bot.get_invoice(invoice_id)
    
    if not invoice_info.get("ok"):
        await query.answer("❌ Ошибка проверки платежа", show_alert=True)
        return
    
    invoices = invoice_info.get("result", {}).get("items", [])
    
    if not invoices:
        await query.answer("❌ Инвойс не найден", show_alert=True)
        return
    
    invoice = invoices[0]
    status = invoice.get("status")
    
    if status == "paid":
        # Платёж успешен - активируем подписку
        payload = invoice.get("payload", "")
        result = subscription_manager.process_payment(invoice)
        
        if result.get("ok"):
            await query.answer("✅ Оплата подтверждена!", show_alert=True)
            
            # Сохраняем подписку
            user_id = result['user_id']
            model_id = result['model_id']
            subscription_type = result['subscription_type']
            
            if user_id not in USER_SUBSCRIPTIONS:
                USER_SUBSCRIPTIONS[user_id] = []
            
            USER_SUBSCRIPTIONS[user_id].append({
                "model_id": model_id,
                "type": subscription_type,
                "activated_at": datetime.now().isoformat(),
                "expires_at": (datetime.now() + timedelta(days=30)).isoformat() if subscription_type == "monthly" else None
            })
            
            model = ML_MODELS[model_id]
            
            text = f"""
✅ ПОДПИСКА АКТИВИРОВАНА!

{model['emoji']} {model['name']}
{'⭐ Ежемесячная' if subscription_type == 'monthly' else '👑 Пожизненная'} подписка

🎉 Модель успешно активирована!
📊 Используйте /my_subscriptions для просмотра
            """
            
            keyboard = [[InlineKeyboardButton("📊 Мои подписки", callback_data="my_subscriptions")]]
            reply_markup = InlineKeyboardMarkup(keyboard)
            
            await query.edit_message_text(text, reply_markup=reply_markup)
            
            # Уведомляем админа об успешной оплате
            await notify_admin_payment_success(context, user_id, model, subscription_type, invoice)
        else:
            await query.answer("❌ Ошибка активации подписки", show_alert=True)
    
    elif status == "active":
        await query.answer("⏳ Ожидание оплаты...", show_alert=True)
    
    elif status == "expired":
        await query.answer("⏰ Время оплаты истекло. Создайте новый инвойс.", show_alert=True)
    
    else:
        await query.answer(f"ℹ️ Статус: {status}", show_alert=True)


async def my_subscriptions_callback(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """
    Показать активные подписки пользователя
    """
    query = update.callback_query
    await query.answer()
    
    user_id = update.effective_user.id
    subscriptions = USER_SUBSCRIPTIONS.get(user_id, [])
    
    if not subscriptions:
        text = """
📊 Активные подписки

У вас пока нет активных подписок.

Оформите подписку на любую ML-модель!
        """
        keyboard = [[InlineKeyboardButton("💳 Оформить подписку", callback_data="subscribe")]]
    else:
        text = "📊 Ваши активные подписки:\n\n"
        
        for sub in subscriptions:
            model = ML_MODELS.get(sub['model_id'])
            if model:
                text += f"{model['emoji']} {model['name']}\n"
                text += f"Тип: {'⭐ Ежемесячная' if sub['type'] == 'monthly' else '👑 Пожизненная'}\n"
                text += f"Активирована: {sub['activated_at'][:10]}\n"
                if sub.get('expires_at'):
                    text += f"Истекает: {sub['expires_at'][:10]}\n"
                text += "━━━━━━━━━━━━━━━━━━━━━━\n\n"
        
        keyboard = [
            [InlineKeyboardButton("➕ Добавить подписку", callback_data="subscribe")],
            [InlineKeyboardButton("◀️ Назад", callback_data="start")]
        ]
    
    reply_markup = InlineKeyboardMarkup(keyboard)
    await query.edit_message_text(text, reply_markup=reply_markup)


async def notify_admin_payment_request(
    context: ContextTypes.DEFAULT_TYPE,
    user_id: int,
    model: Dict[str, Any],
    subscription_type: str,
    currency: str,
    amount: float,
    invoice_id: str
) -> None:
    """
    Уведомление админу о запросе оплаты
    """
    admin_id = YOUR_ADMIN_TELEGRAM_ID  # Замените на ваш ID
    
    text = f"""
🔔 НОВЫЙ ЗАПРОС ОПЛАТЫ

👤 Пользователь: {user_id}
🧠 Модель: {model['name']}
💳 Тип: {'Ежемесячная подписка' if subscription_type == 'monthly' else 'Пожизненная покупка'}
💰 Цена: {amount} {currency}
🔑 Invoice ID: {invoice_id}
⏰ Время: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

⏳ Ожидание оплаты...
    """
    
    try:
        await context.bot.send_message(chat_id=admin_id, text=text)
    except Exception as e:
        logger.error(f"Ошибка отправки уведомления админу: {e}")


async def notify_admin_payment_success(
    context: ContextTypes.DEFAULT_TYPE,
    user_id: int,
    model: Dict[str, Any],
    subscription_type: str,
    invoice: Dict[str, Any]
) -> None:
    """
    Уведомление админу об успешной оплате
    """
    admin_id = YOUR_ADMIN_TELEGRAM_ID  # Замените на ваш ID
    
    text = f"""
✅ ОПЛАТА ПОДТВЕРЖДЕНА!

👤 Пользователь: {user_id}
🧠 Модель: {model['name']}
💳 Тип: {'Ежемесячная подписка' if subscription_type == 'monthly' else 'Пожизненная покупка'}
💰 Сумма: {invoice.get('amount')} {invoice.get('asset')}
🔑 Invoice ID: {invoice.get('invoice_id')}
⏰ Оплачено: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

🎉 Подписка активирована!
    """
    
    try:
        await context.bot.send_message(chat_id=admin_id, text=text)
    except Exception as e:
        logger.error(f"Ошибка отправки уведомления админу: {e}")


async def button_callback(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """
    Обработчик всех кнопок
    """
    query = update.callback_query
    
    if query.data == "start":
        await start_command(update, context)
    elif query.data == "show_models":
        await show_models_command(update, context)
    elif query.data == "subscribe":
        await subscribe_command(update, context)
    elif query.data.startswith("select_model:"):
        await select_model_callback(update, context)
    elif query.data.startswith("payment:"):
        await payment_callback(update, context)
    elif query.data.startswith("crypto:"):
        await crypto_payment_callback(update, context)
    elif query.data.startswith("check:"):
        await check_payment_callback(update, context)
    elif query.data == "my_subscriptions":
        await my_subscriptions_callback(update, context)


def main() -> None:
    """
    Запуск бота
    """
    # Создаём приложение
    application = Application.builder().token(TELEGRAM_BOT_TOKEN).build()
    
    # Регистрируем обработчики
    application.add_handler(CommandHandler("start", start_command))
    application.add_handler(CommandHandler("models", show_models_command))
    application.add_handler(CommandHandler("subscribe", subscribe_command))
    application.add_handler(CallbackQueryHandler(button_callback))
    
    # Запускаем бота
    logger.info("🚀 Бот запущен!")
    application.run_polling(allowed_updates=Update.ALL_TYPES)


if __name__ == "__main__":
    # ВАЖНО: Замените YOUR_ADMIN_TELEGRAM_ID на ваш Telegram ID
    YOUR_ADMIN_TELEGRAM_ID = 123456789  # <-- Замените здесь
    
    main()

