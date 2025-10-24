import requests
import json
import time
import sys

def get_ngrok_url():
    max_attempts = 10
    for attempt in range(max_attempts):
        try:
            response = requests.get("http://localhost:4040/api/tunnels", timeout=5)
            if response.status_code == 200:
                data = response.json()
                tunnels = data.get("tunnels", [])
                for tunnel in tunnels:
                    if tunnel.get("proto") == "https":
                        return tunnel.get("public_url")
            print(f"Attempt {attempt + 1}: ngrok not ready yet...")
            time.sleep(2)
        except:
            print(f"Attempt {attempt + 1}: waiting for ngrok...")
            time.sleep(2)
    
    return None

if __name__ == "__main__":
    url = get_ngrok_url()
    if url:
        print(url)
    else:
        print("ERROR: Could not get ngrok URL")
        sys.exit(1)