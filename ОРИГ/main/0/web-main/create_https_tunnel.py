#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import subprocess
import time
import requests
import json

def start_ngrok():
    """Запускает ngrok и получает HTTPS URL"""
    try:
        # Запускаем ngrok в фоне
        subprocess.Popen(['ngrok', 'http', '3005', '--log=stdout'], 
                        stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        
        # Ждем запуска
        time.sleep(3)
        
        # Получаем URL
        for i in range(10):
            try:
                response = requests.get('http://localhost:4040/api/tunnels', timeout=2)
                tunnels = response.json()['tunnels']
                
                for tunnel in tunnels:
                    if tunnel['proto'] == 'https':
                        return tunnel['public_url']
                        
            except:
                time.sleep(1)
                
        return None
        
    except Exception as e:
        print(f"Ошибка ngrok: {e}")
        return None

def update_bot_url(url):
    """Обновляет URL в telegram_bot.py"""
    try:
        with open('telegram_bot.py', 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Заменяем URL
        old_line = 'self.web_app_url = "http://localhost:3002"'
        new_line = f'self.web_app_url = "{url}"'
        content = content.replace(old_line, new_line)
        
        # Заменяем кнопку на web_app
        old_button = 'InlineKeyboardButton("🌐 Web App", callback_data="show_webapp")'
        new_button = 'InlineKeyboardButton("🌐 Web App", web_app={"url": self.web_app_url})'
        content = content.replace(old_button, new_button)
        
        with open('telegram_bot.py', 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"URL обновлен в боте: {url}")
        return True
        
    except Exception as e:
        print(f"Ошибка обновления URL: {e}")
        return False

def main():
    print("Создание HTTPS туннеля для Telegram Mini App...")
    
    # Запускаем ngrok
    print("Запуск ngrok...")
    url = start_ngrok()
    
    if not url:
        print("Не удалось запустить ngrok")
        return
    
    print(f"Ngrok туннель: {url}")
    
    # Обновляем бота
    if update_bot_url(url):
        print("Telegram Mini App настроен!")
        print(f"HTTPS URL: {url}")
        print("Перезапустите бота: python run_telegram_bot.py")
    else:
        print("Ошибка настройки")

if __name__ == "__main__":
    main()
