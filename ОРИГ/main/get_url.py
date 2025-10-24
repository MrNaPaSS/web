import requests
import time

print("Checking ngrok status...")
time.sleep(3)

try:
    response = requests.get('http://localhost:4040/api/tunnels', timeout=5)
    data = response.json()
    
    if data['tunnels']:
        tunnel = data['tunnels'][0]
        https_url = tunnel['public_url']
        print(f"SUCCESS!")
        print(f"HTTPS URL: {https_url}")
        
        with open('ngrok_url.txt', 'w') as f:
            f.write(https_url)
        print("URL saved to ngrok_url.txt")
    else:
        print("No tunnels found")
        
except Exception as e:
    print(f"Error: {e}")
    print("Make sure ngrok is running: ngrok http 3011")
