#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import requests
import json
import time

def get_ngrok_url():
    """Получает URL ngrok туннеля"""
    try:
        response = requests.get('http://localhost:4040/api/tunnels')
        tunnels = response.json()['tunnels']
        
        for tunnel in tunnels:
            if tunnel['proto'] == 'https':
                return tunnel['public_url']
        return None
    except:
        return None

def update_bot_url(url):
    """Обновляет URL в telegram_bot.py"""
    try:
        with open('telegram_bot.py', 'r', encoding='utf-8') as f:
            content = f.read()
        
        old_line = 'self.web_app_url = "https://your-domain.com"'
        new_line = f'self.web_app_url = "{url}"'
        content = content.replace(old_line, new_line)
        
        with open('telegram_bot.py', 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"URL обновлен в боте: {url}")
        return True
    except Exception as e:
        print(f"Ошибка обновления URL: {e}")
        return False

def main():
    print("Настройка Telegram Web App...")
    
    # Ждем запуска ngrok
    print("Ожидание ngrok туннеля...")
    for i in range(30):
        url = get_ngrok_url()
        if url:
            print(f"Ngrok туннель найден: {url}")
            break
        time.sleep(1)
    else:
        print("Ngrok туннель не найден. Убедитесь что ngrok запущен на порту 3001")
        return
    
    # Обновляем URL в боте
    if update_bot_url(url):
        print("Telegram Web App настроен!")
        print(f"URL: {url}")
        print("Теперь перезапустите бота командой: python run_telegram_bot.py")

if __name__ == "__main__":
    main()
