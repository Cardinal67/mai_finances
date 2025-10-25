# Mai Finances Startup Guide

## Quick Start

### Interactive Menu (Recommended)
```powershell
./start-app.ps1
```
This will show you a menu to choose what to start.

### Command Line Options
```powershell
# Start frontend only (Port 3000)
./start-app.ps1 frontend

# Start backend only (Port 3001)
./start-app.ps1 backend

# Start both servers (Recommended)
./start-app.ps1 both
```

## Features

- **Easy Startup** - One command to start everything  
- **Flexible Options** - Start what you need  
- **Separate Windows** - Each server in its own terminal  
- **Auto Cleanup** - Kills old processes before starting  
- **Color Coded** - Easy to read output  

## Default Ports

- **Frontend:** http://localhost:3000
- **Backend:** http://localhost:3001

## Login Credentials

- **Username:** `cardinal` (case-insensitive)
- **Password:** `TestPassword123!`

## Troubleshooting

**Port already in use?**
- The script automatically kills old processes
- If it persists, restart your terminal

**Script won't run?**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

**Need to stop servers?**
- Close the terminal windows, or press Ctrl+C in each window

## What Gets Started?

**Frontend (Port 3000):**
- React application
- Opens in your default browser automatically
- Hot-reload enabled for development

**Backend (Port 3001):**
- Node.js/Express API server
- PostgreSQL database connection
- Scheduled jobs for recurring transactions

---

Made with 💙 by Scott
