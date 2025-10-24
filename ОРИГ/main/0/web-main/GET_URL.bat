@echo off
chcp 65001 > nul

echo Получаю ngrok URL...

:loop
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:4040/api/tunnels' -UseBasicParsing -TimeoutSec 3; $json = $response.Content | ConvertFrom-Json; $tunnels = $json.tunnels; foreach ($tunnel in $tunnels) { if ($tunnel.proto -eq 'https') { Write-Host $tunnel.public_url; exit 0 } } Write-Host 'No HTTPS tunnel found' } catch { Write-Host 'Waiting for ngrok...' }"

if %errorlevel% == 0 goto :found

timeout /t 2 /nobreak > nul
goto :loop

:found
echo.
echo ✅ URL получен!
echo.
pause
