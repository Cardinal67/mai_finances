# 🎛️ Admin Control Script - Complete Guide

The ultimate control panel for managing your Mai Finances Admin Dashboard!

## 🚀 Quick Start

### Interactive Menu (Recommended):
```powershell
.\admin-control.ps1
```

### Command Line:
```powershell
.\admin-control.ps1 start     # Start both server & dashboard
.\admin-control.ps1 stop      # Stop both
.\admin-control.ps1 restart   # Restart both
.\admin-control.ps1 status    # View status
```

---

## 📋 Interactive Menu Options

```
╔════════════════════════════════════════════════════════╗
║     🎛️  Admin Server Control Panel  🎛️                ║
╚════════════════════════════════════════════════════════╝

CONTROL OPTIONS:
  [1]  Start Admin Server (Port 3002)
  [2]  Start Admin Dashboard (Port 3003)
  [3]  Start Both (Complete Stack)
  [4]  Stop Admin Server
  [5]  Stop Admin Dashboard
  [6]  Stop Both
  [7]  Restart Both

MONITORING OPTIONS:
  [8]  View Status & Process Details
  [9]  Test Connectivity
  [10] View Logs
  [11] Open Dashboard in Browser

MAINTENANCE OPTIONS:
  [12] Install Dependencies
  [13] Update Dependencies
  [14] Clean Install (Reset)
  [15] Build for Production

INFORMATION OPTIONS:
  [16] Show Configuration
  [17] Check System Requirements
```

---

## 💻 Command Line Options

### Control Commands:
```powershell
.\admin-control.ps1 start-server      # Start only the API server
.\admin-control.ps1 start-dashboard   # Start only the dashboard
.\admin-control.ps1 start             # Start both
.\admin-control.ps1 stop-server       # Stop only the API server
.\admin-control.ps1 stop-dashboard    # Stop only the dashboard
.\admin-control.ps1 stop              # Stop both
.\admin-control.ps1 restart           # Restart both
```

### Monitoring Commands:
```powershell
.\admin-control.ps1 status    # Show process details (PID, CPU, memory)
.\admin-control.ps1 test      # Test connectivity to services
.\admin-control.ps1 logs      # View recent logs
.\admin-control.ps1 open      # Open dashboard in browser
```

### Maintenance Commands:
```powershell
.\admin-control.ps1 install   # Install all dependencies
.\admin-control.ps1 update    # Update all dependencies
.\admin-control.ps1 reset     # Clean install (deletes node_modules)
.\admin-control.ps1 build     # Build dashboard for production
```

### Information Commands:
```powershell
.\admin-control.ps1 config    # Show current configuration
.\admin-control.ps1 check     # Check system requirements
```

---

## 🎯 Common Use Cases

### Starting Everything:
```powershell
# Interactive
.\admin-control.ps1
# Select [3] Start Both

# Or command line
.\admin-control.ps1 start
```

### Checking Status:
```powershell
.\admin-control.ps1 status
```

**Example Output:**
```
=== Admin Server Processes ===

Admin Server (Port 3002):
  PID: 12345
  CPU: 2.5s
  Memory: 85.32 MB
  Started: 10/25/2025 2:30:15 PM

Admin Dashboard (Port 3003):
  PID: 12346
  CPU: 5.1s
  Memory: 156.78 MB
  Started: 10/25/2025 2:30:18 PM
```

### Testing Connectivity:
```powershell
.\admin-control.ps1 test
```

**Example Output:**
```
=== Testing Admin Server Connectivity ===

Testing Admin Server (Port 3002)...
✓ Admin Server responding
  Status: 200
  Response: {"status":"ok","service":"admin-dashboard"}

Testing Admin Dashboard (Port 3003)...
✓ Admin Dashboard responding
  Status: 200
```

### Installing Dependencies:
```powershell
.\admin-control.ps1 install
```

This will:
- Install admin server dependencies
- Install admin dashboard dependencies
- Show progress for each

### Quick Restart:
```powershell
.\admin-control.ps1 restart
```

This will:
1. Stop both services
2. Wait 2 seconds
3. Start both services
4. Show URLs when ready

---

## 🔍 What Each Option Does

### [1] Start Admin Server
- Starts the backend API (Port 3002)
- Opens in new terminal window
- Check if already running first
- Shows API URL when ready

### [2] Start Admin Dashboard
- Starts the React frontend (Port 3003)
- Opens in new terminal window
- Check if already running first
- Shows dashboard URL when ready

### [3] Start Both (Complete Stack)
- Starts server first
- Waits 3 seconds
- Then starts dashboard
- Perfect for clean starts

### [8] View Status & Process Details
Shows:
- Process ID (PID)
- CPU usage
- Memory usage
- Start time
- Running/stopped status

### [9] Test Connectivity
Tests:
- Admin server health endpoint
- Admin dashboard availability
- Response times
- Error messages if down

### [12] Install Dependencies
- Runs `npm install` in admin-server
- Runs `npm install` in admin-dashboard
- Shows progress for each

### [13] Update Dependencies
- Runs `npm update` in admin-server
- Runs `npm update` in admin-dashboard
- Updates to latest compatible versions

### [14] Clean Install (Reset)
**Warning:** Deletes everything and reinstalls
- Deletes node_modules folders
- Deletes package-lock.json files
- Fresh npm install
- Use when dependencies are corrupted

### [15] Build for Production
- Creates optimized production build
- Output: `admin-dashboard/build`
- Minified and ready to deploy

### [17] Check System Requirements
Checks:
- Node.js installed and version
- NPM installed and version
- Port 3002 availability
- Port 3003 availability
- Directory existence

---

## 📊 Troubleshooting Guide

### Problem: "Port already in use"
**Solution:**
```powershell
.\admin-control.ps1 stop
.\admin-control.ps1 start
```

### Problem: "Module not found"
**Solution:**
```powershell
.\admin-control.ps1 install
```

### Problem: Dependencies corrupted
**Solution:**
```powershell
.\admin-control.ps1 reset
```

### Problem: Dashboard won't load
**Steps:**
1. Check status: `.\admin-control.ps1 status`
2. Test connectivity: `.\admin-control.ps1 test`
3. View logs: `.\admin-control.ps1 logs`
4. Restart: `.\admin-control.ps1 restart`

### Problem: Server acting weird
**Solution:**
```powershell
# Stop everything
.\admin-control.ps1 stop

# Check nothing is running
.\admin-control.ps1 status

# Clean restart
.\admin-control.ps1 start
```

---

## 🎨 Features

### ✅ Smart Detection
- Automatically checks if services are running
- Won't start if already running
- Shows helpful error messages

### ✅ Process Management
- View detailed process information
- Track CPU and memory usage
- Monitor uptime

### ✅ Health Checks
- Test API endpoints
- Verify dashboard availability
- Show response times

### ✅ Dependency Management
- Install new dependencies
- Update existing ones
- Clean reinstall option

### ✅ Production Ready
- Build optimized production bundle
- Configuration management
- System requirement checks

---

## 📝 Examples

### Example 1: First Time Setup
```powershell
# Check requirements
.\admin-control.ps1 check

# Install dependencies
.\admin-control.ps1 install

# Start everything
.\admin-control.ps1 start

# Open in browser
.\admin-control.ps1 open
```

### Example 2: Daily Use
```powershell
# Start with interactive menu
.\admin-control.ps1

# Or quick start
.\admin-control.ps1 start
```

### Example 3: Troubleshooting
```powershell
# Check what's running
.\admin-control.ps1 status

# Test connections
.\admin-control.ps1 test

# View logs
.\admin-control.ps1 logs

# Restart if needed
.\admin-control.ps1 restart
```

### Example 4: Maintenance
```powershell
# Update dependencies
.\admin-control.ps1 update

# Build for production
.\admin-control.ps1 build

# View configuration
.\admin-control.ps1 config
```

---

## 🔗 Quick Reference Card

| What You Want | Command |
|---------------|---------|
| Start everything | `.\admin-control.ps1 start` |
| Stop everything | `.\admin-control.ps1 stop` |
| Restart | `.\admin-control.ps1 restart` |
| Check status | `.\admin-control.ps1 status` |
| Test if working | `.\admin-control.ps1 test` |
| Open dashboard | `.\admin-control.ps1 open` |
| Install packages | `.\admin-control.ps1 install` |
| Update packages | `.\admin-control.ps1 update` |
| Fix problems | `.\admin-control.ps1 reset` |
| Interactive menu | `.\admin-control.ps1` |

---

## 🌟 Pro Tips

1. **Always use the interactive menu** for maximum visibility
2. **Check status first** before starting services
3. **Use test command** to verify everything is working
4. **Open logs** if something goes wrong
5. **Reset only** when dependencies are broken

---

## 📦 What Gets Managed

### Admin Server (Port 3002)
- Express backend
- Socket.IO for real-time
- API endpoints
- Process manager
- Health checks

### Admin Dashboard (Port 3003)
- React frontend
- WebSocket client
- UI components
- Real-time updates

---

## 🚀 Access URLs

After starting, access:
- **Dashboard:** http://localhost:3003
- **API:** http://localhost:3002
- **Health:** http://localhost:3002/health

---

**Made with 💙 for easy admin management**

Need help? Run `.\admin-control.ps1` and explore the menu! 🎯

