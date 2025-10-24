#!/usr/bin/env python3
"""
Скрипт для настройки переменных окружения на сервере
"""
import os
import sys

def setup_environment():
    """Настройка переменных окружения"""
    print("SETUP ENVIRONMENT VARIABLES")
    print("=" * 50)
    
    # OpenRouter API Key
    openrouter_key = "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"
    
    # Устанавливаем переменную окружения
    os.environ['OPENROUTER_API_KEY'] = openrouter_key
    
    print(f"OPENROUTER_API_KEY установлен")
    print(f"Ключ: {openrouter_key[:20]}...")
    
    # Проверяем что ключ установлен
    if os.getenv('OPENROUTER_API_KEY'):
        print("Переменная окружения успешно установлена")
        return True
    else:
        print("Ошибка установки переменной окружения")
        return False

if __name__ == "__main__":
    setup_environment()
