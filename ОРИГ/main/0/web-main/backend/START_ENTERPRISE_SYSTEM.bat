@echo off
echo ========================================
echo ENTERPRISE SUBSCRIPTION SYSTEM STARTUP
echo ========================================

echo [1/5] Creating logs directory...
if not exist "logs" mkdir logs

echo [2/5] Installing Python dependencies...
pip install -r requirements.txt

echo [3/5] Starting WebSocket server...
start "WebSocket Server" python websocket_server.py

echo [4/5] Waiting for WebSocket server to start...
timeout /t 3

echo [5/5] Starting main API server...
echo.
echo ========================================
echo SYSTEM STARTED SUCCESSFULLY!
echo ========================================
echo Main API: http://localhost:5000
echo WebSocket: ws://localhost:8001
echo Audit Logs: logs/audit.log
echo ========================================
echo.
echo Press Ctrl+C to stop the servers
echo ========================================

python signal_api.py





