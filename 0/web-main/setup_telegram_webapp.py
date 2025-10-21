#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Скрипт для настройки Telegram Web App
"""

import subprocess
import time
import json
import requests
import threading
from telegram import Bot
from telegram_bot import TelegramSignalBot
from config import BotConfig

class TelegramWebAppSetup:
    def __init__(self):
        self.bot_token = BotConfig.BOT_TOKEN
        self.bot = Bot(self.bot_token)
        
    def start_ngrok_tunnel(self):
        """Запускает ngrok туннель для frontend"""
        try:
            # Запускаем ngrok для порта 3001 (frontend)
            ngrok_process = subprocess.Popen([
                'ngrok', 'http', '3001', '--log=stdout'
            ], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
            
            # Ждем запуска ngrok
            time.sleep(3)
            
            # Получаем публичный URL
            try:
                response = requests.get('http://localhost:4040/api/tunnels')
                tunnels = response.json()['tunnels']
                
                for tunnel in tunnels:
                    if tunnel['proto'] == 'https':
                        public_url = tunnel['public_url']
                        print(f"✅ Ngrok туннель запущен: {public_url}")
                        return public_url
                        
            except Exception as e:
                print(f"❌ Ошибка получения ngrok URL: {e}")
                return None
                
        except Exception as e:
            print(f"❌ Ошибка запуска ngrok: {e}")
            return None
    
    def update_bot_webapp_url(self, webapp_url):
        """Обновляет URL Web App в коде бота"""
        try:
            # Читаем файл telegram_bot.py
            with open('telegram_bot.py', 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Заменяем URL
            old_url = 'self.web_app_url = "https://your-domain.com"'
            new_url = f'self.web_app_url = "{webapp_url}"'
            content = content.replace(old_url, new_url)
            
            # Записываем обратно
            with open('telegram_bot.py', 'w', encoding='utf-8') as f:
                f.write(content)
                
            print(f"✅ Обновлен Web App URL в боте: {webapp_url}")
            return True
            
        except Exception as e:
            print(f"❌ Ошибка обновления URL в боте: {e}")
            return False
    
    def set_bot_commands(self):
        """Устанавливает команды бота"""
        try:
            commands = [
                {"command": "start", "description": "🚀 Запустить бота"},
                {"command": "help", "description": "❓ Помощь"},
                {"command": "webapp", "description": "🌐 Открыть Web App"},
                {"command": "market", "description": "📅 Расписание рынка"},
            ]
            
            self.bot.set_my_commands(commands)
            print("✅ Команды бота установлены")
            return True
            
        except Exception as e:
            print(f"❌ Ошибка установки команд: {e}")
            return False
    
    def test_webapp_connection(self, webapp_url):
        """Тестирует подключение к Web App"""
        try:
            response = requests.get(webapp_url, timeout=10)
            if response.status_code == 200:
                print("✅ Web App доступен")
                return True
            else:
                print(f"❌ Web App недоступен: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ Ошибка подключения к Web App: {e}")
            return False

def main():
    print("Настройка Telegram Web App...")
    
    setup = TelegramWebAppSetup()
    
    # 1. Запускаем ngrok туннель
    print("\nЗапуск ngrok туннеля...")
    webapp_url = setup.start_ngrok_tunnel()
    
    if not webapp_url:
        print("Не удалось запустить ngrok туннель")
        return
    
    # 2. Обновляем URL в боте
    print(f"\nОбновление URL в боте...")
    if not setup.update_bot_webapp_url(webapp_url):
        return
    
    # 3. Устанавливаем команды бота
    print(f"\nУстановка команд бота...")
    if not setup.set_bot_commands():
        return
    
    # 4. Тестируем подключение
    print(f"\nТестирование Web App...")
    if not setup.test_webapp_connection(webapp_url):
        return
    
    print(f"\nTelegram Web App настроен успешно!")
    print(f"Web App URL: {webapp_url}")
    print(f"Теперь в боте есть кнопка Web App")
    print(f"\nИнструкции:")
    print(f"1. Откройте Telegram бота")
    print(f"2. Нажмите кнопку Web App")
    print(f"3. Web App откроется прямо в Telegram")

if __name__ == "__main__":
    main()
