# Mai Finances Startup Script
# Run this script to start, stop, or restart frontend, backend, or both

param(
    [Parameter(Position=0)]
    [ValidateSet("frontend", "backend", "both", "stop-frontend", "stop-backend", "stop-both", "restart-frontend", "restart-backend", "restart-both", "")]
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
        Where-Object { $_.Path -like "*node.exe*" } |
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
        Where-Object { $_.CommandLine -like "*react-scripts*" -or $_.MainWindowTitle -like "*Mai Finances Frontend*" } |
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

# Function to stop both
function Stop-Both {
    Stop-Backend
    Stop-Frontend
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

# Function to start both
function Start-Both {
    Start-Backend
    Start-Sleep -Seconds 2
    Start-Frontend
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

# Function to restart both
function Restart-Both {
    Stop-Both
    Start-Sleep -Seconds 2
    Start-Both
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
    Write-Host "  [1] Start Frontend Only" -ForegroundColor Magenta
    Write-Host "  [2] Start Backend Only" -ForegroundColor Cyan
    Write-Host "  [3] Start Both (Recommended)" -ForegroundColor Green
    Write-Host ""
    Write-Host "  STOP OPTIONS:" -ForegroundColor White
    Write-Host "  [4] Stop Frontend" -ForegroundColor Magenta
    Write-Host "  [5] Stop Backend" -ForegroundColor Cyan
    Write-Host "  [6] Stop Both" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  RESTART OPTIONS:" -ForegroundColor White
    Write-Host "  [7] Restart Frontend" -ForegroundColor Magenta
    Write-Host "  [8] Restart Backend" -ForegroundColor Cyan
    Write-Host "  [9] Restart Both" -ForegroundColor Green
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
                Start-Both
                Write-Host ""
                Write-Host "Both servers are starting!" -ForegroundColor Green
                Write-Host "Access your app at: http://localhost:3000" -ForegroundColor Green
                Write-Host ""
                Write-Host "Press any key to return to menu..." -ForegroundColor Cyan
                $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
            }
            "4" {
                Stop-Frontend
                Write-Host ""
                Write-Host "Press any key to return to menu..." -ForegroundColor Cyan
                $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
            }
            "5" {
                Stop-Backend
                Write-Host ""
                Write-Host "Press any key to return to menu..." -ForegroundColor Cyan
                $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
            }
            "6" {
                Stop-Both
                Write-Host ""
                Write-Host "Press any key to return to menu..." -ForegroundColor Cyan
                $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
            }
            "7" {
                Restart-Frontend
                Write-Host ""
                Write-Host "Press any key to return to menu..." -ForegroundColor Cyan
                $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
            }
            "8" {
                Restart-Backend
                Write-Host ""
                Write-Host "Press any key to return to menu..." -ForegroundColor Cyan
                $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
            }
            "9" {
                Restart-Both
                Write-Host ""
                Write-Host "Both servers restarted!" -ForegroundColor Green
                Write-Host "Access your app at: http://localhost:3000" -ForegroundColor Green
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
        "both" {
            Start-Both
            Write-Host "`nBoth servers are starting!" -ForegroundColor Green
            Write-Host "Access your app at: http://localhost:3000" -ForegroundColor Green
        }
        "stop-frontend" {
            Stop-Frontend
        }
        "stop-backend" {
            Stop-Backend
        }
        "stop-both" {
            Stop-Both
        }
        "restart-frontend" {
            Restart-Frontend
            Write-Host "`nFrontend restarted!" -ForegroundColor Green
        }
        "restart-backend" {
            Restart-Backend
            Write-Host "`nBackend restarted!" -ForegroundColor Green
        }
        "restart-both" {
            Restart-Both
            Write-Host "`nBoth servers restarted!" -ForegroundColor Green
            Write-Host "Access your app at: http://localhost:3000" -ForegroundColor Green
        }
    }
    
    Write-Host ""
    Write-Host "=================================================" -ForegroundColor Cyan
    Write-Host "Tip: Run the script without parameters for interactive menu" -ForegroundColor Cyan
    Write-Host ""
}
