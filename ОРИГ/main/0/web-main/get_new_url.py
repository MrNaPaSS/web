#!/usr/bin/env python3
import subprocess
import time
import requests

def get_new_tunnel_url():
    """Получает новый URL туннеля"""
    try:
        # Проверяем что cloudflared запущен
        result = subprocess.run(['tasklist', '/FI', 'IMAGENAME eq cloudflared.exe'], 
                              capture_output=True, text=True, shell=True)
        
        if 'cloudflared.exe' not in result.stdout:
            print("Cloudflare tunnel not running")
            return None
            
        print("Cloudflare tunnel is running, testing URLs...")
        
        # Возможные URL на основе паттерна
        possible_urls = [
            "https://employer-harvard-farmers-artist.trycloudflare.com",
            "https://arlington-half-typing-paid.trycloudflare.com",
            "https://pics-ability-nyc-rows.trycloudflare.com",
            "https://fame-acne-lived-instances.trycloudflare.com",
            "https://plaintiff-lauren-necessity-nodes.trycloudflare.com"
        ]
        
        # Проверяем каждый URL
        for url in possible_urls:
            try:
                print(f"Testing: {url}")
                response = requests.head(url, timeout=5)
                if response.status_code == 200:
                    print(f"Working URL found: {url}")
                    return url
                elif response.status_code == 404:
                    print(f"404 - URL not ready: {url}")
                else:
                    print(f"Status {response.status_code}: {url}")
            except requests.exceptions.RequestException as e:
                print(f"Error testing {url}: {e}")
                continue
                
        print("No working URL found")
        return None
        
    except Exception as e:
        print(f"Error: {e}")
        return None

def update_bot_url(url):
    """Обновляет URL в telegram_bot.py"""
    try:
        import re
        with open("telegram_bot.py", "r", encoding="utf-8") as f:
            content = f.read()
        
        old_pattern = r'self\.web_app_url = "https://[^"]*"'
        new_pattern = f'self.web_app_url = "{url}"'
        
        if re.search(old_pattern, content):
            content = re.sub(old_pattern, new_pattern, content)
            
            with open("telegram_bot.py", "w", encoding="utf-8") as f:
                f.write(content)
            
            print(f"Updated URL in telegram_bot.py: {url}")
            return True
        else:
            print("Pattern for URL replacement not found")
            return False
            
    except Exception as e:
        print(f"Error updating telegram_bot.py: {e}")
        return False

if __name__ == "__main__":
    url = get_new_tunnel_url()
    if url:
        print(f"Tunnel URL: {url}")
        if update_bot_url(url):
            print("Bot URL updated successfully!")
        else:
            print("Failed to update bot URL")
    else:
        print("No working tunnel URL found")
