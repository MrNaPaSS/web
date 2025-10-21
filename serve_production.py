#!/usr/bin/env python3
"""
Простой HTTP сервер для production версии Web App
"""
import http.server
import socketserver
import os

PORT = 8000
DIRECTORY = r'e:\TelegramBot_RDP\webapp\frontend\dist'

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

def start_server():
    try:
        os.chdir(DIRECTORY)
        with socketserver.TCPServer(("", PORT), MyHTTPRequestHandler) as httpd:
            print(f"[OK] Production сервер запущен на http://localhost:{PORT}")
            print(f"[INFO] Открой в браузере: http://localhost:{PORT}")
            print(f"[INFO] Обслуживает файлы из: {DIRECTORY}")
            httpd.serve_forever()
    except Exception as e:
        print(f"[ERROR] Ошибка запуска сервера: {e}")

if __name__ == "__main__":
    start_server()
