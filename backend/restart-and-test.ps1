# Pull latest code
Write-Host "📥 Pulling latest code..." -ForegroundColor Cyan
git pull origin main

# Kill any existing backend process on port 3001
Write-Host "`n🛑 Stopping existing backend..." -ForegroundColor Yellow
$process = Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
if ($process) {
    Stop-Process -Id $process -Force
    Start-Sleep -Seconds 2
    Write-Host "✅ Stopped process $process" -ForegroundColor Green
} else {
    Write-Host "ℹ️  No process found on port 3001" -ForegroundColor Gray
}

# Start backend in background
Write-Host "`n🚀 Starting backend with new code..." -ForegroundColor Cyan
$backendPath = $PWD.Path
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$backendPath'; .\start.ps1"

# Wait for backend to start
Write-Host "⏳ Waiting for backend to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Test the balance toggle
Write-Host "`n🧪 Running balance toggle test..." -ForegroundColor Cyan
node test-balance-toggle.js

Write-Host "`n✅ Test complete! Check the backend window for debug logs." -ForegroundColor Green

