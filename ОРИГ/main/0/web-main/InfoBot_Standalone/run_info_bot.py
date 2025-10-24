#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Запуск инфо бота
"""

import asyncio
import logging
from telegram_bot_handler import main

if __name__ == "__main__":
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            logging.FileHandler('info_bot.log', encoding='utf-8'),
            logging.StreamHandler()
        ]
    )
    
    print("🤖 Запуск инфо бота...")
    asyncio.run(main())
