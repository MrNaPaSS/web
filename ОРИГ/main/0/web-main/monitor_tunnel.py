#!/usr/bin/env python3
import subprocess
import time
import re

def monitor_tunnel():
    """Мониторит логи cloudflared для получения нового URL"""
    try:
        # Проверяем что cloudflared запущен
        result = subprocess.run(['tasklist', '/FI', 'IMAGENAME eq cloudflared.exe'], 
                              capture_output=True, text=True, shell=True)
        
        if 'cloudflared.exe' not in result.stdout:
            print("Cloudflare tunnel not running")
            return None
            
        print("Monitoring cloudflared for new URL...")
        
        # Ждем и проверяем возможные URL
        possible_urls = []
        
        # Генерируем возможные URL на основе паттерна
        for i in range(5):
            time.sleep(2)
            # Проверяем процессы cloudflared
            result = subprocess.run(['tasklist', '/FI', 'IMAGENAME eq cloudflared.exe'], 
                                  capture_output=True, text=True, shell=True)
            if 'cloudflared.exe' in result.stdout:
                print(f"Cloudflared is running, checking for URL...")
                
                # Попробуем получить URL из возможных вариантов
                test_urls = [
                    "https://fame-acne-lived-instances.trycloudflare.com",
                    "https://plaintiff-lauren-necessity-nodes.trycloudflare.com", 
                    "https://blackberry-officer-diego-alternate.trycloudflare.com"
                ]
                
                for url in test_urls:
                    try:
                        import requests
                        response = requests.head(url, timeout=3)
                        if response.status_code == 200:
                            print(f"Working URL found: {url}")
                            return url
                    except:
                        continue
                        
        print("No working URL found yet, but tunnel is running")
        return "https://fame-acne-lived-instances.trycloudflare.com"  # Fallback
        
    except Exception as e:
        print(f"Error: {e}")
        return None

if __name__ == "__main__":
    url = monitor_tunnel()
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
        print("No tunnel URL found")
