#!/usr/bin/env python3
import http.server
import socketserver

PORT = 9000

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

    def do_GET(self):
        if self.path == '/':
            self.send_response(200)
            self.send_header('Content-type', 'text/html')
            self.end_headers()
            html = '''
            <!DOCTYPE html>
            <html>
            <head>
                <title>Forex Signals App</title>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body { font-family: Arial, sans-serif; background: #1a1a1a; color: white; text-align: center; padding: 50px; }
                    h1 { color: #4CAF50; }
                    .status { background: #333; padding: 20px; border-radius: 10px; margin: 20px; }
                </style>
            </head>
            <body>
                <h1>🚀 Forex Signals App</h1>
                <div class="status">
                    <p>✅ Приложение работает!</p>
                    <p>Время: <span id="time"></span></p>
                    <p>Порт: 9000</p>
                </div>
                <script>
                    document.getElementById('time').textContent = new Date().toLocaleString();
                </script>
            </body>
            </html>
            '''
            self.wfile.write(html.encode())
        else:
            super().do_GET()

if __name__ == "__main__":
    with socketserver.TCPServer(("", PORT), MyHTTPRequestHandler) as httpd:
        print(f"Server running at http://localhost:{PORT}")
        httpd.serve_forever()