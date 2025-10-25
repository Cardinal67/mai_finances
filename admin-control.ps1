# Admin Server Control Script
# Complete management tool for the Mai Finances Admin Dashboard

param(
    [Parameter(Position=0)]
    [string]$Command = ""
)

$ErrorActionPreference = "Continue"
$env:Path += ";C:\Program Files\nodejs"

# Check PowerShell version
if ($PSVersionTable.PSVersion.Major -lt 7) {
    Write-Host ""
    Write-Host "ERROR: This script requires PowerShell 7 or higher!" -ForegroundColor Red
    Write-Host ""
    Write-Host "You are currently using PowerShell $($PSVersionTable.PSVersion)" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Solutions:" -ForegroundColor Cyan
    Write-Host "  1. Use the batch file: .\admin-control.bat" -ForegroundColor Green
    Write-Host "  2. Switch to PowerShell 7: pwsh" -ForegroundColor Green
    Write-Host "  3. Install PowerShell 7: winget install Microsoft.PowerShell" -ForegroundColor Green
    Write-Host ""
    Write-Host "Press any key to exit..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}

# Colors
function Write-ColorTitle { Write-Host $args -ForegroundColor Cyan }
function Write-ColorSuccess { Write-Host $args -ForegroundColor Green }
function Write-ColorInfo { Write-Host $args -ForegroundColor Blue }
function Write-ColorWarning { Write-Host $args -ForegroundColor Yellow }
function Write-ColorError { Write-Host $args -ForegroundColor Red }

# Paths
$ScriptRoot = $PSScriptRoot
$AdminServerPath = Join-Path $ScriptRoot "admin-server"
$AdminDashboardPath = Join-Path $ScriptRoot "admin-dashboard"

# Check if admin server is running
function Test-AdminServerRunning {
    # Check by port (more reliable)
    $connection = Get-NetTCPConnection -LocalPort 3002 -State Listen -ErrorAction SilentlyContinue
    if ($connection) {
        return $true
    }
    
    # Fallback: Check by process
    $serverProcess = Get-Process -Name node -ErrorAction SilentlyContinue | 
        Where-Object { $_.CommandLine -like "*admin-server*server.js*" }
    return $null -ne $serverProcess
}

# Check if admin dashboard is running
function Test-AdminDashboardRunning {
    # Check by port (more reliable)
    $connection = Get-NetTCPConnection -LocalPort 3003 -State Listen -ErrorAction SilentlyContinue
    if ($connection) {
        return $true
    }
    
    # Fallback: Check by process
    $dashboardProcess = Get-Process -Name node -ErrorAction SilentlyContinue | 
        Where-Object { $_.CommandLine -like "*admin-dashboard*react-scripts*" }
    return $null -ne $dashboardProcess
}

# Get PID from port
function Get-PidFromPort {
    param([int]$Port)
    
    $connection = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
    if ($connection) {
        return $connection.OwningProcess
    }
    return $null
}

# Get process details
function Get-AdminProcessDetails {
    Write-ColorTitle "`n=== Admin Server Processes ==="
    
    # Try port-based detection first (more reliable)
    $serverPid = Get-PidFromPort -Port 3002
    $serverProcess = if ($serverPid) { Get-Process -Id $serverPid -ErrorAction SilentlyContinue } else { $null }
    
    $dashboardPid = Get-PidFromPort -Port 3003
    $dashboardProcess = if ($dashboardPid) { Get-Process -Id $dashboardPid -ErrorAction SilentlyContinue } else { $null }
    
    if ($serverProcess) {
        Write-ColorSuccess "`nAdmin Server (Port 3002):"
        Write-Host "  PID: $($serverProcess.Id)"
        Write-Host "  CPU: $([math]::Round($serverProcess.CPU, 2))s"
        Write-Host "  Memory: $([math]::Round($serverProcess.WorkingSet64 / 1MB, 2)) MB"
        Write-Host "  Started: $($serverProcess.StartTime)"
    } else {
        Write-ColorWarning "`nAdmin Server: Not Running"
    }
    
    if ($dashboardProcess) {
        Write-ColorSuccess "`nAdmin Dashboard (Port 3003):"
        Write-Host "  PID: $($dashboardProcess.Id)"
        Write-Host "  CPU: $([math]::Round($dashboardProcess.CPU, 2))s"
        Write-Host "  Memory: $([math]::Round($dashboardProcess.WorkingSet64 / 1MB, 2)) MB"
        Write-Host "  Started: $($dashboardProcess.StartTime)"
    } else {
        Write-ColorWarning "`nAdmin Dashboard: Not Running"
    }
}

# Start admin server
function Start-AdminServer {
    Write-ColorInfo "`nStarting Admin Server..."
    
    if (Test-AdminServerRunning) {
        Write-ColorWarning "Admin server is already running!"
        return
    }
    
    if (-not (Test-Path $AdminServerPath)) {
        Write-ColorError "Admin server directory not found: $AdminServerPath"
        return
    }
    
    Start-Process pwsh -ArgumentList "-NoExit", "-Command", 
        "cd '$AdminServerPath'; Write-Host 'Admin Server (Port 3002)' -ForegroundColor Cyan; node server.js"
    
    Start-Sleep -Seconds 2
    Write-ColorSuccess "Admin server started!"
    Write-Host "API: http://localhost:3002"
}

# Start admin dashboard
function Start-AdminDashboard {
    Write-ColorInfo "`nStarting Admin Dashboard..."
    
    if (Test-AdminDashboardRunning) {
        Write-ColorWarning "Admin dashboard is already running!"
        return
    }
    
    if (-not (Test-Path $AdminDashboardPath)) {
        Write-ColorError "Admin dashboard directory not found: $AdminDashboardPath"
        return
    }
    
    Start-Process pwsh -ArgumentList "-NoExit", "-Command", 
        "cd '$AdminDashboardPath'; Write-Host 'Admin Dashboard (Port 3003)' -ForegroundColor Magenta; npm start"
    
    Start-Sleep -Seconds 2
    Write-ColorSuccess "Admin dashboard started!"
    Write-Host "Dashboard: http://localhost:3003"
}

# Start both
function Start-AdminComplete {
    Write-ColorTitle "`n=== Starting Admin Complete Stack ==="
    Start-AdminServer
    Start-Sleep -Seconds 3
    Start-AdminDashboard
    Write-ColorSuccess "`nAdmin stack is starting!"
    Write-Host "Dashboard: http://localhost:3003"
    Write-Host "API: http://localhost:3002"
}

# Stop admin server
function Stop-AdminServer {
    Write-ColorInfo "`nStopping Admin Server..."
    
    $stopped = $false
    
    # Try to stop by port (most reliable)
    $connection = Get-NetTCPConnection -LocalPort 3002 -State Listen -ErrorAction SilentlyContinue
    if ($connection) {
        $processId = $connection.OwningProcess
        Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
        $stopped = $true
        Write-ColorSuccess "Admin server stopped (Port 3002)"
    }
    
    # Also try by process matching (backup)
    $processes = Get-Process -Name node -ErrorAction SilentlyContinue | 
        Where-Object { $_.CommandLine -like "*admin-server*server.js*" }
    
    if ($processes) {
        $processes | ForEach-Object { 
            Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
            $stopped = $true
        }
        Write-ColorSuccess "Admin server stopped (by process)"
    }
    
    if (-not $stopped) {
        Write-ColorWarning "Admin server was not running"
    }
}

# Stop admin dashboard
function Stop-AdminDashboard {
    Write-ColorInfo "`nStopping Admin Dashboard..."
    
    $stopped = $false
    
    # Try to stop by port (most reliable)
    $connection = Get-NetTCPConnection -LocalPort 3003 -State Listen -ErrorAction SilentlyContinue
    if ($connection) {
        $processId = $connection.OwningProcess
        Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
        $stopped = $true
        Write-ColorSuccess "Admin dashboard stopped (Port 3003)"
    }
    
    # Also try by process matching (backup)
    $processes = Get-Process -Name node -ErrorAction SilentlyContinue | 
        Where-Object { $_.CommandLine -like "*admin-dashboard*react-scripts*" }
    
    if ($processes) {
        $processes | ForEach-Object { 
            Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
            $stopped = $true
        }
        Write-ColorSuccess "Admin dashboard stopped (by process)"
    }
    
    if (-not $stopped) {
        Write-ColorWarning "Admin dashboard was not running"
    }
}

# Stop both
function Stop-AdminComplete {
    Write-ColorTitle "`n=== Stopping Admin Complete Stack ==="
    Stop-AdminServer
    Stop-AdminDashboard
    Write-ColorSuccess "Admin stack stopped"
}

# Restart
function Restart-AdminComplete {
    Stop-AdminComplete
    Start-Sleep -Seconds 2
    Start-AdminComplete
}

# Test connectivity
function Test-AdminConnectivity {
    Write-ColorTitle "`n=== Testing Admin Server Connectivity ==="
    
    Write-ColorInfo "`nTesting Admin Server (Port 3002)..."
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3002/health" -UseBasicParsing -TimeoutSec 5
        Write-ColorSuccess "✓ Admin Server responding"
        Write-Host "  Status: $($response.StatusCode)"
        Write-Host "  Response: $($response.Content)"
    } catch {
        Write-ColorError "✗ Admin Server not responding"
        Write-Host "  Error: $($_.Exception.Message)"
    }
    
    Write-ColorInfo "`nTesting Admin Dashboard (Port 3003)..."
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3003" -UseBasicParsing -TimeoutSec 5
        Write-ColorSuccess "✓ Admin Dashboard responding"
        Write-Host "  Status: $($response.StatusCode)"
    } catch {
        Write-ColorError "✗ Admin Dashboard not responding"
        Write-Host "  Error: $($_.Exception.Message)"
    }
}

# Install dependencies
function Install-AdminDependencies {
    Write-ColorTitle "`n=== Installing Admin Dependencies ==="
    
    Write-ColorInfo "`nInstalling Admin Server dependencies..."
    Set-Location $AdminServerPath
    npm install
    
    Write-ColorInfo "`nInstalling Admin Dashboard dependencies..."
    Set-Location $AdminDashboardPath
    npm install
    
    Write-ColorSuccess "`nDependencies installed!"
}

# Update dependencies
function Update-AdminDependencies {
    Write-ColorTitle "`n=== Updating Admin Dependencies ==="
    
    Write-ColorInfo "`nUpdating Admin Server dependencies..."
    Set-Location $AdminServerPath
    npm update
    
    Write-ColorInfo "`nUpdating Admin Dashboard dependencies..."
    Set-Location $AdminDashboardPath
    npm update
    
    Write-ColorSuccess "`nDependencies updated!"
}

# View logs
function Show-AdminLogs {
    Write-ColorTitle "`n=== Admin Server Logs ==="
    
    $logPath = Join-Path $AdminServerPath "logs"
    
    if (Test-Path $logPath) {
        $logFiles = Get-ChildItem $logPath -Filter "*.log" -ErrorAction SilentlyContinue
        if ($logFiles) {
            $logFiles | 
                Sort-Object LastWriteTime -Descending | 
                Select-Object -First 5 |
                ForEach-Object {
                    Write-ColorInfo "`n--- $($_.Name) ---"
                    Get-Content $_.FullName -Tail 50
                }
            return
        }
    }
    
    # No log files - servers log to console
    Write-ColorInfo "`nℹ️  Log Output Location:"
    Write-Host ""
    
    $serverPid = Get-PidFromPort -Port 3002
    $dashboardPid = Get-PidFromPort -Port 3003
    
    if ($serverPid) {
        Write-ColorSuccess "✓ Admin Server (Port 3002, PID $serverPid):"
        Write-Host "  Logs are displayed in the PowerShell window where it was started"
        Write-Host "  Look for the window titled: 'Admin Server (Port 3002)'"
    } else {
        Write-ColorWarning "✗ Admin Server is not running"
    }
    
    Write-Host ""
    
    if ($dashboardPid) {
        Write-ColorSuccess "✓ Admin Dashboard (Port 3003, PID $dashboardPid):"
        Write-Host "  Logs are displayed in the PowerShell window where it was started"
        Write-Host "  Look for the window titled: 'Admin Dashboard (Port 3003)'"
    } else {
        Write-ColorWarning "✗ Admin Dashboard is not running"
    }
    
    Write-Host ""
    Write-ColorInfo "💡 Tip:"
    Write-Host "  The servers output logs in real-time to their console windows"
    Write-Host "  To see more detail, check those terminal windows"
}

# Check system requirements
function Test-AdminRequirements {
    Write-ColorTitle "`n=== Checking System Requirements ==="
    
    # Node.js
    Write-ColorInfo "`nChecking Node.js..."
    try {
        $nodeVersion = node --version
        Write-ColorSuccess "✓ Node.js: $nodeVersion"
    } catch {
        Write-ColorError "✗ Node.js not found"
    }
    
    # NPM
    Write-ColorInfo "`nChecking NPM..."
    try {
        $npmVersion = npm --version
        Write-ColorSuccess "✓ NPM: $npmVersion"
    } catch {
        Write-ColorError "✗ NPM not found"
    }
    
    # Ports
    Write-ColorInfo "`nChecking port availability..."
    $ports = @(3002, 3003)
    foreach ($port in $ports) {
        $connection = Test-NetConnection -ComputerName localhost -Port $port -WarningAction SilentlyContinue -InformationLevel Quiet
        if ($connection) {
            Write-ColorWarning "✗ Port $port is in use"
        } else {
            Write-ColorSuccess "✓ Port $port is available"
        }
    }
    
    # Directories
    Write-ColorInfo "`nChecking directories..."
    if (Test-Path $AdminServerPath) {
        Write-ColorSuccess "✓ Admin server directory exists"
    } else {
        Write-ColorError "✗ Admin server directory not found"
    }
    
    if (Test-Path $AdminDashboardPath) {
        Write-ColorSuccess "✓ Admin dashboard directory exists"
    } else {
        Write-ColorError "✗ Admin dashboard directory not found"
    }
}

# Open in browser
function Open-AdminDashboard {
    Write-ColorInfo "`nOpening admin dashboard in browser..."
    Start-Process "http://localhost:3003"
}

# Build dashboard for production
function New-AdminDashboardBuild {
    Write-ColorTitle "`n=== Building Admin Dashboard for Production ==="
    
    Set-Location $AdminDashboardPath
    Write-ColorInfo "`nBuilding..."
    npm run build
    
    Write-ColorSuccess "`nBuild complete!"
    Write-Host "Build output: $AdminDashboardPath\build"
}

# Clean install
function Reset-AdminInstallation {
    Write-ColorTitle "`n=== Clean Admin Installation ==="
    Write-ColorWarning "`nThis will delete node_modules and reinstall everything"
    
    $confirm = Read-Host "Continue? (y/n)"
    if ($confirm -ne "y") {
        Write-ColorInfo "Cancelled"
        return
    }
    
    # Server
    Write-ColorInfo "`nCleaning admin server..."
    Set-Location $AdminServerPath
    if (Test-Path "node_modules") {
        Remove-Item -Recurse -Force "node_modules"
    }
    if (Test-Path "package-lock.json") {
        Remove-Item -Force "package-lock.json"
    }
    npm install
    
    # Dashboard
    Write-ColorInfo "`nCleaning admin dashboard..."
    Set-Location $AdminDashboardPath
    if (Test-Path "node_modules") {
        Remove-Item -Recurse -Force "node_modules"
    }
    if (Test-Path "package-lock.json") {
        Remove-Item -Force "package-lock.json"
    }
    npm install
    
    Write-ColorSuccess "`nClean installation complete!"
}

# Show configuration
function Show-AdminConfiguration {
    Write-ColorTitle "`n=== Admin Configuration ==="
    
    Write-ColorInfo "`nServer Configuration:"
    Write-Host "  Path: $AdminServerPath"
    Write-Host "  Port: 3002"
    Write-Host "  API: http://localhost:3002/api/admin"
    
    Write-ColorInfo "`nDashboard Configuration:"
    Write-Host "  Path: $AdminDashboardPath"
    Write-Host "  Port: 3003"
    Write-Host "  URL: http://localhost:3003"
    
    Write-ColorInfo "`nEnvironment:"
    $nodeEnv = if ($env:NODE_ENV) { $env:NODE_ENV } else { 'production' }
    $dbUrl = if ($env:DATABASE_URL) { $env:DATABASE_URL } else { 'not set' }
    Write-Host "  NODE_ENV: $nodeEnv"
    Write-Host "  Database: $dbUrl"
}

# Interactive Menu
function Show-AdminMenu {
    Clear-Host
    Write-Host ""
    Write-ColorTitle "╔════════════════════════════════════════════════════════╗"
    Write-ColorTitle "║                                                        ║"
    Write-ColorTitle "║     🎛️  Admin Server Control Panel  🎛️                ║"
    Write-ColorTitle "║                                                        ║"
    Write-ColorTitle "╚════════════════════════════════════════════════════════╝"
    Write-Host ""
    
    Write-Host "  CONTROL OPTIONS:" -ForegroundColor White
    Write-Host "  [1]  Start Admin Server (Port 3002)" -ForegroundColor Cyan
    Write-Host "  [2]  Start Admin Dashboard (Port 3003)" -ForegroundColor Magenta
    Write-Host "  [3]  Start Both (Complete Stack)" -ForegroundColor Green
    Write-Host "  [4]  Stop Admin Server" -ForegroundColor Yellow
    Write-Host "  [5]  Stop Admin Dashboard" -ForegroundColor Yellow
    Write-Host "  [6]  Stop Both" -ForegroundColor Yellow
    Write-Host "  [7]  Restart Both" -ForegroundColor Green
    Write-Host ""
    Write-Host "  MONITORING OPTIONS:" -ForegroundColor White
    Write-Host "  [8]  View Status & Process Details" -ForegroundColor Cyan
    Write-Host "  [9]  Test Connectivity" -ForegroundColor Cyan
    Write-Host "  [10] View Logs" -ForegroundColor Cyan
    Write-Host "  [11] Open Dashboard in Browser" -ForegroundColor Blue
    Write-Host ""
    Write-Host "  MAINTENANCE OPTIONS:" -ForegroundColor White
    Write-Host "  [12] Install Dependencies" -ForegroundColor Green
    Write-Host "  [13] Update Dependencies" -ForegroundColor Green
    Write-Host "  [14] Clean Install (Reset)" -ForegroundColor Yellow
    Write-Host "  [15] Build for Production" -ForegroundColor Magenta
    Write-Host ""
    Write-Host "  INFORMATION OPTIONS:" -ForegroundColor White
    Write-Host "  [16] Show Configuration" -ForegroundColor Blue
    Write-Host "  [17] Check System Requirements" -ForegroundColor Blue
    Write-Host ""
    Write-Host "  [Q]  Quit" -ForegroundColor Red
    Write-Host ""
    Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor DarkGray
    Write-Host ""
}

# Main interactive loop
if ($Command -eq "") {
    do {
        Show-AdminMenu
        $choice = Read-Host "Enter your choice"
        
        switch ($choice) {
            "1" { Start-AdminServer; Read-Host "`nPress Enter to continue" }
            "2" { Start-AdminDashboard; Read-Host "`nPress Enter to continue" }
            "3" { Start-AdminComplete; Read-Host "`nPress Enter to continue" }
            "4" { Stop-AdminServer; Read-Host "`nPress Enter to continue" }
            "5" { Stop-AdminDashboard; Read-Host "`nPress Enter to continue" }
            "6" { Stop-AdminComplete; Read-Host "`nPress Enter to continue" }
            "7" { Restart-AdminComplete; Read-Host "`nPress Enter to continue" }
            "8" { Get-AdminProcessDetails; Read-Host "`nPress Enter to continue" }
            "9" { Test-AdminConnectivity; Read-Host "`nPress Enter to continue" }
            "10" { Show-AdminLogs; Read-Host "`nPress Enter to continue" }
            "11" { Open-AdminDashboard; Read-Host "`nPress Enter to continue" }
            "12" { Install-AdminDependencies; Read-Host "`nPress Enter to continue" }
            "13" { Update-AdminDependencies; Read-Host "`nPress Enter to continue" }
            "14" { Reset-AdminInstallation; Read-Host "`nPress Enter to continue" }
            "15" { New-AdminDashboardBuild; Read-Host "`nPress Enter to continue" }
            "16" { Show-AdminConfiguration; Read-Host "`nPress Enter to continue" }
            "17" { Test-AdminRequirements; Read-Host "`nPress Enter to continue" }
            "Q" { Write-ColorSuccess "`nGoodbye!"; exit }
            default { Write-ColorWarning "`nInvalid choice"; Start-Sleep -Seconds 1 }
        }
    } while ($true)
} else {
    # Command-line mode
    switch ($Command.ToLower()) {
        "start-server" { Start-AdminServer }
        "start-dashboard" { Start-AdminDashboard }
        "start" { Start-AdminComplete }
        "stop-server" { Stop-AdminServer }
        "stop-dashboard" { Stop-AdminDashboard }
        "stop" { Stop-AdminComplete }
        "restart" { Restart-AdminComplete }
        "status" { Get-AdminProcessDetails }
        "test" { Test-AdminConnectivity }
        "logs" { Show-AdminLogs }
        "open" { Open-AdminDashboard }
        "install" { Install-AdminDependencies }
        "update" { Update-AdminDependencies }
        "reset" { Reset-AdminInstallation }
        "build" { New-AdminDashboardBuild }
        "config" { Show-AdminConfiguration }
        "check" { Test-AdminRequirements }
        default { 
            Write-ColorError "Unknown command: $Command"
            Write-Host "`nAvailable commands:"
            Write-Host "  start, stop, restart, status, test, logs, open"
            Write-Host "  install, update, reset, build, config, check"
            Write-Host "`nOr run without parameters for interactive menu"
        }
    }
}

