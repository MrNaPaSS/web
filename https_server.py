#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import http.server
import ssl
import socketserver
import threading
import time
import requests
from urllib.parse import urlparse

class HTTPSProxyHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        # Перенаправляем на localhost:3005
        self.path = self.path
        # Добавляем заголовки для CORS
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
        
        # Проксируем запрос на localhost:3005
        try:
            url = f"http://localhost:3005{self.path}"
            response = requests.get(url, timeout=10)
            self.wfile.write(response.content)
        except Exception as e:
            self.wfile.write(f"Error: {e}".encode())

def start_https_server():
    """Запускает HTTPS сервер на порту 8443"""
    try:
        # Создаем самоподписанный сертификат
        context = ssl.create_default_context(ssl.Purpose.CLIENT_AUTH)
        context.load_cert_chain('cert.pem', 'key.pem')
        
        with socketserver.TCPServer(("", 8443), HTTPSProxyHandler) as httpd:
            httpd.socket = context.wrap_socket(httpd.socket, server_side=True)
            print("HTTPS сервер запущен на https://localhost:8443")
            httpd.serve_forever()
            
    except Exception as e:
        print(f"Ошибка HTTPS сервера: {e}")

def create_self_signed_cert():
    """Создает самоподписанный сертификат"""
    try:
        from cryptography import x509
        from cryptography.x509.oid import NameOID
        from cryptography.hazmat.primitives import hashes, serialization
        from cryptography.hazmat.primitives.asymmetric import rsa
        from datetime import datetime, timedelta
        
        # Генерируем приватный ключ
        key = rsa.generate_private_key(
            public_exponent=65537,
            key_size=2048,
        )
        
        # Создаем сертификат
        subject = issuer = x509.Name([
            x509.NameAttribute(NameOID.COUNTRY_NAME, "US"),
            x509.NameAttribute(NameOID.STATE_OR_PROVINCE_NAME, "State"),
            x509.NameAttribute(NameOID.LOCALITY_NAME, "City"),
            x509.NameAttribute(NameOID.ORGANIZATION_NAME, "Trading Signals Pro"),
            x509.NameAttribute(NameOID.COMMON_NAME, "localhost"),
        ])
        
        cert = x509.CertificateBuilder().subject_name(
            subject
        ).issuer_name(
            issuer
        ).public_key(
            key.public_key()
        ).serial_number(
            x509.random_serial_number()
        ).not_valid_before(
            datetime.utcnow()
        ).not_valid_after(
            datetime.utcnow() + timedelta(days=365)
        ).add_extension(
            x509.SubjectAlternativeName([
                x509.DNSName("localhost"),
                x509.IPAddress("127.0.0.1"),
            ]),
            critical=False,
        ).sign(key, hashes.SHA256())
        
        # Сохраняем сертификат и ключ
        with open("cert.pem", "wb") as f:
            f.write(cert.public_bytes(serialization.Encoding.PEM))
        
        with open("key.pem", "wb") as f:
            f.write(key.private_bytes(
                encoding=serialization.Encoding.PEM,
                format=serialization.PrivateFormat.PKCS8,
                encryption_algorithm=serialization.NoEncryption()
            ))
        
        print("Самоподписанный сертификат создан")
        return True
        
    except ImportError:
        print("Установите cryptography: pip install cryptography")
        return False
    except Exception as e:
        print(f"Ошибка создания сертификата: {e}")
        return False

def main():
    print("Создание HTTPS сервера для Telegram Mini App...")
    
    # Создаем сертификат
    if not create_self_signed_cert():
        return
    
    # Запускаем HTTPS сервер
    start_https_server()

if __name__ == "__main__":
    main()
