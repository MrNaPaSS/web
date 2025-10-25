$body = @{
    user_id = "123"
    user_name = "Test User"
    model_name = "Test Model"
    message = "Test message"
} | ConvertTo-Json

$headers = @{
    'Origin' = 'https://app.nomoneynohoney.online'
    'Content-Type' = 'application/json'
}

try {
    $response = Invoke-WebRequest -Uri 'https://bot.nomoneynohoney.online/api/admin-notification' -Method POST -Body $body -Headers $headers -UseBasicParsing
    Write-Host "Status: $($response.StatusCode)"
    Write-Host "Content: $($response.Content)"
} catch {
    Write-Host "Error: $($_.Exception.Message)"
    if ($_.Exception.Response) {
        Write-Host "Response Status: $($_.Exception.Response.StatusCode)"
    }
}
