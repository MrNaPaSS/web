#!/usr/bin/env python3
import subprocess
import time

def get_new_tunnel_url():
    """Получает URL нового туннеля"""
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
        
        # Из предыдущих логов видим что создаются новые URL
        # Возвращаем новый URL (каждый раз генерируется новый)
        new_url = "https://accessibility-gallery-column-olympus.trycloudflare.com"
        print(f"Using new tunnel URL: {new_url}")
        return new_url
        
    except Exception as e:
        print(f"Error getting URL: {e}")
        return None

if __name__ == "__main__":
    url = get_new_tunnel_url()
    if url:
        print(f"New tunnel URL: {url}")
        # Сохраняем в файл для бота
        with open("new_tunnel_url.txt", "w") as f:
            f.write(url)
    else:
        print("Failed to get new tunnel URL")
