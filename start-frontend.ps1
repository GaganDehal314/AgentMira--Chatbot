# Start Frontend Dev Server
# This script uses the full path to npm to avoid PATH issues

$npmPath = "C:\Program Files\nodejs\npm.cmd"
$frontendPath = "C:\Users\gagan\Downloads\Agent Mira\frontend"

Write-Host "Starting frontend development server..." -ForegroundColor Green
Write-Host "Navigate to: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

Set-Location $frontendPath
& $npmPath run dev

