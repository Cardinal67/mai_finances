# Load environment variables from .env file
Get-Content ..\.env | ForEach-Object {
    if ($_ -match '^\s*([^#][^=]*?)\s*=\s*(.+?)\s*$') {
        $key = $matches[1]
        $value = $matches[2]
        [Environment]::SetEnvironmentVariable($key, $value, "Process")
    }
}

# Add Node.js to PATH
$env:Path += ";C:\Program Files\nodejs"

# Start the server
Write-Host "🚀 Starting Personal Finance Manager API..." -ForegroundColor Green
node src/server.js

