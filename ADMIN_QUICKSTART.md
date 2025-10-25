# 🚀 Quick Start Guide - Admin Control Panel

## Three Ways to Run:

### 🎯 **Method 1: Batch File (Easiest - Always Uses PS 7)**
```cmd
admin-control.bat
```
**Just double-click `admin-control.bat` in File Explorer!**
- ✅ Automatically uses PowerShell 7
- ✅ No need to worry about versions
- ✅ Works from anywhere

---

### 💻 **Method 2: PowerShell 7 Direct**
```powershell
pwsh
cd C:\Users\Scott\repo\github\mai_finances
.\admin-control.ps1
```

---

### 🪟 **Method 3: Windows PowerShell 5.1**
```powershell
# Close and reopen PowerShell first to clear cache!
.\admin-control.ps1
```

---

## ⚡ **Quick Commands:**

| What You Want | Command |
|---------------|---------|
| **Start everything** | `admin-control.bat start` |
| **Stop everything** | `admin-control.bat stop` |
| **Check status** | `admin-control.bat status` |
| **Interactive menu** | `admin-control.bat` |

---

## 📋 **File Overview:**

- **`admin-control.bat`** ← Use this! (Always works)
- **`admin-control.ps1`** ← The actual script
- **`start-app.ps1`** ← Controls all servers (main app too)

---

## 🔧 **Troubleshooting:**

**"pwsh is not recognized":**
- PowerShell 7 not installed
- Install: `winget install Microsoft.PowerShell`
- Or download: https://aka.ms/powershell

**"Script won't run in PS 5.1":**
- Use `admin-control.bat` instead
- Or close and reopen PowerShell

**"Execution policy error":**
- Already handled by the batch file!
- Or run: `Set-ExecutionPolicy RemoteSigned -Scope CurrentUser`

---

## ✅ **Recommended Setup:**

1. **Pin the batch file** to your taskbar:
   - Right-click `admin-control.bat`
   - Send to → Desktop (create shortcut)
   - Drag shortcut to taskbar

2. **Or create a shortcut** with admin rights:
   - Right-click `admin-control.bat`
   - Create shortcut
   - Right-click shortcut → Properties
   - Advanced → Run as administrator

---

## 🎨 **What Each File Does:**

| File | Purpose |
|------|---------|
| `admin-control.bat` | Launcher (uses PS 7) |
| `admin-control.ps1` | Admin dashboard control |
| `start-app.ps1` | Start/stop ALL servers |
| `ADMIN_CONTROL_GUIDE.md` | Full documentation |

---

## 💡 **Pro Tip:**

**Right-click `admin-control.bat` → "Run as administrator"** to ensure full permissions for stopping/starting servers!

---

**Made with 💙 for easy server management**

Need help? Check `ADMIN_CONTROL_GUIDE.md` for full details!

