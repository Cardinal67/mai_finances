# Personal Finance Manager - Project Plan & Outline

## 🎯 Project Overview

**Name:** Personal Finance Manager  
**Type:** Self-hosted web application (accessible from anywhere)  
**User Level:** Complete beginner - needs everything built from scratch  
**Primary Goal:** Track bills, payments, debts, due dates, and maintain financial awareness

---

## 📋 Core Problems to Solve

1. **Tracking Chaos**: Lost track of who owes what, to whom, and how much
2. **Due Date Management**: Missing payment deadlines
3. **Account Timing**: Forgetting to transfer money between accounts in advance (accounting for transfer delays)
4. **Payment Complexity**: Handling partial payments, payment plans, multiple payment methods
5. **Financial Visibility**: Not knowing how much money is "safe to spend" vs. reserved for bills
6. **Historical Records**: No organized history of payments to each person/business
7. **Recurring Complexity**: Mix of recurring (various intervals) and one-time payments

---

## 🏗️ Architecture Overview

### Technology Stack Recommendations

**Frontend:**
- React.js or Vue.js (modern, component-based)
- Tailwind CSS or Material-UI (clean, professional design)
- React Router (navigation)
- Axios (API calls)
- Chart.js or Recharts (analytics/visualizations)

**Backend:**
- Node.js + Express.js OR Python + Flask/FastAPI
- PostgreSQL database (robust, handles complex relationships)
- JWT authentication (secure login)
- Bcrypt (password hashing)
- Node-cron or APScheduler (scheduled tasks for reminders)

**Deployment (Self-hosted):**
- Docker + Docker Compose (easy setup, portable)
- Nginx (reverse proxy)
- Let's Encrypt (free SSL certificates)
- Can run on: Raspberry Pi, home server, VPS (DigitalOcean, Linode)

**Security:**
- AES-256 encryption for sensitive data
- Environment variables for secrets
- HTTPS only
- Two-factor authentication (Phase 2)

---

## 📊 Database Schema - Complete Structure

### Core Tables

#### 1. USERS
```sql
- id (primary key)
- username
- email
- password_hash
- created_at
- last_login
- settings (JSON - preferences, time zone, currency)
```

#### 2. ACCOUNTS (Bank accounts, credit cards, cash)
```sql
- id (primary key)
- user_id (foreign key)
- account_name (e.g., "Chase Checking")
- account_type (checking/savings/credit_card/cash/investment/other)
- institution_name (e.g., "Chase Bank")
- institution_phone
- institution_website
- routing_number (ENCRYPTED)
- account_number (ENCRYPTED)
- account_number_last4 (for display)
- current_balance (decimal)
- available_balance (decimal)
- reserved_for_bills (calculated)
- safe_to_spend (calculated)
- is_active (boolean)
- default_for_bills (boolean)
- transfer_time_days (integer - how long transfers take)
- notes (text)
- created_at
- updated_at
```

#### 3. CONTACTS (People/businesses you pay or receive from)
```sql
- id (primary key)
- user_id (foreign key)
- current_name
- contact_type (person/business/utility/government/other)
- email
- phone
- address
- account_number_with_them (your customer account number)
- website
- payment_portal_url
- status (active/inactive/merged)
- merged_into_contact_id (if business acquired)
- notes
- created_at
- updated_at
```

#### 4. CONTACT_NAME_HISTORY
```sql
- id (primary key)
- contact_id (foreign key)
- old_name
- new_name
- change_date
- change_reason (acquired/renamed/corrected/merged)
- old_account_number
- new_account_number
- documentation (notes)
- user_notified (boolean)
```

#### 5. CATEGORIES
```sql
- id (primary key)
- user_id (foreign key)
- name (e.g., "Utilities", "Medical")
- parent_category_id (for hierarchical categories)
- color_code (hex color for UI)
- icon
- is_active (boolean)
- sort_order
- created_at
```

#### 6. PAYMENTS (Main bill/payment records)
```sql
- id (primary key)
- user_id (foreign key)
- contact_id (foreign key)
- description
- payment_type (owed_by_me/owed_to_me)
- original_amount (decimal)
- current_balance (calculated)
- currency (default USD)
- original_due_date
- current_due_date
- is_recurring (boolean)
- recurrence_pattern (daily/weekly/biweekly/monthly/quarterly/yearly)
- recurrence_interval (integer)
- recurrence_end_date
- status (unpaid/partially_paid/paid/overpaid/scheduled/processing/failed/missed/disputed/canceled)
- priority (low/medium/high/critical)
- days_overdue (calculated)
- missed_date
- late_payment_count
- consequence_notes
- notes
- created_at
- updated_at
- paid_date
```

#### 7. PAYMENT_TRANSACTIONS (Individual payment events)
```sql
- id (primary key)
- payment_id (foreign key)
- transaction_date
- amount (decimal)
- payment_method (cash/check/bank_transfer/wire/credit_card/debit_card/venmo/paypal/zelle/cashapp/crypto/money_order/auto_pay/other)
- payment_method_detail (e.g., "Chase Credit Card", "Check #1234")
- from_account_id (foreign key to ACCOUNTS)
- to_account_id (foreign key to ACCOUNTS - for internal transfers)
- transaction_reference (confirmation number, transaction ID)
- expected_clear_date
- actual_clear_date
- status (scheduled/processing/completed/failed/canceled)
- notes
- receipt_attachment_path
- created_at
```

#### 8. PAYMENT_CATEGORIES (Many-to-many relationship)
```sql
- payment_id (foreign key)
- category_id (foreign key)
```

#### 9. PAYMENT_DATE_CHANGES
```sql
- id (primary key)
- payment_id (foreign key)
- old_due_date
- new_due_date
- changed_date
- reason (text)
- changed_by (user/system)
- fee_for_change (decimal)
```

#### 10. INTEREST_CHARGES
```sql
- id (primary key)
- payment_id (foreign key)
- interest_type (late_payment_penalty/payment_plan_interest/compounding)
- rate (decimal - percentage or fixed amount)
- calculation_method (simple/compound/daily/monthly/fixed)
- start_date
- end_date
- amount_accrued (decimal)
- last_calculated_date
- is_active (boolean)
- notes
```

#### 11. PAYMENT_PLANS
```sql
- id (primary key)
- payment_id (foreign key)
- total_amount (decimal)
- total_installments (integer)
- installment_amount (decimal)
- frequency (weekly/biweekly/monthly)
- interest_rate (decimal)
- start_date
- end_date
- is_active (boolean)
- notes
```

#### 12. INSTALLMENTS
```sql
- id (primary key)
- payment_plan_id (foreign key)
- installment_number (integer)
- amount_due (decimal)
- due_date
- status (pending/paid/missed/waived)
- paid_date
- paid_amount (decimal)
- notes
```

#### 13. ACCOUNT_TRANSFERS
```sql
- id (primary key)
- user_id (foreign key)
- from_account_id (foreign key)
- to_account_id (foreign key)
- amount (decimal)
- transfer_date
- expected_arrival_date
- actual_arrival_date
- status (scheduled/in_transit/completed/failed/canceled)
- related_payment_id (foreign key - if transfer for specific bill)
- notes
- created_at
```

#### 14. REMINDERS
```sql
- id (primary key)
- user_id (foreign key)
- payment_id (foreign key - nullable for general reminders)
- reminder_type (due_date/transfer_needed/overdue/payment_plan/custom)
- reminder_date
- days_before (integer - for relative reminders)
- message (text)
- delivery_method (email/dashboard/both)
- is_sent (boolean)
- sent_at
- is_recurring (boolean)
- created_at
```

#### 15. AUDIT_LOG (Complete activity history)
```sql
- id (primary key)
- user_id (foreign key)
- timestamp
- action_type (created/updated/deleted/paid/rescheduled/etc)
- entity_type (payment/contact/account/category/etc)
- entity_id
- field_changed
- old_value
- new_value
- changed_by (user_id or 'system')
- change_reason
- ip_address
```

#### 16. ATTACHMENTS
```sql
- id (primary key)
- user_id (foreign key)
- entity_type (payment/contact/account)
- entity_id
- file_name
- file_path
- file_type (pdf/image/doc)
- file_size
- uploaded_at
- notes
```

#### 17. SAVED_SEARCHES
```sql
- id (primary key)
- user_id (foreign key)
- search_name
- search_criteria (JSON - stores filter parameters)
- is_favorite (boolean)
- created_at
- last_used
```

---

## 🎯 Feature List by Priority

### ✅ PHASE 1: MVP (Must-Have Features)

#### Core Payment Management
- [x] Create, view, edit, delete payments/bills
- [x] Mark payments as "owed by me" or "owed to me"
- [x] Set due dates
- [x] Add payment descriptions and notes
- [x] Set payment amounts
- [x] One-time and recurring payment support
- [x] Multiple payment statuses (unpaid/partially_paid/paid/overdue/missed)

#### Partial Payment System
- [x] Record multiple transactions against one bill
- [x] Automatic balance calculation (original - paid = remaining)
- [x] Payment history showing running balance
- [x] Support multiple payment methods per transaction
- [x] Track transaction confirmation numbers

#### Contact Management
- [x] Add/edit people and businesses
- [x] Store contact information (phone, email, address)
- [x] Track account numbers with each contact
- [x] Contact name change history
- [x] Link payments to contacts
- [x] View all payments per contact

#### Account Management
- [x] Add/edit bank accounts, credit cards, cash accounts
- [x] Store account details (institution, last 4 digits)
- [x] Link payments to specific accounts
- [x] Track which account each payment comes from
- [x] Manual balance updates
- [x] Account transfer time tracking (days for money to move)

#### Safe-to-Spend Calculator
- [x] Calculate money reserved for upcoming bills
- [x] Calculate available "safe to spend" amount per account
- [x] Adjustable time horizon (next 7, 14, 30 days)
- [x] Customizable safety buffer
- [x] Real-time updates as bills are paid
- [x] Dashboard widget showing safe-to-spend total

#### Due Date Management
- [x] Reschedule payment due dates
- [x] Track due date change history
- [x] Require reason for date changes
- [x] Update related reminders automatically
- [x] Show original vs. current due date

#### Missed Payment Tracking
- [x] Auto-detect missed payments (past due date, unpaid)
- [x] Visual indicators for overdue payments
- [x] Calculate days overdue
- [x] Track missed payment count per contact
- [x] Separate "paid on time" vs. "paid late" in history

#### Calendar View
- [x] Month/week/day calendar views
- [x] Show due dates, payment dates, transfer dates
- [x] Color-coded by payment type/category/status
- [x] Click date to see all payments
- [x] Recurring payments auto-populate
- [x] Show "transfer by" dates (backwards calculation from due dates)

#### Categories & Tags
- [x] Create custom categories
- [x] Pre-defined category list (Utilities, Medical, Housing, etc.)
- [x] Assign multiple categories to one payment
- [x] Color-coding by category
- [x] Filter/sort by category

#### Search & History
- [x] Global text search (names, descriptions, notes, confirmation numbers)
- [x] Filter by date range, amount range, status, account, contact, category
- [x] Payment history view with timeline
- [x] Account activity history
- [x] Contact payment history
- [x] Complete audit log (all changes tracked)

#### Dashboard
- [x] Safe-to-spend summary (all accounts)
- [x] Upcoming bills (next 7/14/30 days)
- [x] Recent activity feed
- [x] Overdue payment alerts
- [x] Quick actions (add payment, record payment, view calendar)
- [x] Account overview with balances

#### Basic Reminders
- [x] Set reminders X days before due date
- [x] Dashboard notifications
- [x] Mark reminders as dismissed
- [x] Recurring payment reminders auto-create

#### User Authentication
- [x] User registration
- [x] Login/logout
- [x] Password hashing
- [x] Session management
- [x] Basic profile settings

---

### 🚀 PHASE 2: Important Features (Add Soon)

#### Interest & Fee Calculation
- [ ] Late fee auto-calculation (fixed or percentage)
- [ ] Payment plan interest calculation (APR-based)
- [ ] Daily interest accrual tracking
- [ ] Show interest-to-date on overdue bills
- [ ] Project future interest if not paid by date
- [ ] Manual interest entry option

#### Cost Analysis Dashboard
- [ ] Total interest/fees paid (per payment, per contact, all-time)
- [ ] "True cost" calculation (original vs. total paid)
- [ ] Most expensive debts (by total interest)
- [ ] Most frequently late payments
- [ ] Money saved by paying on time
- [ ] Pay now vs. payment plan calculator
- [ ] Interest projection graphs

#### Advanced Account Features
- [ ] Account transfers with status tracking
- [ ] Automatic transfer reminders (X days before bill due)
- [ ] Transfer-in-progress tracking
- [ ] Link transfers to specific bills
- [ ] Account balance projections

#### Payment Plans & Installments
- [ ] Create structured payment plans
- [ ] Fixed or custom installment amounts
- [ ] Auto-generate next installment when one is paid
- [ ] Track progress (payment 3 of 6)
- [ ] Alert when behind schedule
- [ ] Early payoff calculations

#### Split Payments
- [ ] Allocate one payment across multiple accounts
- [ ] Split bills among multiple people (shared expenses)
- [ ] Track who has paid their portion
- [ ] Link individual receivables to original payment

#### Advanced Search
- [ ] Saved searches (name and reuse)
- [ ] Boolean operators (AND/OR/NOT)
- [ ] Advanced filters (has attachment, has notes, etc.)
- [ ] Search result export (CSV/Excel/PDF)
- [ ] Scheduled search result emails

#### Enhanced Calendar
- [ ] Drag-and-drop to reschedule
- [ ] Add payment directly from calendar
- [ ] Export to Google Calendar / iCal
- [ ] Show running balance projection on calendar
- [ ] Highlight payday vs. bill clusters
- [ ] Potential overdraft warnings

#### Email Notifications
- [ ] Email reminders for due dates
- [ ] Missed payment alerts via email
- [ ] Weekly/monthly summary emails
- [ ] Configurable notification preferences

#### Reporting
- [ ] Spending by category (monthly, yearly)
- [ ] Payment history reports (date range)
- [ ] On-time payment rate reports
- [ ] Cash flow analysis
- [ ] Export reports to PDF/Excel

#### Enhanced Security
- [ ] Two-factor authentication
- [ ] Optional storage of full account numbers (encrypted)
- [ ] Security audit log (who accessed what when)
- [ ] Auto-logout after inactivity
- [ ] View-only mode for sensitive data

---

### 🎨 PHASE 3: Nice-to-Have Features (Future)

#### Budget Tracking
- [ ] Set budget limits per category
- [ ] Track spending vs. budget
- [ ] Budget alerts when approaching limit
- [ ] Monthly budget rollover options

#### Advanced Analytics
- [ ] Spending trends over time
- [ ] Predictive analytics (forecast future bills)
- [ ] Anomaly detection (unusual payments)
- [ ] Year-over-year comparisons
- [ ] Debt payoff projections

#### Mobile Features
- [ ] Push notifications (mobile devices)
- [ ] Mobile-responsive design (already in Phase 1)
- [ ] Progressive Web App (PWA) support
- [ ] Mobile app (React Native)

#### Receipt Management
- [ ] Photo upload for receipts
- [ ] OCR (extract bill data from receipt photos)
- [ ] Receipt storage and organization
- [ ] Link multiple receipts to one payment

#### Bank Integration
- [ ] Connect to bank accounts (Plaid API)
- [ ] Auto-sync account balances
- [ ] Auto-import transactions
- [ ] Auto-match transactions to bills
- [ ] Detect duplicate payments

#### Credit Score Monitoring
- [ ] Integrate credit score API
- [ ] Display current credit score
- [ ] Credit score history
- [ ] Alerts for credit score changes
- [ ] Track impact of on-time payments

#### Advanced Automation
- [ ] Auto-pay setup tracking
- [ ] Automatic payment recording from bank integration
- [ ] Smart suggestions (based on payment history)
- [ ] Auto-categorization of payments

#### Collaboration Features
- [ ] Shared household finances (multi-user support)
- [ ] Permission levels (admin/viewer)
- [ ] Activity feed showing who did what
- [ ] Comments on payments

#### Import/Export
- [ ] Import from CSV/Excel
- [ ] Import from other finance apps
- [ ] Full data export
- [ ] Backup/restore functionality

---

## 🎨 User Interface Design Guidelines

### Design Principles
1. **Clean & Minimal**: Not cluttered, easy to scan
2. **Color-Coded**: Red = overdue, Yellow = due soon, Green = paid, Blue = scheduled
3. **Mobile-First**: Responsive design, works on all devices
4. **Accessible**: High contrast, readable fonts, keyboard navigation
5. **Fast**: Quick loading, instant feedback on actions
6. **Intuitive**: Minimal learning curve, obvious actions

### Key UI Components

#### Dashboard Layout
```
┌─────────────────────────────────────────────────────────────┐
│  💰 Finance Manager              [Search] [User] [Settings] │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  💵 SAFE TO SPEND TODAY: $1,847.00                          │
│  (Across all accounts • Next 30 days reserved)              │
│  ⚠️ 2 bills due in next 3 days                              │
│                                                              │
├──────────────────────────┬──────────────────────────────────┤
│  📅 UPCOMING BILLS       │  📊 RECENT ACTIVITY              │
│                          │                                  │
│  TODAY                   │  ✅ Electric - Paid $150         │
│  (none)                  │     Feb 15, 10:30 AM             │
│                          │                                  │
│  NEXT 7 DAYS             │  📝 Rent - Rescheduled           │
│  🔴 Rent                 │     Due: Feb 1 → Feb 15          │
│     $1,200 • Feb 20      │                                  │
│     [Pay] [Reschedule]   │  ⚠️ Medical Bill - Overdue       │
│                          │     $500 + $12 interest          │
│  🟡 Car Payment          │                                  │
│     $400 • Feb 25        │  [View All]                      │
│     [Pay]                │                                  │
│                          │                                  │
│  [View All Bills]        │                                  │
├──────────────────────────┴──────────────────────────────────┤
│  💳 ACCOUNTS                                                │
│                                                              │
│  Chase Checking      $2,350 │ Reserved: $1,600 │ Safe: $750 │
│  Savings Account     $5,200 │ Reserved: $0     │ Safe: $5,200│
│  Cash                $97    │ Reserved: $0     │ Safe: $97   │
│                                                              │
│  [Manage Accounts] [Transfer Money]                         │
├─────────────────────────────────────────────────────────────┤
│  [+ New Payment] [Record Payment] [Calendar] [Reports]      │
└─────────────────────────────────────────────────────────────┘
```

#### Payment Detail View
```
┌─────────────────────────────────────────────────────────────┐
│  ← Back to All Payments                          [Edit] [⋮] │
├─────────────────────────────────────────────────────────────┤
│  Electric Company - February 2025             Status: PAID  │
│  Category: Utilities > Electric                             │
│                                                              │
│  Original Amount:    $350.00                                │
│  Amount Paid:        $350.00                                │
│  Remaining:          $0.00                                  │
│                                                              │
│  Due Date:           Feb 1, 2025                            │
│  Paid Date:          Feb 1, 2025 ✅ ON TIME                │
│  Account:            Chase Checking                         │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│  📋 PAYMENT HISTORY                                         │
│                                                              │
│  Feb 1, 2025 10:30 AM                            $350.00    │
│  Bank Transfer • Conf: ACH-789456                           │
│  Balance after: $0.00                                       │
│  [View Receipt]                                             │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│  🕒 TIMELINE                                                │
│                                                              │
│  ● Feb 1, 2025 10:30 AM - Payment recorded                 │
│    $350.00 via Bank Transfer                                │
│                                                              │
│  ● Jan 27, 2025 9:00 AM - Reminder sent                    │
│    "Bill due in 5 days"                                     │
│                                                              │
│  ● Jan 1, 2025 - Bill created (recurring)                  │
│    Amount: $350.00 | Due: Feb 1                             │
│                                                              │
│  [View Full History]                                        │
├─────────────────────────────────────────────────────────────┤
│  📎 Attachments (1)                                         │
│  📄 electric_bill_feb_2025.pdf                              │
│                                                              │
│  💬 Notes                                                   │
│  "Winter bill - higher than usual due to cold weather"      │
└─────────────────────────────────────────────────────────────┘
```

#### Payment Entry Form
```
┌─────────────────────────────────────────────────────────────┐
│  Add New Payment                                      [✕]   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  I owe money ⚪  /  Someone owes me ⚪                       │
│                                                              │
│  Contact *                                                   │
│  [Select contact ▼]  [+ New Contact]                        │
│                                                              │
│  Description *                                               │
│  [                                              ]            │
│                                                              │
│  Amount *                   Currency                         │
│  [$                   ]     [USD ▼]                         │
│                                                              │
│  Due Date *                                                  │
│  [📅 MM/DD/YYYY      ]                                      │
│                                                              │
│  Category                                                    │
│  [Select category ▼]  [+ New Category]                      │
│                                                              │
│  Account (where payment comes from)                          │
│  [Select account ▼]                                         │
│                                                              │
│  Priority                                                    │
│  ⚪ Low  ⚪ Medium  ⚪ High  ⚪ Critical                      │
│                                                              │
│  ☑ This is a recurring payment                             │
│    Frequency: [Monthly ▼]  Every [1] [month(s)]            │
│    Ends: ⚪ Never  ⚪ After [12] occurrences  ⚪ On date     │
│                                                              │
│  ☑ Set reminders                                           │
│    Remind me [7] days before due date                       │
│    Also remind me [3] days before (for account transfer)    │
│                                                              │
│  Notes                                                       │
│  [                                              ]            │
│  [                                              ]            │
│                                                              │
│  📎 Attach files (optional)                                 │
│  [Drop files here or click to upload]                       │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                             [Cancel]  [Save Payment]        │
└─────────────────────────────────────────────────────────────┘
```

#### Record Payment Modal (Partial Payment)
```
┌─────────────────────────────────────────────────────────────┐
│  Record Payment                                       [✕]   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Rent - February 2025                                       │
│  Total Amount: $1,200.00                                    │
│  Already Paid: $0.00                                        │
│  Remaining:    $1,200.00                                    │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Payment Amount *                                            │
│  ⚪ Pay remaining balance ($1,200.00)                       │
│  ⚪ Pay partial amount: [$           ]                      │
│  ⚪ Pay different amount (overpayment): [$           ]      │
│                                                              │
│  Payment Date *                                              │
│  [📅 Today ▼]                                               │
│                                                              │
│  Payment Method *                                            │
│  [Bank Transfer ▼]                                          │
│                                                              │
│  From Account *                                              │
│  [Chase Checking ▼]                                         │
│                                                              │
│  Confirmation / Transaction Number                           │
│  [                                              ]            │
│                                                              │
│  Notes                                                       │
│  [                                              ]            │
│                                                              │
│  📎 Attach receipt (optional)                               │
│  [Drop file here or click to upload]                        │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│  After this payment:                                        │
│  Remaining balance will be: $0.00                           │
│  Status will change to: PAID                                │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                           [Cancel]  [Record Payment]        │
└─────────────────────────────────────────────────────────────┘
```

---

## ⚠️ Security Considerations & Warnings

### Critical Security Requirements

1. **Data Encryption**
   - ✅ Encrypt routing numbers and full account numbers (AES-256)
   - ✅ Encrypt passwords (bcrypt with salt)
   - ✅ Encrypt sensitive fields at rest in database
   - ✅ Use HTTPS only (SSL/TLS certificates)
   - ✅ Never log sensitive data in plain text

2. **Access Control**
   - ✅ Strong password requirements (min 12 chars, complexity)
   - ✅ Session management with secure cookies
   - ✅ Auto-logout after inactivity (30 minutes)
   - ⚠️ Two-factor authentication (Phase 2)
   - ✅ Rate limiting on login attempts
   - ✅ Audit logging for sensitive data access

3. **Data Storage**
   - ⚠️ **OPTION A:** Store full account/routing numbers (encrypted)
     - Pros: Convenient reference, can copy when needed
     - Cons: Higher risk if database breached, compliance concerns
   - ⚠️ **OPTION B:** Store last 4 digits only + bank name
     - Pros: Much safer, minimal liability
     - Cons: Need to look up full numbers elsewhere
   - **RECOMMENDATION:** Start with Option B (safer), add Option A in Phase 2 with enhanced security

4. **Backup Security**
   - ✅ Encrypt all backups
   - ✅ Store backups in secure location (not publicly accessible)
   - ✅ Test restore procedures regularly
   - ⚠️ Never email or share backups unencrypted

5. **Self-Hosting Risks**
   - ⚠️ Home network security is critical
   - ⚠️ Keep server software updated (OS, database, application)
   - ⚠️ Firewall configuration essential
   - ⚠️ Consider VPN access instead of public exposure
   - ⚠️ Physical security of server (locked location)
   - ⚠️ Power backup (UPS) to prevent data corruption

6. **Compliance & Legal**
   - ⚠️ Storing financial data may have legal implications
   - ⚠️ Consult local laws regarding data storage
   - ⚠️ Consider liability insurance if storing sensitive data
   - ⚠️ Have a breach response plan
   - ⚠️ Document your security practices

### Security Best Practices for Self-Hosting

1. **Use Docker with non-root users**
2. **Regular security updates (automated if possible)**
3. **Strong firewall rules (only expose necessary ports)**
4. **Fail2ban or similar (block repeated failed login attempts)**
5. **Regular automated backups to separate location**
6. **Monitor logs for suspicious activity**
7. **Use environment variables for all secrets (never hardcode)**
8. **Disable directory listing on web server**
9. **Set up HTTPS with Let's Encrypt**
10. **Consider VPN (Tailscale, WireGuard) for remote access**

---

## 🚀 Deployment Guide (Self-Hosted Options)

### Option 1: Docker + Docker Compose (RECOMMENDED)

**Pros:**
- Easy setup and updates
- Portable across systems
- Isolated environment
- Consistent across dev/prod

**What you'll run:**
```
docker-compose up -d
```

**Includes:**
- Frontend container
- Backend container
- PostgreSQL database container
- Nginx reverse proxy container

**Hardware Requirements:**
- 2GB+ RAM
- 20GB+ storage
- Stable internet connection

**Can run on:**
- Raspberry Pi 4 (4GB+ RAM)
- Old laptop/desktop
- VPS (DigitalOcean, Linode, Vultr)
- NAS (Synology, QNAP)

### Option 2: Traditional Installation

**Pros:**
- No Docker knowledge needed
- Direct control

**Cons:**
- More complex setup
- Harder to update
- System dependencies

### Recommended Hosting Platforms

1. **Home Server (Raspberry Pi / Old PC)**
   - Cost: Hardware only (~$100-$200 one-time)
   - Pros: Full control, no monthly fees, data stays home
   - Cons: Need to manage, power costs, internet dependency
   - Access: Set up Dynamic DNS + Port forwarding OR use VPN

2. **VPS (Virtual Private Server)**
   - Cost: $5-10/month (DigitalOcean, Linode, Vultr)
   - Pros: Always online, fast, reliable, easy access from anywhere
   - Cons: Monthly cost, data not physically with you
   - Easiest for beginners wanting "access from anywhere"

3. **NAS Device** (if you already have one)
   - Cost: None (if you already own it)
   - Pros: Already running 24/7, good for backups
   - Cons: May have limited resources

### Remote Access Options

**Option A: Traditional (Port Forwarding + Dynamic DNS)**
- Pros: Direct access
- Cons: Exposes your home IP, security risk
- ⚠️ Not recommended for financial data

**Option B: VPN (Tailscale / WireGuard / OpenVPN)**
- Pros: Secure, encrypted, no port forwarding
- Cons: Need VPN client on devices
- ✅ Recommended for home hosting

**Option C: Cloudflare Tunnel**
- Pros: No port forwarding, free, easy setup
- Cons: Relies on Cloudflare service
- ✅ Good option

**Option D: VPS Hosting**
- Pros: Already has public IP, no home network issues
- Cons: Monthly cost
- ✅ Easiest for "access from anywhere"

---

## 📱 Additional Features & Considerations

### Things You Asked About - Status Check ✅

| Feature | Addressed? | Phase | Notes |
|---------|-----------|-------|-------|
| Partial payments | ✅ Yes | Phase 1 | Full transaction history per bill |
| Payment types/methods | ✅ Yes | Phase 1 | Cash, check, bank transfer, etc. |
| Payment tracking | ✅ Yes | Phase 1 | Complete transaction log with confirmations |
| Multiple payment types | ✅ Yes | Phase 1 | Track method per transaction |
| Missed payments | ✅ Yes | Phase 1 | Auto-detection, tracking, history |
| Payment date changes | ✅ Yes | Phase 1 | Full change history with reasons |
| Interest from missed payments | ✅ Yes | Phase 2 | Auto-calculation, projections |
| Interest accountability | ✅ Yes | Phase 2 | Cost analysis, total interest paid |
| Cost analysis | ✅ Yes | Phase 2 | True cost tracking, savings analysis |
| Which account (from/to) | ✅ Yes | Phase 1 | Track source account per payment |
| History for everything | ✅ Yes | Phase 1 | Complete audit log, timeline views |
| Categories | ✅ Yes | Phase 1 | Hierarchical, customizable, color-coded |
| Searchable | ✅ Yes | Phase 1 | Global search, filters, saved searches |
| Safe-to-spend calculator | ✅ Yes | Phase 1 | Per account and total, with reserves |
| Built-in calendar | ✅ Yes | Phase 1 | Month/week/day views, color-coded |
| Bank account names | ✅ Yes | Phase 1 | Full account management |
| Routing/account numbers | ✅ Yes | Phase 1 | Encrypted storage (optional) |
| Business name changes | ✅ Yes | Phase 1 | Full change history, merged contacts |
| Credit score | ✅ Yes | Phase 3 | Via API integration (later) |

### What's NOT Included (Intentionally)

1. **Automatic bill pay** - You'll record payments manually (safer for MVP)
2. **Bank account sync** - Manual entry for Phase 1 (bank integration in Phase 3)
3. **Investment tracking** - Focused on bills/debts only
4. **Tax calculations** - Out of scope
5. **Multi-currency advanced features** - Basic support only
6. **Cryptocurrency tracking** - Payment method yes, asset tracking no
7. **Lending/borrowing contract templates** - Just payment tracking

---

## 📋 Questions to Answer Before Building

### User Preferences

1. **Primary Use Case Priority:**
   - [ ] Tracking bills I need to pay (most important)
   - [ ] Tracking money owed to me (most important)
   - [ ] Both equally important
   
2. **Payment Frequency:**
   - How many bills/payments per month? ______
   - How many are recurring? ______
   - How many are one-time? ______

3. **Account Complexity:**
   - How many bank accounts do you have? ______
   - Do you frequently transfer money between accounts? Yes / No
   - Do transfers usually take 1 day, 2-3 days, or longer? ______

4. **Interest & Fees:**
   - Do you often pay late fees? Yes / No
   - Do you have payment plans with interest? Yes / No
   - Is interest calculation critical for Phase 1? Yes / No
   
5. **Security Comfort Level:**
   - Store full account numbers (encrypted)? Yes / No / Maybe Later
   - Comfortable with self-hosting on home network? Yes / No
   - Prefer VPS hosting ($5-10/month)? Yes / No
   
6. **Technical Skill Level:**
   - Comfortable with command line? Yes / No
   - Experience with Docker? Yes / No
   - Want one-command installation? Yes / No

7. **Shared Use:**
   - Will anyone else use this app (spouse, family)? Yes / No
   - Need separate logins or shared account? ______

8. **Safe-to-Spend Settings:**
   - Preferred safety buffer amount? $______ or ______%
   - Look ahead period (days for upcoming bills)? 7 / 14 / 30 / Custom: ______

---

## 🎯 Next Steps to Get This Built

### Step 1: Answer the Questions Above
Clarify your preferences so the implementation matches your needs.

### Step 2: Choose Hosting Approach
- **Easiest:** VPS hosting (DigitalOcean) - $5-10/month
- **Most Control:** Home server with VPN access
- **Budget:** Raspberry Pi at home

### Step 3: Use the Prompt Below
Copy the detailed prompt to give Claude for building the application.

---


