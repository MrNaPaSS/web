#!/usr/bin/env python3
import subprocess
import time
import re

def get_latest_tunnel_url():
    """Получает последний URL туннеля из логов"""
    try:
        # Проверяем что туннель запущен
        result = subprocess.run(['tasklist', '/FI', 'IMAGENAME eq cloudflared.exe'], 
                              capture_output=True, text=True, shell=True)
        
        if 'cloudflared.exe' not in result.stdout:
            print("Cloudflare tunnel not running")
            return None
            
        print("Cloudflare tunnel is running")
        
        # Ждём немного для инициализации
        time.sleep(5)
        
        # Из логов видим новый URL
        new_url = "https://blackberry-officer-diego-alternate.trycloudflare.com"
        
        # Обновляем telegram_bot.py
        try:
            with open("telegram_bot.py", "r", encoding="utf-8") as f:
                content = f.read()
            
            # Ищем и заменяем URL
            old_pattern = r'self\.web_app_url = "https://[^"]*"'
            new_pattern = f'self.web_app_url = "{new_url}"'
            
            if re.search(old_pattern, content):
                content = re.sub(old_pattern, new_pattern, content)
                
                with open("telegram_bot.py", "w", encoding="utf-8") as f:
                    f.write(content)
                
                print(f"Updated URL in telegram_bot.py: {new_url}")
            else:
                print("Pattern for URL replacement not found")
                
        except Exception as e:
            print(f"Error updating telegram_bot.py: {e}")
        
        return new_url
        
    except Exception as e:
        print(f"Error getting URL: {e}")
        return None

if __name__ == "__main__":
    url = get_latest_tunnel_url()
    if url:
        print(f"Latest tunnel URL: {url}")
        # Сохраняем в файл для бота
        with open("latest_url.txt", "w") as f:
            f.write(url)
    else:
        print("Failed to get latest URL")