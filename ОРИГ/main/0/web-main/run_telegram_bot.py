#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Запуск Telegram бота для системы генерации форекс сигналов
"""

import asyncio
import logging
import sys
import os
from pathlib import Path

# Устанавливаем кодировку UTF-8 для Windows
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except:
        import codecs
        sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')
        sys.stderr = codecs.getwriter('utf-8')(sys.stderr.buffer, 'strict')
    os.system('chcp 65001 >nul 2>&1')

# Добавляем текущую папку в путь для импорта модулей
current_dir = Path(__file__).parent
sys.path.insert(0, str(current_dir))

from telegram_bot import TelegramSignalBot
from config import BotConfig

# Настройка расширенного логирования
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler('telegram_bot.log', encoding='utf-8')
    ]
)

logger = logging.getLogger(__name__)

def check_configuration():
    """Проверяет конфигурацию перед запуском"""
    logger.info("🔍 Проверка конфигурации...")
    
    # Проверка токена бота
    if BotConfig.BOT_TOKEN == "YOUR_BOT_TOKEN" or not BotConfig.BOT_TOKEN:
        logger.error("❌ Не настроен BOT_TOKEN в config.py")
        return False
    
    # Проверка API ключа
    if BotConfig.TWELVEDATA_API_KEY == "demo":
        logger.warning("⚠️ Используется демо ключ Twelvedata API. Функциональность ограничена.")
    elif not BotConfig.TWELVEDATA_API_KEY:
        logger.error("❌ Не настроен TWELVEDATA_API_KEY в config.py")
        return False
    
    # Проверка авторизованных пользователей
    if not BotConfig.AUTHORIZED_USERS:
        logger.warning("⚠️ Нет авторизованных пользователей. Добавьте ID в config.py")
    else:
        logger.info(f"✅ Авторизованных пользователей: {len(BotConfig.AUTHORIZED_USERS)}")
    
    logger.info("✅ Конфигурация проверена")
    return True

def print_startup_info():
    """Выводит информацию при запуске"""
    print("🚀 TELEGRAM БОТ ГЕНЕРАЦИИ ФОРЕКС СИГНАЛОВ")
    print("=" * 50)
    print(f"📱 Bot Token: {BotConfig.BOT_TOKEN[:10]}...")
    print(f"🔑 API Key: {BotConfig.TWELVEDATA_API_KEY[:10]}...")
    print(f"👥 Authorized Users: {len(BotConfig.AUTHORIZED_USERS)}")
    print(f"💱 Supported Pairs: {len(BotConfig.MAJOR_FOREX_PAIRS)}")
    print("=" * 50)
    print("🔄 Запуск бота...")
    print("💡 Для остановки нажмите Ctrl+C")
    print()

def main():
    """Главная функция запуска"""
    try:
        # Проверяем конфигурацию
        if not check_configuration():
            logger.error("❌ Ошибки в конфигурации. Исправьте и попробуйте снова.")
            return
        
        # Выводим информацию о запуске
        print_startup_info()
        
        # Создаем и запускаем бота
        bot = TelegramSignalBot(BotConfig.BOT_TOKEN, BotConfig.TWELVEDATA_API_KEY)
        
        logger.info("🚀 Telegram бот запущен")
        logger.info(f"👥 Авторизованные пользователи: {list(BotConfig.AUTHORIZED_USERS)}")
        
        # Запускаем бота
        bot.run()
        
    except KeyboardInterrupt:
        logger.info("🛑 Бот остановлен пользователем")
        print("\n🛑 Бот остановлен")
    except ImportError as e:
        logger.error(f"❌ Ошибка импорта: {e}")
        print(f"\n❌ Ошибка: {e}")
        print("💡 Установите зависимости: pip install -r requirements_telegram.txt")
    except Exception as e:
        logger.error(f"❌ Критическая ошибка: {e}")
        print(f"\n❌ Критическая ошибка: {e}")
        import traceback
        traceback.print_exc()
    finally:
        logger.info("🔚 Завершение работы бота")

if __name__ == "__main__":
    main()
