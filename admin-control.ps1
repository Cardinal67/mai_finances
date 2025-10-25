# Admin Server Control Script
# Complete management tool for the Mai Finances Admin Dashboard

param(
    [Parameter(Position=0)]
    [string]$Command = ""
)

$ErrorActionPreference = "Continue"
$env:Path += ";C:\Program Files\nodejs"

# Colors
function Write-Title { Write-Host $args -ForegroundColor Cyan }
function Write-Success { Write-Host $args -ForegroundColor Green }
function Write-Info { Write-Host $args -ForegroundColor Blue }
function Write-Warning { Write-Host $args -ForegroundColor Yellow }
function Write-Error { Write-Host $args -ForegroundColor Red }

# Paths
$ScriptRoot = $PSScriptRoot
$AdminServerPath = Join-Path $ScriptRoot "admin-server"
$AdminDashboardPath = Join-Path $ScriptRoot "admin-dashboard"

# Check if admin server is running
function Test-AdminServerRunning {
    $serverProcess = Get-Process -Name node -ErrorAction SilentlyContinue | 
        Where-Object { $_.CommandLine -like "*admin-server*server.js*" }
    return $null -ne $serverProcess
}

# Check if admin dashboard is running
function Test-AdminDashboardRunning {
    $dashboardProcess = Get-Process -Name node -ErrorAction SilentlyContinue | 
        Where-Object { $_.CommandLine -like "*admin-dashboard*react-scripts*" }
    return $null -ne $dashboardProcess
}

# Get process details
function Get-AdminProcessDetails {
    Write-Title "`n=== Admin Server Processes ==="
    
    $serverProcess = Get-Process -Name node -ErrorAction SilentlyContinue | 
        Where-Object { $_.CommandLine -like "*admin-server*server.js*" }
    
    $dashboardProcess = Get-Process -Name node -ErrorAction SilentlyContinue | 
        Where-Object { $_.CommandLine -like "*admin-dashboard*react-scripts*" }
    
    if ($serverProcess) {
        Write-Success "`nAdmin Server (Port 3002):"
        Write-Host "  PID: $($serverProcess.Id)"
        Write-Host "  CPU: $([math]::Round($serverProcess.CPU, 2))s"
        Write-Host "  Memory: $([math]::Round($serverProcess.WorkingSet64 / 1MB, 2)) MB"
        Write-Host "  Started: $($serverProcess.StartTime)"
    } else {
        Write-Warning "`nAdmin Server: Not Running"
    }
    
    if ($dashboardProcess) {
        Write-Success "`nAdmin Dashboard (Port 3003):"
        Write-Host "  PID: $($dashboardProcess.Id)"
        Write-Host "  CPU: $([math]::Round($dashboardProcess.CPU, 2))s"
        Write-Host "  Memory: $([math]::Round($dashboardProcess.WorkingSet64 / 1MB, 2)) MB"
        Write-Host "  Started: $($dashboardProcess.StartTime)"
    } else {
        Write-Warning "`nAdmin Dashboard: Not Running"
    }
}

# Start admin server
function Start-AdminServer {
    Write-Info "`nStarting Admin Server..."
    
    if (Test-AdminServerRunning) {
        Write-Warning "Admin server is already running!"
        return
    }
    
    if (-not (Test-Path $AdminServerPath)) {
        Write-Error "Admin server directory not found: $AdminServerPath"
        return
    }
    
    Start-Process powershell -ArgumentList "-NoExit", "-Command", 
        "cd '$AdminServerPath'; Write-Host 'Admin Server (Port 3002)' -ForegroundColor Cyan; node server.js"
    
    Start-Sleep -Seconds 2
    Write-Success "Admin server started!"
    Write-Host "API: http://localhost:3002"
}

# Start admin dashboard
function Start-AdminDashboard {
    Write-Info "`nStarting Admin Dashboard..."
    
    if (Test-AdminDashboardRunning) {
        Write-Warning "Admin dashboard is already running!"
        return
    }
    
    if (-not (Test-Path $AdminDashboardPath)) {
        Write-Error "Admin dashboard directory not found: $AdminDashboardPath"
        return
    }
    
    Start-Process powershell -ArgumentList "-NoExit", "-Command", 
        "cd '$AdminDashboardPath'; Write-Host 'Admin Dashboard (Port 3003)' -ForegroundColor Magenta; npm start"
    
    Start-Sleep -Seconds 2
    Write-Success "Admin dashboard started!"
    Write-Host "Dashboard: http://localhost:3003"
}

# Start both
function Start-AdminComplete {
    Write-Title "`n=== Starting Admin Complete Stack ==="
    Start-AdminServer
    Start-Sleep -Seconds 3
    Start-AdminDashboard
    Write-Success "`nAdmin stack is starting!"
    Write-Host "Dashboard: http://localhost:3003"
    Write-Host "API: http://localhost:3002"
}

# Stop admin server
function Stop-AdminServer {
    Write-Info "`nStopping Admin Server..."
    
    $stopped = $false
    Get-Process -Name node -ErrorAction SilentlyContinue | 
        Where-Object { $_.CommandLine -like "*admin-server*server.js*" } |
        ForEach-Object {
            Stop-Process -Id $_.Id -Force
            $stopped = $true
        }
    
    if ($stopped) {
        Write-Success "Admin server stopped"
    } else {
        Write-Warning "Admin server was not running"
    }
}

# Stop admin dashboard
function Stop-AdminDashboard {
    Write-Info "`nStopping Admin Dashboard..."
    
    $stopped = $false
    Get-Process -Name node -ErrorAction SilentlyContinue | 
        Where-Object { $_.CommandLine -like "*admin-dashboard*react-scripts*" } |
        ForEach-Object {
            Stop-Process -Id $_.Id -Force
            $stopped = $true
        }
    
    if ($stopped) {
        Write-Success "Admin dashboard stopped"
    } else {
        Write-Warning "Admin dashboard was not running"
    }
}

# Stop both
function Stop-AdminComplete {
    Write-Title "`n=== Stopping Admin Complete Stack ==="
    Stop-AdminServer
    Stop-AdminDashboard
    Write-Success "Admin stack stopped"
}

# Restart
function Restart-AdminComplete {
    Stop-AdminComplete
    Start-Sleep -Seconds 2
    Start-AdminComplete
}

# Test connectivity
function Test-AdminConnectivity {
    Write-Title "`n=== Testing Admin Server Connectivity ==="
    
    Write-Info "`nTesting Admin Server (Port 3002)..."
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3002/health" -UseBasicParsing -TimeoutSec 5
        Write-Success "✓ Admin Server responding"
        Write-Host "  Status: $($response.StatusCode)"
        Write-Host "  Response: $($response.Content)"
    } catch {
        Write-Error "✗ Admin Server not responding"
        Write-Host "  Error: $($_.Exception.Message)"
    }
    
    Write-Info "`nTesting Admin Dashboard (Port 3003)..."
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3003" -UseBasicParsing -TimeoutSec 5
        Write-Success "✓ Admin Dashboard responding"
        Write-Host "  Status: $($response.StatusCode)"
    } catch {
        Write-Error "✗ Admin Dashboard not responding"
        Write-Host "  Error: $($_.Exception.Message)"
    }
}

# Install dependencies
function Install-AdminDependencies {
    Write-Title "`n=== Installing Admin Dependencies ==="
    
    Write-Info "`nInstalling Admin Server dependencies..."
    cd $AdminServerPath
    npm install
    
    Write-Info "`nInstalling Admin Dashboard dependencies..."
    cd $AdminDashboardPath
    npm install
    
    Write-Success "`nDependencies installed!"
}

# Update dependencies
function Update-AdminDependencies {
    Write-Title "`n=== Updating Admin Dependencies ==="
    
    Write-Info "`nUpdating Admin Server dependencies..."
    cd $AdminServerPath
    npm update
    
    Write-Info "`nUpdating Admin Dashboard dependencies..."
    cd $AdminDashboardPath
    npm update
    
    Write-Success "`nDependencies updated!"
}

# View logs
function Show-AdminLogs {
    Write-Title "`n=== Admin Server Logs ==="
    
    $logPath = Join-Path $AdminServerPath "logs"
    
    if (Test-Path $logPath) {
        Get-ChildItem $logPath -Filter "*.log" | 
            Sort-Object LastWriteTime -Descending | 
            Select-Object -First 5 |
            ForEach-Object {
                Write-Info "`n--- $($_.Name) ---"
                Get-Content $_.FullName -Tail 50
            }
    } else {
        Write-Warning "No log files found"
        Write-Host "Logs are displayed in the terminal window"
    }
}

# Check system requirements
function Test-AdminRequirements {
    Write-Title "`n=== Checking System Requirements ==="
    
    # Node.js
    Write-Info "`nChecking Node.js..."
    try {
        $nodeVersion = node --version
        Write-Success "✓ Node.js: $nodeVersion"
    } catch {
        Write-Error "✗ Node.js not found"
    }
    
    # NPM
    Write-Info "`nChecking NPM..."
    try {
        $npmVersion = npm --version
        Write-Success "✓ NPM: $npmVersion"
    } catch {
        Write-Error "✗ NPM not found"
    }
    
    # Ports
    Write-Info "`nChecking port availability..."
    $ports = @(3002, 3003)
    foreach ($port in $ports) {
        $connection = Test-NetConnection -ComputerName localhost -Port $port -WarningAction SilentlyContinue -InformationLevel Quiet
        if ($connection) {
            Write-Warning "✗ Port $port is in use"
        } else {
            Write-Success "✓ Port $port is available"
        }
    }
    
    # Directories
    Write-Info "`nChecking directories..."
    if (Test-Path $AdminServerPath) {
        Write-Success "✓ Admin server directory exists"
    } else {
        Write-Error "✗ Admin server directory not found"
    }
    
    if (Test-Path $AdminDashboardPath) {
        Write-Success "✓ Admin dashboard directory exists"
    } else {
        Write-Error "✗ Admin dashboard directory not found"
    }
}

# Open in browser
function Open-AdminDashboard {
    Write-Info "`nOpening admin dashboard in browser..."
    Start-Process "http://localhost:3003"
}

# Build dashboard for production
function Build-AdminDashboard {
    Write-Title "`n=== Building Admin Dashboard for Production ==="
    
    cd $AdminDashboardPath
    Write-Info "`nBuilding..."
    npm run build
    
    Write-Success "`nBuild complete!"
    Write-Host "Build output: $AdminDashboardPath\build"
}

# Clean install
function Reset-AdminInstallation {
    Write-Title "`n=== Clean Admin Installation ==="
    Write-Warning "`nThis will delete node_modules and reinstall everything"
    
    $confirm = Read-Host "Continue? (y/n)"
    if ($confirm -ne "y") {
        Write-Info "Cancelled"
        return
    }
    
    # Server
    Write-Info "`nCleaning admin server..."
    cd $AdminServerPath
    if (Test-Path "node_modules") {
        Remove-Item -Recurse -Force "node_modules"
    }
    if (Test-Path "package-lock.json") {
        Remove-Item -Force "package-lock.json"
    }
    npm install
    
    # Dashboard
    Write-Info "`nCleaning admin dashboard..."
    cd $AdminDashboardPath
    if (Test-Path "node_modules") {
        Remove-Item -Recurse -Force "node_modules"
    }
    if (Test-Path "package-lock.json") {
        Remove-Item -Force "package-lock.json"
    }
    npm install
    
    Write-Success "`nClean installation complete!"
}

# Show configuration
function Show-AdminConfiguration {
    Write-Title "`n=== Admin Configuration ==="
    
    Write-Info "`nServer Configuration:"
    Write-Host "  Path: $AdminServerPath"
    Write-Host "  Port: 3002"
    Write-Host "  API: http://localhost:3002/api/admin"
    
    Write-Info "`nDashboard Configuration:"
    Write-Host "  Path: $AdminDashboardPath"
    Write-Host "  Port: 3003"
    Write-Host "  URL: http://localhost:3003"
    
    Write-Info "`nEnvironment:"
    $nodeEnv = if ($env:NODE_ENV) { $env:NODE_ENV } else { 'production' }
    $dbUrl = if ($env:DATABASE_URL) { $env:DATABASE_URL } else { 'not set' }
    Write-Host "  NODE_ENV: $nodeEnv"
    Write-Host "  Database: $dbUrl"
}

# Interactive Menu
function Show-AdminMenu {
    Clear-Host
    Write-Host ""
    Write-Title "╔════════════════════════════════════════════════════════╗"
    Write-Title "║                                                        ║"
    Write-Title "║     🎛️  Admin Server Control Panel  🎛️                ║"
    Write-Title "║                                                        ║"
    Write-Title "╚════════════════════════════════════════════════════════╝"
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
            "1" { Start-AdminServer; Write-Host "`nPress any key..."; $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") }
            "2" { Start-AdminDashboard; Write-Host "`nPress any key..."; $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") }
            "3" { Start-AdminComplete; Write-Host "`nPress any key..."; $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") }
            "4" { Stop-AdminServer; Write-Host "`nPress any key..."; $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") }
            "5" { Stop-AdminDashboard; Write-Host "`nPress any key..."; $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") }
            "6" { Stop-AdminComplete; Write-Host "`nPress any key..."; $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") }
            "7" { Restart-AdminComplete; Write-Host "`nPress any key..."; $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") }
            "8" { Get-AdminProcessDetails; Write-Host "`nPress any key..."; $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") }
            "9" { Test-AdminConnectivity; Write-Host "`nPress any key..."; $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") }
            "10" { Show-AdminLogs; Write-Host "`nPress any key..."; $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") }
            "11" { Open-AdminDashboard; Write-Host "`nPress any key..."; $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") }
            "12" { Install-AdminDependencies; Write-Host "`nPress any key..."; $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") }
            "13" { Update-AdminDependencies; Write-Host "`nPress any key..."; $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") }
            "14" { Reset-AdminInstallation; Write-Host "`nPress any key..."; $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") }
            "15" { Build-AdminDashboard; Write-Host "`nPress any key..."; $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") }
            "16" { Show-AdminConfiguration; Write-Host "`nPress any key..."; $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") }
            "17" { Test-AdminRequirements; Write-Host "`nPress any key..."; $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") }
            "Q" { Write-Success "`nGoodbye!"; Start-Sleep -Seconds 1; exit }
            default { Write-Warning "`nInvalid choice"; Start-Sleep -Seconds 2 }
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
        "build" { Build-AdminDashboard }
        "config" { Show-AdminConfiguration }
        "check" { Test-AdminRequirements }
        default { 
            Write-Error "Unknown command: $Command"
            Write-Host "`nAvailable commands:"
            Write-Host "  start, stop, restart, status, test, logs, open"
            Write-Host "  install, update, reset, build, config, check"
            Write-Host "`nOr run without parameters for interactive menu"
        }
    }
}

