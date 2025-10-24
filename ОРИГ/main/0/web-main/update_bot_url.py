import requests
import re
import time

def get_new_tunnel_url():
    try:
        response = requests.get("http://localhost:4040/api/tunnels", timeout=5)
        if response.status_code == 200:
            data = response.json()
            tunnels = data.get("tunnels", [])
            for tunnel in tunnels:
                if tunnel.get("config", {}).get("addr") == "http://localhost:5173":
                    return tunnel.get("public_url")
        return None
    except:
        return None

def update_bot_url(new_url):
    try:
        file_path = r"e:\TelegramBot_RDP\telegram_bot.py"
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        new_content = re.sub(
            r'self\.web_app_url = ".*"',
            f'self.web_app_url = "{new_url}"',
            content
        )
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        
        return True
    except Exception as e:
        print(f"Error updating bot: {e}")
        return False

if __name__ == "__main__":
    print("=== CLOUDFLARE TUNNEL UPDATE ===")
    
    for attempt in range(10):
        url = get_new_tunnel_url()
        if url:
            print(f"NEW TUNNEL URL: {url}")
            print("Updating bot...")
            
            if update_bot_url(url):
                print("Bot updated successfully!")
                print("Restart the bot to apply changes")
            else:
                print("Failed to update bot")
            break
        else:
            print(f"Attempt {attempt + 1}: Waiting for tunnel...")
            time.sleep(3)
    else:
        print("Tunnel not ready after 30 seconds")
