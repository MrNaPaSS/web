import requests
import time

def get_cloudflare_url():
    max_attempts = 15
    for attempt in range(max_attempts):
        try:
            response = requests.get("http://localhost:4040/api/tunnels", timeout=3)
            if response.status_code == 200:
                data = response.json()
                tunnels = data.get("tunnels", [])
                for tunnel in tunnels:
                    if tunnel.get("config", {}).get("addr") == "http://localhost:5173":
                        return tunnel.get("public_url")
            print(f"Attempt {attempt + 1}: waiting for Cloudflare tunnel...")
            time.sleep(2)
        except:
            print(f"Attempt {attempt + 1}: Cloudflare tunnel starting...")
            time.sleep(2)
    
    return None

if __name__ == "__main__":
    url = get_cloudflare_url()
    if url:
        print(f"CLOUDFLARE_URL={url}")
    else:
        print("ERROR: Cloudflare tunnel not ready")
