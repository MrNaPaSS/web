#!/usr/bin/env python3
import subprocess
import re
import time

def get_tunnel_url():
    """Получает URL туннеля из процессов cloudflared"""
    try:
        # Проверяем что туннель запущен
        result = subprocess.run(['tasklist', '/FI', 'IMAGENAME eq cloudflared.exe'], 
                              capture_output=True, text=True, shell=True)
        
        if 'cloudflared.exe' not in result.stdout:
            print("Cloudflare tunnel not running")
            return None
            
        print("Cloudflare tunnel is running")
        
        # Возможные URL из логов
        possible_urls = [
            "https://fame-acne-lived-instances.trycloudflare.com",
            "https://plaintiff-lauren-necessity-nodes.trycloudflare.com",
            "https://blackberry-officer-diego-alternate.trycloudflare.com"
        ]
        
        # Проверяем доступность каждого URL
        for url in possible_urls:
            try:
                import requests
                response = requests.head(url, timeout=5)
                if response.status_code == 200:
                    print(f"Working URL found: {url}")
                    return url
            except:
                continue
                
        # Если ни один не работает, возвращаем последний из логов
        return possible_urls[0]
        
    except Exception as e:
        print(f"Error: {e}")
        return None

if __name__ == "__main__":
    url = get_tunnel_url()
    if url:
        print(f"Tunnel URL: {url}")
        # Обновляем в telegram_bot.py
        try:
            with open("telegram_bot.py", "r", encoding="utf-8") as f:
                content = f.read()
            
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
        print("No working tunnel URL found")