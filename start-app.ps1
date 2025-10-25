# Mai Finances Startup Script
# Run this script to start frontend, backend, or both

param(
    [Parameter(Position=0)]
    [ValidateSet("frontend", "backend", "both", "")]
    [string]$Mode = ""
)

$ErrorActionPreference = "Continue"

# Ensure Node.js is in PATH
$env:Path += ";C:\Program Files\nodejs"

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
    Get-Process -Name node -ErrorAction SilentlyContinue | 
        Where-Object { $_.Path -like "*node.exe*" } |
        Stop-Process -Force -ErrorAction SilentlyContinue
    
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
    Get-Process -Name node -ErrorAction SilentlyContinue | 
        Where-Object { $_.CommandLine -like "*react-scripts*" } |
        Stop-Process -Force -ErrorAction SilentlyContinue
    
    Start-Sleep -Seconds 1
    
    # Start frontend in new window
    $frontendJob = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendPath'; Write-Host 'Mai Finances Frontend' -ForegroundColor Magenta; Write-Host '========================================' -ForegroundColor Magenta; npm start" -PassThru
    
    Write-Host "Frontend started in new window (Port 3000)" -ForegroundColor Green
    return $true
}

# Function to display menu
function Show-Menu {
    Clear-Host
    Write-Host ""
    Write-Host "=================================================" -ForegroundColor Cyan
    Write-Host "         Mai Finances Startup Menu" -ForegroundColor Cyan
    Write-Host "=================================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  Select startup option:" -ForegroundColor White
    Write-Host ""
    Write-Host "  [1] Start Frontend Only" -ForegroundColor Magenta
    Write-Host "  [2] Start Backend Only" -ForegroundColor Cyan
    Write-Host "  [3] Start Both (Recommended)" -ForegroundColor Green
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
                Start-Backend
                Start-Sleep -Seconds 2
                Start-Frontend
                Write-Host ""
                Write-Host "Both servers are starting!" -ForegroundColor Green
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
            Start-Backend
            Start-Sleep -Seconds 2
            Start-Frontend
            Write-Host "`nBoth servers are starting!" -ForegroundColor Green
            Write-Host "Access your app at: http://localhost:3000" -ForegroundColor Green
        }
    }
    
    Write-Host ""
    Write-Host "=================================================" -ForegroundColor Cyan
    Write-Host "Tip: Run the script without parameters for interactive menu" -ForegroundColor Cyan
    Write-Host ""
}
