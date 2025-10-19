# Personal Finance Manager - Implementation Checklist

Print this page or keep it open as you work through the project.

---

## ✅ PRE-BUILD CHECKLIST

### Step 1: Review Documentation
- [ ] Read `README.md` (overview)
- [ ] Read `QUICK_START_GUIDE.md` (essential)
- [ ] Skim `PROJECT_PLAN.md` (understand features)
- [ ] Optional: Review `SYSTEM_OVERVIEW.md` (technical details)

### Step 2: Make Key Decisions

**Hosting Choice:**
- [ ] VPS (DigitalOcean/Linode) - $5-10/month
- [ ] Home Server (Raspberry Pi/PC) - One-time cost
- [ ] Not decided yet (can decide later)

**Security Level:**
- [ ] Store last 4 digits only (recommended for Phase 1)
- [ ] Store full account numbers encrypted (higher risk)
- [ ] Decide during build

**App Settings:**
- Look-ahead period: [ ] 7 days  [ ] 14 days  [ ] 30 days
- Safety buffer: $_______ or _______%
- Default currency: _______

**Quick Stats (for reference):**
- Approximate bills per month: _______
- Number of bank accounts: _______
- Pay bills in installments often? [ ] Yes [ ] No

### Step 3: Prepare Hosting (if ready)
- [ ] VPS account created (if using VPS)
- [ ] OR Home server is set up and accessible
- [ ] OR Will set up after code is ready

---

## ✅ BUILD CHECKLIST

### Step 1: Open the Build Prompt
- [ ] Open `CLAUDE_BUILD_PROMPT.md`
- [ ] Locate the section "## THE PROMPT"
- [ ] Select and copy ENTIRE prompt (it's very long - that's correct!)

### Step 2: Give to Claude
- [ ] Start NEW conversation with Claude (fresh window)
- [ ] Paste the complete prompt
- [ ] Send

### Step 3: Answer Questions
- [ ] Claude may ask for clarifications (hosting, security, etc.)
- [ ] Answer with your decisions from above
- [ ] Be patient - Claude will create many files

### Step 4: Wait for Completion
- [ ] Claude creates backend code
- [ ] Claude creates frontend code
- [ ] Claude creates Docker configuration
- [ ] Claude creates database schema
- [ ] Claude creates README with instructions
- [ ] All files are complete

**Estimated time: 2-4 hours of Claude working**

---

## ✅ DEPLOYMENT CHECKLIST

### Step 1: Prerequisites
- [ ] Docker installed on server
- [ ] Docker Compose installed on server
- [ ] Git installed (if cloning from repository)
- [ ] SSH access to server (if VPS)

**Check versions:**
```bash
docker --version
docker-compose --version
```

### Step 2: Get Code on Server
- [ ] Code copied to server
- [ ] Navigate to project directory
- [ ] `.env.example` file is present
- [ ] `docker-compose.yml` file is present

### Step 3: Configure Environment
- [ ] Copy `.env.example` to `.env`
  ```bash
  cp .env.example .env
  ```
- [ ] Edit `.env` file
- [ ] Change `POSTGRES_PASSWORD` (make it strong!)
- [ ] Change `JWT_SECRET` (random long string)
- [ ] Change `ENCRYPTION_KEY` (must be exactly 32 characters)
- [ ] Update `REACT_APP_API_URL` if needed
- [ ] Save `.env` file

### Step 4: Build & Start
- [ ] Run: `docker-compose build`
  - Wait for all images to build
  - Check for errors
- [ ] Run: `docker-compose up -d`
  - Containers start in background
  - Check status: `docker-compose ps`
- [ ] All containers show "Up" status
  - [ ] nginx
  - [ ] frontend
  - [ ] backend
  - [ ] postgres

### Step 5: Check Logs
- [ ] Check backend logs: `docker-compose logs backend`
- [ ] Check frontend logs: `docker-compose logs frontend`
- [ ] Check database logs: `docker-compose logs postgres`
- [ ] No critical errors in logs

### Step 6: Database Setup
- [ ] Run migrations (command will be in README)
- [ ] Seed default categories (if script provided)
- [ ] Database is ready

---

## ✅ TESTING CHECKLIST

### Step 1: Access App
- [ ] Open browser
- [ ] Navigate to `http://localhost` (local) or `http://your-server-ip` (VPS)
- [ ] App loads without errors
- [ ] Login page is visible

### Step 2: Registration & Login
- [ ] Click "Register"
- [ ] Fill out registration form
  - Username: _____________
  - Email: _____________
  - Password: _____________ (write it down!)
- [ ] Submit registration
- [ ] Registration successful
- [ ] Login with new credentials
- [ ] Dashboard loads

### Step 3: Test Core Features

**Accounts:**
- [ ] Click "Manage Accounts" or go to Accounts page
- [ ] Click "Add Account"
- [ ] Create test account:
  - Name: "Test Checking"
  - Type: Checking
  - Balance: $1,000
- [ ] Account appears in list
- [ ] Can view account details
- [ ] Can edit account

**Contacts:**
- [ ] Go to Contacts page
- [ ] Click "Add Contact"
- [ ] Create test contact:
  - Name: "Test Electric Company"
  - Type: Business
- [ ] Contact appears in list
- [ ] Can view contact details

**Categories:**
- [ ] Go to Categories page
- [ ] Default categories are present (Utilities, Housing, etc.)
- [ ] Can create a new category
- [ ] Category appears in list

**Payments:**
- [ ] Go to Payments page or Dashboard
- [ ] Click "Add Payment"
- [ ] Fill out form:
  - Contact: Test Electric Company
  - Description: "Test Bill"
  - Amount: $150
  - Due Date: [Next week]
  - Category: Utilities
  - Account: Test Checking
- [ ] Save payment
- [ ] Payment appears in list
- [ ] Payment shows on dashboard "Upcoming Bills"
- [ ] Payment shows on calendar

**Record Payment (Partial):**
- [ ] Click on test payment
- [ ] Click "Record Payment"
- [ ] Choose "Pay partial amount": $50
- [ ] Payment method: Bank Transfer
- [ ] Date: Today
- [ ] Submit
- [ ] Transaction appears in payment history
- [ ] Balance updates: $100 remaining
- [ ] Status shows "Partially Paid"

**Record Payment (Complete):**
- [ ] Click "Record Payment" again
- [ ] Choose "Pay remaining balance": $100
- [ ] Submit
- [ ] Transaction appears in history
- [ ] Balance: $0 remaining
- [ ] Status shows "Paid"
- [ ] Payment moves to "Recent Activity"

**Safe-to-Spend:**
- [ ] Dashboard shows "Safe to Spend" widget
- [ ] Shows a dollar amount
- [ ] Create another payment (due next week, $200)
- [ ] Safe-to-spend updates (decreases by $200)
- [ ] Mark payment as paid
- [ ] Safe-to-spend updates (increases by $200)

**Calendar:**
- [ ] Go to Calendar page
- [ ] See payments on their due dates
- [ ] Click on a date with a payment
- [ ] Payment details appear
- [ ] Navigate to different months

**Search:**
- [ ] Use search bar
- [ ] Search for "Test"
- [ ] Results show your test payment
- [ ] Click result to view details

**Missed Payment Detection:**
- [ ] Create payment with due date in the past
- [ ] Wait for daily cron job (or manually trigger if possible)
- [ ] OR Set due date to yesterday and wait until next day
- [ ] Payment status changes to "Missed"
- [ ] Dashboard shows overdue alert
- [ ] Days overdue is calculated

**Reschedule:**
- [ ] Click on a payment
- [ ] Click "Reschedule"
- [ ] Change due date to new date
- [ ] Enter reason
- [ ] Save
- [ ] Due date updates
- [ ] Change history shows the update

**File Attachment:**
- [ ] Click on a payment
- [ ] Upload a test file (any image or PDF)
- [ ] File appears in attachments
- [ ] Click to view/download file
- [ ] File opens correctly

### Step 4: Mobile Test
- [ ] Open app on phone
- [ ] Layout is responsive (not broken)
- [ ] Can navigate easily
- [ ] Can add payment on mobile
- [ ] Can record payment on mobile
- [ ] All buttons are touchable

### Step 5: Security Test
- [ ] Logout
- [ ] Try to access `/dashboard` directly
- [ ] Redirected to login (good!)
- [ ] Login again
- [ ] Can access dashboard (good!)
- [ ] Check if full account numbers are hidden (only last 4 shown)

---

## ✅ PRODUCTION READINESS CHECKLIST

### Security Hardening
- [ ] Changed all default passwords in `.env`
- [ ] Generated strong `JWT_SECRET` (32+ random characters)
- [ ] Generated strong `ENCRYPTION_KEY` (exactly 32 characters)
- [ ] Postgres password is strong
- [ ] Default user password is strong

### SSL/HTTPS (Critical for Production!)
- [ ] Domain name pointed to server (if using domain)
- [ ] Let's Encrypt SSL certificate installed
- [ ] App accessible via `https://` (not just `http://`)
- [ ] HTTP redirects to HTTPS
- [ ] SSL certificate auto-renewal configured

### Firewall
- [ ] Firewall enabled on server
- [ ] Only necessary ports open:
  - [ ] 22 (SSH) - from your IP only if possible
  - [ ] 80 (HTTP)
  - [ ] 443 (HTTPS)
- [ ] Database port 5432 NOT exposed to internet

### Backups (CRITICAL!)
- [ ] Backup script created
  ```bash
  docker-compose exec postgres pg_dump -U financeapp finance_manager > backup_$(date +%Y%m%d).sql
  ```
- [ ] Test backup restoration:
  ```bash
  docker-compose exec -T postgres psql -U financeapp finance_manager < backup_20250101.sql
  ```
- [ ] Backup restoration successful
- [ ] Automated backup schedule set up (daily recommended)
  - [ ] Cron job or scheduled task created
  - [ ] Backups stored in safe location (not just on same server!)
- [ ] Backup retention policy decided (keep last 30 days, etc.)

### Monitoring
- [ ] Uptime monitoring set up (optional but recommended)
  - [ ] UptimeRobot or similar service
  - [ ] Get alert if site goes down
- [ ] Log rotation configured (prevent disk filling)
- [ ] Disk space monitoring

### Documentation
- [ ] README from Claude is complete
- [ ] Backup/restore instructions documented
- [ ] Emergency contacts/passwords stored securely (password manager)
- [ ] Server access details documented

### Final Checks
- [ ] App is accessible from anywhere (not just localhost)
- [ ] Multiple users can use it (if needed)
- [ ] Performance is acceptable (pages load quickly)
- [ ] No console errors in browser
- [ ] Mobile experience is good

---

## ✅ ONGOING MAINTENANCE CHECKLIST

### Daily
- [ ] Check dashboard for any alerts
- [ ] Record any payments made
- [ ] Update account balances (if changed)

### Weekly
- [ ] Review upcoming bills
- [ ] Check safe-to-spend is accurate
- [ ] Verify no missed payments

### Monthly
- [ ] Update account balances from bank statements
- [ ] Review categories (add new if needed)
- [ ] Check disk space on server
- [ ] Verify backups are running

### Quarterly
- [ ] Update Docker images (for security patches)
  ```bash
  docker-compose pull
  docker-compose up -d
  ```
- [ ] Review and clean up old data (if any)
- [ ] Test backup restoration
- [ ] Review security settings

### As Needed
- [ ] Add new contacts when paying new businesses
- [ ] Update contact info if businesses change
- [ ] Adjust safe-to-spend settings if lifestyle changes
- [ ] Add new accounts if you open new bank accounts

---

## ✅ TROUBLESHOOTING CHECKLIST

### App Won't Start
- [ ] Check Docker is running: `docker --version`
- [ ] Check containers: `docker-compose ps`
- [ ] Check logs: `docker-compose logs`
- [ ] Try restart: `docker-compose down && docker-compose up -d`
- [ ] Check `.env` file exists and is configured

### Can't Access App
- [ ] Check containers are running: `docker-compose ps`
- [ ] Check firewall allows traffic on port 80/443
- [ ] Check server IP address is correct
- [ ] Try accessing from server itself: `curl localhost`
- [ ] Check nginx logs: `docker-compose logs nginx`

### Login Not Working
- [ ] Verify username/email is correct
- [ ] Try password reset (instructions in app README)
- [ ] Check backend logs for errors: `docker-compose logs backend`
- [ ] Verify database is running: `docker-compose ps postgres`

### Database Issues
- [ ] Check postgres container: `docker-compose logs postgres`
- [ ] Verify connection string in `.env`
- [ ] Try restarting database: `docker-compose restart postgres`
- [ ] Check if migrations ran successfully

### Safe-to-Spend Not Calculating
- [ ] Verify payments have `from_account_id` set
- [ ] Check account balances are entered
- [ ] Look at backend logs: `docker-compose logs backend`
- [ ] Trigger manual recalculation (if available)

### Uploads Not Working
- [ ] Check uploads directory exists
- [ ] Check directory permissions
- [ ] Check `MAX_FILE_SIZE` in `.env`
- [ ] Check nginx configuration for file uploads

---

## 📝 NOTES SECTION

**Installation Date:** _______________

**Server Details:**
- Type: [ ] VPS [ ] Home Server
- Provider: _______________
- IP Address: _______________
- Domain (if any): _______________

**Login Credentials:**
- Username: _______________
- Email: _______________
- Password: (stored in password manager)

**Important Paths:**
- Project directory: _______________
- Backup location: _______________

**Important Commands:**
```bash
# Start app
docker-compose up -d

# Stop app
docker-compose down

# View logs
docker-compose logs backend

# Backup database
docker-compose exec postgres pg_dump -U financeapp finance_manager > backup.sql

# Restart
docker-compose restart
```

**Emergency Contacts:**
- Server provider support: _______________
- Domain registrar: _______________
- Who can help if I'm stuck: _______________

---

## 🎉 COMPLETION CHECKLIST

Mark when fully complete:

- [ ] ✅ App is built (all code created by Claude)
- [ ] ✅ App is deployed (running on server)
- [ ] ✅ Testing complete (all features work)
- [ ] ✅ Security hardened (SSL, backups, firewall)
- [ ] ✅ Using daily (added real bills and payments)
- [ ] ✅ Confident with the system

**Congratulations! Your personal finance manager is live!** 🎊

---

**Date Completed:** _______________

**Next Phase Plan:**
- [ ] Use Phase 1 for 2-4 weeks
- [ ] Gather feedback on what else is needed
- [ ] Plan Phase 2 implementation (interest, cost analysis, etc.)
- [ ] Consider Phase 3 features (bank integration, credit score)

---

Print this checklist and check off items as you complete them!


