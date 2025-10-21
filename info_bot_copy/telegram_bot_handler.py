"""
TELEGRAM БОТ @info_xm_trust_bot
Система доступа к сигналам
"""

import asyncio
import logging
import json
import csv
import requests
import threading
from datetime import datetime, timedelta
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import Application, CommandHandler, MessageHandler, CallbackQueryHandler, filters, ContextTypes

# Импорт системы мультиязычности
from i18n import t, get_user_language, set_user_language, get_language_keyboard, LANGUAGES

# Настройка логирования
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)

class InfoBot:
    """Бот для управления доступом к сигналам"""
    
    def __init__(self):
        self.bot_token = "8301387899:AAF3iyRTamLwiFxao6nImBeZC-aUm0GbV00"
        self.referral_link = "https://u3.shortink.io/register?utm_campaign=827841&utm_source=affiliate&utm_medium=sr&a=CQQJpdvm2ya9dU&ac=tggg&code=50START"
        self.referral_code = "50START"
        self.min_deposit = 50
        self.admin_chat_id = "511442168"  # Ваш Telegram ID
        
        # Путь к приветственному фото
        self.welcome_photo = "welcome.jpg"  # Файл должен быть в той же папке с ботом
        
        # База данных пользователей
        self.users_db_file = "info_bot_users.json"
        self.users_db = self._load_users_db()
        
        # Отслеживание повторных нажатий кнопки "Проверить доступ"
        self.access_check_history = {}  # {user_id: [timestamps]}
        self.max_repeated_checks = 3  # Максимум повторных проверок
        self.check_cooldown = 300  # 5 минут между проверками
        
        # Система предупреждений о блокировке
        self.user_warnings = {}  # {user_id: warning_count}
        self.max_warnings = 2  # Максимум предупреждений перед блокировкой (1-е, 2-е)
        self.blocked_users = set()  # Заблокированные пользователи
        
        # История событий для администратора
        self.admin_events = []  # [{timestamp, event_type, user_id, description}]
        self.max_events = 50  # Максимум событий в истории
    
    def _add_admin_event(self, event_type: str, user_id: int, description: str):
        """Добавить событие в историю для администратора"""
        event = {
            'timestamp': datetime.now().isoformat(),
            'event_type': event_type,
            'user_id': user_id,
            'description': description
        }
        self.admin_events.insert(0, event)  # Добавляем в начало списка
        # Ограничиваем размер истории
        if len(self.admin_events) > self.max_events:
            self.admin_events = self.admin_events[:self.max_events]
    
    def _load_users_db(self):
        """Загрузка базы пользователей из JSON"""
        try:
            with open(self.users_db_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
                logger.info(f"✅ Загружено {len(data)} пользователей из базы")
                return data
        except FileNotFoundError:
            logger.info("📝 Создается новая база пользователей")
            return {}
        except Exception as e:
            logger.error(f"❌ Ошибка загрузки базы пользователей: {e}")
            return {}
    
    def _save_users_db(self):
        """Сохранение базы пользователей в JSON"""
        try:
            with open(self.users_db_file, 'w', encoding='utf-8') as f:
                json.dump(self.users_db, f, ensure_ascii=False, indent=2)
            logger.info(f"💾 База пользователей сохранена ({len(self.users_db)} пользователей)")
        except Exception as e:
            logger.error(f"❌ Ошибка сохранения базы пользователей: {e}")
    
    def _export_users_csv(self):
        """Экспорт пользователей в CSV файл"""
        import csv
        csv_filename = f"users_export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
        
        try:
            with open(csv_filename, 'w', newline='', encoding='utf-8-sig') as csvfile:
                fieldnames = ['ID', 'Username', 'Telegram', 'Язык', 'Дата регистрации', 'PocketOption ID', 'Статус', 'Верифицирован', 'Депозит']
                writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
                
                writer.writeheader()
                for user_id, user_data in self.users_db.items():
                    writer.writerow({
                        'ID': user_id,
                        'Username': user_data.get('username', 'N/A'),
                        'Telegram': f"@{user_data.get('username', 'N/A')}",
                        'Язык': user_data.get('language', 'N/A'),
                        'Дата регистрации': user_data.get('registered_at', 'N/A')[:19] if user_data.get('registered_at') else 'N/A',
                        'PocketOption ID': user_data.get('pocket_option_id', 'Не отправлен'),
                        'Статус': user_data.get('status', 'N/A'),
                        'Верифицирован': '✅ Да' if user_data.get('verified') else '❌ Нет',
                        'Депозит': '✅ Да' if user_data.get('deposited') else '❌ Нет'
                    })
            
            logger.info(f"📊 Экспортировано {len(self.users_db)} пользователей в {csv_filename}")
            return csv_filename
        except Exception as e:
            logger.error(f"❌ Ошибка экспорта пользователей: {e}")
            return None
        
    async def start_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Команда /start"""
        user_id = update.effective_user.id
        username = update.effective_user.username or "User"
        
        # Если это администратор - показываем админ-панель
        if str(user_id) == self.admin_chat_id:
            await self.admin_panel_command(update, context)
            return
        
        # Проверяем, новый ли это пользователь
        is_new_user = user_id not in self.users_db
        
        # Если новый пользователь - показываем выбор языка
        if is_new_user or 'language' not in self.users_db.get(user_id, {}):
            # Создаем запись пользователя БЕЗ языка
            if user_id not in self.users_db:
                self.users_db[user_id] = {
                    'username': username,
                    'registered_at': datetime.now().isoformat(),
                    'status': 'new',
                    'pocket_option_id': None,
                    'verified': False,
                    'deposited': False
                }
                self._save_users_db()
            
            # Показываем выбор языка для новых пользователей
            keyboard = get_language_keyboard()
            reply_markup = InlineKeyboardMarkup(keyboard)
            
            await update.message.reply_text(
                "🌐 *Welcome! Choose your language / Выберите язык*\n\n"
                "Please select your preferred language:",
                reply_markup=reply_markup,
                parse_mode='Markdown'
            )
            return
        
        # Если пользователь уже выбрал язык - показываем приветствие
        user_lang = get_user_language(
            user_id, 
            self.users_db, 
            update.effective_user.language_code
        )
        
        # Формируем многоязычное приветственное сообщение
        welcome_message = f"""
{t('welcome_title', user_lang).format(username)}

{t('welcome_intro', user_lang)}

{t('welcome_features_title', user_lang)}
{t('welcome_feature_1', user_lang)}
{t('welcome_feature_2', user_lang)}
{t('welcome_feature_3', user_lang)}
{t('welcome_feature_4', user_lang)}

{t('welcome_how_title', user_lang)}

{t('welcome_step_1', user_lang)}
   [РЕГИСТРАЦИЯ НА ПЛАТФОРМЕ]({self.referral_link})

{t('welcome_step_2', user_lang)}
{t('welcome_step_2_bonus', user_lang)}
{t('welcome_step_2_promo', user_lang)}

{t('welcome_step_3', user_lang)}

{t('welcome_step_4', user_lang)}

{t('welcome_traders_only', user_lang)}

{t('welcome_support', user_lang)}
        """.strip()
        
        # Многоязычные кнопки
        keyboard = [
            [InlineKeyboardButton(t('btn_instruction', user_lang), callback_data="instruction")],
            [InlineKeyboardButton(t('btn_registration', user_lang), url=self.referral_link)],
            [InlineKeyboardButton(t('btn_check_access', user_lang), callback_data="check_access")],
            [InlineKeyboardButton(t('btn_support', user_lang), url="https://t.me/kaktotakxm")],
            [InlineKeyboardButton(t('btn_language', user_lang), callback_data="choose_language")]
        ]
        reply_markup = InlineKeyboardMarkup(keyboard)
        
        # Отправляем фото с приветствием
        try:
            with open('welcome.jpg', 'rb') as photo:
                await update.message.reply_photo(
                    photo=photo,
                    caption=welcome_message, 
                    reply_markup=reply_markup,
                    parse_mode='Markdown'
                )
        except FileNotFoundError:
            # Если фото нет, отправляем обычное сообщение
            await update.message.reply_text(
                welcome_message, 
                reply_markup=reply_markup,
                parse_mode='Markdown'
            )
        except Exception as e:
            logger.error(f"Ошибка отправки фото: {e}")
            await update.message.reply_text(
                welcome_message, 
                reply_markup=reply_markup,
                parse_mode='Markdown'
            )
        
    async def instruction_callback(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Кнопка Инструкция"""
        query = update.callback_query
        await query.answer()
        
        user_id = query.from_user.id
        user_lang = get_user_language(user_id, self.users_db)
        
        instruction_text = f"""
{t('instruction_title', user_lang)}

{t('instruction_step1_title', user_lang)}
{t('instruction_step1_1', user_lang)}
{t('instruction_step1_2', user_lang)}
{t('instruction_step1_3', user_lang)}

{t('instruction_step2_title', user_lang)}
{t('instruction_step2_1', user_lang)}
{t('instruction_step2_2', user_lang)}
{t('instruction_step2_3', user_lang)}

{t('instruction_step3_title', user_lang)}
{t('instruction_step3_1', user_lang)}
{t('instruction_step3_2', user_lang)}
{t('instruction_step3_3', user_lang)}

{t('instruction_step4_title', user_lang)}
{t('instruction_step4_1', user_lang)}
{t('instruction_step4_2', user_lang)}
{t('instruction_step4_3', user_lang)}

{t('instruction_time', user_lang)}

{t('instruction_questions', user_lang)}
        """.strip()
        
        keyboard = [
            [InlineKeyboardButton(t('btn_registration', user_lang), url=self.referral_link)],
            [InlineKeyboardButton(t('btn_check_access', user_lang), callback_data="check_access")],
            [InlineKeyboardButton(t('btn_back', user_lang), callback_data="back_to_start")]
        ]
        reply_markup = InlineKeyboardMarkup(keyboard)
        
        await query.edit_message_text(
            instruction_text,
            reply_markup=reply_markup,
            parse_mode='Markdown'
        )
        
    async def check_access_callback(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Кнопка Проверить доступ"""
        query = update.callback_query
        await query.answer()
        
        user_id = query.from_user.id
        user_lang = get_user_language(user_id, self.users_db)
        current_time = datetime.now()
        
        # Проверяем, не заблокирован ли пользователь
        if user_id in self.blocked_users:
            blocked_text = f"""
{t('blocked_title', user_lang)}

{t('blocked_reason', user_lang)}

{t('blocked_permanent', user_lang)}

{t('blocked_contact', user_lang)}
{t('blocked_user_id', user_lang).format(user_id)}
            """.strip()
            
            await query.edit_message_text(
                blocked_text,
                parse_mode='Markdown'
            )
            return
        
        if user_id not in self.users_db:
            await query.edit_message_text(
                t('error_not_registered', user_lang),
                parse_mode='Markdown'
            )
            return
            
        user_data = self.users_db[user_id]
        
        # Проверяем историю нажатий кнопки
        if user_id not in self.access_check_history:
            self.access_check_history[user_id] = []
        
        # Добавляем текущее время
        self.access_check_history[user_id].append(current_time)
        
        # Очищаем старые записи (старше 1 часа)
        hour_ago = current_time.timestamp() - 3600
        self.access_check_history[user_id] = [
            ts for ts in self.access_check_history[user_id] 
            if ts.timestamp() > hour_ago
        ]
        
        # Проверяем количество повторных нажатий
        recent_checks = len(self.access_check_history[user_id])
        
        # Если пользователь НЕ выполнил необходимые действия и делает повторные проверки
        if not user_data.get('verified') and recent_checks > 1:
            # Проверяем, выполнил ли пользователь действия с последней проверки
            last_check = self.access_check_history[user_id][-2] if recent_checks > 1 else None
            
            if last_check:
                time_since_last = (current_time - last_check).total_seconds()
                
                # Если прошло мало времени и действия не выполнены
                if time_since_last < self.check_cooldown:
                    # Увеличиваем счетчик предупреждений
                    if user_id not in self.user_warnings:
                        self.user_warnings[user_id] = 0
                    self.user_warnings[user_id] += 1
                    
                    warning_count = self.user_warnings[user_id]
                    
                    # Проверяем, не превышен ли лимит предупреждений (блокировка после 2-го предупреждения)
                    if warning_count >= self.max_warnings:
                        # БЛОКИРУЕМ ПОЛЬЗОВАТЕЛЯ
                        self.blocked_users.add(user_id)
                        
                        # Уведомляем администратора о блокировке
                        username_safe = user_data['username'].replace('*', '').replace('_', '').replace('`', '')
                        telegram_username = update.effective_user.username or 'без username'
                        telegram_username_safe = telegram_username.replace('*', '').replace('_', '').replace('`', '')
                        
                        admin_message = f"""🚨 ПОЛЬЗОВАТЕЛЬ ЗАБЛОКИРОВАН!

👤 Пользователь: {username_safe}
🆔 ID: {user_id}
📧 Telegram: @{telegram_username_safe}

⚠️ Причина: Превышение лимита предупреждений (2/2 - после второго предупреждения)
🔄 Проверок: {recent_checks} раз подряд

⏰ Время блокировки: {current_time.strftime('%H:%M:%S %d.%m.%Y')}

💡 Для разблокировки используйте: /unblock_user {user_id}"""
                        
                        try:
                            requests.post(
                                f"https://api.telegram.org/bot{self.bot_token}/sendMessage",
                                data={
                                    'chat_id': self.admin_chat_id,
                                    'text': admin_message
                                }
                            )
                        except Exception as e:
                            logger.error(f"Ошибка уведомления админа о блокировке: {e}")
                        
                        # Логируем блокировку
                        logger.warning(f"🚨 ПОЛЬЗОВАТЕЛЬ ЗАБЛОКИРОВАН: {user_data['username']} (ID: {user_id}) - Превышение лимита предупреждений")
                        self._add_admin_event('blocked', user_id, f"⛔ @{user_data['username']} ЗАБЛОКИРОВАН за {recent_checks} проверок подряд")
                        
                        # Сообщение о блокировке пользователю НА ЕГО ЯЗЫКЕ
                        blocked_text = f"""
{t('blocked_title', user_lang)}

{t('blocked_reason', user_lang)}

{t('blocked_permanent', user_lang)}

{t('blocked_contact', user_lang)}
{t('blocked_user_id', user_lang).format(user_id)}
                        """.strip()
                        
                        await query.edit_message_text(
                            blocked_text,
                            parse_mode='Markdown'
                        )
                        return
                    
                    # Показываем предупреждение с эскалацией
                    if warning_count == 1:
                        warning_level = t('warning_first_title', user_lang)
                        warning_text = t('warning_block_threat', user_lang)
                    else:  # warning_count == 2 (последнее предупреждение)
                        warning_level = t('warning_last_title', user_lang)
                        warning_text = t('warning_block_threat', user_lang)
                    
                    # Базовое сообщение
                    warning_message = f"""
{warning_level}

{t('warning_checks_count', user_lang).format(recent_checks)}

{warning_text}

{t('warning_status_wont_change', user_lang)}

{t('warning_steps_required', user_lang).format(self.min_deposit)}

{t('warning_cooldown', user_lang).format(int((self.check_cooldown - time_since_last) / 60))}

{t('warning_advice', user_lang)}
                    """.strip()
                    
                    # Дополнительное предупреждение для второго предупреждения - убрано для упрощения
                    # Вся необходимая информация уже в warning_message выше
                    
                    keyboard = [
                        [InlineKeyboardButton(t('btn_registration', user_lang), url=self.referral_link)],
                        [InlineKeyboardButton(t('btn_support', user_lang), url="https://t.me/kaktotakxm")],
                        [InlineKeyboardButton(t('btn_back', user_lang), callback_data="back_to_start")]
                    ]
                    reply_markup = InlineKeyboardMarkup(keyboard)
                    
                    await query.edit_message_text(
                        warning_message,
                        reply_markup=reply_markup,
                        parse_mode='Markdown'
                    )
                    return
        
        # Обычное сообщение со статусом
        referral_status = t('access_referral_used', user_lang) if user_data.get('referral_used') else t('access_referral_not_used', user_lang)
        deposit_status = t('access_deposit_confirmed', user_lang) if user_data.get('deposited') else t('access_deposit_not_confirmed', user_lang)
        account_id = user_data.get('pocket_option_id', t('access_id_not_sent', user_lang))
        access_status = t('access_active', user_lang) if user_data.get('verified') else t('access_not_granted', user_lang)
        
        status_message = f"""
{t('access_status_title', user_lang)}

{t('access_user', user_lang).format(user_data['username'])}
{t('access_registration', user_lang).format(user_data['registered_at'][:10])}
{t('access_referral_link', user_lang).format(referral_status)}
{t('access_deposit', user_lang).format(deposit_status)}
{t('access_account_id', user_lang).format(account_id)}
{t('access_status', user_lang).format(access_status)}

        """.strip()
        
        if user_data.get('verified'):
            status_message += t('access_granted_message', user_lang)
            # Сбрасываем историю проверок при успешном доступе
            self.access_check_history[user_id] = []
        else:
            status_message += t('access_not_granted_message', user_lang).format(self.min_deposit)
            
            # Добавляем информацию о повторных проверках
            if recent_checks > 1:
                status_message += t('access_checks_info', user_lang).format(recent_checks)
        
        keyboard = [
            [InlineKeyboardButton(t('btn_registration', user_lang), url=self.referral_link)],
            [InlineKeyboardButton(t('btn_support', user_lang), url="https://t.me/kaktotakxm")],
            [InlineKeyboardButton(t('btn_back', user_lang), callback_data="back_to_start")]
        ]
        reply_markup = InlineKeyboardMarkup(keyboard)
        
        await query.edit_message_text(
            status_message,
            reply_markup=reply_markup,
            parse_mode='Markdown'
        )
        
    async def back_to_start_callback(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Кнопка Назад"""
        query = update.callback_query
        await query.answer()
        
        user_id = query.from_user.id
        username = query.from_user.username or "User"
        user_lang = get_user_language(user_id, self.users_db)
        
        welcome_message = f"""
{t('welcome_title', user_lang).format(username)}

{t('welcome_intro', user_lang)}

{t('welcome_features_title', user_lang)}
{t('welcome_feature_1', user_lang)}
{t('welcome_feature_2', user_lang)}
{t('welcome_feature_3', user_lang)}
{t('welcome_feature_4', user_lang)}

{t('welcome_how_title', user_lang)}

{t('welcome_step_1', user_lang)}
   [РЕГИСТРАЦИЯ НА ПЛАТФОРМЕ]({self.referral_link})

{t('welcome_step_2', user_lang)}
{t('welcome_step_2_bonus', user_lang)}
{t('welcome_step_2_promo', user_lang)}

{t('welcome_step_3', user_lang)}

{t('welcome_step_4', user_lang)}

{t('welcome_traders_only', user_lang)}

{t('welcome_support', user_lang)}
        """.strip()
        
        # Многоязычные кнопки
        keyboard = [
            [InlineKeyboardButton(t('btn_instruction', user_lang), callback_data="instruction")],
            [InlineKeyboardButton(t('btn_registration', user_lang), url=self.referral_link)],
            [InlineKeyboardButton(t('btn_check_access', user_lang), callback_data="check_access")],
            [InlineKeyboardButton(t('btn_support', user_lang), url="https://t.me/kaktotakxm")],
            [InlineKeyboardButton(t('btn_language', user_lang), callback_data="choose_language")]
        ]
        reply_markup = InlineKeyboardMarkup(keyboard)
        
        # Отправляем фото с приветствием
        try:
            with open('welcome.jpg', 'rb') as photo:
                await context.bot.send_photo(
                    chat_id=query.from_user.id,
                    photo=photo,
                    caption=welcome_message, 
                    reply_markup=reply_markup,
                    parse_mode='Markdown'
                )
        except FileNotFoundError:
            # Если фото нет, отправляем обычное сообщение
            await query.edit_message_text(
                welcome_message, 
                reply_markup=reply_markup,
                parse_mode='Markdown'
            )
        except Exception as e:
            logger.error(f"Ошибка отправки фото: {e}")
            await query.edit_message_text(
                welcome_message, 
                reply_markup=reply_markup,
                parse_mode='Markdown'
            )
        
    async def language_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Команда /language - выбор языка"""
        user_id = update.effective_user.id
        user_lang = get_user_language(user_id, self.users_db)
        
        keyboard = get_language_keyboard()
        reply_markup = InlineKeyboardMarkup(keyboard)
        
        await update.message.reply_text(
            t('language_select', user_lang),
            reply_markup=reply_markup,
            parse_mode='Markdown'
        )
    
    async def language_callback(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Обработчик выбора языка"""
        query = update.callback_query
        await query.answer()
        
        user_id = query.from_user.id
        username = query.from_user.username or "User"
        
        # Извлекаем код языка из callback_data (формат: "lang_ru", "lang_en" и т.д.)
        if query.data.startswith("lang_"):
            lang_code = query.data[5:]  # Убираем префикс "lang_"
            
            # Проверяем, был ли это первый выбор языка (новый пользователь)
            is_first_language_selection = user_id not in self.users_db or 'language' not in self.users_db.get(user_id, {})
            
            # Устанавливаем язык пользователя
            if set_user_language(user_id, self.users_db, lang_code):
                self._save_users_db()
                # Отправляем подтверждение на новом языке
                confirmation_text = t('language_changed', lang_code)
                await query.edit_message_text(
                    confirmation_text,
                    parse_mode='Markdown'
                )
                
                # Если это первый выбор языка - уведомляем администратора
                if is_first_language_selection:
                    logger.info(f"🆕 Новый пользователь выбрал язык: {username} (ID: {user_id}) - {lang_code}")
                    self._add_admin_event('new_user', user_id, f"Новый пользователь @{username} выбрал язык: {lang_code}")
                    await self.notify_admin_new_user(user_id, username, update)
                
                # Через 2 секунды показываем главное меню на новом языке
                await asyncio.sleep(2)
                
                welcome_message = f"""
{t('welcome_title', lang_code).format(username)}

{t('welcome_intro', lang_code)}

{t('welcome_features_title', lang_code)}
{t('welcome_feature_1', lang_code)}
{t('welcome_feature_2', lang_code)}
{t('welcome_feature_3', lang_code)}
{t('welcome_feature_4', lang_code)}

{t('welcome_how_title', lang_code)}

{t('welcome_step_1', lang_code)}
   [РЕГИСТРАЦИЯ НА ПЛАТФОРМЕ]({self.referral_link})

{t('welcome_step_2', lang_code)}
{t('welcome_step_2_bonus', lang_code)}
{t('welcome_step_2_promo', lang_code)}

{t('welcome_step_3', lang_code)}

{t('welcome_step_4', lang_code)}

{t('welcome_traders_only', lang_code)}

{t('welcome_support', lang_code)}
                """.strip()
                
                keyboard = [
                    [InlineKeyboardButton(t('btn_instruction', lang_code), callback_data="instruction")],
                    [InlineKeyboardButton(t('btn_registration', lang_code), url=self.referral_link)],
                    [InlineKeyboardButton(t('btn_check_access', lang_code), callback_data="check_access")],
                    [InlineKeyboardButton(t('btn_support', lang_code), url="https://t.me/kaktotakxm")],
                    [InlineKeyboardButton(t('btn_language', lang_code), callback_data="choose_language")]
                ]
                reply_markup = InlineKeyboardMarkup(keyboard)
                
                # Отправляем фото с приветствием
                try:
                    with open('welcome.jpg', 'rb') as photo:
                        await context.bot.send_photo(
                            chat_id=query.from_user.id,
                            photo=photo,
                            caption=welcome_message,
                            reply_markup=reply_markup,
                            parse_mode='Markdown'
                        )
                except FileNotFoundError:
                    # Если фото нет, отправляем обычное сообщение
                    await query.edit_message_text(
                        welcome_message,
                        reply_markup=reply_markup,
                        parse_mode='Markdown'
                    )
                except Exception as e:
                    logger.error(f"Ошибка отправки фото: {e}")
                    await query.edit_message_text(
                        welcome_message,
                        reply_markup=reply_markup,
                        parse_mode='Markdown'
                    )
    
    async def choose_language_callback(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Обработчик кнопки выбора языка из меню"""
        query = update.callback_query
        await query.answer()
        
        user_id = query.from_user.id
        user_lang = get_user_language(user_id, self.users_db)
        
        keyboard = get_language_keyboard()
        reply_markup = InlineKeyboardMarkup(keyboard)
        
        await query.edit_message_text(
            t('language_select', user_lang),
            reply_markup=reply_markup,
            parse_mode='Markdown'
        )
    
    async def handle_message(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Обработка текстовых сообщений"""
        # Проверяем, что у нас есть пользователь
        if not update.effective_user:
            logger.error("Получено сообщение без информации о пользователе")
            return
            
        user_id = update.effective_user.id
        user_lang = get_user_language(user_id, self.users_db)
        message_text = update.message.text.strip()
        
        # Проверяем если это ID аккаунта PocketOption (с PO или без)
        if (message_text.upper().startswith('PO') and len(message_text) >= 5) or \
           (message_text.isdigit() and len(message_text) >= 5):
            await self.handle_pocket_option_id(user_id, message_text, update)
        else:
            # Обычное сообщение
            await update.message.reply_text(
                t('error_unknown_message', user_lang),
                parse_mode='Markdown'
            )
            
    async def handle_pocket_option_id(self, user_id: int, po_id: str, update: Update):
        """Обработка ID аккаунта PocketOption"""
        
        logger.info(f"🆔 Получен ID аккаунта от пользователя {user_id}: {po_id}")
        user_lang = get_user_language(user_id, self.users_db)
        
        if user_id not in self.users_db:
            logger.warning(f"⚠️ Пользователь {user_id} не найден в базе данных")
            await update.message.reply_text(
                t('error_use_start', user_lang),
                parse_mode='Markdown'
            )
            return
            
        # Форматируем ID (добавляем PO если нет)
        if po_id.upper().startswith('PO'):
            formatted_id = po_id.upper()
        else:
            formatted_id = f"PO{po_id}"
            
        logger.info(f"📝 Форматированный ID: {formatted_id}")
            
        # Сохраняем ID
        self.users_db[user_id]['pocket_option_id'] = formatted_id
        self._save_users_db()
        
        # Сбрасываем историю проверок доступа при отправке ID
        if user_id in self.access_check_history:
            self.access_check_history[user_id] = []
            logger.info(f"🔄 Сброшена история проверок для пользователя {user_id}")
        
        # Сбрасываем предупреждения при отправке ID
        if user_id in self.user_warnings:
            self.user_warnings[user_id] = 0
            logger.info(f"🔄 Сброшены предупреждения для пользователя {user_id}")
        
        # Уведомляем администратора об отправке ID
        logger.info(f"📤 Пользователь {user_id} отправил ID: {formatted_id}")
        username = self.users_db[user_id].get('username', 'Unknown')
        self._add_admin_event('id_sent', user_id, f"@{username} отправил PocketOption ID: {formatted_id}")
        await self.notify_admin_id_sent(user_id, formatted_id, update)
        
        # Ответ пользователю на его языке
        response_text = f"""
{t('id_received_title', user_lang).format(formatted_id)}

{t('id_checking', user_lang)}

{t('id_processing_time', user_lang)}

{t('id_what_checked', user_lang)}

{t('id_after_verification', user_lang)}

{t('id_questions', user_lang)}
        """.strip()
        
        await update.message.reply_text(
            response_text,
            parse_mode='Markdown'
        )
        
    async def help_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Команда /help"""
        user_id = update.effective_user.id
        user_lang = get_user_language(user_id, self.users_db)
        
        help_text = f"""
{t('help_title', user_lang)}

{t('help_commands', user_lang)}

{t('help_send_id', user_lang)}

🔗 *{t('btn_registration', user_lang)}:*
{self.referral_link}

{t('help_min_deposit', user_lang).format(self.min_deposit)}

📞 *{t('btn_support', user_lang)}:* @kaktotakxm

{t('help_response_time', user_lang)}
        """.strip()
        
        await update.message.reply_text(help_text, parse_mode='Markdown')
        
    async def status_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Команда /status"""
        user_id = update.effective_user.id
        user_lang = get_user_language(user_id, self.users_db)
        
        if user_id not in self.users_db:
            await update.message.reply_text(
                t('error_not_registered', user_lang),
                parse_mode='Markdown'
            )
            return
            
        user_data = self.users_db[user_id]
        
        status_text = f"""
{t('status_title', user_lang)}

{t('access_user', user_lang).format(user_data['username'])}
{t('access_registration', user_lang).format(user_data['registered_at'][:10])}
{t('access_account_id', user_lang).format(user_data.get('pocket_option_id', t('access_id_not_sent', user_lang)))}
{t('access_status', user_lang).format(t('access_active', user_lang) if user_data.get('verified') else t('access_not_granted', user_lang))}

        """.strip()
        
        if not user_data.get('verified'):
            status_text += t('status_not_verified', user_lang).format(self.min_deposit)
        
        await update.message.reply_text(status_text, parse_mode='Markdown')
    
    async def notify_admin_new_user(self, user_id: int, username: str, update: Update):
        """Уведомление администратора о новом пользователе"""
        # Безопасное получение username
        telegram_username = "без username"
        if update.effective_user and update.effective_user.username:
            telegram_username = f"@{update.effective_user.username}"
        
        # Безопасное создание сообщения без Markdown проблем
        admin_message = f"""🆕 НОВЫЙ ПОЛЬЗОВАТЕЛЬ ЗАРЕГИСТРИРОВАЛСЯ!

👤 Пользователь: {username}
🆔 ID: {user_id}
📧 Telegram: {telegram_username}
📅 Время регистрации: {datetime.now().strftime('%H:%M:%S %d.%m.%Y')}

📊 Статистика:
• Всего пользователей: {len(self.users_db)}
• Новых сегодня: {len([u for u in self.users_db.values() if u['registered_at'][:10] == datetime.now().strftime('%Y-%m-%d')])}

💡 Ожидайте отправки ID аккаунта для верификации"""
        
        try:
            # Используем синхронный requests.post в отдельном потоке
            
            def send_notification():
                try:
                    logger.info(f"📤 Отправляем уведомление администратору (ID: {self.admin_chat_id})")
                    logger.info(f"📝 Длина сообщения: {len(admin_message)} символов")
                    
                    response = requests.post(
                        f"https://api.telegram.org/bot{self.bot_token}/sendMessage",
                        data={
                            'chat_id': self.admin_chat_id,
                            'text': admin_message
                        },
                        timeout=10
                    )
                    
                    logger.info(f"📡 Ответ сервера: HTTP {response.status_code}")
                    
                    if response.status_code == 200:
                        logger.info(f"✅ Уведомление о новом пользователе отправлено администратору: {username} (ID: {user_id})")
                    else:
                        logger.error(f"❌ Ошибка отправки уведомления: HTTP {response.status_code}")
                        logger.error(f"❌ Ответ сервера: {response.text}")
                except Exception as e:
                    logger.error(f"❌ Ошибка отправки уведомления администратору: {e}")
            
            # Запускаем в отдельном потоке
            thread = threading.Thread(target=send_notification)
            thread.daemon = True
            thread.start()
            
        except Exception as e:
            logger.error(f"❌ Критическая ошибка при отправке уведомления: {e}")
    
    async def notify_admin_id_sent(self, user_id: int, formatted_id: str, update: Update):
        """Уведомление администратора об отправке ID аккаунта"""
        # Безопасное получение username
        telegram_username = "без username"
        if update.effective_user and update.effective_user.username:
            telegram_username = f"@{update.effective_user.username}"
        
        # Безопасное создание сообщения без Markdown проблем
        admin_message = f"""🔔 НОВЫЙ ЗАПРОС ДОСТУПА

👤 Пользователь: {self.users_db[user_id]['username']}
🆔 ID: {user_id}
📧 Telegram: {telegram_username}
🆔 PocketOption ID: {formatted_id}

⏰ Время: {datetime.now().strftime('%H:%M:%S %d.%m.%Y')}

🔗 Реферальная ссылка: {self.referral_link}

✅ Проверьте:
1. Регистрация по реферальной ссылке
2. Пополнение минимум ${self.min_deposit}
3. Предоставьте доступ если все ОК"""
        
        try:
            # Используем синхронный requests.post в отдельном потоке
            
            def send_notification():
                try:
                    logger.info(f"📤 Отправляем уведомление о ID администратору (ID: {self.admin_chat_id})")
                    logger.info(f"📝 Длина сообщения: {len(admin_message)} символов")
                    
                    response = requests.post(
                        f"https://api.telegram.org/bot{self.bot_token}/sendMessage",
                        data={
                            'chat_id': self.admin_chat_id,
                            'text': admin_message
                        },
                        timeout=10
                    )
                    
                    logger.info(f"📡 Ответ сервера: HTTP {response.status_code}")
                    
                    if response.status_code == 200:
                        logger.info(f"✅ Уведомление об отправке ID отправлено администратору: {self.users_db[user_id]['username']} (ID: {user_id})")
                    else:
                        logger.error(f"❌ Ошибка отправки уведомления об ID: HTTP {response.status_code}")
                        logger.error(f"❌ Ответ сервера: {response.text}")
                except Exception as e:
                    logger.error(f"❌ Ошибка отправки уведомления об ID администратору: {e}")
            
            # Запускаем в отдельном потоке
            thread = threading.Thread(target=send_notification)
            thread.daemon = True
            thread.start()
            
        except Exception as e:
            logger.error(f"❌ Критическая ошибка при отправке уведомления об ID: {e}")
    
    async def admin_stats_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Команда /admin_stats - только для администратора"""
        user_id = update.effective_user.id
        
        # Проверяем, что это администратор
        if str(user_id) != self.admin_chat_id:
            await update.message.reply_text(
                "❌ У вас нет прав для выполнения этой команды",
                parse_mode='Markdown'
            )
            return
        
        # Статистика проверок доступа
        total_users = len(self.users_db)
        users_with_checks = len(self.access_check_history)
        total_checks = sum(len(checks) for checks in self.access_check_history.values())
        
        # Находим пользователей с наибольшим количеством проверок
        top_checkers = []
        for uid, checks in self.access_check_history.items():
            if len(checks) > 1:  # Только тех, кто проверял более 1 раза
                username = self.users_db.get(uid, {}).get('username', 'Unknown')
                top_checkers.append((username, len(checks)))
        
        top_checkers.sort(key=lambda x: x[1], reverse=True)
        
        # Статистика заблокированных пользователей
        blocked_count = len(self.blocked_users)
        warned_users = len([uid for uid, count in self.user_warnings.items() if count > 0])
        
        # Статистика новых пользователей
        today = datetime.now().strftime('%Y-%m-%d')
        new_today = len([u for u in self.users_db.values() if u['registered_at'][:10] == today])
        week_ago = (datetime.now().replace(hour=0, minute=0, second=0, microsecond=0) - timedelta(days=7)).strftime('%Y-%m-%d')
        new_week = len([u for u in self.users_db.values() if u['registered_at'][:10] >= week_ago])
        
        stats_text = f"""
📊 *СТАТИСТИКА ПРОВЕРОК ДОСТУПА*

👥 *Общая статистика:*
• Всего пользователей: {total_users}
• Новых сегодня: {new_today}
• Новых за неделю: {new_week}
• Пользователей с проверками: {users_with_checks}
• Всего проверок: {total_checks}
• Пользователей с предупреждениями: {warned_users}
• Заблокированных пользователей: {blocked_count}

🔄 *Топ повторных проверок:*
        """.strip()
        
        if top_checkers:
            for i, (username, count) in enumerate(top_checkers[:5], 1):
                stats_text += f"\n{i}. @{username}: {count} проверок"
        else:
            stats_text += "\n• Нет повторных проверок"
        
        stats_text += f"""

⚙️ *Настройки:*
• Максимум проверок: {self.max_repeated_checks}
• Кулдаун: {self.check_cooldown // 60} мин.
• Максимум предупреждений: {self.max_warnings} (1-е, 2-е = бан)

💡 *Управление:*
• /reset_checks - сбросить все проверки
• /blocked_users - список заблокированных
• /unblock_user <ID> - разблокировать пользователя
        """.strip()
        
        await update.message.reply_text(stats_text, parse_mode='Markdown')
    
    async def reset_checks_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Команда /reset_checks - сброс всех проверок (только для админа)"""
        user_id = update.effective_user.id
        
        # Проверяем, что это администратор
        if str(user_id) != self.admin_chat_id:
            await update.message.reply_text(
                "❌ У вас нет прав для выполнения этой команды",
                parse_mode='Markdown'
            )
            return
        
        # Сбрасываем все проверки
        self.access_check_history = {}
        self.user_warnings = {}
        
        await update.message.reply_text(
            "✅ История всех проверок доступа и предупреждений сброшена",
            parse_mode='Markdown'
        )
    
    async def unblock_user_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Команда /unblock_user <user_id> - разблокировка пользователя (только для админа)"""
        user_id = update.effective_user.id
        
        # Проверяем, что это администратор
        if str(user_id) != self.admin_chat_id:
            await update.message.reply_text(
                "❌ У вас нет прав для выполнения этой команды",
                parse_mode='Markdown'
            )
            return
        
        # Получаем ID пользователя для разблокировки
        if not context.args:
            await update.message.reply_text(
                "❌ Укажите ID пользователя для разблокировки\n"
                "Пример: /unblock_user 123456789",
                parse_mode='Markdown'
            )
            return
        
        try:
            target_user_id = int(context.args[0])
        except ValueError:
            await update.message.reply_text(
                "❌ Неверный формат ID пользователя",
                parse_mode='Markdown'
            )
            return
        
        # Разблокируем пользователя
        if target_user_id in self.blocked_users:
            self.blocked_users.remove(target_user_id)
            
            # Сбрасываем предупреждения
            if target_user_id in self.user_warnings:
                self.user_warnings[target_user_id] = 0
            
            # Сбрасываем историю проверок
            if target_user_id in self.access_check_history:
                self.access_check_history[target_user_id] = []
            
            await update.message.reply_text(
                f"✅ Пользователь {target_user_id} разблокирован\n"
                f"• Предупреждения сброшены\n"
                f"• История проверок очищена\n\n"
                f"💡 Пользователь может продолжить использование бота",
                parse_mode='Markdown'
            )
            
            # Уведомление пользователю отключено
            logger.info(f"✅ Пользователь {target_user_id} разблокирован администратором")
        else:
            await update.message.reply_text(
                f"ℹ️ Пользователь {target_user_id} не заблокирован",
                parse_mode='Markdown'
            )
    
    async def blocked_users_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Команда /blocked_users - список заблокированных пользователей (только для админа)"""
        user_id = update.effective_user.id
        
        # Проверяем, что это администратор
        if str(user_id) != self.admin_chat_id:
            await update.message.reply_text(
                "❌ У вас нет прав для выполнения этой команды",
                parse_mode='Markdown'
            )
            return
        
        if not self.blocked_users:
            await update.message.reply_text(
                "✅ Заблокированных пользователей нет",
                parse_mode='Markdown'
            )
            return
        
        blocked_list = "🚫 *ЗАБЛОКИРОВАННЫЕ ПОЛЬЗОВАТЕЛИ:*\n\n"
        
        for blocked_id in self.blocked_users:
            username = self.users_db.get(blocked_id, {}).get('username', 'Unknown')
            warnings = self.user_warnings.get(blocked_id, 0)
            blocked_list += f"• ID: {blocked_id}\n"
            blocked_list += f"  Username: @{username}\n"
            blocked_list += f"  Предупреждений: {warnings}\n\n"
        
        blocked_list += f"💡 *Для разблокировки используйте:* /unblock_user <ID>"
        
        await update.message.reply_text(blocked_list, parse_mode='Markdown')
    
    async def admin_panel_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Команда /admin_panel - панель администратора"""
        user_id = update.effective_user.id
        
        # Проверяем, что это администратор
        if str(user_id) != self.admin_chat_id:
            await update.message.reply_text(
                "❌ У вас нет прав для выполнения этой команды",
                parse_mode='Markdown'
            )
            return
        
        # Статистика пользователей
        total_users = len(self.users_db)
        verified_users = len([u for u in self.users_db.values() if u.get('verified')])
        with_id = len([u for u in self.users_db.values() if u.get('pocket_option_id')])
        with_deposit = len([u for u in self.users_db.values() if u.get('deposited')])
        
        # Статистика по датам
        today = datetime.now().strftime('%Y-%m-%d')
        new_today = len([u for u in self.users_db.values() if u.get('registered_at', '')[:10] == today])
        week_ago = (datetime.now() - timedelta(days=7)).strftime('%Y-%m-%d')
        new_week = len([u for u in self.users_db.values() if u.get('registered_at', '')[:10] >= week_ago])
        
        # Статистика по языкам
        languages = {}
        for user_data in self.users_db.values():
            lang = user_data.get('language', 'Не выбран')
            languages[lang] = languages.get(lang, 0) + 1
        
        lang_stats = '\n'.join([f"  • {lang}: {count}" for lang, count in sorted(languages.items(), key=lambda x: x[1], reverse=True)])
        
        panel_text = f"""
👑 *ПАНЕЛЬ АДМИНИСТРАТОРА*

📊 *СТАТИСТИКА ПОЛЬЗОВАТЕЛЕЙ:*

👥 *Общая информация:*
• Всего пользователей: {total_users}
• Верифицированных: {verified_users}
• Отправили ID: {with_id}
• С депозитом: {with_deposit}

📅 *Новые пользователи:*
• Сегодня: {new_today}
• За неделю: {new_week}

🌐 *Распределение по языкам:*
{lang_stats}

⚠️ *Система безопасности:*
• С предупреждениями: {len([uid for uid, count in self.user_warnings.items() if count > 0])}
• Заблокированных: {len(self.blocked_users)}

💾 *Файл базы данных:* `{self.users_db_file}`
        """.strip()
        
        keyboard = [
            [InlineKeyboardButton("📥 Скачать таблицу пользователей", callback_data="admin_export_users")],
            [InlineKeyboardButton("📋 Последние события", callback_data="admin_events")],
            [InlineKeyboardButton("🔄 Обновить статистику", callback_data="admin_refresh")],
            [InlineKeyboardButton("📊 Детальная статистика", callback_data="admin_stats")],
            [InlineKeyboardButton("🗑️ Очистить статистику", callback_data="admin_clear_stats")]
        ]
        reply_markup = InlineKeyboardMarkup(keyboard)
        
        await update.message.reply_text(
            panel_text,
            reply_markup=reply_markup,
            parse_mode='Markdown'
        )
    
    async def admin_export_callback(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Обработчик экспорта пользователей"""
        query = update.callback_query
        await query.answer()
        
        user_id = query.from_user.id
        
        # Проверяем, что это администратор
        if str(user_id) != self.admin_chat_id:
            await query.edit_message_text(
                "❌ У вас нет прав для выполнения этой команды",
                parse_mode='Markdown'
            )
            return
        
        await query.edit_message_text(
            "⏳ Генерирую таблицу пользователей...",
            parse_mode='Markdown'
        )
        
        # Экспортируем пользователей
        csv_file = self._export_users_csv()
        
        if csv_file:
            try:
                # Отправляем файл
                with open(csv_file, 'rb') as f:
                    await context.bot.send_document(
                        chat_id=self.admin_chat_id,
                        document=f,
                        filename=csv_file,
                        caption=f"📊 *Таблица пользователей*\n\nВсего записей: {len(self.users_db)}\nДата экспорта: {datetime.now().strftime('%d.%m.%Y %H:%M:%S')}",
                        parse_mode='Markdown'
                    )
                
                # Удаляем временный файл
                import os
                os.remove(csv_file)
                
                await query.edit_message_text(
                    "✅ Таблица пользователей отправлена!",
                    parse_mode='Markdown'
                )
            except Exception as e:
                logger.error(f"❌ Ошибка отправки файла: {e}")
                await query.edit_message_text(
                    f"❌ Ошибка отправки файла: {e}",
                    parse_mode='Markdown'
                )
        else:
            await query.edit_message_text(
                "❌ Ошибка создания файла экспорта",
                parse_mode='Markdown'
            )
    
    async def admin_refresh_callback(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Обработчик обновления статистики"""
        query = update.callback_query
        await query.answer("🔄 Обновляю статистику...")
        
        user_id = query.from_user.id
        
        # Проверяем, что это администратор
        if str(user_id) != self.admin_chat_id:
            await query.edit_message_text(
                "❌ У вас нет прав для выполнения этой команды",
                parse_mode='Markdown'
            )
            return
        
        # Статистика пользователей
        total_users = len(self.users_db)
        verified_users = len([u for u in self.users_db.values() if u.get('verified')])
        with_id = len([u for u in self.users_db.values() if u.get('pocket_option_id')])
        with_deposit = len([u for u in self.users_db.values() if u.get('deposited')])
        
        # Статистика по датам
        today = datetime.now().strftime('%Y-%m-%d')
        new_today = len([u for u in self.users_db.values() if u.get('registered_at', '')[:10] == today])
        week_ago = (datetime.now() - timedelta(days=7)).strftime('%Y-%m-%d')
        new_week = len([u for u in self.users_db.values() if u.get('registered_at', '')[:10] >= week_ago])
        
        # Статистика по языкам
        languages = {}
        for user_data in self.users_db.values():
            lang = user_data.get('language', 'Не выбран')
            languages[lang] = languages.get(lang, 0) + 1
        
        lang_stats = '\n'.join([f"  • {lang}: {count}" for lang, count in sorted(languages.items(), key=lambda x: x[1], reverse=True)])
        
        # Добавляем время обновления для различия контента (с микросекундами)
        update_time = datetime.now().strftime('%H:%M:%S.%f')[:-3]  # миллисекунды
        
        panel_text = f"""👑 ПАНЕЛЬ АДМИНИСТРАТОРА

📊 СТАТИСТИКА ПОЛЬЗОВАТЕЛЕЙ:

👥 Общая информация:
• Всего пользователей: {total_users}
• Верифицированных: {verified_users}
• Отправили ID: {with_id}
• С депозитом: {with_deposit}

📅 Новые пользователи:
• Сегодня: {new_today}
• За неделю: {new_week}

🌐 Распределение по языкам:
{lang_stats}

⚠️ Система безопасности:
• С предупреждениями: {len([uid for uid, count in self.user_warnings.items() if count > 0])}
• Заблокированных: {len(self.blocked_users)}

💾 Файл базы данных: {self.users_db_file}

🕐 Обновлено: {update_time}"""
        
        keyboard = [
            [InlineKeyboardButton("📥 Скачать таблицу пользователей", callback_data="admin_export_users")],
            [InlineKeyboardButton("📋 Последние события", callback_data="admin_events")],
            [InlineKeyboardButton("🔄 Обновить статистику", callback_data="admin_refresh")],
            [InlineKeyboardButton("📊 Детальная статистика", callback_data="admin_stats")],
            [InlineKeyboardButton("🗑️ Очистить статистику", callback_data="admin_clear_stats")]
        ]
        reply_markup = InlineKeyboardMarkup(keyboard)
        
        await query.edit_message_text(
            panel_text,
            reply_markup=reply_markup
        )
    
    async def admin_stats_detailed_callback(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Обработчик детальной статистики"""
        query = update.callback_query
        await query.answer()
        
        user_id = query.from_user.id
        
        # Проверяем, что это администратор
        if str(user_id) != self.admin_chat_id:
            await query.edit_message_text(
                "❌ У вас нет прав для выполнения этой команды",
                parse_mode='Markdown'
            )
            return
        
        # Статистика проверок доступа
        total_users = len(self.users_db)
        users_with_checks = len(self.access_check_history)
        total_checks = sum(len(checks) for checks in self.access_check_history.values())
        
        # Находим пользователей с наибольшим количеством проверок
        top_checkers = []
        for uid, checks in self.access_check_history.items():
            if len(checks) > 1:  # Только тех, кто проверял более 1 раза
                username = self.users_db.get(uid, {}).get('username', 'Unknown')
                top_checkers.append((username, len(checks)))
        
        top_checkers.sort(key=lambda x: x[1], reverse=True)
        
        # Статистика заблокированных пользователей
        blocked_count = len(self.blocked_users)
        warned_users = len([uid for uid, count in self.user_warnings.items() if count > 0])
        
        # Статистика новых пользователей
        today = datetime.now().strftime('%Y-%m-%d')
        new_today = len([u for u in self.users_db.values() if u['registered_at'][:10] == today])
        week_ago = (datetime.now().replace(hour=0, minute=0, second=0, microsecond=0) - timedelta(days=7)).strftime('%Y-%m-%d')
        new_week = len([u for u in self.users_db.values() if u['registered_at'][:10] >= week_ago])
        
        stats_text = f"""📊 СТАТИСТИКА ПРОВЕРОК ДОСТУПА

👥 Общая статистика:
• Всего пользователей: {total_users}
• Новых сегодня: {new_today}
• Новых за неделю: {new_week}
• Пользователей с проверками: {users_with_checks}
• Всего проверок: {total_checks}
• Пользователей с предупреждениями: {warned_users}
• Заблокированных пользователей: {blocked_count}

🔄 Топ повторных проверок:"""
        
        if top_checkers:
            for i, (username, count) in enumerate(top_checkers[:5], 1):
                # Безопасное имя пользователя
                safe_username = username.replace('*', '').replace('_', '').replace('`', '') if username else 'Unknown'
                stats_text += f"\n{i}. @{safe_username}: {count} проверок"
        else:
            stats_text += "\n• Нет повторных проверок"
        
        stats_text += f"""

⚙️ Настройки:
• Максимум проверок: {self.max_repeated_checks}
• Кулдаун: {self.check_cooldown // 60} мин.
• Максимум предупреждений: {self.max_warnings} (1-е, 2-е = бан)

💡 Управление:
• /reset_checks - сбросить все проверки
• /blocked_users - список заблокированных
• /unblock_user <ID> - разблокировать пользователя"""
        
        keyboard = [
            [InlineKeyboardButton("◀️ Назад к панели", callback_data="back_to_admin_panel")]
        ]
        reply_markup = InlineKeyboardMarkup(keyboard)
        
        await query.edit_message_text(
            stats_text,
            reply_markup=reply_markup
        )
    
    async def admin_events_callback(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Обработчик просмотра последних событий"""
        query = update.callback_query
        await query.answer("🔄 Обновляю события...")
        
        user_id = query.from_user.id
        
        # Проверяем, что это администратор
        if str(user_id) != self.admin_chat_id:
            await query.edit_message_text(
                "❌ У вас нет прав для выполнения этой команды",
                parse_mode='Markdown'
            )
            return
        
        # Добавляем время обновления для различия контента
        update_time = datetime.now().strftime('%H:%M:%S.%f')[:-3]  # миллисекунды
        
        if not self.admin_events:
            events_text = f"""📋 ПОСЛЕДНИЕ СОБЫТИЯ

ℹ️ Пока нет событий для отображения.

События появятся когда:
• Зарегистрируются новые пользователи
• Пользователи отправят PocketOption ID
• Произойдут блокировки

🕐 Обновлено: {update_time}"""
        else:
            events_text = f"📋 ПОСЛЕДНИЕ СОБЫТИЯ\n\n"
            
            # Показываем последние 20 событий
            for i, event in enumerate(self.admin_events[:20], 1):
                timestamp = datetime.fromisoformat(event['timestamp'])
                time_str = timestamp.strftime('%H:%M:%S %d.%m')
                
                # Иконки для разных типов событий
                icons = {
                    'new_user': '🆕',
                    'id_sent': '🆔',
                    'blocked': '⛔',
                    'unblocked': '✅',
                    'verified': '✅'
                }
                icon = icons.get(event['event_type'], '📌')
                
                events_text += f"{i}. {icon} {time_str} - {event['description']}\n"
            
            if len(self.admin_events) > 20:
                events_text += f"\n...и еще {len(self.admin_events) - 20} событий"
            
            events_text += f"\n\n🕐 Обновлено: {update_time}"
        
        keyboard = [
            [InlineKeyboardButton("🔄 Обновить", callback_data="admin_events")],
            [InlineKeyboardButton("◀️ Назад к панели", callback_data="back_to_admin_panel")]
        ]
        reply_markup = InlineKeyboardMarkup(keyboard)
        
        await query.edit_message_text(
            events_text,
            reply_markup=reply_markup
        )
    
    async def back_to_admin_panel_callback(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Обработчик кнопки 'Назад к панели'"""
        query = update.callback_query
        await query.answer()
        
        user_id = query.from_user.id
        
        # Проверяем, что это администратор
        if str(user_id) != self.admin_chat_id:
            await query.edit_message_text(
                "❌ У вас нет прав для выполнения этой команды",
                parse_mode='Markdown'
            )
            return
        
        # Статистика пользователей
        total_users = len(self.users_db)
        verified_users = len([u for u in self.users_db.values() if u.get('verified')])
        with_id = len([u for u in self.users_db.values() if u.get('pocket_option_id')])
        with_deposit = len([u for u in self.users_db.values() if u.get('deposited')])
        
        # Статистика по датам
        today = datetime.now().strftime('%Y-%m-%d')
        new_today = len([u for u in self.users_db.values() if u.get('registered_at', '')[:10] == today])
        week_ago = (datetime.now() - timedelta(days=7)).strftime('%Y-%m-%d')
        new_week = len([u for u in self.users_db.values() if u.get('registered_at', '')[:10] >= week_ago])
        
        # Статистика по языкам
        languages = {}
        for user_data in self.users_db.values():
            lang = user_data.get('language', 'Не выбран')
            languages[lang] = languages.get(lang, 0) + 1
        
        lang_stats = '\n'.join([f"  • {lang}: {count}" for lang, count in sorted(languages.items(), key=lambda x: x[1], reverse=True)])
        
        panel_text = f"""
👑 *ПАНЕЛЬ АДМИНИСТРАТОРА*

📊 *СТАТИСТИКА ПОЛЬЗОВАТЕЛЕЙ:*

👥 *Общая информация:*
• Всего пользователей: {total_users}
• Верифицированных: {verified_users}
• Отправили ID: {with_id}
• С депозитом: {with_deposit}

📅 *Новые пользователи:*
• Сегодня: {new_today}
• За неделю: {new_week}

🌐 *Распределение по языкам:*
{lang_stats}

⚠️ *Система безопасности:*
• С предупреждениями: {len([uid for uid, count in self.user_warnings.items() if count > 0])}
• Заблокированных: {len(self.blocked_users)}

💾 *Файл базы данных:* `{self.users_db_file}`
        """.strip()
        
        keyboard = [
            [InlineKeyboardButton("📥 Скачать таблицу пользователей", callback_data="admin_export_users")],
            [InlineKeyboardButton("📋 Последние события", callback_data="admin_events")],
            [InlineKeyboardButton("🔄 Обновить статистику", callback_data="admin_refresh")],
            [InlineKeyboardButton("📊 Детальная статистика", callback_data="admin_stats")],
            [InlineKeyboardButton("🗑️ Очистить статистику", callback_data="admin_clear_stats")]
        ]
        reply_markup = InlineKeyboardMarkup(keyboard)
        
        await query.edit_message_text(
            panel_text,
            reply_markup=reply_markup,
            parse_mode='Markdown'
        )
    
    async def admin_clear_stats_callback(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Обработчик очистки статистики"""
        query = update.callback_query
        await query.answer()
        
        user_id = query.from_user.id
        
        # Проверяем, что это администратор
        if str(user_id) != self.admin_chat_id:
            await query.edit_message_text(
                "❌ У вас нет прав для выполнения этой команды",
                parse_mode='Markdown'
            )
            return
        
        # Показываем предупреждение с подтверждением
        confirm_text = """⚠️ ВНИМАНИЕ! ОЧИСТКА СТАТИСТИКИ
    
    Выберите тип очистки:
    
    🔄 СБРОС СТАТУСОВ:
    • Сбросить верификацию и депозиты
    • Очистить историю проверок
    • Очистить предупреждения и блокировки
    
    🗑️ ПОЛНАЯ ОЧИСТКА:
    • Удалить ВСЕХ пользователей
    • Очистить всю статистику
    • Начать с чистого листа"""
        
        keyboard = [
            [InlineKeyboardButton("🔄 Сбросить статусы", callback_data="admin_clear_confirm")],
            [InlineKeyboardButton("🗑️ Удалить всех пользователей", callback_data="admin_clear_full")],
            [InlineKeyboardButton("❌ Отмена", callback_data="back_to_admin_panel")]
        ]
        reply_markup = InlineKeyboardMarkup(keyboard)
        
        await query.edit_message_text(
            confirm_text,
            reply_markup=reply_markup
        )
    
    async def admin_clear_confirm_callback(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Обработчик подтверждения очистки статистики"""
        query = update.callback_query
        await query.answer("🗑️ Очищаю статистику...")
        
        user_id = query.from_user.id
        
        # Проверяем, что это администратор
        if str(user_id) != self.admin_chat_id:
            await query.edit_message_text(
                "❌ У вас нет прав для выполнения этой команды"
            )
            return
        
        # Очищаем статистику
        cleared_items = []
        
        # Очищаем историю проверок доступа
        checks_count = len(self.access_check_history)
        self.access_check_history = {}
        if checks_count > 0:
            cleared_items.append(f"• История проверок: {checks_count} пользователей")
        
        # Очищаем предупреждения
        warnings_count = len(self.user_warnings)
        self.user_warnings = {}
        if warnings_count > 0:
            cleared_items.append(f"• Предупреждения: {warnings_count} пользователей")
        
        # Очищаем список заблокированных
        blocked_count = len(self.blocked_users)
        self.blocked_users = set()
        if blocked_count > 0:
            cleared_items.append(f"• Заблокированные: {blocked_count} пользователей")
        
        # Очищаем события
        events_count = len(self.admin_events)
        self.admin_events = []
        if events_count > 0:
            cleared_items.append(f"• События администратора: {events_count} событий")
        
        # Очищаем статистику в базе пользователей (сбрасываем флаги)
        users_reset = 0
        for user_id_key, user_data in self.users_db.items():
            if user_data.get('verified') or user_data.get('deposited'):
                user_data['verified'] = False
                user_data['deposited'] = False
                user_data['pocket_option_id'] = None
                users_reset += 1
        
        if users_reset > 0:
            cleared_items.append(f"• Сброшены статусы: {users_reset} пользователей")
            # Сохраняем изменения в файл
            self._save_users_db()
        
        # Формируем сообщение о результате
        if cleared_items:
            result_text = f"""✅ СТАТИСТИКА ОЧИЩЕНА

Очищено:
{chr(10).join(cleared_items)}

⏰ Время очистки: {datetime.now().strftime('%H:%M:%S %d.%m.%Y')}

💾 База пользователей обновлена
Всего пользователей: {len(self.users_db)}
Статусы сброшены: {users_reset}"""
        else:
            result_text = """ℹ️ СТАТИСТИКА УЖЕ ПУСТА

Нет данных для очистки."""
        
        logger.info(f"🗑️ Администратор очистил статистику: {len(cleared_items)} категорий, сброшено {users_reset} пользователей")
        
        keyboard = [
            [InlineKeyboardButton("◀️ Назад к панели", callback_data="back_to_admin_panel")]
        ]
        reply_markup = InlineKeyboardMarkup(keyboard)
        
        await query.edit_message_text(
            result_text,
            reply_markup=reply_markup
        )

    async def admin_clear_full_callback(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Обработчик полной очистки всех пользователей"""
        query = update.callback_query
        await query.answer("🗑️ Выполняю полную очистку...")
        
        user_id = query.from_user.id
        
        # Проверяем, что это администратор
        if str(user_id) != self.admin_chat_id:
            await query.edit_message_text(
                "❌ У вас нет прав для выполнения этой команды"
            )
            return
        
        # Очищаем ВСЕ данные
        users_count = len(self.users_db)
        checks_count = len(self.access_check_history)
        warnings_count = len(self.user_warnings)
        blocked_count = len(self.blocked_users)
        events_count = len(self.admin_events)
        
        # Полная очистка
        self.users_db = {}
        self.access_check_history = {}
        self.user_warnings = {}
        self.blocked_users = set()
        self.admin_events = []
        
        # Сохраняем пустую базу
        self._save_users_db()
        
        result_text = f"""✅ ПОЛНАЯ ОЧИСТКА ЗАВЕРШЕНА

Удалено:
• Пользователей: {users_count}
• История проверок: {checks_count}
• Предупреждения: {warnings_count}
• Заблокированные: {blocked_count}
• События: {events_count}

⏰ Время очистки: {datetime.now().strftime('%H:%M:%S %d.%m.%Y')}

🎯 База данных полностью очищена
Начинаем с чистого листа!"""
        
        logger.info(f"🗑️ Администратор выполнил полную очистку: {users_count} пользователей удалено")
        
        keyboard = [
            [InlineKeyboardButton("◀️ Назад к панели", callback_data="back_to_admin_panel")]
        ]
        reply_markup = InlineKeyboardMarkup(keyboard)
        
        await query.edit_message_text(
            result_text,
            reply_markup=reply_markup
        )

# Функции для админа
async def grant_access_to_user(bot_token: str, user_id: int, admin_chat_id: str, bot_instance=None):
    """Предоставить доступ пользователю (вызывается админом)"""
    
    success_message = """
🎉 *ДОСТУП ПРЕДОСТАВЛЕН!*

✅ *Ваша заявка одобрена!*

📊 *Теперь вы получаете:*
• Все торговые сигналы
• Точные точки входа
• Профессиональную аналитику
• Поддержку 24/7

🚀 *Начните зарабатывать прямо сейчас!*

💎 *Добро пожаловать в команду профи!*

👨‍💻 *Поддержка:* @kaktotakxm
    """.strip()
    
    try:
        response = requests.post(
            f"https://api.telegram.org/bot{bot_token}/sendMessage",
            data={
                'chat_id': user_id,
                'text': success_message,
                'parse_mode': 'Markdown'
            }
        )
        
        if response.status_code == 200:
            # Сбрасываем историю проверок доступа и предупреждения
            if bot_instance:
                if hasattr(bot_instance, 'access_check_history') and user_id in bot_instance.access_check_history:
                    bot_instance.access_check_history[user_id] = []
                if hasattr(bot_instance, 'user_warnings') and user_id in bot_instance.user_warnings:
                    bot_instance.user_warnings[user_id] = 0
                if hasattr(bot_instance, '_save_users_db'):
                    bot_instance._save_users_db()
            
            # Уведомляем админа
            requests.post(
                f"https://api.telegram.org/bot{bot_token}/sendMessage",
                data={
                    'chat_id': admin_chat_id,
                    'text': f"✅ Доступ предоставлен пользователю {user_id}"
                }
            )
            logger.info(f"✅ Доступ предоставлен пользователю {user_id}")
            return True
    except Exception as e:
        logger.error(f"Ошибка предоставления доступа: {e}")
        
    return False

async def error_handler(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Обработчик ошибок"""
    logger.error(f"Ошибка при обработке обновления: {context.error}")
    
    # Если есть пользователь, отправляем сообщение об ошибке
    if update and update.effective_user:
        try:
            await context.bot.send_message(
                chat_id=update.effective_user.id,
                text="❌ Произошла ошибка. Попробуйте позже."
            )
        except Exception as e:
            logger.error(f"Не удалось отправить сообщение об ошибке: {e}")

def main():
    """Запуск бота"""
    bot = InfoBot()
    
    # Создаем приложение
    application = Application.builder().token(bot.bot_token).build()
    
    # Добавляем обработчик ошибок
    application.add_error_handler(error_handler)
    
    # Добавляем обработчики команд
    application.add_handler(CommandHandler("start", bot.start_command))
    application.add_handler(CommandHandler("help", bot.help_command))
    application.add_handler(CommandHandler("status", bot.status_command))
    application.add_handler(CommandHandler("language", bot.language_command))  # Новая команда
    application.add_handler(CommandHandler("admin_stats", bot.admin_stats_command))
    application.add_handler(CommandHandler("reset_checks", bot.reset_checks_command))
    application.add_handler(CommandHandler("unblock_user", bot.unblock_user_command))
    application.add_handler(CommandHandler("blocked_users", bot.blocked_users_command))
    application.add_handler(CommandHandler("admin_panel", bot.admin_panel_command))
    
    # Обработчики кнопок
    application.add_handler(CallbackQueryHandler(bot.instruction_callback, pattern="instruction"))
    application.add_handler(CallbackQueryHandler(bot.check_access_callback, pattern="check_access"))
    application.add_handler(CallbackQueryHandler(bot.back_to_start_callback, pattern="back_to_start"))
    application.add_handler(CallbackQueryHandler(bot.choose_language_callback, pattern="choose_language"))  # Новый обработчик
    application.add_handler(CallbackQueryHandler(bot.language_callback, pattern="^lang_"))  # Обработчик выбора языка
    
    # Обработчики админ-панели
    application.add_handler(CallbackQueryHandler(bot.admin_export_callback, pattern="admin_export_users"))
    application.add_handler(CallbackQueryHandler(bot.admin_refresh_callback, pattern="admin_refresh"))
    application.add_handler(CallbackQueryHandler(bot.admin_stats_detailed_callback, pattern="admin_stats"))
    application.add_handler(CallbackQueryHandler(bot.admin_events_callback, pattern="admin_events"))
    application.add_handler(CallbackQueryHandler(bot.admin_clear_stats_callback, pattern="admin_clear_stats"))
    application.add_handler(CallbackQueryHandler(bot.admin_clear_confirm_callback, pattern="admin_clear_confirm"))
    application.add_handler(CallbackQueryHandler(bot.admin_clear_full_callback, pattern="admin_clear_full"))
    application.add_handler(CallbackQueryHandler(bot.back_to_admin_panel_callback, pattern="back_to_admin_panel"))
    
    # Обработчик текстовых сообщений
    application.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, bot.handle_message))
    
    # Запускаем бота
    # Устанавливаем UTF-8 для Windows консоли
    import sys
    import io
    if sys.platform == 'win32':
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    
    print("🤖 Бот @info_xm_trust_bot запущен с поддержкой мультиязычности!")
    print("🌐 Поддерживаемые языки: Русский, English, ไทย, Español, العربية")
    application.run_polling()

if __name__ == "__main__":
    main()