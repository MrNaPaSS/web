import requests
import time

def check_tunnel():
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

if __name__ == "__main__":
    print("=== CLOUDFLARE TUNNEL STATUS ===")
    for i in range(10):
        url = check_tunnel()
        if url:
            print(f"✅ TUNNEL URL: {url}")
            print("✅ STATUS: Active")
            break
        else:
            print(f"Attempt {i+1}: Cloudflare tunnel starting...")
            time.sleep(3)
    else:
        print("❌ Tunnel not ready after 30 seconds")
