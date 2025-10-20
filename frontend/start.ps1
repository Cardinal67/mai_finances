# Start Frontend Server
Write-Host "Starting Personal Finance Manager Frontend..." -ForegroundColor Cyan

# Ensure Node.js is in PATH
$env:Path += ";C:\Program Files\nodejs"

# Disable browser auto-open
$env:BROWSER = "none"

# Start the React development server
Write-Host "Running: npm start" -ForegroundColor Yellow
npm start

