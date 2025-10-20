# 🛡️ Windows Firewall Configuration for Mai Finances

## Problem
Windows Firewall is blocking your browser from connecting to `localhost:3001` (the backend API).

## ✅ Solution 1: Temporarily Disable Windows Firewall (Quickest)

⚠️ **Only for local development! Re-enable when done.**

### Steps:
1. Press **`Windows Key`**
2. Type **"Windows Security"** and open it
3. Click **"Firewall & network protection"**
4. Click on your active network (usually "Private network")
5. **Turn OFF** "Microsoft Defender Firewall"
6. Test the app at `http://localhost:3000`
7. **Remember to turn it back ON** when finished!

---

## ✅ Solution 2: Add Firewall Rule (Recommended)

This creates a permanent rule that allows Node.js on port 3001.

### Steps:
1. Press **`Windows Key`**
2. Type **"PowerShell"**
3. **Right-click** "Windows PowerShell"
4. Select **"Run as administrator"**
5. Run this command:

```powershell
New-NetFirewallRule -DisplayName "Mai Finances - Backend API (Port 3001)" -Direction Inbound -LocalPort 3001 -Protocol TCP -Action Allow
```

6. You should see:
```
DisplayName          : Mai Finances - Backend API (Port 3001)
Enabled              : True
```

7. Test the app at `http://localhost:3000`

---

## ✅ Solution 3: Allow Node.js Through Firewall (Alternative)

1. Press **`Windows Key`**
2. Type **"Allow an app through Windows Firewall"** and open it
3. Click **"Change settings"** (requires admin)
4. Click **"Allow another app..."**
5. Click **"Browse..."**
6. Navigate to: `C:\Program Files\nodejs\node.exe`
7. Click **"Add"**
8. Make sure **both "Private" and "Public"** are checked for Node.js
9. Click **"OK"**

---

## 🧪 Test If It's Working

After applying any solution, test with:

### In Browser:
1. Go to `http://localhost:3000`
2. Click **Register**
3. Fill in the form
4. Submit

### In PowerShell:
```powershell
Invoke-WebRequest -Uri "http://localhost:3001/health" -UseBasicParsing
```

Should return:
```
StatusCode : 200
```

---

## ❓ Still Not Working?

### Check Browser Console (F12)
- Look for **CORS errors** (red text)
- Look for **Network errors**

### Verify Backend is Running
```powershell
Test-NetConnection -ComputerName localhost -Port 3001
```

Should show:
```
TcpTestSucceeded : True
```

### Check if Antivirus is Blocking
- Some antivirus software also blocks localhost connections
- Temporarily disable and test

---

## 🔒 Security Note

These solutions are **safe for local development** because:
- ✅ Only affects `localhost` (your computer)
- ✅ Not accessible from the internet
- ✅ Only opens port 3001 locally

When you deploy to production, you'll use proper security (HTTPS, reverse proxy, etc.).
