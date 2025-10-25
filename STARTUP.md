# Mai Finances Startup Guide

## Quick Start

### Interactive Menu (Recommended)
```powershell
./start-app.ps1
```
This will show you a menu with all available options.

### Command Line Options

**START:**
```powershell
./start-app.ps1 frontend   # Start only frontend
./start-app.ps1 backend    # Start only backend
./start-app.ps1 both       # Start both servers
```

**STOP:**
```powershell
./start-app.ps1 stop-frontend   # Stop frontend
./start-app.ps1 stop-backend    # Stop backend
./start-app.ps1 stop-both       # Stop both servers
```

**RESTART:**
```powershell
./start-app.ps1 restart-frontend   # Restart frontend
./start-app.ps1 restart-backend    # Restart backend
./start-app.ps1 restart-both       # Restart both servers
```

## Features

- ✨ **Easy Startup** - One command to start everything  
- 🛑 **Easy Stop** - Kill servers with one command  
- 🔄 **Easy Restart** - Restart without manual stopping  
- 🎯 **Flexible Options** - Control exactly what you need  
- 🪟 **Separate Windows** - Each server in its own terminal  
- 🎨 **Color Coded** - Easy to read output  

## Interactive Menu

When you run `./start-app.ps1` without parameters, you'll see:

```
=================================================
         Mai Finances Startup Menu
=================================================

  START OPTIONS:
  [1] Start Frontend Only
  [2] Start Backend Only
  [3] Start Both (Recommended)

  STOP OPTIONS:
  [4] Stop Frontend
  [5] Stop Backend
  [6] Stop Both

  RESTART OPTIONS:
  [7] Restart Frontend
  [8] Restart Backend
  [9] Restart Both

  [Q] Quit

=================================================
```

## Default Ports

- **Frontend:** http://localhost:3000
- **Backend:** http://localhost:3001

## Login Credentials

- **Username:** `cardinal` (case-insensitive)
- **Password:** `TestPassword123!`

## Common Use Cases

**Starting from scratch:**
```powershell
./start-app.ps1 both
```

**Backend not responding? Restart it:**
```powershell
./start-app.ps1 restart-backend
```

**Made frontend changes? Quick restart:**
```powershell
./start-app.ps1 restart-frontend
```

**Shutting down for the day:**
```powershell
./start-app.ps1 stop-both
```

**Fresh start after changes:**
```powershell
./start-app.ps1 restart-both
```

## Troubleshooting

**Port already in use?**
- Run: `./start-app.ps1 stop-both`
- Then: `./start-app.ps1 both`

**Script won't run?**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

**Need to manually kill processes?**
```powershell
# Kill all node processes
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
```

## What Gets Started?

**Frontend (Port 3000):**
- React application
- Opens in your default browser automatically
- Hot-reload enabled for development

**Backend (Port 3001):**
- Node.js/Express API server
- PostgreSQL database connection
- Scheduled jobs for recurring transactions

## Examples

**Quick daily workflow:**
```powershell
# Morning: Start everything
./start-app.ps1 both

# After code changes: Restart
./start-app.ps1 restart-both

# End of day: Stop everything
./start-app.ps1 stop-both
```

**Development workflow:**
```powershell
# Working on backend only
./start-app.ps1 backend

# Test backend changes
./start-app.ps1 restart-backend

# Now add frontend
./start-app.ps1 frontend
```

---

Made with 💙 by Scott
