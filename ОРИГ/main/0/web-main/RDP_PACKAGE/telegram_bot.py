#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Telegram бот для системы генерации форекс сигналов
Интеграция с системой генерации сигналов через Twelvedata API
"""

import asyncio
import logging
import json
import time
from datetime import datetime
from typing import List, Dict
import os

# Telegram Bot API
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, BotCommand
from telegram.ext import Application, CommandHandler, CallbackQueryHandler, ContextTypes
from telegram.constants import ParseMode

# Импорт нашей системы генерации сигналов
from signal_generator import SignalGenerator, ForexSignal
from config import BotConfig
from market_schedule import MarketSchedule
from access_requests import access_manager, AccessRequest
from powerful_otc_generator import PowerfulOTCGenerator, PowerfulOTCSignal
from chart_generator import ChartGenerator
from signal_statistics import signal_statistics

# Настройка логирования
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)

class TelegramSignalBot:
    """Telegram бот для генерации форекс сигналов"""
    
    def __init__(self, bot_token: str, twelvedata_api_key: str):
        self.bot_token = bot_token
        self.twelvedata_api_key = twelvedata_api_key
        self.web_app_url = "https://app.nomoneynohoney.online"
        
        # Инициализация системы генерации сигналов
        self.signal_generator = SignalGenerator(twelvedata_api_key)
        
        # Инициализация МОЩНОГО ОТС генератора (24/7)
        self.otc_generator = PowerfulOTCGenerator()
        
        # Инициализация генератора графиков
        self.chart_generator = ChartGenerator()
        
        # Инициализация расписания рынка
        self.market_schedule = MarketSchedule()
        
        # Контроль времени генерации сигналов (по пользователям)
        self.last_signal_time = {}  # {user_id: timestamp}
        self.last_bulk_signal_time = {}  # {user_id: timestamp} для ТОП-3 сигналов
        self.last_top3_generation = {}  # {user_id: timestamp} для ТОП-3 генерации (10 минут)
        
        # Сохранение активных сигналов для навигации (по пользователям)
        self.active_signals = {}  # {user_id: {signal_data, message_id}}
        
        # Режим ожидания результата сделки (блокирует навигацию)
        self.pending_trade_results = {}  # {user_id: [signal_ids]} - ожидающие ОБЯЗАТЕЛЬНОЙ обратной связи
        self.pending_trade_timers = {}  # {user_id: {signal_id: expiry_time}} - время когда можно дать обратную связь
        
        # Статистика генерации сигналов (общая)
        self.signal_stats = {
            'forex_single': 0,      # Одиночные Форекс сигналы
            'forex_bulk': 0,        # ТОП-3 Форекс сигналы
            'otc_single': 0,        # Одиночные ОТС сигналы  
            'otc_bulk': 0,          # ТОП-3 ОТС сигналы
            'total': 0              # Общее количество
        }
        
        # Статистика генерации сигналов по пользователям
        self.user_signal_stats = {}  # {user_id: {forex_single: 0, forex_bulk: 0, otc_single: 0, otc_bulk: 0, total: 0}}
        
        # Статистика результатов торговли по пользователям
        self.user_trade_results = {}  # {user_id: {success: 0, failure: 0, total_trades: 0, win_rate: 0.0}}
        
        # Кулдаун для кнопки обновления таймера (3 секунды)
        self.last_timer_update = {}  # {user_id: timestamp}
        
        # Автоматическое обновление таймеров
        self.auto_update_active = {}  # {user_id: {signal_id, message_id, chat_id}}
        
        # Авторизованные пользователи из конфигурации
        self.authorized_users = BotConfig.AUTHORIZED_USERS
        
        # Создание приложения
        self.application = Application.builder().token(bot_token).build()
        
        # Регистрация обработчиков
        self._setup_handlers()
        
        logger.info("✅ TelegramSignalBot инициализирован")
    
    def _setup_handlers(self):
        """Настройка обработчиков команд и кнопок"""
        
        # Команды
        self.application.add_handler(CommandHandler("start", self.start_command))
        self.application.add_handler(CommandHandler("help", self.help_command))
        self.application.add_handler(CommandHandler("status", self.status_command))
        self.application.add_handler(CommandHandler("market", self.market_command))
        self.application.add_handler(CommandHandler("adduser", self.add_user_command))
        
        # Обработчики кнопок
        self.application.add_handler(CallbackQueryHandler(self.button_handler))
        
        # Установка команд меню будет выполнена при запуске
        self._commands_set = False
    
    async def _set_bot_commands(self):
        """Устанавливает команды бота в меню"""
        # Базовые команды для всех пользователей
        commands = [
            BotCommand("start", "🚀 Запустить бота"),
            BotCommand("help", "❓ Помощь"),
            BotCommand("market", "📅 Расписание работы"),
        ]
        
        # Админские команды только для вас
        admin_commands = [
            BotCommand("start", "🚀 Запустить бота"),
            BotCommand("help", "❓ Помощь"),
            BotCommand("market", "📅 Расписание работы"),
            BotCommand("status", "📊 Статус системы"),
            BotCommand("adduser", "👥 Добавить пользователя"),
        ]
        
        # Устанавливаем команды для всех (базовые)
        await self.application.bot.set_my_commands(commands)
        
        # Устанавливаем админские команды для вас
        try:
            await self.application.bot.set_my_commands(
                admin_commands,
                scope={"type": "chat", "chat_id": BotConfig.ADMIN_ID}
            )
        except Exception as e:
            logger.warning(f"⚠️ Не удалось установить админские команды: {e}")
    
    def _check_authorization(self, user_id: int) -> bool:
        """Проверяет авторизацию пользователя"""
        return user_id in self.authorized_users
    
    def _check_expired_trades(self, user_id: int):
        """Проверка истекших сделок - они становятся доступными для обратной связи"""
        # Эта функция больше не удаляет сделки автоматически
        # Сделки остаются в ожидании обратной связи до тех пор, пока пользователь не даст результат
        pass
    
    def _is_signal_ready_for_feedback(self, user_id: int, signal_id: str) -> bool:
        """Проверяет, готов ли сигнал для получения обратной связи (истекло время экспирации)"""
        if user_id not in self.pending_trade_timers:
            return False
        
        if signal_id not in self.pending_trade_timers[user_id]:
            return False
            
        current_time = time.time()
        expiry_time = self.pending_trade_timers[user_id][signal_id]
        
        # Сигнал готов для обратной связи только ПОСЛЕ истечения времени экспирации
        return current_time >= expiry_time
    
    def _increment_signal_stats(self, signal_type: str, user_id: int, count: int = 1):
        """Увеличивает счетчики статистики сигналов (общие и пользовательские)"""
        # Общая статистика
        if signal_type in self.signal_stats:
            self.signal_stats[signal_type] += count
            self.signal_stats['total'] += count
        
        # Пользовательская статистика
        if user_id not in self.user_signal_stats:
            self.user_signal_stats[user_id] = {
                'forex_single': 0,
                'forex_bulk': 0,
                'otc_single': 0,
                'otc_bulk': 0,
                'total': 0
            }
        
        if signal_type in self.user_signal_stats[user_id]:
            self.user_signal_stats[user_id][signal_type] += count
            self.user_signal_stats[user_id]['total'] += count
    
    def _add_trade_result(self, user_id: int, feedback: str):
        """Добавляет результат торговли в статистику пользователя"""
        if user_id not in self.user_trade_results:
            self.user_trade_results[user_id] = {
                'success': 0,
                'failure': 0,
                'total_trades': 0,
                'win_rate': 0.0
            }
        
        # Увеличиваем соответствующий счетчик
        if feedback == "success":
            self.user_trade_results[user_id]['success'] += 1
        elif feedback == "failure":
            self.user_trade_results[user_id]['failure'] += 1
        
        # Обновляем общие показатели
        self.user_trade_results[user_id]['total_trades'] += 1
        
        # Рассчитываем процент побед
        total = self.user_trade_results[user_id]['total_trades']
        success = self.user_trade_results[user_id]['success']
        self.user_trade_results[user_id]['win_rate'] = (success / total * 100) if total > 0 else 0.0
    
    async def _start_auto_timer_update(self, user_id: int, signal_id: str, chat_id: int, message_id: int):
        """Запускает автоматическое обновление таймера каждые 30 секунд"""
        self.auto_update_active[user_id] = {
            'signal_id': signal_id,
            'message_id': message_id,
            'chat_id': chat_id
        }
        
        # Запускаем фоновую задачу обновления
        asyncio.create_task(self._auto_update_timer_loop(user_id))
    
    async def _auto_update_timer_loop(self, user_id: int):
        """Фоновая задача автоматического обновления таймера"""
        try:
            while user_id in self.auto_update_active:
                await asyncio.sleep(30)  # Обновляем каждые 30 секунд
                
                # Проверяем, есть ли ещё активная сделка
                if user_id not in self.pending_trade_results:
                    break
                
                update_info = self.auto_update_active[user_id]
                signal_id = update_info['signal_id']
                message_id = update_info['message_id']
                chat_id = update_info['chat_id']
                
                # Проверяем, готов ли сигнал к обратной связи
                if self._is_signal_ready_for_feedback(user_id, signal_id):
                    # Время истекло - показываем активные кнопки
                    if signal_id in self.pending_signals:
                        signal_data = self.pending_signals[signal_id]
                        
                        try:
                            await self.application.bot.edit_message_text(
                                chat_id=chat_id,
                                message_id=message_id,
                                text=(
                                    f"✅ <b>ВРЕМЯ ИСТЕКЛО - УКАЖИТЕ РЕЗУЛЬТАТ</b>\n\n"
                                    f"📊 <b>Пара:</b> {signal_data['pair']}\n"
                                    f"📈 <b>Направление:</b> {signal_data['direction']}\n"
                                    f"🎯 <b>Скор:</b> {signal_data['confidence'] * 100 if signal_data['confidence'] <= 1 else signal_data['confidence']:.1f}%\n"
                                    f"⏰ <b>Экспирация:</b> {signal_data['expiration']} мин\n\n"
                                    f"🎯 <b>Время истекло! Укажите результат торговли:</b>"
                                ),
                                parse_mode=ParseMode.HTML,
                                reply_markup=InlineKeyboardMarkup([
                                    [
                                        InlineKeyboardButton("✅ ВЫИГРАШ", callback_data=f"feedback_success_{signal_id}"),
                                        InlineKeyboardButton("❌ ПРОИГРАШ", callback_data=f"feedback_failure_{signal_id}")
                                    ]
                                ])
                            )
                        except:
                            pass  # Игнорируем ошибки редактирования
                    break
                else:
                    # Обновляем таймер
                    if (user_id in self.pending_trade_timers and 
                        signal_id in self.pending_trade_timers[user_id] and
                        signal_id in self.pending_signals):
                        
                        signal_data = self.pending_signals[signal_id]
                        expiry_time = self.pending_trade_timers[user_id][signal_id]
                        current_time = time.time()
                        remaining_seconds = max(0, int(expiry_time - current_time))
                        remaining_minutes = remaining_seconds // 60
                        remaining_seconds = remaining_seconds % 60
                        
                        expiry_datetime = datetime.fromtimestamp(expiry_time)
                        expiry_time_str = expiry_datetime.strftime('%H:%M:%S')
                        
                        try:
                            await self.application.bot.edit_message_text(
                                chat_id=chat_id,
                                message_id=message_id,
                                text=(
                                    f"🔒 <b>СДЕЛКА АКТИВИРОВАНА</b>\n\n"
                                    f"📊 <b>Пара:</b> {signal_data['pair']}\n"
                                    f"📈 <b>Направление:</b> {signal_data['direction']}\n"
                                    f"🎯 <b>Скор:</b> {signal_data['confidence'] * 100 if signal_data['confidence'] <= 1 else signal_data['confidence']:.1f}%\n"
                                    f"⏰ <b>Экспирация:</b> {signal_data['expiration']} мин\n\n"
                                    f"🚫 <b>Навигация заблокирована до {expiry_time_str}</b>\n"
                                    f"⏳ <b>Осталось: {remaining_minutes}м {remaining_seconds}с</b>\n\n"
                                    f"🔘 <b>Кнопки результата станут активными в {expiry_time_str}</b>\n"
                                    f"💡 После этого времени укажите результат торговли"
                                ),
                                parse_mode=ParseMode.HTML,
                                reply_markup=InlineKeyboardMarkup([
                                    [
                                        InlineKeyboardButton("⚪ Выиграш (недоступно)", callback_data=f"feedback_success_{signal_id}"),
                                        InlineKeyboardButton("⚪ Проиграш (недоступно)", callback_data=f"feedback_failure_{signal_id}")
                                    ],
                                    [InlineKeyboardButton("🔄 Обновить таймер", callback_data="show_pending_trades")]
                                ])
                            )
                        except:
                            pass  # Игнорируем ошибки редактирования
                            
        except Exception as e:
            logger.error(f"❌ Ошибка автообновления таймера для {user_id}: {e}")
        finally:
            # Удаляем из активных обновлений
            if user_id in self.auto_update_active:
                del self.auto_update_active[user_id]

    def _remove_pending_trade(self, user_id: int, signal_id: str):
        """Удаляет сигнал из режима ожидания результата после получения обратной связи"""
        if user_id in self.pending_trade_results:
            if signal_id in self.pending_trade_results[user_id]:
                self.pending_trade_results[user_id].remove(signal_id)
        
        if user_id in self.pending_trade_timers:
            if signal_id in self.pending_trade_timers[user_id]:
                del self.pending_trade_timers[user_id][signal_id]
        
        # Останавливаем автообновление таймера
        if user_id in self.auto_update_active:
            del self.auto_update_active[user_id]
        
        # Если все сигналы обработаны - полностью разблокируем навигацию
        if user_id in self.pending_trade_results and not self.pending_trade_results[user_id]:
            del self.pending_trade_results[user_id]
            
        if user_id in self.pending_trade_timers and not self.pending_trade_timers[user_id]:
            del self.pending_trade_timers[user_id]
    
    def _add_pending_trade(self, user_id: int, signal_id: str, expiration_minutes: int):
        """Добавляет сигнал в режим ОБЯЗАТЕЛЬНОЙ обратной связи (блокирует навигацию)"""
        if user_id not in self.pending_trade_results:
            self.pending_trade_results[user_id] = []
        if user_id not in self.pending_trade_timers:
            self.pending_trade_timers[user_id] = {}
            
        self.pending_trade_results[user_id].append(signal_id)
        
        # Время когда можно дать обратную связь = текущее время + время экспирации сигнала
        expiry_time = time.time() + (expiration_minutes * 60)
        self.pending_trade_timers[user_id][signal_id] = expiry_time
    
    async def _handle_show_pending_trades(self, query):
        """Показывает список ожидающих результата сделок или обновляет таймер активной сделки"""
        user_id = query.from_user.id
        current_time = time.time()
        
        # Проверяем кулдаун обновления таймера (3 секунды)
        if user_id in self.last_timer_update:
            time_passed = current_time - self.last_timer_update[user_id]
            if time_passed < 3:  # 3 секунды кулдаун
                remaining = 3 - time_passed
                await query.answer(
                    f"⏰ Подождите {remaining:.0f}с перед следующим обновлением",
                    show_alert=True
                )
                return
        
        # Обновляем время последнего обновления таймера
        self.last_timer_update[user_id] = current_time
        
        # Если у пользователя только одна активная сделка, показываем её экран с обновленным таймером
        if (user_id in self.pending_trade_results and 
            len(self.pending_trade_results[user_id]) == 1):
            
            signal_id = self.pending_trade_results[user_id][0]
            
            if signal_id in self.pending_signals:
                signal_data = self.pending_signals[signal_id]
                
                # Проверяем готовность к обратной связи
                if self._is_signal_ready_for_feedback(user_id, signal_id):
                    # Время истекло - показываем активные кнопки
                    await query.edit_message_text(
                        f"✅ <b>ВРЕМЯ ИСТЕКЛО - УКАЖИТЕ РЕЗУЛЬТАТ</b>\n\n"
                        f"📊 <b>Пара:</b> {signal_data['pair']}\n"
                        f"📈 <b>Направление:</b> {signal_data['direction']}\n"
                        f"🎯 <b>Скор:</b> {signal_data['confidence'] * 100 if signal_data['confidence'] <= 1 else signal_data['confidence']:.1f}%\n"
                        f"⏰ <b>Экспирация:</b> {signal_data['expiration']} мин\n\n"
                        f"🎯 <b>Время истекло! Укажите результат торговли:</b>",
                        parse_mode=ParseMode.HTML,
                        reply_markup=InlineKeyboardMarkup([
                            [
                                InlineKeyboardButton("✅ ВЫИГРАШ", callback_data=f"feedback_success_{signal_id}"),
                                InlineKeyboardButton("❌ ПРОИГРАШ", callback_data=f"feedback_failure_{signal_id}")
                            ],
                            [InlineKeyboardButton("🔄 Обновить", callback_data="show_pending_trades")]
                        ])
                    )
                    return
                else:
                    # Время ещё не истекло - показываем обновленный таймер
                    if user_id in self.pending_trade_timers and signal_id in self.pending_trade_timers[user_id]:
                        expiry_time = self.pending_trade_timers[user_id][signal_id]
                        current_time = time.time()
                        remaining_seconds = max(0, int(expiry_time - current_time))
                        remaining_minutes = remaining_seconds // 60
                        remaining_seconds = remaining_seconds % 60
                        
                        expiry_datetime = datetime.fromtimestamp(expiry_time)
                        expiry_time_str = expiry_datetime.strftime('%H:%M:%S')
                        
                        await query.edit_message_text(
                            f"🔒 <b>СДЕЛКА АКТИВИРОВАНА</b>\n\n"
                            f"📊 <b>Пара:</b> {signal_data['pair']}\n"
                            f"📈 <b>Направление:</b> {signal_data['direction']}\n"
                            f"🎯 <b>Скор:</b> {signal_data['confidence'] * 100 if signal_data['confidence'] <= 1 else signal_data['confidence']:.1f}%\n"
                            f"⏰ <b>Экспирация:</b> {signal_data['expiration']} мин\n\n"
                            f"🚫 <b>Навигация заблокирована до {expiry_time_str}</b>\n"
                            f"⏳ <b>Осталось: {remaining_minutes}м {remaining_seconds}с</b>\n\n"
                            f"🔘 <b>Кнопки результата станут активными в {expiry_time_str}</b>\n"
                            f"💡 После этого времени укажите результат торговли",
                            parse_mode=ParseMode.HTML,
                            reply_markup=InlineKeyboardMarkup([
                                [
                                    InlineKeyboardButton("⚪ Выиграш (недоступно)", callback_data=f"feedback_success_{signal_id}"),
                                    InlineKeyboardButton("⚪ Проиграш (недоступно)", callback_data=f"feedback_failure_{signal_id}")
                                ],
                                [InlineKeyboardButton("🔄 Обновить таймер", callback_data="show_pending_trades")]
                            ])
                        )
                        return
        
        if user_id not in self.pending_trade_results or not self.pending_trade_results[user_id]:
            try:
                await query.edit_message_text(
                    "✅ <b>Нет ожидающих сделок</b>\n\n"
                    "Все ваши сигналы обработаны.\n"
                    "Можете продолжить навигацию по боту.",
                    parse_mode=ParseMode.HTML,
                    reply_markup=InlineKeyboardMarkup([
                        [InlineKeyboardButton("🔙 Главное меню", callback_data="back_to_main")]
                    ])
                )
            except Exception as e:
                logger.warning(f"Не удалось отредактировать сообщение 'нет сделок': {e}")
                try:
                    await query.message.reply_text(
                        "✅ <b>Нет ожидающих сделок</b>\n\n"
                        "Все ваши сигналы обработаны.\n"
                        "Можете продолжить навигацию по боту.",
                        parse_mode=ParseMode.HTML,
                        reply_markup=InlineKeyboardMarkup([
                            [InlineKeyboardButton("🔙 Главное меню", callback_data="back_to_main")]
                        ])
                    )
                except:
                    pass
            return
        
        # Формируем список ожидающих сделок
        pending_text = "⏳ <b>Сделки в процессе экспирации:</b>\n\n"
        current_time = time.time()
        ready_count = 0
        
        for i, signal_id in enumerate(self.pending_trade_results[user_id], 1):
            # Получаем информацию о сигнале
            if hasattr(self, 'pending_signals') and signal_id in self.pending_signals:
                signal_data = self.pending_signals[signal_id]
                pair = signal_data['pair']
                direction = signal_data['direction']
                
                # Рассчитываем оставшееся время до возможности дать обратную связь
                if user_id in self.pending_trade_timers and signal_id in self.pending_trade_timers[user_id]:
                    expiry_time = self.pending_trade_timers[user_id][signal_id]
                    remaining_seconds = max(0, int(expiry_time - current_time))
                    
                    if remaining_seconds > 0:
                        remaining_minutes = remaining_seconds // 60
                        remaining_seconds = remaining_seconds % 60
                        
                        pending_text += f"{i}. ⏰ <b>{pair}</b> - {direction}\n"
                        pending_text += f"   🕒 До результата: {remaining_minutes}м {remaining_seconds}с\n\n"
                    else:
                        pending_text += f"{i}. ✅ <b>{pair}</b> - {direction}\n"
                        pending_text += f"   🎯 Готов к обратной связи!\n\n"
                        ready_count += 1
                else:
                    pending_text += f"{i}. 📊 <b>{pair}</b> - {direction}\n"
                    pending_text += f"   ⏰ Ожидает результата\n\n"
            else:
                pending_text += f"{i}. 📊 Сигнал #{signal_id[-8:]}\n"
                pending_text += f"   ⏰ Ожидает результата\n\n"
        
        # Формируем кнопки для готовых к обратной связи сигналов
        keyboard_buttons = []
        
        if ready_count > 0:
            pending_text += f"🎯 <b>{ready_count} сигналов готовы к обратной связи!</b>\n"
            pending_text += "Укажите результат готовых сделок:"
            
            # Добавляем кнопки для каждого готового сигнала
            for signal_id in self.pending_trade_results[user_id]:
                if self._is_signal_ready_for_feedback(user_id, signal_id):
                    if hasattr(self, 'pending_signals') and signal_id in self.pending_signals:
                        signal_data = self.pending_signals[signal_id]
                        pair = signal_data['pair']
                        direction = signal_data['direction']
                        
                        keyboard_buttons.append([
                            InlineKeyboardButton(f"✅ {pair} {direction} - УСПЕХ", callback_data=f"feedback_success_{signal_id}"),
                            InlineKeyboardButton(f"❌ {pair} {direction} - ПРОВАЛ", callback_data=f"feedback_failure_{signal_id}")
                        ])
        else:
            pending_text += "⏰ Дождитесь окончания времени экспирации всех сигналов"
        
        # Кнопка обновления всегда есть
        keyboard_buttons.append([InlineKeyboardButton("🔄 Обновить", callback_data="show_pending_trades")])
        
        try:
            await query.edit_message_text(
                pending_text,
                parse_mode=ParseMode.HTML,
                reply_markup=InlineKeyboardMarkup(keyboard_buttons)
            )
        except Exception as e:
            # Если не удалось отредактировать (то же содержимое), отправляем новое сообщение
            logger.warning(f"Не удалось отредактировать сообщение ожидающих сделок: {e}")
            try:
                await query.message.reply_text(
                    pending_text,
                    parse_mode=ParseMode.HTML,
                    reply_markup=InlineKeyboardMarkup(keyboard_buttons)
                )
            except:
                pass

    async def _handle_refresh_signal_cooldown(self, query):
        """Обновление экрана кулдауна одиночной форекс-генерации (30 сек)"""
        try:
            user_id = query.from_user.id
            current_time = time.time()
            cooldown = BotConfig.SIGNAL_SETTINGS.get("signal_cooldown", 30)

            remaining = 0
            if user_id in self.last_signal_time:
                time_passed = current_time - self.last_signal_time[user_id]
                if time_passed < cooldown:
                    remaining = cooldown - time_passed

            if remaining > 0:
                minutes = int(remaining // 60)
                seconds = int(remaining % 60)
                await query.edit_message_text(
                    f"⏰ <b>Подождите 30 секунд и выберите другую пару</b>\n\n"
                    f"🕒 Осталось: {minutes}м {seconds}с\n\n"
                    f"💡 Рекомендация:\n"
                    f"• Попробуйте другую валютную пару\n"
                    f"• Дождитесь изменения рыночных условий\n\n"
                    f"🎯 Выберите пару с лучшими условиями для торговли!",
                    parse_mode=ParseMode.HTML,
                    reply_markup=InlineKeyboardMarkup([
                        [InlineKeyboardButton("🔄 Обновить таймер", callback_data="refresh_signal_cooldown")],
                        [InlineKeyboardButton("🔙 Главное меню", callback_data="back_to_main")]
                    ])
                )
            else:
                # Кулдаун закончился — показываем кнопки выбора пары
                await query.edit_message_text(
                    "✅ <b>Кулдаун завершён</b>\n\nВыберите новую пару для генерации сигнала:",
                    parse_mode=ParseMode.HTML,
                    reply_markup=self._get_pairs_keyboard()
                )
        except Exception as e:
            logger.error(f"❌ Ошибка обновления кулдауна: {e}")
            await query.answer("Произошла ошибка", show_alert=True)
    
    async def start_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Обработчик команды /start"""
        user_id = update.effective_user.id
        
        if not self._check_authorization(user_id):
            # Создаем запрос на доступ
            user = update.effective_user
            request_created = access_manager.add_request(
                user_id=user_id,
                username=user.username,
                first_name=user.first_name,
                last_name=user.last_name
            )
            
            if request_created:
                # Отправляем уведомление админу
                await self._notify_admin_new_request(user)
                
                await update.message.reply_text(
                    "📝 <b>Запрос на доступ отправлен!</b>\n\n"
                    "🔄 Ваш запрос передан администратору на рассмотрение.\n"
                    "⏳ Ожидайте уведомления о результате.\n\n"
                    "📞 Администратор: @kaktotakxm",
                    parse_mode=ParseMode.HTML
                )
            else:
                await update.message.reply_text(
                    "⏳ <b>Ваш запрос уже на рассмотрении</b>\n\n"
                    "🔄 Запрос был отправлен ранее.\n"
                    "⏳ Ожидайте уведомления о результате.\n\n"
                    "📞 Администратор: @kaktotakxm",
                    parse_mode=ParseMode.HTML
                )
            return
        
        welcome_text = BotConfig.MESSAGES["welcome"]
        
        keyboard = self._get_main_keyboard(user_id)
        
        await update.message.reply_text(
            welcome_text,
            parse_mode=ParseMode.HTML,
            reply_markup=keyboard
        )
    
    async def help_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Обработчик команды /help"""
        user_id = update.effective_user.id
        
        if not self._check_authorization(user_id):
            await update.message.reply_text("❌ У вас нет доступа к этому боту.")
            return
        
        help_text = (
            "❓ <b>Помощь по использованию бота</b>\n\n"
            "🔹 <b>Основные функции:</b>\n"
            "• <code>📊 Получить сигнал</code> - генерирует сигнал для выбранной пары\n"
            "• <code>📈 Массовые сигналы</code> - сигналы для нескольких пар\n"
            "• <code>💱 Валютные пары</code> - список поддерживаемых пар\n"
            "• <code>⚙️ Статус системы</code> - информация о работе API\n\n"
            "🔹 <b>Интерпретация сигналов:</b>\n"
            "• <b>BUY</b> 🟢 - рекомендуется покупка\n"
            "• <b>SELL</b> 🔴 - рекомендуется продажа\n"
            "• <b>Confidence</b> - уверенность в сигнале (0-100%)\n\n"
            "🔹 <b>Индикаторы:</b>\n"
            "• RSI - индекс относительной силы\n"
            "• EMA - экспоненциальная скользящая средняя\n"
            "• Bollinger Bands - полосы Боллинджера\n"
            "• MACD - схождение-расхождение скользящих средних\n\n"
            "⚠️ <b>Важно:</b> Сигналы носят информационный характер. "
            "Всегда используйте управление рисками при торговле.\n\n"
            "🆘 <b>Поддержка:</b> @kaktotakxm"
        )
        
        keyboard = self._get_main_keyboard(user_id)
        
        await update.message.reply_text(
            help_text,
            parse_mode=ParseMode.HTML,
            reply_markup=keyboard
        )
    
    async def status_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Обработчик команды /status"""
        user_id = update.effective_user.id
        
        if not self._check_authorization(user_id):
            await update.message.reply_text("❌ У вас нет доступа к этому боту.")
            return
        
        # Проверяем, что это админ
        if user_id != BotConfig.ADMIN_ID:
            await update.message.reply_text(
                "❌ Доступ к статусу системы только для администратора."
            )
            return
        
        try:
            # Получаем статус API
            api_status = self.signal_generator.get_api_status()
            supported_pairs = self.signal_generator.get_supported_pairs()
            
            # Получаем статистику запросов
            request_stats = access_manager.get_statistics()
            
            status_text = (
                "📊 <b>Статус системы генерации сигналов</b>\n\n"
                f"🕒 <b>Время:</b> {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n"
                f"💱 <b>Поддерживаемых пар:</b> {len(supported_pairs)}\n"
                f"👥 <b>Авторизованных пользователей:</b> {len(BotConfig.AUTHORIZED_USERS)}\n\n"
                f"📝 <b>Запросы на доступ:</b>\n"
                f"⏳ Ожидают: {request_stats['pending']}\n"
                f"✅ Одобрено: {request_stats['approved']}\n"
                f"❌ Отклонено: {request_stats['rejected']}\n\n"
                "🔗 <b>Статус API:</b>\n"
            )
            
            for api_name, status in api_status.items():
                status_emoji = "✅" if status['can_request'] else "❌"
                status_text += (
                    f"{status_emoji} <b>{api_name.upper()}</b>\n"
                    f"   Запросы в минуту: {status['minute_requests']}\n"
                    f"   Запросы в день: {status['day_requests']}\n\n"
                )
            
            # Создаем специальную клавиатуру для статуса с запросами
            keyboard = []
            
            # Если есть ожидающие запросы - добавляем кнопку
            if request_stats['pending'] > 0:
                keyboard.append([
                    InlineKeyboardButton(
                        f"📋 Просмотреть запросы ({request_stats['pending']})", 
                        callback_data="show_all_requests"
                    )
                ])
            
            keyboard.append([InlineKeyboardButton("🔙 Главное меню", callback_data="back_to_main")])
            reply_markup = InlineKeyboardMarkup(keyboard)
            
            await update.message.reply_text(
                status_text,
                parse_mode=ParseMode.HTML,
                reply_markup=reply_markup
            )
            
        except Exception as e:
            logger.error(f"Ошибка получения статуса: {e}")
            await update.message.reply_text(
                "❌ Ошибка получения статуса системы. Попробуйте позже."
            )
    
    async def pairs_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Обработчик команды /pairs"""
        user_id = update.effective_user.id
        
        if not self._check_authorization(user_id):
            await update.message.reply_text("❌ У вас нет доступа к этому боту.")
            return
        
        try:
            supported_pairs = self.signal_generator.get_supported_pairs()
            
            pairs_text = (
                "💱 <b>Поддерживаемые валютные пары</b>\n\n"
                f"📊 Всего пар: {len(supported_pairs)}\n\n"
            )
            
            # Группируем пары для красивого отображения
            major_pairs = ["EUR/USD", "GBP/USD", "USD/JPY", "USD/CHF"]
            minor_pairs = ["AUD/USD", "USD/CAD", "NZD/USD"]
            cross_pairs = ["EUR/GBP", "GBP/JPY", "AUD/CAD", "EUR/JPY", "CHF/JPY"]
            
            pairs_text += "🔹 <b>Основные пары:</b>\n"
            for pair in major_pairs:
                if pair in supported_pairs:
                    pairs_text += f"• {pair}\n"
            
            pairs_text += "\n🔸 <b>Второстепенные пары:</b>\n"
            for pair in minor_pairs:
                if pair in supported_pairs:
                    pairs_text += f"• {pair}\n"
            
            pairs_text += "\n🔹 <b>Кросс-пары:</b>\n"
            for pair in cross_pairs:
                if pair in supported_pairs:
                    pairs_text += f"• {pair}\n"
            
            keyboard = self._get_main_keyboard()
            
            await update.message.reply_text(
                pairs_text,
                parse_mode=ParseMode.HTML,
                reply_markup=keyboard
            )
            
        except Exception as e:
            logger.error(f"Ошибка получения списка пар: {e}")
            await update.message.reply_text(
                "❌ Ошибка получения списка пар. Попробуйте позже."
            )
    
    async def market_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Обработчик команды /market"""
        user_id = update.effective_user.id
        
        if not self._check_authorization(user_id):
            await update.message.reply_text(BotConfig.MESSAGES["unauthorized"])
            return
        
        try:
            market_message = self.market_schedule.get_market_message()
            
            # Добавляем кнопку для быстрого доступа к сигналам
            if self.market_schedule.is_market_open():
                keyboard = [
                    [InlineKeyboardButton("🏆 Получить ТОП-3 сигнала", callback_data="bulk_signals")],
                    [InlineKeyboardButton("🔙 Главное меню", callback_data="back_to_main")]
                ]
            else:
                keyboard = [
                    [InlineKeyboardButton("🔙 Главное меню", callback_data="back_to_main")]
                ]
            
            reply_markup = InlineKeyboardMarkup(keyboard)
            
            await update.message.reply_text(
                market_message,
                parse_mode=ParseMode.HTML,
                reply_markup=reply_markup
            )
            
        except Exception as e:
            logger.error(f"Ошибка получения расписания рынка: {e}")
            await update.message.reply_text(
                "❌ Ошибка получения расписания рынка. Попробуйте позже."
            )
    
    async def add_user_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Команда для добавления пользователя (только для админа)"""
        user_id = update.effective_user.id
        
        # Проверяем, что это админ
        if user_id != BotConfig.ADMIN_ID:
            await update.message.reply_text(
                "❌ Эта команда доступна только администратору."
            )
            return
        
        # Проверяем аргументы команды
        if not context.args:
            await update.message.reply_text(
                "📝 <b>Использование:</b>\n"
                "<code>/adduser 123456789</code>\n\n"
                "💡 <b>Как узнать ID пользователя:</b>\n"
                "1. Пользователь пишет боту любое сообщение\n"
                "2. В логах появится его ID\n"
                "3. Используйте этот ID в команде",
                parse_mode=ParseMode.HTML
            )
            return
        
        try:
            new_user_id = int(context.args[0])
            
            # Добавляем пользователя
            BotConfig.AUTHORIZED_USERS.add(new_user_id)
            
            await update.message.reply_text(
                f"✅ <b>Пользователь добавлен!</b>\n\n"
                f"👤 ID: <code>{new_user_id}</code>\n"
                f"👥 Всего авторизованных: {len(BotConfig.AUTHORIZED_USERS)}\n\n"
                f"💡 Пользователь может теперь использовать бота.\n"
                f"⚠️ Изменения действуют до перезапуска бота.",
                parse_mode=ParseMode.HTML
            )
            
            logger.info(f"👥 Админ {user_id} добавил пользователя {new_user_id}")
            
        except ValueError:
            await update.message.reply_text(
                "❌ Неверный формат ID. Используйте только цифры.\n"
                "Пример: <code>/adduser 123456789</code>",
                parse_mode=ParseMode.HTML
            )
        except Exception as e:
            logger.error(f"Ошибка добавления пользователя: {e}")
            await update.message.reply_text(
                "❌ Ошибка добавления пользователя. Попробуйте позже."
            )
    
    async def _notify_admin_new_request(self, user):
        """Отправляет уведомление админу о новом запросе"""
        try:
            user_display = f"{user.first_name or ''} {user.last_name or ''}".strip()
            if not user_display:
                user_display = "Без имени"
            
            username_info = f"@{user.username}" if user.username else "Нет username"
            
            notification_text = (
                f"🔔 <b>Новый запрос на доступ!</b>\n\n"
                f"👤 <b>Пользователь:</b> {user_display}\n"
                f"🆔 <b>Username:</b> {username_info}\n"
                f"🔢 <b>ID:</b> <code>{user.id}</code>\n"
                f"🕒 <b>Время:</b> {datetime.now().strftime('%H:%M:%S')}\n\n"
                f"👇 <b>Выберите действие:</b>"
            )
            
            keyboard = [
                [
                    InlineKeyboardButton("✅ Принять", callback_data=f"approve_{user.id}"),
                    InlineKeyboardButton("❌ Отклонить", callback_data=f"reject_{user.id}")
                ],
                [InlineKeyboardButton("📋 Все запросы", callback_data="show_all_requests")]
            ]
            
            reply_markup = InlineKeyboardMarkup(keyboard)
            
            await self.application.bot.send_message(
                chat_id=BotConfig.ADMIN_ID,
                text=notification_text,
                parse_mode=ParseMode.HTML,
                reply_markup=reply_markup
            )
            
            logger.info(f"📧 Уведомление о запросе {user.id} отправлено админу")
            
        except Exception as e:
            logger.error(f"❌ Ошибка отправки уведомления админу: {e}")
    
    async def _handle_approve_request(self, query, request_user_id: int):
        """Обработка одобрения запроса"""
        # Проверяем, что это админ
        if query.from_user.id != BotConfig.ADMIN_ID:
            await query.answer("❌ Доступ только для администратора.")
            return
        
        try:
            # Получаем информацию о запросе
            request = access_manager.get_request(request_user_id)
            if not request:
                await query.edit_message_text("❌ Запрос не найден.")
                return
            
            # Одобряем запрос
            access_manager.approve_request(request_user_id)
            
            # Добавляем пользователя в авторизованные
            BotConfig.AUTHORIZED_USERS.add(request_user_id)
            
            # Уведомляем пользователя об одобрении
            await self._notify_user_approved(request_user_id, request.get_user_display_name())
            
            # Обновляем сообщение админу
            await query.edit_message_text(
                f"✅ <b>Запрос одобрен!</b>\n\n"
                f"👤 Пользователь: {request.get_user_display_name()}\n"
                f"🔢 ID: <code>{request_user_id}</code>\n"
                f"🕒 Время одобрения: {datetime.now().strftime('%H:%M:%S')}\n\n"
                f"💡 Пользователь получил доступ к боту.",
                parse_mode=ParseMode.HTML
            )
            
            logger.info(f"✅ Админ одобрил запрос пользователя {request_user_id}")
            
        except Exception as e:
            logger.error(f"❌ Ошибка одобрения запроса: {e}")
            await query.edit_message_text("❌ Ошибка одобрения запроса.")
    
    async def _handle_reject_request(self, query, request_user_id: int):
        """Обработка отклонения запроса"""
        # Проверяем, что это админ
        if query.from_user.id != BotConfig.ADMIN_ID:
            await query.answer("❌ Доступ только для администратора.")
            return
        
        try:
            # Получаем информацию о запросе
            request = access_manager.get_request(request_user_id)
            if not request:
                await query.edit_message_text("❌ Запрос не найден.")
                return
            
            # Отклоняем запрос
            access_manager.reject_request(request_user_id)
            
            # Уведомляем пользователя об отклонении
            await self._notify_user_rejected(request_user_id, request.get_user_display_name())
            
            # Обновляем сообщение админу
            await query.edit_message_text(
                f"❌ <b>Запрос отклонен!</b>\n\n"
                f"👤 Пользователь: {request.get_user_display_name()}\n"
                f"🔢 ID: <code>{request_user_id}</code>\n"
                f"🕒 Время отклонения: {datetime.now().strftime('%H:%M:%S')}\n\n"
                f"💡 Пользователь уведомлен об отклонении.",
                parse_mode=ParseMode.HTML
            )
            
            logger.info(f"❌ Админ отклонил запрос пользователя {request_user_id}")
            
        except Exception as e:
            logger.error(f"❌ Ошибка отклонения запроса: {e}")
            await query.edit_message_text("❌ Ошибка отклонения запроса.")
    
    async def _notify_user_approved(self, user_id: int, user_name: str):
        """Уведомляет пользователя об одобрении"""
        try:
            await self.application.bot.send_message(
                chat_id=user_id,
                text=(
                    f"🎉 <b>Ваш запрос одобрен!</b>\n\n"
                    f"✅ Теперь у вас есть доступ к боту генерации форекс сигналов.\n"
                    f"🚀 Напишите /start для начала работы.\n\n"
                    f"💡 Добро пожаловать!"
                ),
                parse_mode=ParseMode.HTML
            )
        except Exception as e:
            logger.error(f"❌ Ошибка уведомления пользователя {user_id}: {e}")
    
    async def _notify_user_rejected(self, user_id: int, user_name: str):
        """Уведомляет пользователя об отклонении"""
        try:
            await self.application.bot.send_message(
                chat_id=user_id,
                text=(
                    f"❌ <b>Ваш запрос отклонен</b>\n\n"
                    f"🚫 К сожалению, доступ к боту не предоставлен.\n"
                    f"📞 Для уточнения обратитесь: @kaktotakxm\n\n"
                    f"💡 Вы можете подать новый запрос позже."
                ),
                parse_mode=ParseMode.HTML
            )
        except Exception as e:
            logger.error(f"❌ Ошибка уведомления пользователя {user_id}: {e}")
    
    async def _handle_show_all_requests(self, query):
        """Показывает все ожидающие запросы"""
        # Проверяем, что это админ
        if query.from_user.id != BotConfig.ADMIN_ID:
            await query.answer("❌ Доступ только для администратора.")
            return
        
        try:
            pending_requests = access_manager.get_pending_requests()
            
            if not pending_requests:
                await query.edit_message_text(
                    "📋 <b>Запросы на доступ</b>\n\n"
                    "✅ Нет ожидающих запросов.\n"
                    "💡 Все запросы обработаны.",
                    parse_mode=ParseMode.HTML,
                    reply_markup=InlineKeyboardMarkup([[
                        InlineKeyboardButton("🔙 Статус системы", callback_data="show_status")
                    ]])
                )
                return
            
            requests_text = f"📋 <b>Ожидающие запросы ({len(pending_requests)})</b>\n\n"
            
            keyboard = []
            for i, request in enumerate(pending_requests, 1):
                requests_text += (
                    f"{i}. 👤 <b>{request.get_user_display_name()}</b>\n"
                    f"   🔢 ID: <code>{request.user_id}</code>\n"
                    f"   🕒 Время: {request.get_request_time_str()}\n\n"
                )
                
                # Добавляем кнопки для каждого запроса
                keyboard.append([
                    InlineKeyboardButton(f"✅ Принять #{i}", callback_data=f"approve_{request.user_id}"),
                    InlineKeyboardButton(f"❌ Отклонить #{i}", callback_data=f"reject_{request.user_id}")
                ])
            
            keyboard.append([InlineKeyboardButton("🔙 Статус системы", callback_data="show_status")])
            reply_markup = InlineKeyboardMarkup(keyboard)
            
            await query.edit_message_text(
                requests_text,
                parse_mode=ParseMode.HTML,
                reply_markup=reply_markup
            )
            
        except Exception as e:
            logger.error(f"❌ Ошибка показа запросов: {e}")
            await query.edit_message_text(
                "❌ Ошибка получения запросов.",
                reply_markup=InlineKeyboardMarkup([[
                    InlineKeyboardButton("🔙 Статус системы", callback_data="show_status")
                ]])
            )
    
    async def _handle_show_users(self, query):
        """Показывает всех авторизованных пользователей"""
        # Проверяем, что это админ
        if query.from_user.id != BotConfig.ADMIN_ID:
            await query.answer("❌ Доступ только для администратора.")
            return
        
        try:
            authorized_users = list(BotConfig.AUTHORIZED_USERS)
            
            if not authorized_users:
                await query.edit_message_text(
                    "👥 <b>Авторизованные пользователи</b>\n\n"
                    "❌ Нет авторизованных пользователей.",
                    parse_mode=ParseMode.HTML,
                    reply_markup=InlineKeyboardMarkup([[
                        InlineKeyboardButton("🔙 Статус системы", callback_data="show_status")
                    ]])
                )
                return
            
            users_text = f"👥 <b>Авторизованные пользователи ({len(authorized_users)})</b>\n\n"
            
            keyboard = []
            
            for i, user_id in enumerate(authorized_users, 1):
                # Определяем роль
                if user_id == BotConfig.ADMIN_ID:
                    role = "👑 Администратор"
                    users_text += f"{i}. 👑 <b>ID:</b> <code>{user_id}</code> (Администратор)\n"
                else:
                    role = "👤 Пользователь"
                    users_text += f"{i}. 👤 <b>ID:</b> <code>{user_id}</code>\n"
                    
                    # Добавляем кнопку удаления (только для обычных пользователей)
                    keyboard.append([
                        InlineKeyboardButton(
                            f"🗑️ Удалить #{i}", 
                            callback_data=f"remove_user_{user_id}"
                        )
                    ])
            
            users_text += f"\n💡 Вы можете удалить любого пользователя, кроме себя."
            
            keyboard.append([InlineKeyboardButton("🔙 Статус системы", callback_data="show_status")])
            reply_markup = InlineKeyboardMarkup(keyboard)
            
            await query.edit_message_text(
                users_text,
                parse_mode=ParseMode.HTML,
                reply_markup=reply_markup
            )
            
        except Exception as e:
            logger.error(f"❌ Ошибка показа пользователей: {e}")
            await query.edit_message_text(
                "❌ Ошибка получения списка пользователей.",
                reply_markup=InlineKeyboardMarkup([[
                    InlineKeyboardButton("🔙 Статус системы", callback_data="show_status")
                ]])
            )
    
    async def _handle_remove_user(self, query, user_to_remove: int):
        """Обработка удаления пользователя"""
        # Проверяем, что это админ
        if query.from_user.id != BotConfig.ADMIN_ID:
            await query.answer("❌ Доступ только для администратора.")
            return
        
        # Проверяем, что не пытаемся удалить самого себя
        if user_to_remove == BotConfig.ADMIN_ID:
            await query.answer("❌ Нельзя удалить администратора.")
            return
        
        try:
            # Проверяем, что пользователь существует
            if user_to_remove not in BotConfig.AUTHORIZED_USERS:
                await query.edit_message_text(
                    "❌ Пользователь не найден в списке авторизованных.",
                    reply_markup=InlineKeyboardMarkup([[
                        InlineKeyboardButton("🔙 Пользователи", callback_data="show_users")
                    ]])
                )
                return
            
            # Удаляем пользователя
            BotConfig.AUTHORIZED_USERS.remove(user_to_remove)
            
            # Уведомляем удаленного пользователя
            await self._notify_user_removed(user_to_remove)
            
            # Обновляем сообщение админу
            await query.edit_message_text(
                f"🗑️ <b>Пользователь удален!</b>\n\n"
                f"🔢 <b>ID:</b> <code>{user_to_remove}</code>\n"
                f"🕒 <b>Время удаления:</b> {datetime.now().strftime('%H:%M:%S')}\n"
                f"👥 <b>Осталось пользователей:</b> {len(BotConfig.AUTHORIZED_USERS)}\n\n"
                f"💡 Пользователь уведомлен об удалении.",
                parse_mode=ParseMode.HTML,
                reply_markup=InlineKeyboardMarkup([[
                    InlineKeyboardButton("👥 Назад к пользователям", callback_data="show_users"),
                    InlineKeyboardButton("📊 Статус системы", callback_data="show_status")
                ]])
            )
            
            logger.info(f"🗑️ Админ удалил пользователя {user_to_remove}")
            
        except Exception as e:
            logger.error(f"❌ Ошибка удаления пользователя: {e}")
            await query.edit_message_text(
                "❌ Ошибка удаления пользователя.",
                reply_markup=InlineKeyboardMarkup([[
                    InlineKeyboardButton("🔙 Пользователи", callback_data="show_users")
                ]])
            )
    
    async def _notify_user_removed(self, user_id: int):
        """Уведомляет пользователя об удалении"""
        try:
            await self.application.bot.send_message(
                chat_id=user_id,
                text=(
                    f"🚫 <b>Ваш доступ к боту отозван</b>\n\n"
                    f"❌ Администратор отозвал ваш доступ к боту генерации сигналов.\n"
                    f"📞 Для уточнения обратитесь: @kaktotakxm\n\n"
                    f"💡 Вы можете подать новый запрос на доступ."
                ),
                parse_mode=ParseMode.HTML
            )
        except Exception as e:
            logger.error(f"❌ Ошибка уведомления удаленного пользователя {user_id}: {e}")

    async def _handle_forex_menu(self, query):
        """Показывает меню форекс сигналов"""
        user_id = query.from_user.id
        
        # Очищаем активный сигнал при переходе в меню форекс
        if user_id in self.active_signals:
            del self.active_signals[user_id]
        
        keyboard = [
            [
                InlineKeyboardButton("📊 Форекс сигнал", callback_data="get_signal"),
                InlineKeyboardButton("🏆 ТОП-3 форекс", callback_data="bulk_signals")
            ],
            [
                InlineKeyboardButton("⬅️ Назад", callback_data="back_to_main")
            ]
        ]
        
        text = "📊 <b>ФОРЕКС СИГНАЛЫ</b>\n\n"
        if self.market_schedule.is_market_open():
            text += "🟢 <b>Рынок ОТКРЫТ</b>\n"
            text += "💡 Доступны реальные сигналы с живыми данными"
        else:
            text += "🔴 <b>Рынок ЗАКРЫТ</b>\n"
            text += "💡 Доступны демо-сигналы для тестирования"
            
        await query.edit_message_text(
            text=text,
            reply_markup=InlineKeyboardMarkup(keyboard),
            parse_mode='HTML'
        )

    async def _handle_otc_menu(self, query):
        """Показывает меню ОТС сигналов"""
        user_id = query.from_user.id
        
        # Очищаем активный сигнал при переходе в меню OTC
        if user_id in self.active_signals:
            del self.active_signals[user_id]
        
        keyboard = [
            [
                InlineKeyboardButton("⚡ ОТС сигнал", callback_data="get_otc_signal"),
                InlineKeyboardButton("🏆 ТОП-3 ОТС", callback_data="bulk_otc_signals")
            ],
            [
                InlineKeyboardButton("⬅️ Назад", callback_data="back_to_main")
            ]
        ]
        
        text = "⚡ <b>ОТС СИГНАЛЫ</b>\n\n"
        text += "🟢 <b>ОТС рынок ОТКРЫТ 24/7</b>\n"
        text += "💡 Доступны реальные сигналы круглосуточно\n"
        text += "📊 5 основных ОТС пар"
            
        await query.edit_message_text(
            text=text,
            reply_markup=InlineKeyboardMarkup(keyboard),
            parse_mode='HTML'
        )

    async def _handle_get_otc_signal(self, query):
        """Показывает клавиатуру выбора ОТС пары"""
        keyboard = []
        
        # Создаем кнопки для ОТС пар (по 2 в ряду)
        otc_pairs = self.otc_generator.supported_otc_pairs
        for i in range(0, len(otc_pairs), 2):
            row = []
            for j in range(2):
                if i + j < len(otc_pairs):
                    pair = otc_pairs[i + j]
                    display_name = pair.replace(" (OTC)", "")
                    callback_data = f"otc_signal_{pair.replace('/', '_').replace(' (OTC)', '')}"
                    row.append(InlineKeyboardButton(display_name, callback_data=callback_data))
            keyboard.append(row)
        
        # Кнопка назад
        keyboard.append([InlineKeyboardButton("⬅️ Назад", callback_data="otc_menu")])
        
        text = "⚡ <b>Выберите ОТС пару:</b>\n\n"
        text += "💡 ОТС пары работают 24/7\n"
        text += "📊 Выберите пару для генерации сигнала"
        
        await query.edit_message_text(
            text=text,
            reply_markup=InlineKeyboardMarkup(keyboard),
            parse_mode='HTML'
        )

    async def _handle_generate_otc_signal(self, query, pair: str):
        """Генерирует и показывает ОТС сигнал"""
        try:
            user_id = query.from_user.id
            current_time = time.time()
            
            # Проверяем cooldown (задержка между генерациями)
            if user_id in self.last_signal_time:
                time_passed = current_time - self.last_signal_time[user_id]
                cooldown = BotConfig.SIGNAL_SETTINGS["signal_cooldown"]
                
                if time_passed < cooldown:
                    remaining = cooldown - time_passed
                    minutes = int(remaining // 60)
                    seconds = int(remaining % 60)
                    
                    await query.edit_message_text(
                        f"⏰ <b>Подождите 30 секунд и выберите другую пару</b>\n\n"
                        f"🕒 Осталось: {minutes}м {seconds}с\n\n"
                        f"💡 Рекомендация:\n"
                        f"• Попробуйте другую ОТС пару\n"
                        f"• Дождитесь изменения рыночных условий\n\n"
                        f"🎯 Выберите пару с лучшими условиями для торговли!",
                        parse_mode='HTML',
                        reply_markup=InlineKeyboardMarkup([
                            [InlineKeyboardButton("🔄 Обновить таймер", callback_data="show_pending_trades")],
                            [InlineKeyboardButton("⬅️ ОТС меню", callback_data="otc_menu")]
                        ])
                    )
                    return
            
            # Отвечаем на callback
            await query.answer()
            
            # Отправляем сообщение о поиске
            wait_message = await query.message.reply_text(
                "⏳ <b>Ожидайте...</b>\n\n"
                "🔍 Ищем наилучшую точку входа для ОТС пары\n"
                "📊 Анализируем рыночные данные\n"
                "🎯 Рассчитываем оптимальный сигнал\n\n"
                "💡 Это займет несколько секунд...",
                parse_mode='HTML'
            )
            
            # Генерируем сигнал
            signal = await self.otc_generator.generate_otc_signal(pair)
            
            # Обновляем время при ЛЮБОЙ попытке OTC генерации (даже неудачной)
            self.last_signal_time[user_id] = current_time
            self.last_bulk_signal_time[user_id] = current_time
            
            if signal:
                # Проверяем качество сигнала СРАЗУ
                confidence_value = signal.confidence if signal.confidence <= 1 else signal.confidence / 100
                if confidence_value < 0.60:  # Минимальный порог уверенности 60% для ОТС
                    await query.message.reply_text(
                        f"⚠️ <b>Нет подходящей точки входа для {pair}</b>\n\n"
                        f"📊 Текущая уверенность: {signal.confidence * 100 if signal.confidence <= 1 else signal.confidence:.1f}%\n"
                        f"🎯 Требуется минимум: 60%\n\n"
                        f"💡 <b>Рекомендации:</b>\n"
                        f"• Смените пару\n"
                        f"• Попробуйте позже\n"
                        f"• Дождитесь лучших рыночных условий",
                        reply_markup=InlineKeyboardMarkup([
                            [InlineKeyboardButton("🔄 Другая пара", callback_data="get_otc_signal")],
                            [InlineKeyboardButton("⬅️ ОТС меню", callback_data="otc_menu")]
                        ]),
                        parse_mode='HTML'
                    )
                else:
                    # Форматируем качественный сигнал
                    signal_text = self._format_otc_signal_detailed(signal)
                    
                    # Кнопки с обратной связью для качественных сигналов
                    signal_id = f"otc_{pair.replace('/', '_').replace(' (OTC)', '')}_{int(time.time())}"
                    keyboard = [
                        [
                            InlineKeyboardButton("🔄 Обновить таймер", callback_data="show_pending_trades")
                        ]
                    ]
                    
                    # Сохраняем данные сигнала для статистики
                    self._store_signal_for_feedback(signal_id, query.from_user.id, signal, "otc")
                    
                    # Увеличиваем счетчик одиночных ОТС сигналов
                    self._increment_signal_stats('otc_single', query.from_user.id)
                    
                    # Добавляем в режим ожидания результата (только для качественных сигналов)
                    confidence_value = signal.confidence if signal.confidence <= 1 else signal.confidence / 100
                    if confidence_value >= 0.60:  # Порог для ОТС 60%
                        self._add_pending_trade(query.from_user.id, signal_id, signal.duration)
                    
                    # Сохраняем активный OTC сигнал ДО отправки (только качественные)
                    self.active_signals[user_id] = {
                        'text': signal_text,
                        'keyboard': InlineKeyboardMarkup(keyboard),
                        'signal_data': signal,
                        'timestamp': current_time
                    }
                    
                    # Отправляем качественный сигнал
                    await query.message.reply_text(
                        text=signal_text,
                        reply_markup=InlineKeyboardMarkup(keyboard),
                        parse_mode='HTML'
                    )
                
                # Удаляем сообщение ожидания
                await wait_message.delete()
            else:
                await wait_message.edit_text(
                    "❌ Не удалось сгенерировать ОТС сигнал. Попробуйте позже.",
                    reply_markup=InlineKeyboardMarkup([[
                        InlineKeyboardButton("⬅️ Назад", callback_data="otc_menu")
                    ]]),
                    parse_mode='HTML'
                )
                
        except Exception as e:
            logger.error(f"❌ Ошибка генерации ОТС сигнала: {e}")
            try:
                await query.message.reply_text(
                    "❌ Ошибка генерации сигнала. Попробуйте позже.",
                    reply_markup=InlineKeyboardMarkup([[
                        InlineKeyboardButton("⬅️ Назад", callback_data="otc_menu")
                    ]])
                )
            except:
                pass

    def _format_otc_signal_detailed(self, signal: PowerfulOTCSignal) -> str:
        """Форматирует детальный ОТС сигнал"""
        direction_emoji = {
            'BUY': '🟢',
            'SELL': '🔴', 
            'NEUTRAL': '🟡'
        }
        
        emoji = direction_emoji.get(signal.direction, '❓')
        
        text = f"{emoji} <b>МОЩНЫЙ ОТС СИГНАЛ</b>\n\n"
        text += f"💱 <b>Пара:</b> {signal.pair}\n"
        text += f"📊 <b>Направление:</b> {signal.direction}\n"
        text += f"🎯 <b>Уверенность:</b> {signal.confidence * 100 if signal.confidence <= 1 else signal.confidence:.1f}%\n"
        text += f"📈 <b>Тренд:</b> {signal.trend.upper()}\n"
        text += f"🕒 <b>Время:</b> {signal.timestamp.strftime('%H:%M:%S')}\n"
        # Показываем точное время экспирации
        text += f"⏰ <b>Экспирация:</b> {signal.duration} мин\n\n"
        
        text += "🔬 <b>Технический анализ (22+ индикаторов):</b>\n"
        if hasattr(signal, 'indicators') and signal.indicators:
            if 'rsi' in signal.indicators:
                text += f"• RSI: {signal.indicators['rsi']:.1f}\n"
            if 'ema_21' in signal.indicators:
                text += f"• EMA(21): {signal.indicators['ema_21']:.5f}\n"
            if 'macd' in signal.indicators:
                text += f"• MACD: {signal.indicators['macd']:.6f}\n"
        else:
            text += "• Полный анализ всех индикаторов выполнен\n"
        
        text += f"\n⚡ <b>ОТС режим:</b> 24/7 с полным анализом трендов"
        
        return text
    
    def _get_time_range(self, duration: int) -> str:
        """Формирует диапазон времени экспирации"""
        time_ranges = {
            1: "1-2",
            2: "2-3", 
            3: "2-3",
            4: "4-5",
            5: "4-5"
        }
        return time_ranges.get(duration, f"{duration}-{duration+1}")
    
    def _store_signal_for_feedback(self, signal_id: str, user_id: int, signal, signal_type: str):
        """Сохраняет данные сигнала для последующей обратной связи"""
        try:
            # Сохраняем в памяти для быстрого доступа
            if not hasattr(self, 'pending_signals'):
                self.pending_signals = {}
            
            self.pending_signals[signal_id] = {
                'user_id': user_id,
                'pair': signal.pair,
                'direction': signal.direction,
                'confidence': signal.confidence,
                'entry_price': signal.entry_price,
                'expiration': signal.duration,
                'signal_type': signal_type,
                'timestamp': signal.timestamp.isoformat()
            }
            
            logger.info(f"💾 Сохранен сигнал для обратной связи: {signal_id}")
            
        except Exception as e:
            logger.error(f"❌ Ошибка сохранения сигнала для обратной связи: {e}")
    
    async def _handle_feedback(self, query, signal_id: str, feedback: str):
        """Обрабатывает обратную связь от пользователя"""
        try:
            user_id = query.from_user.id
            
            # Проверяем, готов ли сигнал к получению обратной связи
            if not self._is_signal_ready_for_feedback(user_id, signal_id):
                if user_id in self.pending_trade_timers and signal_id in self.pending_trade_timers[user_id]:
                    expiry_time = self.pending_trade_timers[user_id][signal_id]
                    current_time = time.time()
                    remaining_seconds = max(0, int(expiry_time - current_time))
                    remaining_minutes = remaining_seconds // 60
                    remaining_seconds = remaining_seconds % 60
                    
                    await query.answer(
                        f"⏰ Подождите! Результат можно указать через {remaining_minutes}м {remaining_seconds}с",
                        show_alert=True
                    )
                else:
                    await query.answer("❌ Сигнал не найден в ожидающих", show_alert=True)
                return
            
            await query.answer()
            
            # Получаем данные сигнала
            if not hasattr(self, 'pending_signals') or signal_id not in self.pending_signals:
                await query.edit_message_text("❌ Данные сигнала не найдены.")
                return
            
            signal_data = self.pending_signals[signal_id]
            
            # Добавляем обратную связь в статистику
            success = signal_statistics.add_feedback(
                signal_id=signal_id,
                user_id=signal_data['user_id'],
                pair=signal_data['pair'],
                direction=signal_data['direction'],
                confidence=signal_data['confidence'],
                entry_price=signal_data['entry_price'],
                expiration=signal_data['expiration'],
                signal_type=signal_data['signal_type'],
                timestamp=signal_data['timestamp'],
                feedback=feedback
            )
            
            if success:
                feedback_emoji = "✅" if feedback == "success" else "❌"
                feedback_text = "успешной" if feedback == "success" else "неудачной"
                
                # Удаляем сигнал из режима ожидания результата
                user_id = query.from_user.id
                self._remove_pending_trade(user_id, signal_id)
                
                # Добавляем результат в статистику торговли
                self._add_trade_result(user_id, feedback)
                
                # Показываем итоговое сообщение и очищаем активный сигнал, чтобы кнопка 'Главное меню' работала
                if user_id in self.active_signals:
                    active_signal = self.active_signals[user_id]
                    feedback_info = f"\n\n{feedback_emoji} <b>Ваш отзыв:</b> {feedback_text} сделка"
                    updated_text = active_signal['text'] + feedback_info
                    signal_type = signal_data.get('signal_type', 'forex')
                    back_button = InlineKeyboardButton("⬅️ ОТС меню", callback_data="otc_menu") if signal_type == 'otc' else InlineKeyboardButton("🔙 Главное меню", callback_data="back_to_main")
                    await query.edit_message_text(
                        updated_text,
                        reply_markup=InlineKeyboardMarkup([[back_button]]),
                        parse_mode='HTML'
                    )
                    # Очистить активный сигнал, чтобы back_to_main больше не возвращал старый экран
                    try:
                        del self.active_signals[user_id]
                    except KeyError:
                        pass
                else:
                    await query.edit_message_text(
                        f"{feedback_emoji} <b>Спасибо за обратную связь!</b>\n\n"
                        f"📊 Сигнал отмечен как {feedback_text} сделка.\n"
                        f"💡 Ваш отзыв поможет улучшить качество сигналов.\n\n"
                        f"📈 Продолжайте торговать!",
                        reply_markup=InlineKeyboardMarkup([[
                            InlineKeyboardButton("🔙 Главное меню", callback_data="back_to_main")
                        ]]),
                        parse_mode='HTML'
                    )
                    # На всякий случай очищаем активный сигнал
                    try:
                        if user_id in self.active_signals:
                            del self.active_signals[user_id]
                    except Exception:
                        pass
                
                # Удаляем из памяти
                del self.pending_signals[signal_id]
                
                logger.info(f"✅ Обратная связь обработана: {signal_data['pair']} - {feedback}")
            else:
                await query.edit_message_text("❌ Ошибка сохранения обратной связи.")
                
        except Exception as e:
            logger.error(f"❌ Ошибка обработки обратной связи: {e}")
            await query.edit_message_text("❌ Ошибка обработки обратной связи.")
    
    def _get_main_keyboard(self, user_id: int = None) -> InlineKeyboardMarkup:
        """Создает главную клавиатуру"""
        keyboard = [
            [
                InlineKeyboardButton("📊 Форекс", callback_data="forex_menu"),
                InlineKeyboardButton("⚡ ОТС", callback_data="otc_menu")
            ],
            [
                InlineKeyboardButton("🌐 Web App", web_app={'url': self.web_app_url})
            ],
            [
                InlineKeyboardButton("📅 Расписание работы", callback_data="show_market"),
                InlineKeyboardButton("❓ Помощь", callback_data="show_help")
            ]
        ]
        
        # Добавляем кнопку очистки активного сигнала, если он есть
        if user_id and user_id in self.active_signals:
            keyboard.append([InlineKeyboardButton("🗑️ Очистить сигнал", callback_data="clear_signal")])
        
        # Добавляем кнопку статуса только для админа
        if user_id == BotConfig.ADMIN_ID:
            keyboard.append([InlineKeyboardButton("⚙️ Статус системы", callback_data="show_status")])
        
        return InlineKeyboardMarkup(keyboard)
    
    def _get_pairs_keyboard(self) -> InlineKeyboardMarkup:
        """Создает клавиатуру выбора валютных пар"""
        supported_pairs = self.signal_generator.get_supported_pairs()
        
        keyboard = []
        # По 2 пары в ряд
        for i in range(0, len(supported_pairs), 2):
            row = []
            for j in range(2):
                if i + j < len(supported_pairs):
                    pair = supported_pairs[i + j]
                    row.append(InlineKeyboardButton(
                        pair, 
                        callback_data=f"signal_{pair.replace('/', '_')}"
                    ))
            keyboard.append(row)
        
        # Кнопка "Назад"
        keyboard.append([InlineKeyboardButton("🔙 Назад", callback_data="back_to_main")])
        
        return InlineKeyboardMarkup(keyboard)
    
    async def button_handler(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Обработчик нажатий кнопок"""
        query = update.callback_query
        user_id = query.from_user.id
        
        if not self._check_authorization(user_id):
            await query.answer("❌ У вас нет доступа к этому боту.")
            return
        
        await query.answer()
        
        data = query.data
        
        # Проверяем авторизацию для всех кнопок
        if not self._check_authorization(user_id):
            await query.answer("❌ У вас нет доступа к этому боту.")
            return
        
        # Проверяем режим ожидания результата (блокируем навигацию кроме обратной связи)
        if user_id in self.pending_trade_results and not data.startswith("feedback_") and not data.startswith("select_") and data != "show_pending_trades":
            pending_count = len(self.pending_trade_results[user_id])
            
            try:
                await query.edit_message_text(
                    f"🔒 <b>ОБЯЗАТЕЛЬНАЯ ОБРАТНАЯ СВЯЗЬ</b>\n\n"
                    f"❗ Навигация заблокирована до получения результата\n\n"
                    f"📊 Ожидается обратная связь по {pending_count} сигналам\n"
                    f"🎯 Укажите результат ВСЕХ сделок для разблокировки\n\n"
                    f"💡 <b>Почему это обязательно?</b>\n"
                    f"• Улучшение качества сигналов\n"
                    f"• Анализ эффективности стратегий\n"
                    f"• Персонализация рекомендаций\n\n"
                    f"⚠️ Без обратной связи навигация невозможна!",
                    parse_mode=ParseMode.HTML,
                    reply_markup=InlineKeyboardMarkup([
                        [InlineKeyboardButton("📊 Показать ожидающие сигналы", callback_data="show_pending_trades")]
                    ])
                )
            except Exception as e:
                # Если не удалось отредактировать (например, то же содержимое), просто отвечаем
                logger.warning(f"Не удалось отредактировать сообщение блокировки: {e}")
            return
        
        try:
            if data == "get_signal":
                await self._handle_get_signal(query)
            elif data == "bulk_signals":
                await self._handle_bulk_signals(query)
            elif data == "show_status":
                # Дополнительная проверка для админских функций
                if user_id != BotConfig.ADMIN_ID:
                    await query.answer("❌ Доступ только для администратора.")
                    return
                logger.info("🔍 ВЫЗОВ _handle_show_status - проверяем что вызывается")
                await self._handle_show_new_status(query)
            elif data == "show_help":
                await self._handle_show_help(query)
            elif data == "show_market":
                await self._handle_show_market(query)
            elif data == "back_to_main":
                await self._handle_back_to_main(query)
            elif data.startswith("signal_"):
                pair = data.replace("signal_", "").replace("_", "/")
                await self._handle_generate_signal(query, pair)
            elif data.startswith("approve_"):
                request_user_id = int(data.replace("approve_", ""))
                await self._handle_approve_request(query, request_user_id)
            elif data.startswith("reject_"):
                request_user_id = int(data.replace("reject_", ""))
                await self._handle_reject_request(query, request_user_id)
            elif data == "show_all_requests":
                await self._handle_show_all_requests(query)
            elif data == "show_users":
                await self._handle_show_users(query)
            elif data.startswith("remove_user_"):
                user_to_remove = int(data.replace("remove_user_", ""))
                await self._handle_remove_user(query, user_to_remove)
            # Новые меню
            elif data == "forex_menu":
                await self._handle_forex_menu(query)
            elif data == "otc_menu":
                await self._handle_otc_menu(query)
            elif data == "get_otc_signal":
                await self._handle_get_otc_signal(query)
            elif data == "bulk_otc_signals":
                await self._handle_bulk_otc_signals(query)
            elif data.startswith("otc_signal_"):
                pair = data.replace("otc_signal_", "").replace("_", "/") + " (OTC)"
                await self._handle_generate_otc_signal(query, pair)
            elif data.startswith("select_otc_pair_"):
                signal_id = data.replace("select_otc_pair_", "")
                logger.info(f"🎯 ВЫБОР ОТС ПАРЫ: signal_id = {signal_id}")
                await self._handle_select_otc_pair(query, signal_id)
            elif data.startswith("select_forex_pair_"):
                signal_id = data.replace("select_forex_pair_", "")
                await self._handle_select_forex_pair(query, signal_id)
            elif data == "show_pending_trades":
                await self._handle_show_pending_trades(query)
            elif data == "refresh_signal_cooldown":
                await self._handle_refresh_signal_cooldown(query)
            elif data == "show_user_stats":
                # Дополнительная проверка для админских функций
                if user_id != BotConfig.ADMIN_ID:
                    await query.answer("❌ Доступ только для администратора.")
                    return
                await self._handle_show_user_stats(query)
            # Обработка обратной связи
            elif data.startswith("feedback_success_"):
                signal_id = data.replace("feedback_success_", "")
                await self._handle_feedback(query, signal_id, "success")
            elif data.startswith("feedback_failure_"):
                signal_id = data.replace("feedback_failure_", "")
                await self._handle_feedback(query, signal_id, "failure")
            elif data == "clear_signal":
                await self._handle_clear_signal(query)
            else:
                await query.edit_message_text("❌ Неизвестная команда.")
                
        except Exception as e:
            logger.error(f"Ошибка обработки кнопки {data}: {e}")
            await query.edit_message_text(
                "❌ Произошла ошибка. Попробуйте позже.",
                reply_markup=self._get_main_keyboard(query.from_user.id)
            )
    
    async def _handle_get_signal(self, query):
        """Обработка запроса на получение сигнала"""
        user_id = query.from_user.id
        
        # Очищаем активный сигнал при переходе в меню выбора пар
        if user_id in self.active_signals:
            del self.active_signals[user_id]
        
        text = (
            "📊 <b>Выберите валютную пару для генерации сигнала</b>\n\n"
            "Нажмите на пару, для которой хотите получить торговый сигнал:"
        )
        
        keyboard = self._get_pairs_keyboard()
        
        await query.edit_message_text(
            text,
            parse_mode=ParseMode.HTML,
            reply_markup=keyboard
        )
    
    async def _handle_bulk_signals(self, query):
        """Обработка запроса на массовую генерацию сигналов"""
        user_id = query.from_user.id
        current_time = time.time()
        
        # Проверяем ТОП-3 кулдаун (10 минут)
        top3_cooldown = 600  # 10 минут в секундах
        if user_id in self.last_top3_generation:
            time_passed = current_time - self.last_top3_generation[user_id]
            if time_passed < top3_cooldown:
                remaining = top3_cooldown - time_passed
                minutes = int(remaining // 60)
                seconds = int(remaining % 60)
                
                await query.edit_message_text(
                    f"⏰ <b>ТОП-3 Форекс сигналы доступны раз в 10 минут</b>\n\n"
                    f"🕒 Осталось ждать: {minutes}м {seconds}с\n\n"
                    f"💡 <b>Почему такое ограничение?</b>\n"
                    f"• Качественный анализ требует времени\n"
                    f"• Предотвращение спама запросов\n"
                    f"• Более точные сигналы\n\n"
                    f"🎯 Используйте время для анализа текущих сигналов!",
                    parse_mode=ParseMode.HTML,
                    reply_markup=InlineKeyboardMarkup([
                        [InlineKeyboardButton("🔙 Форекс меню", callback_data="forex_menu")]
                    ])
                )
                return
        
        # Проверяем cooldown для массовых сигналов (4 минуты) ИЛИ любых сигналов (2 минуты)
        bulk_cooldown = BotConfig.SIGNAL_SETTINGS["bulk_signal_cooldown"]
        single_cooldown = BotConfig.SIGNAL_SETTINGS["signal_cooldown"]
        
        # Проверяем последний массовый сигнал
        bulk_blocked = False
        if user_id in self.last_bulk_signal_time:
            time_passed = current_time - self.last_bulk_signal_time[user_id]
            if time_passed < bulk_cooldown:
                bulk_blocked = True
                remaining = bulk_cooldown - time_passed
        
        # Проверяем последний одиночный сигнал  
        single_blocked = False
        if user_id in self.last_signal_time:
            time_passed = current_time - self.last_signal_time[user_id]
            if time_passed < single_cooldown:
                single_blocked = True
                remaining = max(remaining if bulk_blocked else 0, single_cooldown - time_passed)
        
        # Если любой тип заблокирован
        if bulk_blocked or single_blocked:
            minutes = int(remaining // 60)
            seconds = int(remaining % 60)
            
            block_type = "массовых" if bulk_blocked else "одиночных"
            
            await query.edit_message_text(
                f"⏰ <b>Подождите перед ТОП-3 сигналами</b>\n\n"
                f"🕒 Осталось: {minutes}м {seconds}с\n\n"
                f"💡 Блокировка после {block_type} сигналов:\n"
                f"• Только что сгенерирован сигнал\n"
                f"• Экономия API лимитов\n"
                f"• Качественный анализ требует времени\n\n"
                f"🎯 Дождитесь окончания таймера!",
                parse_mode=ParseMode.HTML,
                reply_markup=InlineKeyboardMarkup([
                    [InlineKeyboardButton("🔙 Главное меню", callback_data="back_to_main")]
                ])
            )
            return
        
        # Проверяем время работы рынка
        market_status = self.market_schedule.get_market_status()
        
        if not market_status['is_open']:
            market_message = self.market_schedule.get_market_message()
            await query.edit_message_text(
                f"{market_message}\n\n"
                f"❌ <b>Форекс сигналы недоступны</b>\n"
                f"⏰ Дождитесь открытия рынка для реальных сигналов\n\n"
                f"💡 Вы можете использовать ОТС сигналы (работают 24/7)",
                parse_mode=ParseMode.HTML,
                reply_markup=InlineKeyboardMarkup([
                    [InlineKeyboardButton("⚡ ОТС сигналы", callback_data="otc_menu")],
                    [InlineKeyboardButton("🔙 Главное меню", callback_data="back_to_main")]
                ])
            )
            return
        
        await query.edit_message_text(
            "⏳ <b>Анализ 6 основных форекс пар...</b>\n\n"
            "Генерируем сигналы и ищем лучшие по скору...",
            parse_mode=ParseMode.HTML
        )
        
        try:
            # Получаем лучшие сигналы по скору (как в основном боте)
            best_signals = await self.signal_generator.get_best_signals(limit=3)
            
            if best_signals:
                signals_text = "🏆 <b>ТОП-3 сигнала по скору</b>\n\n"
                
                for i, signal in enumerate(best_signals, 1):
                    direction_emoji = "🟢" if signal.direction == "BUY" else "🔴"
                    confidence_color = "🟢" if signal.final_score > 0.8 else "🟡" if signal.final_score > 0.7 else "🔴"
                    boost_info = " 🧠" if signal.memory_boost else ""
                    
                    signals_text += (
                        f"{i}. {confidence_color} <b>{signal.pair}</b>: {signal.direction}\n"
                        f"   📊 Скор: <b>{signal.final_score * 100 if signal.final_score <= 1 else signal.final_score:.1f}%</b>{boost_info}\n"
                        f"   ⏰ Экспирация: <b>{signal.duration} мин</b>\n\n"
                    )
                
                signals_text += f"🔍 <b>Проанализировано:</b> 6 основных пар\n"
                signals_text += f"🕒 <b>Время генерации:</b> {datetime.now().strftime('%H:%M:%S')}\n\n"
                signals_text += "💡 Сигналы отсортированы по скору (лучшие сверху)"
            else:
                signals_text = (
                    "⚠️ <b>Нет сигналов с высоким скором</b>\n\n"
                    "Все 6 основных пар проанализированы, но:\n"
                    "• Скор всех сигналов < 75%\n"
                    "• Рыночные условия не благоприятны\n"
                    "• Недостаточно данных для уверенного анализа\n\n"
                    "Попробуйте позже или проверьте отдельные пары."
                )
            
            # Создаем кнопки для выбора пар в которые вошел пользователь
            if best_signals:
                feedback_keyboard = []
                
                # Добавляем кнопки для каждого форекс сигнала
                for i, signal in enumerate(best_signals, 1):
                    pair_name = signal.pair
                    signal_id = f"bulk_forex_{pair_name.replace('/', '_')}_{int(current_time)}"
                    
                    # Сохраняем данные сигнала для обратной связи
                    self._store_signal_for_feedback(signal_id, user_id, signal, "bulk_forex")
                    
                    # НЕ добавляем в режим ожидания - блокировка будет только после выбора пары
                    
                    feedback_keyboard.append([
                        InlineKeyboardButton(f"📊 {i}. {pair_name}", callback_data=f"select_forex_pair_{signal_id}")
                    ])
                
                # Убираем кнопку "Главное меню" - пользователь ДОЛЖЕН выбрать пару
                
                keyboard = InlineKeyboardMarkup(feedback_keyboard)
                
                signals_text += "\n\n👇 <b>Выберите пары в которые вошли:</b>"
            else:
                # Если нет качественных сигналов - НЕ ДАЕМ выйти, активируем кулдаун
                self.last_top3_generation[user_id] = current_time  # Активируем кулдаун даже без сигналов
                keyboard = InlineKeyboardMarkup([
                    [InlineKeyboardButton("🔄 Попробовать снова через 10 мин", callback_data="bulk_signals")]
                ])
            
            await query.edit_message_text(
                signals_text,
                parse_mode=ParseMode.HTML,
                reply_markup=keyboard
            )
            
            # Обновляем время последней массовой генерации (только при успешных сигналах)
            if best_signals:
                self.last_bulk_signal_time[user_id] = current_time
                # Также блокируем одиночные сигналы после массовых
                self.last_signal_time[user_id] = current_time
                # НЕ обновляем last_top3_generation здесь - только после выбора пары!
                
                # Увеличиваем счетчик ТОП-3 Форекс сигналов
                self._increment_signal_stats('forex_bulk', user_id, len(best_signals))
            
        except Exception as e:
            logger.error(f"Ошибка генерации сигналов по скору: {e}")
            await query.edit_message_text(
                "❌ Ошибка генерации сигналов. Попробуйте позже.",
                reply_markup=self._get_main_keyboard()
            )
    
    async def _handle_bulk_otc_signals(self, query):
        """Обработка запроса на массовую генерацию ОТС сигналов"""
        user_id = query.from_user.id
        current_time = time.time()
        
        # Проверяем ТОП-3 кулдаун (10 минут)
        top3_cooldown = 600  # 10 минут в секундах
        if user_id in self.last_top3_generation:
            time_passed = current_time - self.last_top3_generation[user_id]
            if time_passed < top3_cooldown:
                remaining = top3_cooldown - time_passed
                minutes = int(remaining // 60)
                seconds = int(remaining % 60)
                
                await query.edit_message_text(
                    f"⏰ <b>ТОП-3 ОТС сигналы доступны раз в 10 минут</b>\n\n"
                    f"🕒 Осталось ждать: {minutes}м {seconds}с\n\n"
                    f"💡 <b>Почему такое ограничение?</b>\n"
                    f"• Качественный анализ требует времени\n"
                    f"• Предотвращение спама запросов\n"
                    f"• Более точные сигналы\n\n"
                    f"🎯 Используйте время для анализа текущих сигналов!",
                    parse_mode=ParseMode.HTML,
                    reply_markup=InlineKeyboardMarkup([
                        [InlineKeyboardButton("⬅️ ОТС меню", callback_data="otc_menu")]
                    ])
                )
                return
        
        # Проверяем cooldown для массовых сигналов (4 минуты) ИЛИ любых сигналов (2 минуты)
        bulk_cooldown = BotConfig.SIGNAL_SETTINGS["bulk_signal_cooldown"]
        single_cooldown = BotConfig.SIGNAL_SETTINGS["signal_cooldown"]
        
        # Проверяем последний массовый сигнал
        bulk_blocked = False
        if user_id in self.last_bulk_signal_time:
            time_passed = current_time - self.last_bulk_signal_time[user_id]
            if time_passed < bulk_cooldown:
                bulk_blocked = True
                remaining = bulk_cooldown - time_passed
        
        # Проверяем последний одиночный сигнал  
        single_blocked = False
        if user_id in self.last_signal_time:
            time_passed = current_time - self.last_signal_time[user_id]
            if time_passed < single_cooldown:
                single_blocked = True
                remaining = max(remaining if bulk_blocked else 0, single_cooldown - time_passed)
        
        # Если любой тип заблокирован
        if bulk_blocked or single_blocked:
            minutes = int(remaining // 60)
            seconds = int(remaining % 60)
            
            block_type = "массовых" if bulk_blocked else "одиночных"
            
            await query.edit_message_text(
                f"⏰ <b>Подождите перед ТОП-3 ОТС сигналами</b>\n\n"
                f"🕒 Осталось: {minutes}м {seconds}с\n\n"
                f"💡 Блокировка после {block_type} сигналов:\n"
                f"• Только что сгенерирован сигнал\n"
                f"• Экономия API лимитов\n"
                f"• Качественный анализ требует времени\n\n"
                f"🎯 Дождитесь окончания таймера!",
                parse_mode=ParseMode.HTML,
                reply_markup=InlineKeyboardMarkup([
                    [InlineKeyboardButton("🔙 ОТС меню", callback_data="otc_menu")]
                ])
            )
            return
        
        await query.edit_message_text(
            "⏳ <b>Анализ 5 основных ОТС пар...</b>\n\n"
            "Генерируем ОТС сигналы и ищем лучшие по скору...",
            parse_mode=ParseMode.HTML
        )
        
        try:
            # Получаем все поддерживаемые OTC пары
            otc_pairs = self.otc_generator.get_supported_pairs()
            
            # Генерируем сигналы для всех OTC пар
            best_otc_signals = []
            for pair in otc_pairs[:3]:  # Ограничиваем до 3 пар для экономии API
                try:
                    signal = await self.otc_generator.generate_otc_signal(pair)
                    if signal and signal.confidence >= 0.60:  # Порог 60% для OTC
                        best_otc_signals.append(signal)
                    
                    # Задержка между парами
                    await asyncio.sleep(2)
                    
                except Exception as e:
                    logger.error(f"❌ Ошибка OTC сигнала для {pair}: {e}")
                    continue
            
            if best_otc_signals:
                # Сортируем по уверенности
                best_otc_signals.sort(key=lambda s: s.confidence, reverse=True)
                
                signals_text = "🏆 <b>ТОП-3 ОТС сигнала по скору</b>\n\n"
                
                for i, signal in enumerate(best_otc_signals, 1):
                    confidence_color = "🟢" if signal.confidence > 0.8 else "🟡" if signal.confidence > 0.6 else "🔴"
                    
                    signals_text += (
                        f"{i}. {confidence_color} <b>{signal.pair}</b>: {signal.direction}\n"
                        f"   📊 Скор: <b>{signal.confidence * 100 if signal.confidence <= 1 else signal.confidence:.1f}%</b>\n"
                        f"   ⏰ Экспирация: <b>{signal.duration} мин</b>\n\n"
                    )
                
                signals_text += f"🔍 <b>Проанализировано:</b> 5 основных ОТС пар\n"
                signals_text += f"🕒 <b>Время генерации:</b> {datetime.now().strftime('%H:%M:%S')}\n\n"
                signals_text += "💡 ОТС сигналы отсортированы по скору (лучшие сверху)"
            else:
                signals_text = (
                    "⚠️ <b>Нет ОТС сигналов с высоким скором</b>\n\n"
                    "Все 5 основных ОТС пар проанализированы, но:\n"
                    "• Скор всех сигналов < 60%\n"
                    "• Рыночные условия не благоприятны\n"
                    "• Недостаточно данных для уверенного анализа\n\n"
                    "Попробуйте позже или проверьте отдельные пары."
                )
            
            # Создаем кнопки для выбора пар в которые вошел пользователь
            if best_otc_signals:
                feedback_keyboard = []
                
                # Добавляем кнопки для каждого сигнала
                pending_signals = []
                for i, signal in enumerate(best_otc_signals, 1):
                    pair_name = signal.pair.replace(" (OTC)", "")
                    signal_id = f"bulk_otc_{pair_name.replace('/', '_')}_{int(current_time)}"
                    
                    # Сохраняем данные сигнала для обратной связи
                    self._store_signal_for_feedback(signal_id, user_id, signal, "bulk_otc")
                    pending_signals.append(signal_id)
                    
                    # НЕ добавляем в режим ожидания - блокировка будет только после выбора пары
                    
                    feedback_keyboard.append([
                        InlineKeyboardButton(f"📈 {i}. {pair_name}", callback_data=f"select_otc_pair_{signal_id}")
                    ])
                
                # Убираем кнопку "ОТС меню" - пользователь ДОЛЖЕН выбрать пару
                
                keyboard = InlineKeyboardMarkup(feedback_keyboard)
                
                signals_text += "\n\n👇 <b>Выберите пары в которые вошли:</b>"
            else:
                # Если нет качественных ОТС сигналов - НЕ ДАЕМ выйти, активируем кулдаун
                self.last_top3_generation[user_id] = current_time  # Активируем кулдаун даже без сигналов
                keyboard = InlineKeyboardMarkup([
                    [InlineKeyboardButton("🔄 Попробовать снова через 10 мин", callback_data="bulk_otc_signals")]
                ])
            
            await query.edit_message_text(
                signals_text,
                parse_mode=ParseMode.HTML,
                reply_markup=keyboard
            )
            
            # Обновляем время последней массовой ОТС генерации
            if best_otc_signals:
                self.last_bulk_signal_time[user_id] = current_time
                self.last_signal_time[user_id] = current_time
                # НЕ обновляем last_top3_generation здесь - только после выбора пары!
                
                # Увеличиваем счетчик ТОП-3 ОТС сигналов
                self._increment_signal_stats('otc_bulk', user_id, len(best_otc_signals))
            
        except Exception as e:
            logger.error(f"Ошибка генерации ОТС сигналов по скору: {e}")
            await query.edit_message_text(
                "❌ Ошибка генерации ОТС сигналов. Попробуйте позже.",
                reply_markup=InlineKeyboardMarkup([
                    [InlineKeyboardButton("⬅️ ОТС меню", callback_data="otc_menu")]
                ])
            )
    
    async def _handle_select_otc_pair(self, query, signal_id: str):
        """Обработка выбора ОТС пары для обратной связи"""
        try:
            user_id = query.from_user.id
            logger.info(f"🎯 НАЧАЛО _handle_select_otc_pair: user_id={user_id}, signal_id={signal_id}")
            
            # Проверяем, есть ли сигнал в данных
            if signal_id not in self.pending_signals:
                logger.error(f"❌ Сигнал {signal_id} не найден в pending_signals")
                await query.edit_message_text("❌ Сигнал не найден или устарел.")
                return
            
            logger.info(f"✅ Сигнал найден в pending_signals")
            signal_data = self.pending_signals[signal_id]
            
            # Проверяем, выбрал ли пользователь уже эту пару ранее
            if user_id in self.pending_trade_results and signal_id in self.pending_trade_results[user_id]:
                logger.info(f"🔄 Пара уже выбрана ранее, проверяем готовность к обратной связи")
                # Пара уже выбрана - проверяем готовность к обратной связи
                if not self._is_signal_ready_for_feedback(user_id, signal_id):
                    if user_id in self.pending_trade_timers and signal_id in self.pending_trade_timers[user_id]:
                        expiry_time = self.pending_trade_timers[user_id][signal_id]
                        current_time = time.time()
                        remaining_seconds = max(0, int(expiry_time - current_time))
                        remaining_minutes = remaining_seconds // 60
                        remaining_seconds = remaining_seconds % 60
                        
                        await query.answer(
                            f"⏰ Подождите! Результат можно указать через {remaining_minutes}м {remaining_seconds}с",
                            show_alert=True
                        )
                        return
                    else:
                        await query.answer("❌ Сигнал не найден в ожидающих", show_alert=True)
                        return
                else:
                    # Сигнал готов к обратной связи - показываем активные кнопки результата
                    logger.info(f"✅ Сигнал готов к обратной связи")
                    
                    await query.edit_message_text(
                        f"✅ <b>ВРЕМЯ ИСТЕКЛО - УКАЖИТЕ РЕЗУЛЬТАТ</b>\n\n"
                        f"📊 <b>Пара:</b> {signal_data['pair']}\n"
                        f"📈 <b>Направление:</b> {signal_data['direction']}\n"
                        f"🎯 <b>Скор:</b> {signal_data['confidence'] * 100 if signal_data['confidence'] <= 1 else signal_data['confidence']:.1f}%\n"
                        f"⏰ <b>Экспирация:</b> {signal_data['expiration']} мин\n\n"
                        f"🎯 <b>Время истекло! Укажите результат торговли:</b>",
                        parse_mode=ParseMode.HTML,
                        reply_markup=InlineKeyboardMarkup([
                            [
                                InlineKeyboardButton("✅ ВЫИГРАШ", callback_data=f"feedback_success_{signal_id}"),
                                InlineKeyboardButton("❌ ПРОИГРАШ", callback_data=f"feedback_failure_{signal_id}")
                            ],
                            [InlineKeyboardButton("🔄 Обновить", callback_data="show_pending_trades")]
                        ])
                    )
                    return
            
            # Это новый выбор пары - активируем сделку
            logger.info(f"🆕 Новый выбор ОТС пары: {signal_id}")
            pair = signal_data['pair']
            direction = signal_data['direction']
            confidence = signal_data['confidence']
            expiration = signal_data['expiration']
            
            # ТЕПЕРЬ добавляем в режим ожидания обратной связи (блокировка активируется)
            self._add_pending_trade(user_id, signal_id, expiration)
            
            # ТЕПЕРЬ активируем ТОП-3 кулдаун (10 минут) - пользователь выбрал ОТС пару
            self.last_top3_generation[user_id] = time.time()
            
            # Показываем экран активации с неактивными кнопками и таймером
            current_time = time.time()
            expiry_timestamp = current_time + (expiration * 60)
            expiry_datetime = datetime.fromtimestamp(expiry_timestamp)
            expiry_time_str = expiry_datetime.strftime('%H:%M:%S')
            
            message = await query.edit_message_text(
                f"🔒 <b>СДЕЛКА АКТИВИРОВАНА</b>\n\n"
                f"📊 <b>Пара:</b> {pair}\n"
                f"📈 <b>Направление:</b> {direction}\n"
                f"🎯 <b>Скор:</b> {confidence * 100 if confidence <= 1 else confidence:.1f}%\n"
                f"⏰ <b>Экспирация:</b> {expiration} мин\n\n"
                f"🚫 <b>Навигация заблокирована до {expiry_time_str}</b>\n"
                f"⏳ <b>Осталось: {expiration}м 0с</b>\n\n"
                f"🔘 <b>Таймер обновляется автоматически каждые 30с</b>\n"
                f"💡 После истечения времени укажите результат торговли",
                parse_mode=ParseMode.HTML,
                reply_markup=InlineKeyboardMarkup([
                    [
                        InlineKeyboardButton("⚪ Выиграш (недоступно)", callback_data=f"feedback_success_{signal_id}"),
                        InlineKeyboardButton("⚪ Проиграш (недоступно)", callback_data=f"feedback_failure_{signal_id}")
                    ],
                    [InlineKeyboardButton("🔄 Обновить сейчас", callback_data="show_pending_trades")]
                ])
            )
            
            # Запускаем автоматическое обновление таймера
            await self._start_auto_timer_update(user_id, signal_id, query.message.chat_id, message.message_id)
            
        except Exception as e:
            logger.error(f"❌ Ошибка выбора ОТС пары: {e}")
            await query.edit_message_text("❌ Ошибка обработки выбора пары.")
    
    async def _handle_select_forex_pair(self, query, signal_id: str):
        """Обработка выбора Форекс пары для обратной связи (аналогично OTC)"""
        try:
            user_id = query.from_user.id

            # Проверяем, есть ли сигнал в данных
            if signal_id not in self.pending_signals:
                await query.edit_message_text("❌ Сигнал не найден или устарел.")
                return

            signal_data = self.pending_signals[signal_id]

            # Если пользователь уже выбирал эту пару ранее — проверяем готовность к обратной связи
            if user_id in self.pending_trade_results and signal_id in self.pending_trade_results[user_id]:
                if not self._is_signal_ready_for_feedback(user_id, signal_id):
                    if user_id in self.pending_trade_timers and signal_id in self.pending_trade_timers[user_id]:
                        expiry_time = self.pending_trade_timers[user_id][signal_id]
                        current_time = time.time()
                        remaining_seconds = max(0, int(expiry_time - current_time))
                        remaining_minutes = remaining_seconds // 60
                        remaining_seconds = remaining_seconds % 60

                        await query.answer(
                            f"⏰ Подождите! Результат можно указать через {remaining_minutes}м {remaining_seconds}с",
                            show_alert=True
                        )
                    else:
                        await query.answer("❌ Сигнал не найден в ожидающих", show_alert=True)
                    return
                else:
                    # Сигнал готов к обратной связи — показать активные кнопки результата
                    await query.edit_message_text(
                        f"✅ <b>ВРЕМЯ ИСТЕКЛО - УКАЖИТЕ РЕЗУЛЬТАТ</b>\n\n"
                        f"📊 <b>Пара:</b> {signal_data['pair']}\n"
                        f"📈 <b>Направление:</b> {signal_data['direction']}\n"
                        f"🎯 <b>Скор:</b> {signal_data['confidence'] * 100 if signal_data['confidence'] <= 1 else signal_data['confidence']:.1f}%\n"
                        f"⏰ <b>Экспирация:</b> {signal_data['expiration']} мин\n\n"
                        f"🎯 <b>Время истекло! Укажите результат торговли:</b>",
                        parse_mode=ParseMode.HTML,
                        reply_markup=InlineKeyboardMarkup([
                            [
                                InlineKeyboardButton("✅ ВЫИГРАШ", callback_data=f"feedback_success_{signal_id}"),
                                InlineKeyboardButton("❌ ПРОИГРАШ", callback_data=f"feedback_failure_{signal_id}")
                            ],
                            [InlineKeyboardButton("🔄 Обновить", callback_data="show_pending_trades")]
                        ])
                    )
                    return

            # Новый выбор пары — активировать сделку, заблокировать навигацию, запустить таймер
            pair = signal_data['pair']
            direction = signal_data['direction']
            confidence = signal_data['confidence']
            expiration = signal_data['expiration']

            # Добавляем в режим ожидания (блокировка)
            self._add_pending_trade(user_id, signal_id, expiration)

            # Активируем ТОП-3 кулдаун (10 мин) после выбора пары
            self.last_top3_generation[user_id] = time.time()

            # Сообщение с таймером, как в OTC
            current_time = time.time()
            expiry_timestamp = current_time + (expiration * 60)
            expiry_datetime = datetime.fromtimestamp(expiry_timestamp)
            expiry_time_str = expiry_datetime.strftime('%H:%M:%S')

            message = await query.edit_message_text(
                f"🔒 <b>СДЕЛКА АКТИВИРОВАНА</b>\n\n"
                f"📊 <b>Пара:</b> {pair}\n"
                f"📈 <b>Направление:</b> {direction}\n"
                f"🎯 <b>Скор:</b> {confidence * 100 if confidence <= 1 else confidence:.1f}%\n"
                f"⏰ <b>Экспирация:</b> {expiration} мин\n\n"
                f"🚫 <b>Навигация заблокирована до {expiry_time_str}</b>\n"
                f"⏳ <b>Осталось: {expiration}м 0с</b>\n\n"
                f"🔘 <b>Таймер обновляется автоматически каждые 30с</b>\n"
                f"💡 После истечения времени укажите результат торговли",
                parse_mode=ParseMode.HTML,
                reply_markup=InlineKeyboardMarkup([
                    [
                        InlineKeyboardButton("⚪ Выиграш (недоступно)", callback_data=f"feedback_success_{signal_id}"),
                        InlineKeyboardButton("⚪ Проиграш (недоступно)", callback_data=f"feedback_failure_{signal_id}")
                    ],
                    [InlineKeyboardButton("🔄 Обновить сейчас", callback_data="show_pending_trades")]
                ])
            )

            # Запуск автообновления таймера каждые 30с
            await self._start_auto_timer_update(user_id, signal_id, query.message.chat_id, message.message_id)

        except Exception as e:
            logger.error(f"❌ Ошибка выбора Форекс пары: {e}")
            await query.edit_message_text("❌ Ошибка обработки выбора пары.")
    
    async def _handle_show_new_status(self, query):
        """Показывает НОВУЮ статистику системы и настройки пользователей"""
        try:
            logger.info("🔍 Показываем НОВУЮ статистику генерации сигналов")
            
            try:
                logger.info(f"📊 Текущая статистика: {self.signal_stats}")
                
                # Общая статистика генерации
                total_signals = self.signal_stats['total']
                forex_signals = self.signal_stats['forex_single'] + self.signal_stats['forex_bulk']
                otc_signals = self.signal_stats['otc_single'] + self.signal_stats['otc_bulk']
                
                logger.info(f"📈 Всего сигналов: {total_signals}, Форекс: {forex_signals}, ОТС: {otc_signals}")
            except Exception as stats_error:
                logger.error(f"❌ Ошибка получения статистики: {stats_error}")
                # Используем нулевые значения
                total_signals = 0
                forex_signals = 0
                otc_signals = 0
            
            status_text = (
                "⚙️ <b>Статус системы</b>\n\n"
                "🟢 <b>Система работает нормально</b>\n\n"
                "📊 <b>Статистика генерации сигналов:</b>\n"
                f"• 🎯 Всего сигналов: <b>{total_signals}</b>\n"
                f"• 📈 Форекс сигналы: <b>{forex_signals}</b>\n"
                f"  ├ Одиночные: {self.signal_stats['forex_single']}\n"
                f"  └ ТОП-3: {self.signal_stats['forex_bulk']}\n"
                f"• ⚡ ОТС сигналы: <b>{otc_signals}</b>\n"
                f"  ├ Одиночные: {self.signal_stats['otc_single']}\n"
                f"  └ ТОП-3: {self.signal_stats['otc_bulk']}\n\n"
                "👥 <b>Управление пользователями:</b>\n"
                "• Просмотр списка пользователей\n"
                "• Управление доступом\n"
                "• Обработка запросов\n\n"
                "📊 <b>Статистика торговли:</b>\n"
                "• Общая статистика сигналов\n"
                "• Эффективность по парам\n"
                "• Обратная связь пользователей"
            )
            
            keyboard = [
                [
                    InlineKeyboardButton("👥 Пользователи", callback_data="show_users"),
                    InlineKeyboardButton("📋 Запросы", callback_data="show_all_requests")
                ],
                [InlineKeyboardButton("📊 Статистика по пользователям", callback_data="show_user_stats")],
                [InlineKeyboardButton("🔙 Главное меню", callback_data="back_to_main")]
            ]
            
            logger.info("📤 Отправляем НОВОЕ сообщение статистики")
            await query.edit_message_text(
                status_text,
                parse_mode=ParseMode.HTML,
                reply_markup=InlineKeyboardMarkup(keyboard)
            )
            logger.info("✅ НОВАЯ статистика отправлена успешно")
            
        except Exception as e:
            logger.error(f"❌ Ошибка показа статуса: {e}")
            await query.edit_message_text("❌ Ошибка загрузки статуса системы.")
    
    async def _handle_show_user_stats(self, query):
        """Показывает статистику генерации сигналов по пользователям"""
        try:
            if not self.user_signal_stats:
                await query.edit_message_text(
                    "📊 <b>Статистика пользователей</b>\n\n"
                    "❌ Нет данных о генерации сигналов\n\n"
                    "💡 Статистика появится после первых сигналов",
                    parse_mode=ParseMode.HTML,
                    reply_markup=InlineKeyboardMarkup([
                        [InlineKeyboardButton("🔙 Статус системы", callback_data="show_status")]
                    ])
                )
                return
            
            stats_text = "📊 <b>Статистика генерации по пользователям</b>\n\n"
            
            for user_id, stats in self.user_signal_stats.items():
                # Получаем имя пользователя (если возможно)
                user_name = f"ID: {user_id}"
                if user_id == query.from_user.id:
                    user_name = f"👤 Вы ({user_id})"
                elif user_id == BotConfig.ADMIN_ID:
                    user_name = f"👑 Админ ({user_id})"
                
                stats_text += f"🔹 <b>{user_name}</b>\n"
                stats_text += f"  📈 Форекс: {stats['forex_single']} + {stats['forex_bulk']} ТОП-3 = {stats['forex_single'] + stats['forex_bulk']}\n"
                stats_text += f"  ⚡ ОТС: {stats['otc_single']} + {stats['otc_bulk']} ТОП-3 = {stats['otc_single'] + stats['otc_bulk']}\n"
                stats_text += f"  🎯 Всего сигналов: <b>{stats['total']}</b>\n"
                
                # Добавляем статистику результатов торговли
                if user_id in self.user_trade_results:
                    trade_stats = self.user_trade_results[user_id]
                    stats_text += f"  ✅ Успешных: <b>{trade_stats['success']}</b>\n"
                    stats_text += f"  ❌ Проигрышных: <b>{trade_stats['failure']}</b>\n"
                    stats_text += f"  📊 Процент побед: <b>{trade_stats['win_rate']:.1f}%</b>\n\n"
                else:
                    stats_text += f"  📊 Результатов торговли: <b>0</b>\n\n"
            
            await query.edit_message_text(
                stats_text,
                parse_mode=ParseMode.HTML,
                reply_markup=InlineKeyboardMarkup([
                    [InlineKeyboardButton("🔙 Статус системы", callback_data="show_status")]
                ])
            )
            
        except Exception as e:
            logger.error(f"❌ Ошибка показа пользовательской статистики: {e}")
            await query.edit_message_text("❌ Ошибка загрузки статистики пользователей.")
    
    async def _handle_generate_signal(self, query, pair: str):
        """Обработка генерации сигнала для конкретной пары"""
        user_id = query.from_user.id
        current_time = time.time()
        
        # Проверяем cooldown (задержка между генерациями)
        if user_id in self.last_signal_time:
            time_passed = current_time - self.last_signal_time[user_id]
            cooldown = BotConfig.SIGNAL_SETTINGS["signal_cooldown"]
            
            if time_passed < cooldown:
                remaining = cooldown - time_passed
                minutes = int(remaining // 60)
                seconds = int(remaining % 60)
                
                await query.edit_message_text(
                    f"⏰ <b>Подождите 30 секунд и выберите другую пару</b>\n\n"
                    f"🕒 Осталось: {minutes}м {seconds}с\n\n"
                    f"💡 Рекомендация:\n"
                    f"• Попробуйте другую валютную пару\n"
                    f"• Дождитесь изменения рыночных условий\n\n"
                    f"🎯 Выберите пару с лучшими условиями для торговли!",
                    parse_mode=ParseMode.HTML,
                    reply_markup=InlineKeyboardMarkup([
                        [InlineKeyboardButton("🔄 Обновить таймер", callback_data="refresh_signal_cooldown")],
                        [InlineKeyboardButton("🔙 Главное меню", callback_data="back_to_main")]
                    ])
                )
                return
        
        # Проверяем время работы рынка
        market_status = self.market_schedule.get_market_status()
        
        if not market_status['is_open']:
            market_message = self.market_schedule.get_market_message()
            await query.edit_message_text(
                f"{market_message}\n\n"
                f"❌ <b>Форекс сигнал для {pair} недоступен</b>\n"
                f"⏰ Дождитесь открытия рынка для реальных сигналов\n\n"
                f"💡 Вы можете использовать ОТС сигналы (работают 24/7)",
                parse_mode=ParseMode.HTML,
                reply_markup=InlineKeyboardMarkup([
                    [InlineKeyboardButton("⚡ ОТС сигналы", callback_data="otc_menu")],
                    [InlineKeyboardButton("🔄 Другая пара", callback_data="get_signal")],
                    [InlineKeyboardButton("🔙 Главное меню", callback_data="back_to_main")]
                ])
            )
            return
        
        await query.edit_message_text(
            f"⏳ <b>Генерация сигнала для {pair}...</b>\n\n"
            "Анализируем рыночные данные и технические индикаторы...",
            parse_mode=ParseMode.HTML
        )
        
        try:
            signal = await self.signal_generator.generate_signal(pair)
            
            if signal:
                # Проверяем качество Форекс сигнала
                if signal.final_score < 0.75:  # Минимальный порог для Форекс
                    signal_text = (
                        f"⚠️ <b>Нет подходящей точки входа для {pair}</b>\n\n"
                        f"📊 Текущая уверенность: {signal.final_score:.1%}\n"
                        f"🎯 Требуется минимум: 75%\n\n"
                        f"💡 <b>Рекомендации:</b>\n"
                        f"• Смените пару\n"
                        f"• Попробуйте позже\n"
                        f"• Дождитесь лучших рыночных условий"
                    )
                    keyboard = [
                        [InlineKeyboardButton("🔄 Другая пара", callback_data="get_signal")],
                        [InlineKeyboardButton("🔙 Главное меню", callback_data="back_to_main")]
                    ]
                else:
                    signal_text = self._format_signal_detailed(signal)
                
            else:
                signal_text = (
                    f"⚠️ <b>Сигнал для {pair} не сгенерирован</b>\n\n"
                    "Возможные причины:\n"
                    "• Недостаточно рыночных данных\n"
                    "• Низкая уверенность в анализе\n"
                    "• Нейтральные рыночные условия\n\n"
                    "Попробуйте другую пару или повторите позже."
                )
                chart_path = None
            
            # Добавляем кнопки/pending только для КАЧЕСТВЕННЫХ форекс-сигналов
            if signal:
                signal_id = f"forex_{pair.replace('/', '_')}_{int(time.time())}"
                # Сохраняем данные сигнала для статистики
                self._store_signal_for_feedback(signal_id, query.from_user.id, signal, "forex")

                # Увеличиваем счетчик одиночных Форекс сигналов
                self._increment_signal_stats('forex_single', query.from_user.id)

                score_value = signal.final_score if signal.final_score <= 1 else signal.final_score / 100
                if score_value >= 0.75:
                    # Только для качественных сигналов показываем экран с таймером
                    keyboard = [[InlineKeyboardButton("🔄 Обновить таймер", callback_data="show_pending_trades")]]
                    self._add_pending_trade(query.from_user.id, signal_id, signal.duration)
                else:
                    # Для слабых сигналов ОСТАВЛЯЕМ ранее подготовленные кнопки (другая пара/меню)
                    pass
            else:
                keyboard = [
                    [
                        InlineKeyboardButton("🔄 Другая пара", callback_data="get_signal"),
                        InlineKeyboardButton("📈 Массовые сигналы", callback_data="bulk_signals")
                    ],
                    [InlineKeyboardButton("🔙 Главное меню", callback_data="back_to_main")]
                ]
            
            reply_markup = InlineKeyboardMarkup(keyboard)
            
            # Обновляем время при ЛЮБОЙ попытке генерации (даже неудачной)
            self.last_signal_time[user_id] = current_time
            self.last_bulk_signal_time[user_id] = current_time
            
            # Сохраняем активный сигнал ДО отправки (только качественные сигналы)
            if signal and (signal.final_score >= 0.75 if signal.final_score <= 1 else signal.final_score >= 75):
                self.active_signals[user_id] = {
                    'text': signal_text,
                    'keyboard': reply_markup,
                    'signal_data': signal,
                    'timestamp': current_time
                }
            
            # Отправляем сигнал (без графиков)
            await query.edit_message_text(
                signal_text,
                parse_mode=ParseMode.HTML,
                reply_markup=reply_markup
            )
            
        except Exception as e:
            logger.error(f"Ошибка генерации сигнала для {pair}: {e}")
            await query.edit_message_text(
                f"❌ Ошибка генерации сигнала для {pair}. Попробуйте позже.",
                reply_markup=self._get_main_keyboard(query.from_user.id)
            )
    
    def _format_signal_detailed(self, signal: ForexSignal) -> str:
        """Форматирует детальный сигнал"""
        direction_emoji = "🟢" if signal.direction == "BUY" else "🔴"
        confidence_color = "🟢" if signal.final_score > 0.8 else "🟡" if signal.final_score > 0.7 else "🔴"
        confidence_bar = self._get_confidence_bar(signal.final_score)
        boost_info = " 🧠" if signal.memory_boost else ""
        
        signal_text = (
            f"📊 <b>Торговый сигнал для {signal.pair}</b>\n\n"
            f"{direction_emoji} <b>Направление:</b> {signal.direction}\n"
            f"🎯 <b>Скор:</b> {confidence_color} <b>{signal.final_score * 100 if signal.final_score <= 1 else signal.final_score:.1f}%</b> {confidence_bar}{boost_info}\n"
            f"⏰ <b>Экспирация:</b> {signal.duration} мин\n"
            f"🕒 <b>Время:</b> {signal.timestamp.strftime('%H:%M:%S')}\n\n"
        )
        
        # Добавляем технические индикаторы
        indicators = signal.indicators
        signal_text += "📊 <b>Технические индикаторы:</b>\n"
        
        if 'rsi' in indicators:
            rsi = indicators['rsi']
            rsi_status = self._get_rsi_status(rsi)
            signal_text += f"• RSI (14): <code>{rsi:.1f}</code> {rsi_status}\n"
        
        if 'ema_21' in indicators:
            signal_text += f"• EMA (21): <code>{indicators['ema_21']:.5f}</code>\n"
        
        if 'current_price' in indicators and 'bb_upper' in indicators and 'bb_lower' in indicators:
            bb_status = self._get_bb_status(
                indicators['current_price'],
                indicators['bb_upper'],
                indicators['bb_lower']
            )
            signal_text += f"• Bollinger Bands: {bb_status}\n"
        
        # Добавляем интерпретацию
        signal_text += f"\n💡 <b>Интерпретация:</b>\n"
        if signal.direction == "BUY":
            signal_text += "Технический анализ указывает на возможность роста цены."
        else:
            signal_text += "Технический анализ указывает на возможность снижения цены."
        
        signal_text += (
            f"\n\n⚠️ <b>Важно:</b> Сигнал носит информационный характер. "
            f"Используйте управление рисками при торговле."
        )
        
        return signal_text
    
    def _format_signal_compact(self, signal: ForexSignal, emoji: str) -> str:
        """Форматирует компактный сигнал"""
        confidence_bar = self._get_confidence_bar(signal.final_score)
        boost_info = " 🧠" if signal.memory_boost else ""
        return (
            f"{emoji} <b>{signal.pair}</b>: {signal.direction} @ "
            f"<code>{signal.entry_price:.5f}</code> "
            f"(Скор: {signal.final_score:.0%} {confidence_bar}){boost_info}"
        )
    
    def _get_confidence_bar(self, confidence: float) -> str:
        """Создает визуальную полосу уверенности"""
        filled = int(confidence * 5)  # 5 блоков максимум
        empty = 5 - filled
        return "█" * filled + "░" * empty
    
    def _get_rsi_status(self, rsi: float) -> str:
        """Возвращает статус RSI"""
        if rsi < 30:
            return "📉 Перепродано"
        elif rsi > 70:
            return "📈 Перекуплено"
        else:
            return "➡️ Нейтрально"
    
    def _get_bb_status(self, price: float, upper: float, lower: float) -> str:
        """Возвращает статус Bollinger Bands"""
        if price >= upper:
            return "🔺 Выше верхней полосы"
        elif price <= lower:
            return "🔻 Ниже нижней полосы"
        else:
            return "➡️ В пределах полос"
    
    def _get_confidence_bar(self, confidence: float) -> str:
        """Создает полоску прогресса для скора уверенности"""
        # Нормализуем значение (если больше 1, делим на 100)
        if confidence > 1:
            confidence = confidence / 100
        
        # Ограничиваем диапазон 0-1
        confidence = max(0, min(1, confidence))
        
        # Создаем полоску из 10 сегментов
        filled_segments = int(confidence * 10)
        empty_segments = 10 - filled_segments
        
        # Используем разные символы для разных уровней
        if confidence >= 0.8:
            fill_char = "🟢"  # Зеленый для высокого скора
        elif confidence >= 0.6:
            fill_char = "🟡"  # Желтый для среднего скора
        else:
            fill_char = "🔴"  # Красный для низкого скора
        
        empty_char = "⬜"
        
        bar = fill_char * filled_segments + empty_char * empty_segments
        return f"\n{bar}"
    
    async def _handle_show_pairs(self, query):
        """Показывает список валютных пар"""
        await self.pairs_command(query, None)
    
    async def _handle_show_status(self, query):
        """Показывает статус системы"""
        # Проверяем, что это админ
        if query.from_user.id != BotConfig.ADMIN_ID:
            await query.answer("❌ Доступ только для администратора.")
            return
        
        try:
            # Получаем статус API
            api_status = self.signal_generator.get_api_status()
            supported_pairs = self.signal_generator.get_supported_pairs()
            chart_limits = self.chart_generator.get_api_limits()
            
            # Получаем статистику запросов
            request_stats = access_manager.get_statistics()
            
            status_text = (
                "📊 <b>Статус системы генерации сигналов</b>\n\n"
                f"🕒 <b>Время:</b> {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n"
                f"💱 <b>Поддерживаемых пар:</b> {len(supported_pairs)}\n"
                f"👥 <b>Авторизованных пользователей:</b> {len(BotConfig.AUTHORIZED_USERS)}\n\n"
                f"📝 <b>Запросы на доступ:</b>\n"
                f"⏳ Ожидают: {request_stats['pending']}\n"
                f"✅ Одобрено: {request_stats['approved']}\n"
                f"❌ Отклонено: {request_stats['rejected']}\n\n"
                "🔗 <b>Статус API:</b>\n"
            )
            
            for api_name, status in api_status.items():
                status_emoji = "✅" if status['can_request'] else "❌"
                status_text += (
                    f"{status_emoji} <b>{api_name.upper()}</b>\n"
                    f"   Запросы в минуту: {status['minute_requests']}\n"
                    f"   Запросы в день: {status['day_requests']}\n\n"
                )
            
            # Добавляем статистику сигналов
            signal_stats = signal_statistics.get_overall_statistics()
            status_text += (
                f"📈 <b>Статистика сигналов:</b>\n"
                f"📊 Всего сигналов: {signal_stats['total_signals']}\n"
                f"✅ Успешных: {signal_stats['successful']}\n"
                f"❌ Неудачных: {signal_stats['failed']}\n"
                f"🎯 Общий винрейт: {signal_stats['success_rate']:.1f}%\n\n"
                f"💱 Форекс: {signal_stats['forex_stats']['success_rate']:.1f}% "
                f"({signal_stats['forex_stats']['successful']}/{signal_stats['forex_stats']['total']})\n"
                f"⚡ ОТС: {signal_stats['otc_stats']['success_rate']:.1f}% "
                f"({signal_stats['otc_stats']['successful']}/{signal_stats['otc_stats']['total']})\n\n"
            )
            
            # Создаем специальную клавиатуру для статуса с управлением
            keyboard = []
            
            # Кнопки управления
            row1 = []
            if request_stats['pending'] > 0:
                row1.append(InlineKeyboardButton(
                    f"📋 Запросы ({request_stats['pending']})", 
                    callback_data="show_all_requests"
                ))
            
            row1.append(InlineKeyboardButton(
                f"👥 Пользователи ({len(BotConfig.AUTHORIZED_USERS)})",
                callback_data="show_users"
            ))
            
            if row1:
                keyboard.append(row1)
            
            keyboard.append([InlineKeyboardButton("🔙 Главное меню", callback_data="back_to_main")])
            reply_markup = InlineKeyboardMarkup(keyboard)
            
            await query.edit_message_text(
                status_text,
                parse_mode=ParseMode.HTML,
                reply_markup=reply_markup
            )
            
        except Exception as e:
            logger.error(f"Ошибка получения статуса: {e}")
            await query.edit_message_text(
                "❌ Ошибка получения статуса системы. Попробуйте позже.",
                reply_markup=InlineKeyboardMarkup([[
                    InlineKeyboardButton("🔙 Главное меню", callback_data="back_to_main")
                ]])
            )
    
    async def _handle_show_help(self, query):
        """Показывает помощь"""
        user_id = query.from_user.id
        
        help_text = BotConfig.MESSAGES["help"]
        
        keyboard = self._get_main_keyboard(user_id)
        
        await query.edit_message_text(
            help_text,
            parse_mode=ParseMode.HTML,
            reply_markup=keyboard
        )
    
    async def _handle_show_market(self, query):
        """Показывает расписание рынка"""
        try:
            keyboard = [
                [InlineKeyboardButton("🔙 Главное меню", callback_data="back_to_main")]
            ]
            
            await query.edit_message_text(
                BotConfig.MESSAGES["market_schedule"],
                parse_mode=ParseMode.HTML,
                reply_markup=InlineKeyboardMarkup(keyboard)
            )
            
        except Exception as e:
            logger.error(f"Ошибка показа расписания: {e}")
            await query.edit_message_text(
                "❌ Ошибка получения расписания. Попробуйте позже.",
                reply_markup=self._get_main_keyboard()
            )
    
    async def _handle_back_to_main(self, query):
        """Возврат в главное меню"""
        user_id = query.from_user.id
        
        try:
            # Проверяем, есть ли у пользователя активный сигнал
            if user_id in self.active_signals:
                # Показываем сохраненный сигнал вместо главного меню
                active_signal = self.active_signals[user_id]
                signal_text = active_signal['text']
                signal_keyboard = active_signal['keyboard']
                
                try:
                    await query.edit_message_text(
                        signal_text,
                        parse_mode=ParseMode.HTML,
                        reply_markup=signal_keyboard
                    )
                except Exception as edit_error:
                    # Если не удается отредактировать, отправляем новое сообщение
                    logger.warning(f"Не удалось отредактировать сообщение, отправляем новое: {edit_error}")
                    await query.message.reply_text(
                        signal_text,
                        parse_mode=ParseMode.HTML,
                        reply_markup=signal_keyboard
                    )
            else:
                # Обычное главное меню
                welcome_text = (
                    "🚀 <b>Система генерации форекс сигналов</b>\n\n"
                    "👇 <b>Выберите действие:</b>"
                )
                
                keyboard = self._get_main_keyboard(user_id)
                
                await query.edit_message_text(
                    welcome_text,
                    parse_mode=ParseMode.HTML,
                    reply_markup=keyboard
                )
                
        except Exception as e:
            logger.error(f"Ошибка в _handle_back_to_main: {e}")
            # Fallback - отправляем простое главное меню
            try:
                welcome_text = (
                    "🚀 <b>Система генерации форекс сигналов</b>\n\n"
                    "👇 <b>Выберите действие:</b>"
                )
                keyboard = self._get_main_keyboard(user_id)
                
                await query.edit_message_text(
                    welcome_text,
                    parse_mode=ParseMode.HTML,
                    reply_markup=keyboard
                )
            except:
                # Последняя попытка - отправить новое сообщение
                await query.message.reply_text(
                    "🚀 <b>Главное меню</b>\n\n👇 <b>Выберите действие:</b>",
                    parse_mode=ParseMode.HTML,
                    reply_markup=self._get_main_keyboard(user_id)
                )
    
    async def _handle_clear_signal(self, query):
        """Очищает активный сигнал пользователя"""
        user_id = query.from_user.id
        
        if user_id in self.active_signals:
            del self.active_signals[user_id]
            
            await query.edit_message_text(
                "🗑️ <b>Сигнал очищен</b>\n\n"
                "✅ Активный сигнал удален из памяти.\n"
                "Теперь при возврате в меню будет показано главное меню.\n\n"
                "👇 <b>Выберите действие:</b>",
                parse_mode=ParseMode.HTML,
                reply_markup=self._get_main_keyboard(user_id)
            )
        else:
            await query.edit_message_text(
                "❌ <b>Нет активного сигнала</b>\n\n"
                "У вас нет сохраненного сигнала для очистки.\n\n"
                "👇 <b>Выберите действие:</b>",
                parse_mode=ParseMode.HTML,
                reply_markup=self._get_main_keyboard(user_id)
                )
    
    async def _setup_bot_commands(self):
        """Устанавливает команды бота при запуске"""
        if not self._commands_set:
            await self._set_bot_commands()
            self._commands_set = True
    
    def run(self):
        """Запуск бота"""
        logger.info("🚀 Запуск Telegram бота...")
        
        # Устанавливаем команды при запуске
        async def post_init(application):
            await self._setup_bot_commands()
        
        self.application.post_init = post_init
        
        self.application.run_polling(
            allowed_updates=Update.ALL_TYPES,
            drop_pending_updates=True
        )

def main():
    """Главная функция"""
    # Создание и запуск бота с конфигурацией
    try:
        bot = TelegramSignalBot(BotConfig.BOT_TOKEN, BotConfig.TWELVEDATA_API_KEY)
        bot.run()
    except KeyboardInterrupt:
        logger.info("🛑 Бот остановлен пользователем")
    except Exception as e:
        logger.error(f"❌ Ошибка запуска бота: {e}")


if __name__ == "__main__":
    main()
