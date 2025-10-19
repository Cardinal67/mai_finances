# System Overview - Personal Finance Manager

This document provides a visual overview of how all the pieces fit together.

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         USER DEVICES                         │
│                                                              │
│  [Phone] [Tablet] [Laptop] [Desktop]                        │
│     ↓        ↓        ↓         ↓                           │
│  ┌──────────────────────────────────────┐                   │
│  │      Web Browser (Chrome, Safari)    │                   │
│  │         HTTPS://your-domain          │                   │
│  └──────────────────────────────────────┘                   │
└─────────────────────────────────────────────────────────────┘
                        ↓ HTTPS
┌─────────────────────────────────────────────────────────────┐
│                      DOCKER HOST                             │
│  (VPS or Home Server)                                        │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              NGINX (Reverse Proxy)                   │   │
│  │              - Routes requests                        │   │
│  │              - Serves frontend                        │   │
│  │              - Proxies API calls                      │   │
│  └──────────────────────────────────────────────────────┘   │
│           ↓                            ↓                     │
│  ┌──────────────────┐       ┌──────────────────────────┐   │
│  │    FRONTEND      │       │      BACKEND             │   │
│  │                  │       │                          │   │
│  │  React.js        │       │  Node.js + Express       │   │
│  │  Tailwind CSS    │       │  - REST API              │   │
│  │  React Router    │       │  - Business Logic        │   │
│  │  Axios           │       │  - Authentication (JWT)  │   │
│  │                  │       │  - Encryption/Decryption │   │
│  │  Served as       │       │  - Scheduled Jobs (cron) │   │
│  │  static files    │       │                          │   │
│  │  by Nginx        │       │  Port: 3001              │   │
│  └──────────────────┘       └──────────────────────────┘   │
│                                      ↓                       │
│                      ┌──────────────────────────────────┐   │
│                      │      PostgreSQL Database         │   │
│                      │                                  │   │
│                      │  - All tables and data           │   │
│                      │  - Persistent volume             │   │
│                      │  - Encrypted sensitive fields    │   │
│                      │                                  │   │
│                      │  Port: 5432 (internal only)      │   │
│                      └──────────────────────────────────┘   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              STORAGE VOLUMES                         │   │
│  │                                                      │   │
│  │  - Database data (persistent)                        │   │
│  │  - Uploaded files (receipts, attachments)           │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🗄️ Database Entity Relationships

```
┌──────────┐
│  USERS   │
│          │
│  - id    │◄───────────────────────┐
│  - email │                        │
│  - pass  │                        │ (user_id)
└──────────┘                        │
                                    │
┌────────────────────────────────────────────────────────┐
│                                                        │
│   ┌──────────────┐      ┌──────────────┐             │
│   │  ACCOUNTS    │      │  CONTACTS    │             │
│   │              │      │              │             │
│   │  - id        │      │  - id        │             │
│   │  - name      │◄──┐  │  - name      │◄────┐       │
│   │  - balance   │   │  │  - email     │     │       │
│   │  - last_4    │   │  │  - phone     │     │       │
│   └──────────────┘   │  └──────────────┘     │       │
│         ▲            │         │              │       │
│         │            │         │              │       │
│         │            │         ▼              │       │
│         │            │  ┌──────────────────┐  │       │
│         │            │  │ CONTACT_NAME_    │  │       │
│         │            │  │ HISTORY          │  │       │
│         │            │  │                  │  │       │
│         │            │  │ - old_name       │  │       │
│         │            │  │ - new_name       │  │       │
│         │            │  │ - reason         │  │       │
│         │            │  └──────────────────┘  │       │
│         │            │                        │       │
│         │            │  ┌──────────────────┐  │       │
│         │            └──┤   PAYMENTS       │──┘       │
│         │               │                  │          │
│         │(from_account) │  - id            │          │
│         │               │  - description   │(contact) │
│         │               │  - amount        │          │
│         │               │  - due_date      │          │
│         │               │  - status        │          │
│         │               │  - is_recurring  │          │
│         │               └──────────────────┘          │
│         │                        │                    │
│         │                        │                    │
│         │          ┌─────────────┼─────────────┐      │
│         │          ▼             ▼             ▼      │
│         │  ┌─────────────┐ ┌───────────┐ ┌─────────┐ │
│         │  │  PAYMENT_   │ │ PAYMENT_  │ │PAYMENT_ │ │
│         │  │  TRANS-     │ │ DATE_     │ │CATEGO-  │ │
│         └──┤  ACTIONS    │ │ CHANGES   │ │RIES     │ │
│            │             │ │           │ │         │ │
│            │ - amount    │ │- old_date │ │(many-to-│ │
│            │ - method    │ │- new_date │ │ many)   │ │
│            │ - date      │ │- reason   │ └─────────┘ │
│            │ - confirm#  │ └───────────┘      │      │
│            └─────────────┘                    ▼      │
│                  │                     ┌──────────┐  │
│                  │                     │CATEGORIES│  │
│                  ▼                     │          │  │
│            ┌─────────────┐             │ - id     │  │
│            │ATTACHMENTS  │             │ - name   │  │
│            │             │             │ - color  │  │
│            │ - file_path │             │ - icon   │  │
│            │ - file_name │             └──────────┘  │
│            │ - entity_id │                           │
│            └─────────────┘                           │
│                                                      │
│   ┌──────────────┐      ┌──────────────┐            │
│   │  REMINDERS   │      │  AUDIT_LOG   │            │
│   │              │      │              │            │
│   │  - payment   │      │ - action     │            │
│   │  - date      │      │ - entity     │            │
│   │  - is_sent   │      │ - old/new    │            │
│   └──────────────┘      └──────────────┘            │
│                                                      │
└──────────────────────────────────────────────────────┘
```

---

## 🔄 Key User Flows

### Flow 1: Creating and Paying a Bill

```
1. User Action: Click "Add Payment"
   ↓
2. Fill Form:
   - Contact: "Electric Company"
   - Description: "January 2025 Electric Bill"
   - Amount: $150
   - Due Date: Feb 1, 2025
   - Category: Utilities > Electric
   - From Account: Chase Checking
   ↓
3. Click "Save"
   ↓
4. Backend:
   - Creates PAYMENT record (status: unpaid)
   - Creates REMINDER records (7 days before, 3 days before)
   - Creates AUDIT_LOG entry
   ↓
5. Dashboard updates:
   - Shows in "Upcoming Bills"
   - Updates safe-to-spend (reduces available amount)
   - Calendar shows payment on Feb 1
   ↓
6. User Action: Jan 31 - Click "Record Payment"
   ↓
7. Fill Payment Modal:
   - Amount: $150 (full payment)
   - Payment Method: Bank Transfer
   - Confirmation: ACH-123456
   - Date: Today
   ↓
8. Backend:
   - Creates PAYMENT_TRANSACTION record
   - Updates PAYMENT status to "paid"
   - Updates PAYMENT paid_date
   - Creates AUDIT_LOG entry
   ↓
9. Dashboard updates:
   - Removes from "Upcoming Bills"
   - Moves to "Recent Activity"
   - Recalculates safe-to-spend (increases available amount)
   - Calendar shows as "paid" (green)
```

### Flow 2: Partial Payment

```
1. Bill exists: Rent - $1,200 due Feb 1
   ↓
2. User Action: Jan 15 - "Record Payment"
   ↓
3. Modal:
   - Select "Pay partial amount"
   - Enter: $400
   - Method: Bank Transfer
   - Confirmation: ACH-789
   ↓
4. Backend:
   - Creates PAYMENT_TRANSACTION ($400)
   - Updates PAYMENT status to "partially_paid"
   - Current balance = $1,200 - $400 = $800
   ↓
5. Payment Detail Page shows:
   - Original: $1,200
   - Paid: $400
   - Remaining: $800
   - Status: PARTIALLY PAID
   ↓
6. User Action: Jan 28 - "Record Payment" again
   ↓
7. Modal:
   - Select "Pay remaining balance"
   - Shows: $800
   - Method: Bank Transfer
   - Confirmation: ACH-999
   ↓
8. Backend:
   - Creates PAYMENT_TRANSACTION ($800)
   - Updates PAYMENT status to "paid"
   - Current balance = $0
   ↓
9. Payment Detail shows:
   - Original: $1,200
   - Paid: $1,200
   - Remaining: $0
   - Status: PAID ✅
   - Transaction History:
     * Jan 28: $800 (Balance: $0)
     * Jan 15: $400 (Balance: $800)
```

### Flow 3: Safe-to-Spend Calculation

```
User has:
- Chase Checking: $3,500 balance
- Savings Account: $5,000 balance

Upcoming bills (next 30 days) from Chase Checking:
- Rent: $1,200 (due in 10 days)
- Electric: $150 (due in 12 days)
- Car Payment: $400 (due in 20 days)
- Total: $1,750

User settings:
- Time horizon: 30 days
- Safety buffer: $500
- No pending transfers

CALCULATION:
Chase Checking:
  Current: $3,500
  Reserved: $1,750 (upcoming bills)
  Buffer: $500
  Safe to Spend: $3,500 - $1,750 - $500 = $1,250

Savings:
  Current: $5,000
  Reserved: $0 (no bills from this account)
  Buffer: $500
  Safe to Spend: $5,000 - $0 - $500 = $4,500

TOTAL SAFE TO SPEND: $1,250 + $4,500 = $5,750

Dashboard displays:
┌──────────────────────────────────────┐
│  💵 SAFE TO SPEND TODAY              │
│                                      │
│  $5,750                              │
│                                      │
│  Chase Checking: $1,250              │
│  Savings: $4,500                     │
│                                      │
│  (Reserved: $1,750 for 3 bills)      │
└──────────────────────────────────────┘
```

### Flow 4: Missed Payment Detection

```
DAILY CRON JOB (runs 1:00 AM every day):

1. Query:
   SELECT * FROM payments
   WHERE status = 'unpaid'
   AND current_due_date < TODAY

2. For each found payment:
   - Update status to 'missed'
   - Set missed_date = TODAY
   - Increment late_payment_count
   - Calculate days_overdue = TODAY - due_date

3. Create dashboard alerts

4. User sees on dashboard:
   ┌────────────────────────────────────┐
   │  ⚠️ ALERTS                         │
   │                                    │
   │  🔴 1 Overdue Payment              │
   │     Electric Bill - $150           │
   │     3 days overdue                 │
   │     [Pay Now] [Reschedule]         │
   └────────────────────────────────────┘
```

### Flow 5: Recurring Payment Auto-Generation

```
User has set up:
- Recurring payment: "Rent"
- Amount: $1,200
- Frequency: Monthly (every 1st of month)
- Never ends

DAILY CRON JOB (runs 2:00 AM every day):

1. Check recurring payments where:
   - Next occurrence should be created
   - Last payment's due date + interval = upcoming date

2. For Rent (due Feb 1):
   - On Jan 2 (30 days before): Create next payment
   - New PAYMENT record:
     * Description: "Rent"
     * Amount: $1,200
     * Due Date: Feb 1, 2025
     * Status: unpaid
     * Link to recurring template

3. Creates associated REMINDERS

4. User sees new bill appear:
   - In "Upcoming Bills"
   - On calendar
   - In safe-to-spend calculation
```

---

## 🔐 Security Flow

### Password Storage & Authentication

```
REGISTRATION:
1. User enters: email + password
   ↓
2. Backend:
   const salt = bcrypt.genSaltSync(12);
   const hash = bcrypt.hashSync(password, salt);
   ↓
3. Store in database:
   USERS: { email: "user@example.com", password_hash: "bcrypt hash" }
   (Password is NEVER stored in plain text)

LOGIN:
1. User enters: email + password
   ↓
2. Backend:
   - Fetch user by email
   - Compare: bcrypt.compareSync(password, stored_hash)
   ↓
3. If match:
   - Generate JWT token
   - Return token to frontend
   ↓
4. Frontend:
   - Store token in localStorage or httpOnly cookie
   - Include in all API requests: Authorization: Bearer <token>
   ↓
5. Backend middleware:
   - Verify token on every protected route
   - Decode to get user_id
   - Fetch user data
   - Proceed with request
```

### Sensitive Data Encryption

```
STORING ACCOUNT NUMBER:

1. User enters: Account Number: 1234567890
   ↓
2. Backend encryption:
   const key = process.env.ENCRYPTION_KEY; // 32 bytes
   const iv = crypto.randomBytes(16);
   const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
   let encrypted = cipher.update('1234567890', 'utf8', 'hex');
   encrypted += cipher.final('hex');
   const stored = iv.toString('hex') + ':' + encrypted;
   ↓
3. Store in database:
   ACCOUNTS: {
     account_number: "iv:encrypteddata",
     account_number_last4: "7890"
   }
   ↓
4. Display in UI:
   - Show only: "****7890"
   - Never show full number in normal view
   ↓
5. If user needs full number (rare):
   - Click "View Sensitive Info"
   - Confirmation dialog
   - Decrypt and show briefly
   - Log access in AUDIT_LOG
```

---

## 📱 Frontend Structure

```
src/
├── App.js (main component, routing)
├── index.js (entry point)
│
├── components/ (reusable UI components)
│   ├── Header.js
│   ├── Sidebar.js
│   ├── Footer.js
│   ├── Button.js
│   ├── Modal.js
│   ├── Card.js
│   ├── Table.js
│   ├── Form/
│   │   ├── Input.js
│   │   ├── Select.js
│   │   ├── DatePicker.js
│   │   └── FileUpload.js
│   └── ...
│
├── pages/ (full page components)
│   ├── Dashboard.js
│   ├── Login.js
│   ├── Register.js
│   ├── Payments/
│   │   ├── PaymentList.js
│   │   ├── PaymentDetail.js
│   │   ├── PaymentForm.js
│   │   └── RecordPaymentModal.js
│   ├── Contacts/
│   │   ├── ContactList.js
│   │   ├── ContactDetail.js
│   │   └── ContactForm.js
│   ├── Accounts/
│   │   ├── AccountList.js
│   │   ├── AccountDetail.js
│   │   └── AccountForm.js
│   ├── Calendar.js
│   ├── Search.js
│   ├── Settings.js
│   └── Profile.js
│
├── context/ (React Context for global state)
│   ├── AuthContext.js (user, login, logout)
│   ├── PaymentContext.js (payments data)
│   └── ...
│
├── hooks/ (custom React hooks)
│   ├── useAuth.js
│   ├── usePayments.js
│   ├── useAccounts.js
│   └── ...
│
├── services/ (API calls)
│   ├── api.js (axios instance with interceptors)
│   ├── authService.js
│   ├── paymentService.js
│   ├── contactService.js
│   ├── accountService.js
│   └── ...
│
├── utils/ (helper functions)
│   ├── formatters.js (currency, dates)
│   ├── validators.js
│   ├── calculations.js (safe-to-spend logic)
│   └── ...
│
└── styles/
    ├── tailwind.css
    └── custom.css
```

---

## 🖥️ Backend Structure

```
src/
├── server.js (main entry point, Express app)
│
├── config/
│   ├── database.js (PostgreSQL connection)
│   ├── encryption.js (AES encryption functions)
│   └── jwt.js (JWT configuration)
│
├── middleware/
│   ├── auth.js (verify JWT, protect routes)
│   ├── errorHandler.js (centralized error handling)
│   ├── validation.js (input validation rules)
│   └── logger.js (request logging)
│
├── models/ (database queries)
│   ├── User.js
│   ├── Payment.js
│   ├── Contact.js
│   ├── Account.js
│   ├── Category.js
│   └── ...
│
├── controllers/ (business logic)
│   ├── authController.js
│   ├── paymentController.js
│   ├── contactController.js
│   ├── accountController.js
│   ├── dashboardController.js
│   └── ...
│
├── routes/ (API endpoints)
│   ├── index.js (combines all routes)
│   ├── auth.js (/api/auth/*)
│   ├── payments.js (/api/payments/*)
│   ├── contacts.js (/api/contacts/*)
│   ├── accounts.js (/api/accounts/*)
│   └── ...
│
├── jobs/ (scheduled tasks)
│   ├── index.js (cron scheduler setup)
│   ├── missedPaymentCheck.js (daily)
│   ├── reminderCheck.js (daily)
│   ├── recurringPaymentGenerator.js (daily)
│   └── safeToSpendCalculator.js (daily)
│
├── utils/
│   ├── calculations.js (financial calculations)
│   ├── validators.js (data validation)
│   └── helpers.js (misc utilities)
│
└── migrations/
    ├── 001_create_users.sql
    ├── 002_create_accounts.sql
    ├── 003_create_contacts.sql
    ├── 004_create_payments.sql
    └── ...
```

---

## 🔄 Data Flow Example: Dashboard Load

```
1. USER: Opens browser → https://your-app.com/dashboard

2. FRONTEND (React):
   - Check if user is logged in (JWT token in localStorage)
   - If not: Redirect to /login
   - If yes: Continue
   
3. FRONTEND: componentDidMount / useEffect
   - API call: GET /api/dashboard/summary
   - Headers: { Authorization: "Bearer <token>" }

4. NGINX:
   - Receives request
   - Routes to Backend: http://backend:3001/api/dashboard/summary

5. BACKEND: auth middleware
   - Verify JWT token
   - Decode to get user_id
   - Attach user to request object

6. BACKEND: dashboardController.getSummary()
   - Query 1: Get safe-to-spend (all accounts)
     * Fetch all accounts for user
     * Calculate reserved amounts (upcoming bills)
     * Calculate safe-to-spend per account
   
   - Query 2: Get upcoming bills (next 30 days)
     * Fetch payments where:
       - user_id = current user
       - status != 'paid' or 'canceled'
       - due_date <= TODAY + 30
       - Order by due_date ASC
   
   - Query 3: Get recent activity (last 20)
     * Fetch from AUDIT_LOG where user_id = current user
     * Order by timestamp DESC
     * Limit 20
   
   - Query 4: Get alerts
     * Overdue payments (status = 'missed')
     * Bills due in next 3 days
     * Low safe-to-spend warnings

7. BACKEND: Return JSON
   {
     safeToSpend: {
       total: 5750,
       byAccount: [
         { name: "Chase Checking", amount: 1250 },
         { name: "Savings", amount: 4500 }
       ],
       reserved: 1750,
       buffer: 1000
     },
     upcomingBills: [
       { id: "...", description: "Rent", amount: 1200, dueDate: "2025-02-01", ... },
       { id: "...", description: "Electric", amount: 150, dueDate: "2025-02-03", ... }
     ],
     recentActivity: [
       { timestamp: "...", action: "Payment recorded", ... },
       { timestamp: "...", action: "Due date changed", ... }
     ],
     alerts: [
       { type: "overdue", count: 1, total: 150 },
       { type: "due_soon", count: 2, total: 1350 }
     ]
   }

8. FRONTEND: Receives response
   - Update state with data
   - Render components:
     * <SafeToSpendWidget data={safeToSpend} />
     * <UpcomingBills bills={upcomingBills} />
     * <RecentActivity items={recentActivity} />
     * <AlertsBanner alerts={alerts} />

9. USER: Sees fully loaded dashboard
```

---

## 📦 Docker Containers

```
CONTAINER: nginx (Port 80, 443)
├── Purpose: Reverse proxy & static file serving
├── Routes:
│   ├── / → Serve frontend static files
│   ├── /api/* → Proxy to backend:3001
│   └── /uploads/* → Serve uploaded files
└── Volumes: ./uploads:/uploads

CONTAINER: frontend
├── Purpose: React.js application (build time)
├── Output: Static files (HTML, JS, CSS)
└── Mounted into nginx for serving

CONTAINER: backend (Port 3001 - internal)
├── Purpose: Node.js + Express API
├── Environment:
│   ├── DATABASE_URL
│   ├── JWT_SECRET
│   ├── ENCRYPTION_KEY
│   └── ...
├── Volumes: ./uploads:/app/uploads
└── Depends on: postgres

CONTAINER: postgres (Port 5432 - internal)
├── Purpose: PostgreSQL database
├── Environment:
│   ├── POSTGRES_USER
│   ├── POSTGRES_PASSWORD
│   └── POSTGRES_DB
└── Volumes: ./db-data:/var/lib/postgresql/data (persistent)
```

---

## 📊 Key Calculations

### Safe-to-Spend Formula
```
For each account:
  upcoming_bills_total = 
    SUM(payment.original_amount - COALESCE(SUM(transaction.amount), 0))
    WHERE payment.from_account_id = account.id
      AND payment.current_due_date BETWEEN NOW() AND NOW() + interval 'X days'
      AND payment.status NOT IN ('paid', 'canceled')
      
  pending_transfers_out = 
    SUM(transfer.amount)
    WHERE transfer.from_account_id = account.id
      AND transfer.status IN ('scheduled', 'in_transit')
  
  safety_buffer = 
    IF user.buffer_type = 'fixed' THEN user.buffer_amount
    ELSE account.current_balance * (user.buffer_percentage / 100)
  
  safe_to_spend = 
    account.current_balance 
    - upcoming_bills_total 
    - pending_transfers_out 
    - safety_buffer

Total Safe to Spend = SUM(safe_to_spend) across all active accounts
```

### Current Balance (Payment)
```
current_balance = 
  payment.original_amount 
  - COALESCE(SUM(transaction.amount WHERE payment_id = payment.id), 0)
```

### Days Overdue
```
days_overdue = 
  IF payment.status = 'missed' THEN
    EXTRACT(DAY FROM NOW() - payment.current_due_date)
  ELSE 0
```

### Payment Status Auto-Update
```
AFTER INSERT ON payment_transactions:
  
  total_paid = SUM(amount) for payment_id
  
  IF total_paid = 0 THEN
    status = 'unpaid'
  ELSE IF total_paid < original_amount THEN
    status = 'partially_paid'
  ELSE IF total_paid = original_amount THEN
    status = 'paid'
    paid_date = NOW()
  ELSE IF total_paid > original_amount THEN
    status = 'overpaid'
```

---

## 🎯 Success Metrics

After deployment, measure success by:

### Technical Metrics
- ✅ Uptime: > 99% (for VPS)
- ✅ Page load time: < 2 seconds
- ✅ API response time: < 500ms average
- ✅ Database query time: < 100ms average
- ✅ Zero data loss (backup recovery tested)

### User Experience Metrics
- ✅ Can complete any task in < 3 clicks
- ✅ Dashboard loads all data in single view
- ✅ Safe-to-spend calculation is accurate
- ✅ Never miss a payment due to app failure
- ✅ Search finds results instantly

### Business Value Metrics
- ✅ Zero late payments (you see reminders in time)
- ✅ Always know safe-to-spend amount
- ✅ Complete payment history accessible
- ✅ Confidence in financial situation
- ✅ Time saved vs. manual tracking: 10+ hours/month

---

## 🚀 Deployment Checklist

Before going live:

### Pre-Deployment
- [ ] All code is committed to repository
- [ ] Environment variables configured (.env)
- [ ] Database migrations ready
- [ ] Docker Compose tested locally
- [ ] Backup strategy planned

### Deployment
- [ ] Server provisioned (VPS or home server ready)
- [ ] Docker and Docker Compose installed
- [ ] Repository cloned to server
- [ ] .env file created with production values
- [ ] Run: `docker-compose up -d`
- [ ] Check logs: `docker-compose logs`
- [ ] Access app in browser

### Post-Deployment
- [ ] Register first user account
- [ ] Change default passwords
- [ ] Test all core features
- [ ] Set up SSL certificate (Let's Encrypt)
- [ ] Configure automated backups
- [ ] Test backup restoration
- [ ] Set up monitoring (optional: Uptime Robot)
- [ ] Document server access details

### Security Hardening
- [ ] Firewall configured (only necessary ports open)
- [ ] Strong passwords for all services
- [ ] SSH key-based authentication (if VPS)
- [ ] Regular update schedule planned
- [ ] Backup encryption verified
- [ ] Access logs being recorded

---

This document provides a comprehensive technical overview. Reference it when:
- Understanding how components interact
- Debugging issues
- Planning enhancements
- Explaining the system to others

**Ready to build? Open `CLAUDE_BUILD_PROMPT.md` and copy the prompt!** 🚀


