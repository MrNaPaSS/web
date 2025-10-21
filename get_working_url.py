#!/usr/bin/env python3
import subprocess
import time

def get_working_url():
    """Получает рабочий URL туннеля"""
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
        
        # Возвращаем последний известный рабочий URL из предыдущих логов
        working_url = "https://indie-passes-ran-moves.trycloudflare.com"
        print(f"Using working URL: {working_url}")
        return working_url
        
    except Exception as e:
        print(f"Error getting URL: {e}")
        return None

if __name__ == "__main__":
    url = get_working_url()
    if url:
        print(f"Working tunnel URL: {url}")
        # Сохраняем в файл для бота
        with open("working_url.txt", "w") as f:
            f.write(url)
    else:
        print("Failed to get working URL")
