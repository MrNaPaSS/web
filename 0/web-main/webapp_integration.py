"""
Интеграция WebApp в основной Telegram бот
Добавь этот код в telegram_bot.py
"""

from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo
from telegram.ext import ContextTypes

class WebAppIntegration:
    """Интеграция WebApp в бота"""
    
    def __init__(self, webapp_url: str):
        self.webapp_url = webapp_url
    
    async def webapp_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Команда /webapp - открыть веб-приложение"""
        user_id = update.effective_user.id
        first_name = update.effective_user.first_name
        
        keyboard = [
            [InlineKeyboardButton(
                "🚀 Открыть Forex Signals Pro", 
                web_app=WebAppInfo(url=self.webapp_url)
            )]
        ]
        reply_markup = InlineKeyboardMarkup(keyboard)
        
        await update.message.reply_text(
            f"👋 Привет, {first_name}!\n\n"
            f"🌐 Нажми кнопку ниже чтобы открыть веб-приложение:\n\n"
            f"✨ Получай сигналы в удобном интерфейсе\n"
            f"📊 Следи за статистикой\n"
            f"🎯 Анализируй рынок\n\n"
            f"⚡ Всё синхронизировано с ботом!",
            reply_markup=reply_markup
        )
    
    async def signals_menu_with_webapp(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Главное меню сигналов с кнопкой WebApp"""
        keyboard = [
            [InlineKeyboardButton("📊 Генерировать сигнал", callback_data="generate_signal")],
            [InlineKeyboardButton("📈 История сигналов", callback_data="signal_history")],
            [InlineKeyboardButton(
                "🌐 Открыть WebApp", 
                web_app=WebAppInfo(url=self.webapp_url)
            )],
            [InlineKeyboardButton("⚙️ Настройки", callback_data="settings")]
        ]
        reply_markup = InlineKeyboardMarkup(keyboard)
        
        await update.message.reply_text(
            "🎯 Forex Signals Pro\n\n"
            "Выберите действие:",
            reply_markup=reply_markup
        )


# ════════════════════════════════════════════════════════════
# КАК ДОБАВИТЬ В TELEGRAM_BOT.PY:
# ════════════════════════════════════════════════════════════

"""
1. В __init__ метод TelegramSignalBot добавь:

    # WebApp интеграция
    self.webapp_integration = WebAppIntegration(self.web_app_url)

2. В _setup_handlers() добавь:

    # WebApp команда
    self.application.add_handler(
        CommandHandler("webapp", self.webapp_integration.webapp_command)
    )

3. Обнови команды бота через BotFather:

    /setcommands
    
    start - 🚀 Запустить бота
    help - ❓ Помощь
    webapp - 🌐 Открыть веб-приложение
    signals - 📊 Генерация сигналов
    stats - 📈 Моя статистика

4. Готово! Пользователи могут:
   - /webapp - Открыть веб-приложение
   - Или нажать кнопку в меню сигналов
"""

# ════════════════════════════════════════════════════════════
# НАСТРОЙКА MENU BUTTON В BOTFATHER:
# ════════════════════════════════════════════════════════════

"""
Чтобы WebApp открывалось через главную кнопку меню:

1. Открой @BotFather
2. /mybots
3. Выбери своего бота
4. Bot Settings
5. Menu Button
6. Edit menu button URL
7. Введи: https://твой-ngrok-url.ngrok.io
8. Edit menu button text (опционально)
9. Введи: 🌐 Forex Signals Pro

Теперь у пользователей будет кнопка внизу экрана чата!
"""

if __name__ == '__main__':
    print("✅ WebApp интеграция готова к добавлению в бота")
    print("📋 Следуй инструкциям выше")

