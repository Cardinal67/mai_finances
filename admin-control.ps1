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

# ========================================
# BACKUP & RESTORE FUNCTIONS
# ========================================

# Get backup configuration
function Get-BackupConfig {
    $configPath = Join-Path $ScriptRoot ".backup-config.json"
    
    if (Test-Path $configPath) {
        $config = Get-Content $configPath -Raw | ConvertFrom-Json
    } else {
        # Default configuration
        $config = @{
            DefaultPath = Join-Path $ScriptRoot "backups"
            KeepLastN = 10
            CustomPaths = @()
        }
    }
    
    return $config
}

# Save backup configuration
function Save-BackupConfig {
    param($Config)
    
    $configPath = Join-Path $ScriptRoot ".backup-config.json"
    $Config | ConvertTo-Json -Depth 10 | Set-Content $configPath
    Write-ColorSuccess "Backup configuration saved!"
}

# Create full backup
function New-AppBackup {
    Write-ColorTitle "`n=== Creating Mai Finances Backup ==="
    
    $config = Get-BackupConfig
    
    # Ask for backup location
    Write-Host ""
    Write-ColorInfo "Backup Location Options:"
    Write-Host "  [1] Default: $($config.DefaultPath)" -ForegroundColor Cyan
    
    $index = 2
    foreach ($path in $config.CustomPaths) {
        Write-Host "  [$index] Custom: $path" -ForegroundColor Cyan
        $index++
    }
    
    Write-Host "  [$index] Add new location" -ForegroundColor Yellow
    Write-Host ""
    
    $locationChoice = Read-Host "Choose backup location"
    
    if ($locationChoice -eq $index) {
        # Add new location
        $newPath = Read-Host "Enter new backup path"
        if (-not (Test-Path $newPath)) {
            $create = Read-Host "Path doesn't exist. Create it? (Y/N)"
            if ($create -eq "Y" -or $create -eq "y") {
                New-Item -ItemType Directory -Path $newPath -Force | Out-Null
            } else {
                Write-ColorError "Backup cancelled"
                return
            }
        }
        $backupRoot = $newPath
        $config.CustomPaths += $newPath
        Save-BackupConfig -Config $config
    } elseif ($locationChoice -eq "1") {
        $backupRoot = $config.DefaultPath
    } else {
        $pathIndex = [int]$locationChoice - 2
        if ($pathIndex -ge 0 -and $pathIndex -lt $config.CustomPaths.Count) {
            $backupRoot = $config.CustomPaths[$pathIndex]
        } else {
            Write-ColorError "Invalid choice"
            return
        }
    }
    
    # Create backup directory with timestamp
    $timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
    $backupDir = Join-Path $backupRoot "mai_finances_backup_$timestamp"
    
    Write-ColorInfo "`nCreating backup directory: $backupDir"
    New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
    
    try {
        # Backup database
        Write-ColorInfo "`n[1/6] Backing up database..."
        $dbBackupPath = Join-Path $backupDir "database.sql"
        
        # Load database connection from .env
        $envPath = Join-Path $ScriptRoot "backend\.env"
        if (Test-Path $envPath) {
            Get-Content $envPath | ForEach-Object {
                if ($_ -match '^DATABASE_URL=(.+)$') {
                    $dbUrl = $matches[1]
                    
                    # Parse PostgreSQL connection string
                    if ($dbUrl -match 'postgres://([^:]+):([^@]+)@([^:]+):(\d+)/(.+)') {
                        $dbUser = $matches[1]
                        $dbPass = $matches[2]
                        $dbHost = $matches[3]
                        $dbPort = $matches[4]
                        $dbName = $matches[5]
                        
                        $env:PGPASSWORD = $dbPass
                        & pg_dump -h $dbHost -p $dbPort -U $dbUser -d $dbName -f $dbBackupPath 2>&1 | Out-Null
                        $env:PGPASSWORD = $null
                        
                        if (Test-Path $dbBackupPath) {
                            $dbSize = (Get-Item $dbBackupPath).Length / 1KB
                            Write-ColorSuccess "  ✓ Database backed up ($([math]::Round($dbSize, 2)) KB)"
                        } else {
                            Write-ColorWarning "  ⚠ Database backup failed (pg_dump might not be installed)"
                        }
                    }
                }
            }
        } else {
            Write-ColorWarning "  ⚠ .env file not found, skipping database backup"
        }
        
        # Backup backend code
        Write-ColorInfo "`n[2/6] Backing up backend code..."
        $backendBackup = Join-Path $backupDir "backend"
        robocopy "$ScriptRoot\backend" $backendBackup /E /XD node_modules .git /XF package-lock.json /NFL /NDL /NJH /NJS | Out-Null
        Write-ColorSuccess "  ✓ Backend code backed up"
        
        # Backup frontend code
        Write-ColorInfo "`n[3/6] Backing up frontend code..."
        $frontendBackup = Join-Path $backupDir "frontend"
        robocopy "$ScriptRoot\frontend" $frontendBackup /E /XD node_modules build .git /XF package-lock.json /NFL /NDL /NJH /NJS | Out-Null
        Write-ColorSuccess "  ✓ Frontend code backed up"
        
        # Backup admin server
        Write-ColorInfo "`n[4/6] Backing up admin server..."
        $adminServerBackup = Join-Path $backupDir "admin-server"
        robocopy "$ScriptRoot\admin-server" $adminServerBackup /E /XD node_modules .git /XF package-lock.json /NFL /NDL /NJH /NJS | Out-Null
        Write-ColorSuccess "  ✓ Admin server backed up"
        
        # Backup admin dashboard
        Write-ColorInfo "`n[5/6] Backing up admin dashboard..."
        $adminDashboardBackup = Join-Path $backupDir "admin-dashboard"
        robocopy "$ScriptRoot\admin-dashboard" $adminDashboardBackup /E /XD node_modules build .git /XF package-lock.json /NFL /NDL /NJH /NJS | Out-Null
        Write-ColorSuccess "  ✓ Admin dashboard backed up"
        
        # Backup configuration files
        Write-ColorInfo "`n[6/6] Backing up configuration..."
        Copy-Item "$ScriptRoot\.env" -Destination "$backupDir\.env" -ErrorAction SilentlyContinue
        Copy-Item "$ScriptRoot\admin-control.ps1" -Destination "$backupDir\admin-control.ps1" -ErrorAction SilentlyContinue
        Copy-Item "$ScriptRoot\start-app.ps1" -Destination "$backupDir\start-app.ps1" -ErrorAction SilentlyContinue
        Copy-Item "$ScriptRoot\.backup-config.json" -Destination "$backupDir\.backup-config.json" -ErrorAction SilentlyContinue
        Write-ColorSuccess "  ✓ Configuration backed up"
        
        # Create backup metadata
        $metadata = @{
            Timestamp = $timestamp
            Date = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
            Version = "1.0"
            BackupType = "Full"
            DatabaseIncluded = Test-Path $dbBackupPath
        }
        $metadata | ConvertTo-Json | Set-Content (Join-Path $backupDir "backup-info.json")
        
        # Calculate total size
        $totalSize = (Get-ChildItem $backupDir -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
        
        Write-Host ""
        Write-ColorSuccess "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        Write-ColorSuccess "✓ Backup completed successfully!"
        Write-ColorSuccess "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        Write-Host ""
        Write-Host "  Location: $backupDir" -ForegroundColor Green
        Write-Host "  Size: $([math]::Round($totalSize, 2)) MB" -ForegroundColor Green
        Write-Host "  Time: $(Get-Date -Format 'HH:mm:ss')" -ForegroundColor Green
        Write-Host ""
        
        # Clean old backups if configured
        $backups = Get-ChildItem $backupRoot -Directory | Where-Object { $_.Name -like "mai_finances_backup_*" } | Sort-Object CreationTime -Descending
        if ($backups.Count -gt $config.KeepLastN) {
            Write-ColorInfo "Cleaning old backups (keeping last $($config.KeepLastN))..."
            $backups | Select-Object -Skip $config.KeepLastN | ForEach-Object {
                Remove-Item $_.FullName -Recurse -Force
                Write-Host "  Removed: $($_.Name)" -ForegroundColor DarkGray
            }
        }
        
    } catch {
        Write-ColorError "`n✗ Backup failed: $($_.Exception.Message)"
    }
}

# List existing backups
function Show-Backups {
    Write-ColorTitle "`n=== Available Backups ==="
    
    $config = Get-BackupConfig
    $allBackups = @()
    
    # Get backups from all configured locations
    $searchPaths = @($config.DefaultPath) + $config.CustomPaths
    
    foreach ($path in $searchPaths) {
        if (Test-Path $path) {
            $backups = Get-ChildItem $path -Directory | Where-Object { $_.Name -like "mai_finances_backup_*" }
            foreach ($backup in $backups) {
                $infoPath = Join-Path $backup.FullName "backup-info.json"
                $size = (Get-ChildItem $backup.FullName -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
                
                $info = if (Test-Path $infoPath) {
                    Get-Content $infoPath -Raw | ConvertFrom-Json
                } else {
                    @{ Date = $backup.CreationTime.ToString("yyyy-MM-dd HH:mm:ss"); DatabaseIncluded = $false }
                }
                
                $allBackups += [PSCustomObject]@{
                    Name = $backup.Name
                    Path = $backup.FullName
                    Date = $info.Date
                    Size = [math]::Round($size, 2)
                    DatabaseIncluded = $info.DatabaseIncluded
                    Location = Split-Path $backup.FullName -Parent
                }
            }
        }
    }
    
    if ($allBackups.Count -eq 0) {
        Write-ColorWarning "`nNo backups found"
        Write-Host "Create your first backup using the backup option!"
        return
    }
    
    $allBackups = $allBackups | Sort-Object Date -Descending
    
    Write-Host ""
    $index = 1
    foreach ($backup in $allBackups) {
        $dbIndicator = if ($backup.DatabaseIncluded) { "✓ DB" } else { "✗ DB" }
        Write-Host "  [$index] " -NoNewline -ForegroundColor Cyan
        Write-Host "$($backup.Date) " -NoNewline -ForegroundColor White
        Write-Host "($($backup.Size) MB) " -NoNewline -ForegroundColor Gray
        Write-Host "[$dbIndicator]" -ForegroundColor $(if ($backup.DatabaseIncluded) { "Green" } else { "Yellow" })
        Write-Host "      Path: $($backup.Path)" -ForegroundColor DarkGray
        $index++
    }
    
    Write-Host ""
    Write-ColorInfo "Total backups: $($allBackups.Count)"
    
    return $allBackups
}

# Restore from backup
function Restore-AppBackup {
    Write-ColorTitle "`n=== Restore Mai Finances from Backup ==="
    
    $backups = Show-Backups
    
    if ($backups.Count -eq 0) {
        return
    }
    
    Write-Host ""
    $choice = Read-Host "Enter backup number to restore (or Enter to cancel)"
    
    if ($choice -eq "") {
        Write-ColorWarning "Restore cancelled"
        return
    }
    
    $backupIndex = [int]$choice - 1
    if ($backupIndex -lt 0 -or $backupIndex -ge $backups.Count) {
        Write-ColorError "Invalid backup number"
        return
    }
    
    $backup = $backups[$backupIndex]
    
    Write-Host ""
    Write-ColorWarning "⚠ WARNING: This will restore from backup:"
    Write-Host "  $($backup.Path)" -ForegroundColor Yellow
    Write-Host ""
    Write-ColorWarning "This will:"
    Write-Host "  • Stop all running servers" -ForegroundColor Yellow
    Write-Host "  • Restore database (if included)" -ForegroundColor Yellow
    Write-Host "  • Restore all application files" -ForegroundColor Yellow
    Write-Host "  • Current files will be OVERWRITTEN" -ForegroundColor Red
    Write-Host ""
    
    $confirm = Read-Host "Type 'RESTORE' to confirm"
    
    if ($confirm -ne "RESTORE") {
        Write-ColorWarning "Restore cancelled"
        return
    }
    
    try {
        # Stop all servers
        Write-ColorInfo "`nStopping servers..."
        Stop-AdminComplete
        
        # Restore database
        if ($backup.DatabaseIncluded) {
            Write-ColorInfo "`n[1/5] Restoring database..."
            $dbBackupPath = Join-Path $backup.Path "database.sql"
            
            if (Test-Path $dbBackupPath) {
                $envPath = Join-Path $ScriptRoot "backend\.env"
                if (Test-Path $envPath) {
                    Get-Content $envPath | ForEach-Object {
                        if ($_ -match '^DATABASE_URL=(.+)$') {
                            $dbUrl = $matches[1]
                            
                            if ($dbUrl -match 'postgres://([^:]+):([^@]+)@([^:]+):(\d+)/(.+)') {
                                $dbUser = $matches[1]
                                $dbPass = $matches[2]
                                $dbHost = $matches[3]
                                $dbPort = $matches[4]
                                $dbName = $matches[5]
                                
                                $env:PGPASSWORD = $dbPass
                                & psql -h $dbHost -p $dbPort -U $dbUser -d $dbName -f $dbBackupPath 2>&1 | Out-Null
                                $env:PGPASSWORD = $null
                                
                                Write-ColorSuccess "  ✓ Database restored"
                            }
                        }
                    }
                }
            }
        }
        
        # Restore backend
        Write-ColorInfo "`n[2/5] Restoring backend..."
        robocopy "$($backup.Path)\backend" "$ScriptRoot\backend" /E /NFL /NDL /NJH /NJS | Out-Null
        Write-ColorSuccess "  ✓ Backend restored"
        
        # Restore frontend
        Write-ColorInfo "`n[3/5] Restoring frontend..."
        robocopy "$($backup.Path)\frontend" "$ScriptRoot\frontend" /E /NFL /NDL /NJH /NJS | Out-Null
        Write-ColorSuccess "  ✓ Frontend restored"
        
        # Restore admin server
        Write-ColorInfo "`n[4/5] Restoring admin server..."
        robocopy "$($backup.Path)\admin-server" "$ScriptRoot\admin-server" /E /NFL /NDL /NJH /NJS | Out-Null
        Write-ColorSuccess "  ✓ Admin server restored"
        
        # Restore admin dashboard
        Write-ColorInfo "`n[5/5] Restoring admin dashboard..."
        robocopy "$($backup.Path)\admin-dashboard" "$ScriptRoot\admin-dashboard" /E /NFL /NDL /NJH /NJS | Out-Null
        Write-ColorSuccess "  ✓ Admin dashboard restored"
        
        Write-Host ""
        Write-ColorSuccess "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        Write-ColorSuccess "✓ Restore completed successfully!"
        Write-ColorSuccess "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        Write-Host ""
        Write-ColorInfo "Next steps:"
        Write-Host "  1. Install dependencies (option 12)" -ForegroundColor Cyan
        Write-Host "  2. Start servers (option 3)" -ForegroundColor Cyan
        Write-Host ""
        
    } catch {
        Write-ColorError "`n✗ Restore failed: $($_.Exception.Message)"
    }
}

# Configure backup settings
function Set-BackupConfiguration {
    Write-ColorTitle "`n=== Backup Configuration ==="
    
    $config = Get-BackupConfig
    
    Write-Host ""
    Write-ColorInfo "Current Settings:"
    Write-Host "  Default Path: $($config.DefaultPath)" -ForegroundColor White
    Write-Host "  Keep Last N Backups: $($config.KeepLastN)" -ForegroundColor White
    Write-Host "  Custom Paths: $($config.CustomPaths.Count)" -ForegroundColor White
    
    if ($config.CustomPaths.Count -gt 0) {
        foreach ($path in $config.CustomPaths) {
            Write-Host "    - $path" -ForegroundColor DarkGray
        }
    }
    
    Write-Host ""
    Write-Host "  [1] Change default backup path" -ForegroundColor Cyan
    Write-Host "  [2] Change retention policy (keep last N)" -ForegroundColor Cyan
    Write-Host "  [3] Add custom backup path" -ForegroundColor Cyan
    Write-Host "  [4] Remove custom backup path" -ForegroundColor Cyan
    Write-Host "  [5] Reset to defaults" -ForegroundColor Yellow
    Write-Host ""
    
    $choice = Read-Host "Enter choice (or Enter to cancel)"
    
    switch ($choice) {
        "1" {
            $newPath = Read-Host "Enter new default backup path"
            if ($newPath -ne "") {
                $config.DefaultPath = $newPath
                if (-not (Test-Path $newPath)) {
                    New-Item -ItemType Directory -Path $newPath -Force | Out-Null
                }
                Save-BackupConfig -Config $config
            }
        }
        "2" {
            $newKeep = Read-Host "Keep last N backups"
            if ($newKeep -match '^\d+$') {
                $config.KeepLastN = [int]$newKeep
                Save-BackupConfig -Config $config
            }
        }
        "3" {
            $newPath = Read-Host "Enter custom backup path"
            if ($newPath -ne "" -and $newPath -notin $config.CustomPaths) {
                $config.CustomPaths += $newPath
                if (-not (Test-Path $newPath)) {
                    New-Item -ItemType Directory -Path $newPath -Force | Out-Null
                }
                Save-BackupConfig -Config $config
            }
        }
        "4" {
            if ($config.CustomPaths.Count -eq 0) {
                Write-ColorWarning "No custom paths to remove"
            } else {
                for ($i = 0; $i -lt $config.CustomPaths.Count; $i++) {
                    Write-Host "  [$($i+1)] $($config.CustomPaths[$i])" -ForegroundColor Cyan
                }
                $removeIndex = Read-Host "Enter number to remove"
                if ($removeIndex -match '^\d+$') {
                    $index = [int]$removeIndex - 1
                    if ($index -ge 0 -and $index -lt $config.CustomPaths.Count) {
                        $config.CustomPaths = $config.CustomPaths | Where-Object { $_ -ne $config.CustomPaths[$index] }
                        Save-BackupConfig -Config $config
                    }
                }
            }
        }
        "5" {
            $confirm = Read-Host "Reset to defaults? (Y/N)"
            if ($confirm -eq "Y" -or $confirm -eq "y") {
                $config = @{
                    DefaultPath = Join-Path $ScriptRoot "backups"
                    KeepLastN = 10
                    CustomPaths = @()
                }
                Save-BackupConfig -Config $config
            }
        }
    }
}

# Delete old backups
function Remove-OldBackups {
    Write-ColorTitle "`n=== Clean Old Backups ==="
    
    $backups = Show-Backups
    
    if ($backups.Count -eq 0) {
        return
    }
    
    Write-Host ""
    Write-Host "  [1] Delete specific backup" -ForegroundColor Cyan
    Write-Host "  [2] Keep only last N backups" -ForegroundColor Cyan
    Write-Host "  [3] Delete all backups" -ForegroundColor Red
    Write-Host ""
    
    $choice = Read-Host "Enter choice (or Enter to cancel)"
    
    switch ($choice) {
        "1" {
            $backupNum = Read-Host "Enter backup number to delete"
            if ($backupNum -match '^\d+$') {
                $index = [int]$backupNum - 1
                if ($index -ge 0 -and $index -lt $backups.Count) {
                    $backup = $backups[$index]
                    $confirm = Read-Host "Delete backup from $($backup.Date)? (Y/N)"
                    if ($confirm -eq "Y" -or $confirm -eq "y") {
                        Remove-Item $backup.Path -Recurse -Force
                        Write-ColorSuccess "Backup deleted"
                    }
                }
            }
        }
        "2" {
            $keepN = Read-Host "Keep how many recent backups?"
            if ($keepN -match '^\d+$') {
                $n = [int]$keepN
                $toDelete = $backups | Select-Object -Skip $n
                Write-Host "Will delete $($toDelete.Count) backups"
                $confirm = Read-Host "Continue? (Y/N)"
                if ($confirm -eq "Y" -or $confirm -eq "y") {
                    foreach ($backup in $toDelete) {
                        Remove-Item $backup.Path -Recurse -Force
                        Write-Host "  Deleted: $($backup.Date)" -ForegroundColor DarkGray
                    }
                    Write-ColorSuccess "Old backups deleted"
                }
            }
        }
        "3" {
            Write-ColorWarning "This will delete ALL backups!"
            $confirm = Read-Host "Type 'DELETE ALL' to confirm"
            if ($confirm -eq "DELETE ALL") {
                foreach ($backup in $backups) {
                    Remove-Item $backup.Path -Recurse -Force
                }
                Write-ColorSuccess "All backups deleted"
            }
        }
    }
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
    Write-Host "  BACKUP & RESTORE:" -ForegroundColor White
    Write-Host "  [18] Create Backup" -ForegroundColor Green
    Write-Host "  [19] List Backups" -ForegroundColor Cyan
    Write-Host "  [20] Restore from Backup" -ForegroundColor Magenta
    Write-Host "  [21] Backup Configuration" -ForegroundColor Blue
    Write-Host "  [22] Clean Old Backups" -ForegroundColor Yellow
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
    $choice = ""
    do {
        # Only show menu if choice is empty (not chaining commands)
        if ($choice -eq "") {
            Show-AdminMenu
            $choice = Read-Host "Enter your choice"
        }
        
        switch ($choice) {
            "1" { Start-AdminServer; $choice = Read-Host "`nPress Enter to continue or enter next choice" }
            "2" { Start-AdminDashboard; $choice = Read-Host "`nPress Enter to continue or enter next choice" }
            "3" { Start-AdminComplete; $choice = Read-Host "`nPress Enter to continue or enter next choice" }
            "4" { Stop-AdminServer; $choice = Read-Host "`nPress Enter to continue or enter next choice" }
            "5" { Stop-AdminDashboard; $choice = Read-Host "`nPress Enter to continue or enter next choice" }
            "6" { Stop-AdminComplete; $choice = Read-Host "`nPress Enter to continue or enter next choice" }
            "7" { Restart-AdminComplete; $choice = Read-Host "`nPress Enter to continue or enter next choice" }
            "8" { Get-AdminProcessDetails; $choice = Read-Host "`nPress Enter to continue or enter next choice" }
            "9" { Test-AdminConnectivity; $choice = Read-Host "`nPress Enter to continue or enter next choice" }
            "10" { Show-AdminLogs; $choice = Read-Host "`nPress Enter to continue or enter next choice" }
            "11" { Open-AdminDashboard; $choice = Read-Host "`nPress Enter to continue or enter next choice" }
            "12" { Install-AdminDependencies; $choice = Read-Host "`nPress Enter to continue or enter next choice" }
            "13" { Update-AdminDependencies; $choice = Read-Host "`nPress Enter to continue or enter next choice" }
            "14" { Reset-AdminInstallation; $choice = Read-Host "`nPress Enter to continue or enter next choice" }
            "15" { New-AdminDashboardBuild; $choice = Read-Host "`nPress Enter to continue or enter next choice" }
            "16" { Show-AdminConfiguration; $choice = Read-Host "`nPress Enter to continue or enter next choice" }
            "17" { Test-AdminRequirements; $choice = Read-Host "`nPress Enter to continue or enter next choice" }
            "18" { New-AppBackup; $choice = Read-Host "`nPress Enter to continue or enter next choice" }
            "19" { Show-Backups | Out-Null; $choice = Read-Host "`nPress Enter to continue or enter next choice" }
            "20" { Restore-AppBackup; $choice = Read-Host "`nPress Enter to continue or enter next choice" }
            "21" { Set-BackupConfiguration; $choice = Read-Host "`nPress Enter to continue or enter next choice" }
            "22" { Remove-OldBackups; $choice = Read-Host "`nPress Enter to continue or enter next choice" }
            "Q" { Write-ColorSuccess "`nGoodbye!"; exit }
            default { 
                if ($choice -ne "") {
                    Write-ColorWarning "`nInvalid choice: $choice"
                    Start-Sleep -Seconds 1
                }
                $choice = ""
            }
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
        "backup" { New-AppBackup }
        "list-backups" { Show-Backups | Out-Null }
        "restore" { Restore-AppBackup }
        "backup-config" { Set-BackupConfiguration }
        "clean-backups" { Remove-OldBackups }
        default { 
            Write-ColorError "Unknown command: $Command"
            Write-Host "`nAvailable commands:"
            Write-Host "  Control: start, stop, restart, status, test, logs, open"
            Write-Host "  Maintenance: install, update, reset, build, config, check"
            Write-Host "  Backup: backup, list-backups, restore, backup-config, clean-backups"
            Write-Host "`nOr run without parameters for interactive menu"
        }
    }
}

