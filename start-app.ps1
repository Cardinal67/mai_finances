# Mai Finances Startup Script
# Run this script to start, stop, or restart frontend, backend, admin or all

param(
    [Parameter(Position=0)]
    [ValidateSet("frontend", "backend", "admin", "all", "stop-frontend", "stop-backend", "stop-admin", "stop-all", "restart-frontend", "restart-backend", "restart-admin", "restart-all", "")]
    [string]$Mode = ""
)

$ErrorActionPreference = "Continue"

# Ensure Node.js is in PATH
$env:Path += ";C:\Program Files\nodejs"

# Function to stop backend
function Stop-Backend {
    Write-Host "`nStopping Backend Server..." -ForegroundColor Yellow
    Write-Host "========================================" -ForegroundColor Yellow
    
    $stopped = $false
    Get-Process -Name node -ErrorAction SilentlyContinue | 
        Where-Object { $_.CommandLine -like "*backend*server.js*" } |
        ForEach-Object {
            Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
            $stopped = $true
        }
    
    if ($stopped) {
        Write-Host "Backend stopped successfully" -ForegroundColor Green
    } else {
        Write-Host "No backend processes found" -ForegroundColor Gray
    }
    
    return $true
}

# Function to stop frontend
function Stop-Frontend {
    Write-Host "`nStopping Frontend Server..." -ForegroundColor Yellow
    Write-Host "========================================" -ForegroundColor Yellow
    
    $stopped = $false
    Get-Process -Name node -ErrorAction SilentlyContinue | 
        Where-Object { $_.CommandLine -like "*frontend*react-scripts*" } |
        ForEach-Object {
            Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
            $stopped = $true
        }
    
    if ($stopped) {
        Write-Host "Frontend stopped successfully" -ForegroundColor Green
    } else {
        Write-Host "No frontend processes found" -ForegroundColor Gray
    }
    
    return $true
}

# Function to stop admin
function Stop-Admin {
    Write-Host "`nStopping Admin Server..." -ForegroundColor Yellow
    Write-Host "========================================" -ForegroundColor Yellow
    
    $stopped = $false
    Get-Process -Name node -ErrorAction SilentlyContinue | 
        Where-Object { $_.CommandLine -like "*admin-server*server.js*" -or $_.CommandLine -like "*admin-dashboard*react-scripts*" } |
        ForEach-Object {
            Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
            $stopped = $true
        }
    
    if ($stopped) {
        Write-Host "Admin stopped successfully" -ForegroundColor Green
    } else {
        Write-Host "No admin processes found" -ForegroundColor Gray
    }
    
    return $true
}

# Function to stop all
function Stop-All {
    Stop-Backend
    Stop-Frontend
    Stop-Admin
}

# Function to start backend
function Start-Backend {
    Write-Host "`nStarting Backend Server..." -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    
    $backendPath = Join-Path $PSScriptRoot "backend"
    
    if (-not (Test-Path $backendPath)) {
        Write-Host "ERROR: Backend directory not found!" -ForegroundColor Red
        return $false
    }
    
    # Kill any existing backend processes
    Stop-Backend | Out-Null
    
    Start-Sleep -Seconds 1
    
    # Start backend in new window
    $backendJob = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; Write-Host 'Mai Finances Backend' -ForegroundColor Cyan; Write-Host '========================================' -ForegroundColor Cyan; node src/server.js" -PassThru
    
    Write-Host "Backend started in new window (Port 3001)" -ForegroundColor Green
    return $true
}

# Function to start frontend
function Start-Frontend {
    Write-Host "`nStarting Frontend Server..." -ForegroundColor Magenta
    Write-Host "========================================" -ForegroundColor Magenta
    
    $frontendPath = Join-Path $PSScriptRoot "frontend"
    
    if (-not (Test-Path $frontendPath)) {
        Write-Host "ERROR: Frontend directory not found!" -ForegroundColor Red
        return $false
    }
    
    # Kill any existing frontend processes
    Stop-Frontend | Out-Null
    
    Start-Sleep -Seconds 1
    
    # Start frontend in new window
    $frontendJob = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendPath'; Write-Host 'Mai Finances Frontend' -ForegroundColor Magenta; Write-Host '========================================' -ForegroundColor Magenta; npm start" -PassThru
    
    Write-Host "Frontend started in new window (Port 3000)" -ForegroundColor Green
    return $true
}

# Function to start admin
function Start-Admin {
    Write-Host "`nStarting Admin Server..." -ForegroundColor Blue
    Write-Host "========================================" -ForegroundColor Blue
    
    $adminServerPath = Join-Path $PSScriptRoot "admin-server"
    $adminDashboardPath = Join-Path $PSScriptRoot "admin-dashboard"
    
    if (-not (Test-Path $adminServerPath)) {
        Write-Host "ERROR: Admin server directory not found!" -ForegroundColor Red
        return $false
    }
    
    if (-not (Test-Path $adminDashboardPath)) {
        Write-Host "ERROR: Admin dashboard directory not found!" -ForegroundColor Red
        return $false
    }
    
    # Kill any existing admin processes
    Stop-Admin | Out-Null
    
    Start-Sleep -Seconds 1
    
    # Start admin server in new window
    $adminServerJob = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$adminServerPath'; Write-Host 'Mai Finances Admin Server' -ForegroundColor Blue; Write-Host '========================================' -ForegroundColor Blue; node server.js" -PassThru
    
    Start-Sleep -Seconds 2
    
    # Start admin dashboard in new window
    $adminDashboardJob = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$adminDashboardPath'; Write-Host 'Mai Finances Admin Dashboard' -ForegroundColor Blue; Write-Host '========================================' -ForegroundColor Blue; npm start" -PassThru
    
    Write-Host "Admin Server started in new window (Port 3002)" -ForegroundColor Green
    Write-Host "Admin Dashboard started in new window (Port 3003)" -ForegroundColor Green
    return $true
}

# Function to start all
function Start-All {
    Start-Backend
    Start-Sleep -Seconds 2
    Start-Frontend
    Start-Sleep -Seconds 2
    Start-Admin
}

# Function to restart backend
function Restart-Backend {
    Stop-Backend
    Start-Sleep -Seconds 1
    Start-Backend
}

# Function to restart frontend
function Restart-Frontend {
    Stop-Frontend
    Start-Sleep -Seconds 1
    Start-Frontend
}

# Function to restart admin
function Restart-Admin {
    Stop-Admin
    Start-Sleep -Seconds 1
    Start-Admin
}

# Function to restart all
function Restart-All {
    Stop-All
    Start-Sleep -Seconds 2
    Start-All
}

# Function to display menu
function Show-Menu {
    Clear-Host
    Write-Host ""
    Write-Host "=================================================" -ForegroundColor Cyan
    Write-Host "         Mai Finances Startup Menu" -ForegroundColor Cyan
    Write-Host "=================================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  START OPTIONS:" -ForegroundColor White
    Write-Host "  [1] Start Frontend Only (Port 3000)" -ForegroundColor Magenta
    Write-Host "  [2] Start Backend Only (Port 3001)" -ForegroundColor Cyan
    Write-Host "  [3] Start Admin Dashboard (Ports 3002/3003)" -ForegroundColor Blue
    Write-Host "  [4] Start All Servers (Recommended)" -ForegroundColor Green
    Write-Host ""
    Write-Host "  STOP OPTIONS:" -ForegroundColor White
    Write-Host "  [5] Stop Frontend" -ForegroundColor Magenta
    Write-Host "  [6] Stop Backend" -ForegroundColor Cyan
    Write-Host "  [7] Stop Admin" -ForegroundColor Blue
    Write-Host "  [8] Stop All" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  RESTART OPTIONS:" -ForegroundColor White
    Write-Host "  [9] Restart Frontend" -ForegroundColor Magenta
    Write-Host "  [A] Restart Backend" -ForegroundColor Cyan
    Write-Host "  [B] Restart Admin" -ForegroundColor Blue
    Write-Host "  [C] Restart All" -ForegroundColor Green
    Write-Host ""
    Write-Host "  [Q] Quit" -ForegroundColor Red
    Write-Host ""
    Write-Host "=================================================" -ForegroundColor DarkGray
    Write-Host ""
}

# Main script logic
if ($Mode -eq "") {
    # Interactive mode - show menu
    do {
        Show-Menu
        $choice = Read-Host "Enter your choice"
        
        switch ($choice.ToUpper()) {
            "1" {
                Start-Frontend
                Write-Host ""
                Write-Host "Press any key to return to menu..." -ForegroundColor Cyan
                $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
            }
            "2" {
                Start-Backend
                Write-Host ""
                Write-Host "Press any key to return to menu..." -ForegroundColor Cyan
                $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
            }
            "3" {
                Start-Admin
                Write-Host ""
                Write-Host "Press any key to return to menu..." -ForegroundColor Cyan
                $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
            }
            "4" {
                Start-All
                Write-Host ""
                Write-Host "All servers are starting!" -ForegroundColor Green
                Write-Host "Main App: http://localhost:3000" -ForegroundColor Green
                Write-Host "Admin Dashboard: http://localhost:3003" -ForegroundColor Green
                Write-Host ""
                Write-Host "Press any key to return to menu..." -ForegroundColor Cyan
                $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
            }
            "5" {
                Stop-Frontend
                Write-Host ""
                Write-Host "Press any key to return to menu..." -ForegroundColor Cyan
                $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
            }
            "6" {
                Stop-Backend
                Write-Host ""
                Write-Host "Press any key to return to menu..." -ForegroundColor Cyan
                $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
            }
            "7" {
                Stop-Admin
                Write-Host ""
                Write-Host "Press any key to return to menu..." -ForegroundColor Cyan
                $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
            }
            "8" {
                Stop-All
                Write-Host ""
                Write-Host "Press any key to return to menu..." -ForegroundColor Cyan
                $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
            }
            "9" {
                Restart-Frontend
                Write-Host ""
                Write-Host "Press any key to return to menu..." -ForegroundColor Cyan
                $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
            }
            "A" {
                Restart-Backend
                Write-Host ""
                Write-Host "Press any key to return to menu..." -ForegroundColor Cyan
                $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
            }
            "B" {
                Restart-Admin
                Write-Host ""
                Write-Host "Press any key to return to menu..." -ForegroundColor Cyan
                $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
            }
            "C" {
                Restart-All
                Write-Host ""
                Write-Host "All servers restarted!" -ForegroundColor Green
                Write-Host "Main App: http://localhost:3000" -ForegroundColor Green
                Write-Host "Admin Dashboard: http://localhost:3003" -ForegroundColor Green
                Write-Host ""
                Write-Host "Press any key to return to menu..." -ForegroundColor Cyan
                $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
            }
            "Q" {
                Write-Host "`nGoodbye!" -ForegroundColor Green
                Start-Sleep -Seconds 1
                exit
            }
            default {
                Write-Host "`nInvalid choice. Please try again." -ForegroundColor Yellow
                Start-Sleep -Seconds 2
            }
        }
    } while ($true)
} else {
    # Command-line mode
    switch ($Mode.ToLower()) {
        "frontend" {
            Start-Frontend
            Write-Host "`nFrontend is starting!" -ForegroundColor Green
        }
        "backend" {
            Start-Backend
            Write-Host "`nBackend is starting!" -ForegroundColor Green
        }
        "admin" {
            Start-Admin
            Write-Host "`nAdmin Dashboard is starting!" -ForegroundColor Green
        }
        "all" {
            Start-All
            Write-Host "`nAll servers are starting!" -ForegroundColor Green
            Write-Host "Main App: http://localhost:3000" -ForegroundColor Green
            Write-Host "Admin Dashboard: http://localhost:3003" -ForegroundColor Green
        }
        "stop-frontend" {
            Stop-Frontend
        }
        "stop-backend" {
            Stop-Backend
        }
        "stop-admin" {
            Stop-Admin
        }
        "stop-all" {
            Stop-All
        }
        "restart-frontend" {
            Restart-Frontend
            Write-Host "`nFrontend restarted!" -ForegroundColor Green
        }
        "restart-backend" {
            Restart-Backend
            Write-Host "`nBackend restarted!" -ForegroundColor Green
        }
        "restart-admin" {
            Restart-Admin
            Write-Host "`nAdmin Dashboard restarted!" -ForegroundColor Green
        }
        "restart-all" {
            Restart-All
            Write-Host "`nAll servers restarted!" -ForegroundColor Green
            Write-Host "Main App: http://localhost:3000" -ForegroundColor Green
            Write-Host "Admin Dashboard: http://localhost:3003" -ForegroundColor Green
        }
    }
    
    Write-Host ""
    Write-Host "=================================================" -ForegroundColor Cyan
    Write-Host "Tip: Run the script without parameters for interactive menu" -ForegroundColor Cyan
    Write-Host ""
}
