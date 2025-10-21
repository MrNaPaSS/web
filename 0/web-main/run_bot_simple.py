#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import sys
import os

# Добавляем текущую директорию в путь
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Устанавливаем кодировку для консоли
if sys.platform.startswith('win'):
    import codecs
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')
    sys.stderr = codecs.getwriter('utf-8')(sys.stderr.buffer, 'strict')

try:
    from telegram_bot import main
    print("Starting Telegram bot...")
    main()
except KeyboardInterrupt:
    print("\nBot stopped by user")
except Exception as e:
    print(f"Error starting bot: {e}")
    import traceback
    traceback.print_exc()
