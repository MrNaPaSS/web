#!/usr/bin/env python3
import requests
import time
import re

def fix_tunnel():
    print("Checking tunnel...")
    
    for attempt in range(10):
        try:
            response = requests.get('http://localhost:4040/api/tunnels', timeout=2)
            if response.status_code == 200:
                data = response.json()
                tunnels = data.get('tunnels', [])
                
                for tunnel in tunnels:
                    if tunnel.get('config', {}).get('addr') == 'http://localhost:5173':
                        url = tunnel.get('public_url')
                        print(f'Found tunnel URL: {url}')
                        
                        # Update bot
                        with open('telegram_bot.py', 'r', encoding='utf-8') as f:
                            content = f.read()
                        
                        new_content = re.sub(
                            r'self\.web_app_url = ".*"',
                            f'self.web_app_url = "{url}"',
                            content
                        )
                        
                        with open('telegram_bot.py', 'w', encoding='utf-8') as f:
                            f.write(new_content)
                        
                        print(f'Bot updated with URL: {url}')
                        return url
                
                print(f'Attempt {attempt + 1}: No tunnel found')
            else:
                print(f'Attempt {attempt + 1}: API not ready')
                
        except Exception as e:
            print(f'Attempt {attempt + 1}: Error - {e}')
        
        time.sleep(3)
    
    print("Failed to get tunnel URL")
    return None

if __name__ == "__main__":
    fix_tunnel()
