# 💻 Installation Guide - Personal Finance Manager

## Complete Setup Instructions

---

## Prerequisites

Before you begin, make sure you have:

### Required Software
1. **Node.js** (v18 or higher)
   - Download: https://nodejs.org/
   - Verify: `node --version`
   - Verify: `npm --version`

2. **PostgreSQL** (v14 or higher)
   - Download: https://www.postgresql.org/download/
   - Verify: `psql --version`

3. **Git** (optional, for version control)
   - Download: https://git-scm.com/

---

## Step 1: Database Setup

### Option A: Using pgAdmin
1. Open **pgAdmin 4**
2. Right-click **Databases** → **Create** → **Database**
3. Database name: `finance_manager`
4. Click **Save**

### Option B: Using SQL Shell (psql)
```sql
CREATE DATABASE finance_manager;
```

### Option C: Using Command Line
```powershell
createdb finance_manager
```

### Create Database User (Recommended)
```sql
CREATE USER financeapp WITH PASSWORD 'your_password_here';
GRANT ALL PRIVILEGES ON DATABASE finance_manager TO financeapp;
```

---

## Step 2: Backend Setup

### 1. Install Dependencies
```powershell
cd backend
npm install
```

This installs:
- express (web framework)
- pg (PostgreSQL client)
- bcrypt (password hashing)
- jsonwebtoken (JWT auth)
- moment-timezone (timezone handling)
- node-cron (scheduled jobs)
- And 10+ more packages

### 2. Configure Environment
The `.env` file in the root directory contains all configuration.

**Important values to check:**
```env
DATABASE_URL=postgresql://financeapp:BadWolf.12@localhost:5432/finance_manager
PORT=3001
JWT_SECRET=your_secret_key_here
ENCRYPTION_KEY=32_character_key_for_aes256_here
```

**Generate secure keys:**
```powershell
# JWT Secret (32 bytes, base64)
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Encryption Key (32 bytes, base64)
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 3. Run Database Migrations
```powershell
npm run migrate
```

**Expected output:**
```
Starting database migrations...
Found 21 migration files
Running migration: 001_create_users.sql
✓ 001_create_users.sql completed
Running migration: 002_create_user_preferences.sql
✓ 002_create_user_preferences.sql completed
...
✓ 021_create_indexes.sql completed
All migrations completed successfully!
```

### 4. Start Backend Server
```powershell
.\start.ps1
```

**Or manually:**
```powershell
node src/server.js
```

**Expected output:**
```
🚀 Personal Finance Manager API
📡 Server running on port 3001
🌍 Environment: production
🔗 Health check: http://localhost:3001/health
🔐 Auth endpoint: http://localhost:3001/api/auth
✨ Ready to accept requests!
📅 Initializing scheduled jobs...
✅ All scheduled jobs initialized successfully!
```

### 5. Test Backend
Open browser: http://localhost:3001/health

Should return:
```json
{
  "success": true,
  "message": "Personal Finance Manager API is running",
  "version": "1.0.0-dev",
  "timestamp": "2025-10-20T..."
}
```

---

## Step 3: Frontend Setup

### 1. Install Dependencies
```powershell
cd frontend
npm install
```

This installs:
- react & react-dom (UI library)
- react-router-dom (routing)
- axios (HTTP client)
- tailwindcss (styling)
- And 15+ more packages

**Installation time:** 2-3 minutes

### 2. Configure Environment
Create `frontend/.env`:
```env
REACT_APP_API_BASE_URL=http://localhost:3001/api
```

**Note:** React requires `REACT_APP_` prefix for environment variables.

### 3. Start Frontend Server
```powershell
npm start
```

**Expected output:**
```
Compiled successfully!

You can now view personal-finance-manager-frontend in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://192.168.x.x:3000

Note that the development build is not optimized.
To create a production build, use npm run build.

webpack compiled successfully
```

### 4. Open Application
Browser should auto-open to: http://localhost:3000

If not, manually open: http://localhost:3000

---

## Step 4: First Use

### 1. Register Account
1. Click "**Don't have an account? Register**"
2. Fill in:
   - **Username** (min 3 chars)
   - **Email** (valid email)
   - **Password** (min 8 chars)
   - **Confirm Password**
3. Click "**Create account**"
4. You'll be logged in automatically!

### 2. Set Up Accounts
1. Go to **Accounts** (🏦)
2. Click "**+ New Account**"
3. Fill in:
   - Account Name: "My Checking"
   - Account Type: "Checking"
   - Current Balance: 5000
4. Click "**Save**"

### 3. Add First Contact
1. Go to **Contacts** (👥)
2. Click "**+ New Contact**"
3. Fill in:
   - Name: "Electric Company"
   - Type: "Utility"
   - Email: billing@electric.com
4. Click "**Save**"

### 4. Add First Payment
1. Go to **Payments** (💰)
2. Click "**+ New Payment**"
3. Fill in:
   - Contact: "Electric Company"
   - Description: "Electric Bill"
   - Amount: 150
   - Due Date: (next month)
   - Type: "I Owe"
4. Click "**Save**"

### 5. Configure Settings
1. Go to **Settings** (⚙️)
2. Set:
   - **Timezone**: Your timezone
   - **Currency**: USD (or your currency)
   - **Safety Buffer**: 100 (fixed) or 10 (percentage)
   - **Date Range**: 30 days
3. Click "**Save Settings**"

**You're all set!** 🎉

---

## Troubleshooting

### Backend Issues

#### Port Already in Use
```powershell
# Check what's using port 3001
Get-NetTCPConnection -LocalPort 3001

# Kill the process
Stop-Process -Id <PID>
```

#### Database Connection Failed
```
Error: password authentication failed for user "postgres"
```

**Fix:** Update `.env` file with correct database credentials:
```env
DATABASE_URL=postgresql://your_user:your_password@localhost:5432/finance_manager
```

#### Module Not Found
```
Error: Cannot find module 'express'
```

**Fix:** Install dependencies:
```powershell
cd backend
Remove-Item node_modules -Recurse -Force
npm install
```

#### Migrations Failed
```
Error: relation "users" already exists
```

**Fix:** Database tables already exist. Either:
1. Skip migrations (already ran)
2. Drop all tables and re-run:
```sql
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO financeapp;
GRANT ALL ON SCHEMA public TO public;
```
Then run: `npm run migrate`

### Frontend Issues

#### Port 3000 in Use
```
Something is already running on port 3000.
```

**Fix:** Kill the process or use different port:
```powershell
# Use different port
$env:PORT=3001
npm start
```

#### API Connection Failed
```
Error: Network Error
```

**Fix:**
1. Make sure backend is running (http://localhost:3001/health)
2. Check `frontend/.env` has: `REACT_APP_API_BASE_URL=http://localhost:3001/api`
3. Check browser console (F12) for CORS errors

#### White Screen / Nothing Loads
```
Blank page, no errors
```

**Fix:**
1. Open browser console (F12)
2. Check for JavaScript errors
3. Clear browser cache (Ctrl+Shift+Delete)
4. Try different browser
5. Reinstall dependencies:
```powershell
cd frontend
Remove-Item node_modules -Recurse -Force
npm install
npm start
```

### Database Issues

#### PostgreSQL Not Running
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Fix:** Start PostgreSQL service:
```powershell
# Windows
Get-Service -Name postgresql* | Start-Service

# Or use pgAdmin to start server
```

#### Can't Connect to Database
```
Error: database "finance_manager" does not exist
```

**Fix:** Create database:
```sql
CREATE DATABASE finance_manager;
```

---

## Verification Checklist

Use this checklist to verify everything is working:

### Backend ✅
- [ ] PostgreSQL is running
- [ ] Database `finance_manager` exists
- [ ] User `financeapp` has permissions
- [ ] Backend dependencies installed (`node_modules` folder exists)
- [ ] Migrations ran successfully (21 tables created)
- [ ] Backend server running on port 3001
- [ ] Health check responds: http://localhost:3001/health
- [ ] No errors in backend console

### Frontend ✅
- [ ] Frontend dependencies installed (`node_modules` folder exists)
- [ ] `.env` file exists with `REACT_APP_API_BASE_URL`
- [ ] Frontend server running on port 3000
- [ ] Browser opens to http://localhost:3000
- [ ] Login/Register page loads
- [ ] No errors in browser console (F12)

### Functionality ✅
- [ ] Can register new account
- [ ] Can login with credentials
- [ ] Dashboard loads with summary
- [ ] Can create account (🏦)
- [ ] Can create contact (👥)
- [ ] Can create payment (💰)
- [ ] Can create income (💵)
- [ ] Can view calendar (📅)
- [ ] Settings page works (⚙️)

---

## Performance Optimization

### Production Build

For production use, build optimized versions:

**Backend:**
```powershell
cd backend
# Already optimized for production
NODE_ENV=production node src/server.js
```

**Frontend:**
```powershell
cd frontend
npm run build
```

This creates `build/` folder with optimized static files.

**Serve production build:**
```powershell
npm install -g serve
serve -s build -p 3000
```

### Database Indexes

All necessary indexes are created during migration. To verify:
```sql
SELECT tablename, indexname FROM pg_indexes 
WHERE schemaname = 'public' 
ORDER BY tablename;
```

---

## Security Recommendations

### For Development
- ✅ Use `.env` file (already set up)
- ✅ Never commit `.env` to git
- ✅ Use strong passwords
- ✅ Enable PostgreSQL password authentication

### For Production
- 🔒 Use HTTPS (Let's Encrypt SSL certificate)
- 🔒 Change all default passwords
- 🔒 Generate new JWT_SECRET and ENCRYPTION_KEY
- 🔒 Set `NODE_ENV=production`
- 🔒 Enable PostgreSQL SSL
- 🔒 Use firewall to restrict database access
- 🔒 Regular backups
- 🔒 Keep dependencies updated (`npm audit fix`)

---

## Next Steps

After installation:

1. **Read START_APP.md** - Usage guide
2. **Read FRONTEND_COMPLETE.md** - Feature overview
3. **Read BACKEND_COMPLETE.md** - API documentation
4. **Customize** - Adjust settings to your needs
5. **Add Data** - Start tracking your finances!

---

## Support & Documentation

- **Quick Start:** START_APP.md
- **Features:** FRONTEND_COMPLETE.md
- **API Docs:** BACKEND_COMPLETE.md
- **Summary:** FINAL_SUMMARY.md
- **Progress:** PROGRESS.md

---

## Common Commands Reference

### Backend
```powershell
cd backend
npm install              # Install dependencies
npm run migrate          # Run database migrations
npm start               # Start server (production)
npm run dev             # Start server (development with nodemon)
.\start.ps1             # Start with PowerShell script
```

### Frontend
```powershell
cd frontend
npm install             # Install dependencies
npm start              # Start development server
npm run build          # Build for production
npm test               # Run tests
```

### Database
```sql
-- List all databases
\l

-- Connect to database
\c finance_manager

-- List all tables
\dt

-- View table structure
\d users

-- Count records
SELECT COUNT(*) FROM users;

-- View recent users
SELECT id, username, email, created_at FROM users ORDER BY created_at DESC LIMIT 5;
```

---

## 🎉 Installation Complete!

Your Personal Finance Manager is ready to use!

**Next:** Open http://localhost:3000 and start managing your finances! 💰

