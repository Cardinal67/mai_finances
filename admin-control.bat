@echo off
REM Admin Control Panel Launcher
REM Forces use of PowerShell 7 for compatibility

REM Check if PowerShell 7 is installed
where pwsh >nul 2>nul
if %errorlevel% neq 0 (
    echo Error: PowerShell 7 is not installed!
    echo Please install it from: https://aka.ms/powershell
    echo.
    echo Or use: winget install Microsoft.PowerShell
    pause
    exit /b 1
)

REM Run the admin control script with PowerShell 7
pwsh -NoProfile -ExecutionPolicy Bypass -File "%~dp0admin-control.ps1" %*

REM If script failed, show error
if %errorlevel% neq 0 (
    echo.
    echo Script encountered an error.
    pause
)

