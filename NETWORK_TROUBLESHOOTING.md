# Network Error Troubleshooting Guide

## Common Error: "Network Error (ERR_NET_8001)"

This error means the frontend cannot connect to the backend server.

---

## Quick Diagnosis

### 1. Check Backend Server

```powershell
# Test if backend is responding
curl http://localhost:3001/health

# Should return:
# {"success":true,"message":"Personal Finance Manager API is running",...}
```

**If this fails:**
- Backend is not running
- Backend is on wrong port
- Backend crashed

---

## Common Causes & Solutions

### ❌ Cause 1: Backend Not Running

**Symptoms:**
- `ERR_NET_8001: Cannot connect to server`
- `curl: (7) Failed to connect to localhost port 3001`
- No response from health check

**Solution:**
```powershell
# Start backend
cd backend
.\start.ps1

# Wait for:
# "✨ Ready to accept requests!"
```

---

### ❌ Cause 2: Wrong Port Configuration

**Symptoms:**
- Backend runs but frontend can't connect
- Different port in error messages

**Check:**
1. **Backend .env file:**
   ```env
   PORT=3001
   ```

2. **Frontend .env file:**
   ```env
   REACT_APP_API_BASE_URL=http://localhost:3001/api
   ```

3. **Backend start.ps1 output:**
   ```
   📡 Server running on port 3001  ← Should be 3001
   ```

**Solution:**
- Ensure both use port 3001
- Restart both servers after .env changes

---

### ❌ Cause 3: Database Connection Failed

**Symptoms:**
- Backend starts but crashes immediately
- Error logs show database errors
- `ERR_DB_2001` in logs

**Check Backend Logs:**
```
❌ Database connection failed
Error: password authentication failed
```

**Solution:**
```powershell
# 1. Check PostgreSQL is running
Get-Service -Name postgresql*

# 2. Verify .env DATABASE_URL
# Should be:
DATABASE_URL=postgresql://financeapp:BadWolf.12@localhost:5432/finance_manager

# 3. Test database connection
psql -U financeapp -d finance_manager -h localhost
```

---

### ❌ Cause 4: CORS Error

**Symptoms:**
- Backend running
- Browser console shows CORS error
- `Access-Control-Allow-Origin` error

**Check Backend .env:**
```env
CORS_ORIGIN=http://localhost:3000
```

**Check backend logs for:**
```
CORS error from origin: http://localhost:3000
```

**Solution:**
- Restart backend after .env change
- Clear browser cache
- Try different browser

---

### ❌ Cause 5: Firewall Blocking

**Symptoms:**
- Backend running
- Local test (curl) works
- Browser test fails

**Solution:**
```powershell
# Allow Node.js through firewall
New-NetFirewallRule -DisplayName "Node.js" -Direction Inbound -Program "C:\Program Files\nodejs\node.exe" -Action Allow
```

---

## Diagnostic Commands

### Backend Status
```powershell
# 1. Check if backend process is running
Get-Process node

# 2. Check if port 3001 is listening
Get-NetTCPConnection -LocalPort 3001 -State Listen

# 3. Test health endpoint
curl http://localhost:3001/health

# 4. Check backend logs
# Look for "✨ Ready to accept requests!"
```

### Frontend Status
```powershell
# 1. Check if frontend process is running
Get-Process node

# 2. Check if port 3000 is listening
Get-NetTCPConnection -LocalPort 3000 -State Listen

# 3. Check API configuration
# frontend/.env should have:
# REACT_APP_API_BASE_URL=http://localhost:3001/api
```

### Database Status
```powershell
# 1. Check PostgreSQL service
Get-Service -Name postgresql*

# 2. Test connection
psql -U financeapp -d finance_manager -h localhost -c "SELECT 1;"

# 3. Check database exists
psql -U postgres -l | Select-String "finance_manager"
```

---

## Step-by-Step Resolution

### Step 1: Verify Prerequisites
- [ ] PostgreSQL installed and running
- [ ] Database `finance_manager` exists
- [ ] User `financeapp` has permissions
- [ ] Node.js installed (check: `node --version`)

### Step 2: Check Configuration
- [ ] Backend `.env` exists with correct DATABASE_URL
- [ ] Frontend `.env` exists with correct API_BASE_URL
- [ ] Ports: Backend=3001, Frontend=3000

### Step 3: Start Backend
```powershell
cd C:\Users\Scott\repo\github\mai_finances\backend
.\start.ps1
```

**Wait for:**
```
✅ Database connected successfully
✨ Ready to accept requests!
```

### Step 4: Test Backend
```powershell
curl http://localhost:3001/health
```

**Expected:**
```json
{"success":true,"message":"Personal Finance Manager API is running"}
```

### Step 5: Start Frontend
```powershell
cd C:\Users\Scott\repo\github\mai_finances\frontend
npm start
```

**Wait for:**
```
Compiled successfully!
You can now view mai-finances-frontend in the browser.
Local: http://localhost:3000
```

### Step 6: Test Application
Open browser to: http://localhost:3000

**If error persists:**
1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for error messages
4. Copy error code and message
5. See ERROR_CODES.md for specific solution

---

## Error Code Reference

### Network Errors (8000-8099)

| Code | Error | Likely Cause | Solution |
|------|-------|--------------|----------|
| `ERR_NET_8001` | Network connection failed | Backend not running | Start backend |
| `ERR_NET_8002` | Request timeout | Backend too slow | Check database connection |
| `ERR_NET_8003` | Connection refused | Wrong port | Verify port configuration |
| `ERR_NET_8004` | Network unreachable | Firewall | Check firewall settings |
| `ERR_NET_8005` | CORS policy error | CORS misconfiguration | Update CORS_ORIGIN in .env |

---

## Still Having Issues?

### Collect This Information:

1. **Error Code** (e.g., ERR_NET_8001)

2. **Backend Status:**
   ```powershell
   Get-Process node
   Get-NetTCPConnection -LocalPort 3001
   curl http://localhost:3001/health
   ```

3. **Frontend Status:**
   ```powershell
   Get-NetTCPConnection -LocalPort 3000
   ```

4. **Database Status:**
   ```powershell
   Get-Service postgresql*
   ```

5. **Browser Console Errors:**
   - Open DevTools (F12)
   - Copy all red error messages

6. **Backend Console Output:**
   - Copy last 20 lines from backend terminal

---

## Quick Reset (Nuclear Option)

If nothing works, try fresh restart:

```powershell
# 1. Stop everything
Get-Process node | Stop-Process -Force

# 2. Clear ports (if stuck)
# Sometimes helps

# 3. Restart PostgreSQL
Restart-Service postgresql*

# 4. Start backend
cd backend
.\start.ps1

# 5. Wait 10 seconds

# 6. Start frontend
cd frontend
npm start

# 7. Wait for compilation

# 8. Open http://localhost:3000
```

---

## Prevention Tips

1. **Always check backend is running** before starting frontend
2. **Use health check** to verify backend: `curl http://localhost:3001/health`
3. **Check logs** for errors before assuming it's working
4. **Use two terminals** - one for backend, one for frontend
5. **Don't close terminals** while testing - you'll lose error logs

---

**Last Updated:** October 20, 2025  
**Version:** 1.0.0-dev

