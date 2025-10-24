@echo off
echo ========================================
echo NGROK AUTH TOKEN SETUP
echo ========================================
echo.
echo 1. Go to: https://dashboard.ngrok.com/get-started/your-authtoken
echo 2. Copy your authtoken
echo 3. Paste it below when asked
echo.
set /p TOKEN="Enter your ngrok authtoken: "
echo.
echo Setting up ngrok with your token...
ngrok config add-authtoken %TOKEN%
echo.
echo ========================================
echo DONE! Now ngrok is ready to use!
echo ========================================
pause
