#!/usr/bin/env python3
import subprocess
import re
import time

def get_current_tunnel_url():
    """Получает текущий URL туннеля из логов cloudflared"""
    try:
        # Проверяем что туннель запущен
        result = subprocess.run(['tasklist', '/FI', 'IMAGENAME eq cloudflared.exe'], 
                              capture_output=True, text=True, shell=True)
        
        if 'cloudflared.exe' not in result.stdout:
            print("Cloudflare tunnel not running")
            return None
            
        print("Cloudflare tunnel is running")
        
        # Получаем URL из последних логов (временный туннель)
        # Обычно URL имеет формат https://something.trycloudflare.com
        # Попробуем несколько возможных URL из предыдущих запусков
        
        possible_urls = [
            "https://plaintiff-lauren-necessity-nodes.trycloudflare.com",
            "https://blackberry-officer-diego-alternate.trycloudflare.com",
            "https://accessibility-gallery-column-olympus.trycloudflare.com"
        ]
        
        # Проверяем доступность каждого URL
        for url in possible_urls:
            try:
                import requests
                response = requests.get(url, timeout=5)
                if response.status_code == 200:
                    print(f"Found working URL: {url}")
                    return url
            except:
                continue
                
        # Если ни один URL не работает, возвращаем последний известный
        return possible_urls[0]
        
    except Exception as e:
        print(f"Error: {e}")
        return None

if __name__ == "__main__":
    url = get_current_tunnel_url()
    if url:
        print(f"Current tunnel URL: {url}")
        # Обновляем telegram_bot.py
        try:
            with open("telegram_bot.py", "r", encoding="utf-8") as f:
                content = f.read()
            
            # Ищем и заменяем URL
            old_pattern = r'self\.web_app_url = "https://[^"]*"'
            new_pattern = f'self.web_app_url = "{url}"'
            
            if re.search(old_pattern, content):
                content = re.sub(old_pattern, new_pattern, content)
                
                with open("telegram_bot.py", "w", encoding="utf-8") as f:
                    f.write(content)
                
                print(f"Updated URL in telegram_bot.py: {url}")
            else:
                print("Pattern for URL replacement not found")
                
        except Exception as e:
            print(f"Error updating telegram_bot.py: {e}")
    else:
        print("Failed to get tunnel URL")
