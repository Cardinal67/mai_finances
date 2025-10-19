# Build Prompt for Personal Finance Manager

Copy this prompt and give it to Claude in a fresh conversation to build your app.

---

## THE PROMPT

I need you to build a complete self-hosted web application for personal finance and bill management. I know nothing about web development, so please build everything from scratch with clear setup instructions.

### Application Overview

**Name:** Personal Finance Manager  
**Type:** Full-stack web application (frontend + backend)  
**Deployment:** Self-hosted via Docker Compose (single-command setup)  
**User:** Single user initially (can expand to multi-user later)

### Core Purpose

I'm terrible at managing my finances. I need an app to:
1. Track all bills and payments (who I owe, who owes me, amounts, due dates)
2. Track all income sources (paychecks, freelance, rental income, etc.) - multiple streams
3. Manage partial payments and payment histories
4. Tell me how much money is "safe to spend" (after reserving for upcoming bills)
5. Plan spending with what-if scenarios ("If I buy this, how much will I have left before my next paycheck?")
6. Remind me about due dates and when to transfer money between accounts (accounting for transfer delays)
7. Track payment methods, accounts, and transaction confirmations
8. Handle both recurring and one-time payments (bills AND income)
9. Provide complete history and search capabilities
10. Flexible date range viewing (see what's coming in next 7/14/30/60/90 days or custom range)
11. Full timezone support (I may travel or move)
12. Customizable interface (show/hide widgets, adjust display, personalize experience)

### Technology Requirements

**Frontend:**
- React.js with functional components and hooks
- Tailwind CSS for styling (clean, modern, professional design)
- React Router for navigation
- Axios for API calls
- Chart.js or Recharts for analytics (Phase 2)
- Mobile-responsive design (works perfectly on phone, tablet, desktop)

**Backend:**
- Node.js + Express.js
- PostgreSQL database
- JWT authentication
- Bcrypt for password hashing
- node-cron for scheduled tasks (reminders)
- Express Validator for input validation

**Deployment:**
- Docker + Docker Compose setup
- Nginx reverse proxy (included in Docker Compose)
- PostgreSQL container
- Let's Encrypt ready (SSL certificate instructions)
- Environment variables for configuration
- Single command to start: `docker-compose up -d`

**Security:**
- AES-256 encryption for sensitive data (routing numbers, account numbers)
- Password hashing with bcrypt
- JWT tokens for authentication
- HTTPS only in production
- Input sanitization and validation
- SQL injection prevention (use parameterized queries)
- XSS prevention
- CORS configuration

### Database Schema

Please implement these tables with proper relationships, indexes, and constraints:

#### USERS
- id (primary key, UUID)
- username (unique)
- email (unique)
- password_hash
- created_at (timestamp)
- last_login (timestamp)
- settings (JSONB - timezone, currency, preferences)

#### ACCOUNTS (Bank accounts, credit cards, cash)
- id (primary key, UUID)
- user_id (foreign key → USERS)
- account_name (e.g., "Chase Checking")
- account_type (enum: checking, savings, credit_card, cash, investment, other)
- institution_name
- institution_phone
- institution_website
- routing_number (encrypted)
- account_number (encrypted)
- account_number_last4 (for display)
- current_balance (decimal)
- available_balance (decimal)
- is_active (boolean)
- default_for_bills (boolean)
- transfer_time_days (integer, default 2)
- notes (text)
- created_at
- updated_at

#### CONTACTS (People/businesses)
- id (primary key, UUID)
- user_id (foreign key → USERS)
- current_name
- contact_type (enum: person, business, utility, government, other)
- email
- phone
- address
- account_number_with_them (customer account number)
- website
- payment_portal_url
- status (enum: active, inactive, merged)
- merged_into_contact_id (foreign key → CONTACTS, nullable)
- notes (text)
- created_at
- updated_at

#### CONTACT_NAME_HISTORY
- id (primary key, UUID)
- contact_id (foreign key → CONTACTS)
- old_name
- new_name
- change_date (timestamp)
- change_reason (text)
- old_account_number
- new_account_number
- documentation (text)
- user_notified (boolean)

#### CATEGORIES
- id (primary key, UUID)
- user_id (foreign key → USERS)
- name
- parent_category_id (foreign key → CATEGORIES, nullable, for hierarchical)
- color_code (hex color)
- icon (text)
- is_active (boolean)
- sort_order (integer)
- created_at

#### PAYMENTS (Main bill/payment records)
- id (primary key, UUID)
- user_id (foreign key → USERS)
- contact_id (foreign key → CONTACTS)
- description
- payment_type (enum: owed_by_me, owed_to_me)
- original_amount (decimal)
- currency (default 'USD')
- original_due_date (date)
- current_due_date (date)
- is_recurring (boolean)
- recurrence_pattern (enum: daily, weekly, biweekly, monthly, quarterly, yearly, custom)
- recurrence_interval (integer, nullable)
- recurrence_end_date (date, nullable)
- status (enum: unpaid, partially_paid, paid, overpaid, scheduled, processing, failed, missed, disputed, canceled)
- priority (enum: low, medium, high, critical)
- missed_date (timestamp, nullable)
- late_payment_count (integer, default 0)
- consequence_notes (text, nullable)
- notes (text)
- created_at
- updated_at
- paid_date (timestamp, nullable)

#### PAYMENT_TRANSACTIONS (Individual payment events)
- id (primary key, UUID)
- payment_id (foreign key → PAYMENTS)
- transaction_date (timestamp)
- amount (decimal)
- payment_method (enum: cash, check, bank_transfer, wire, credit_card, debit_card, venmo, paypal, zelle, cashapp, crypto, money_order, auto_pay, other)
- payment_method_detail (text, e.g., "Check #1234")
- from_account_id (foreign key → ACCOUNTS, nullable)
- to_account_id (foreign key → ACCOUNTS, nullable)
- transaction_reference (text, confirmation number)
- expected_clear_date (date, nullable)
- actual_clear_date (date, nullable)
- status (enum: scheduled, processing, completed, failed, canceled)
- notes (text)
- receipt_attachment_path (text, nullable)
- created_at

#### PAYMENT_CATEGORIES (Many-to-many)
- payment_id (foreign key → PAYMENTS)
- category_id (foreign key → CATEGORIES)
- Primary key: (payment_id, category_id)

#### PAYMENT_DATE_CHANGES
- id (primary key, UUID)
- payment_id (foreign key → PAYMENTS)
- old_due_date (date)
- new_due_date (date)
- changed_date (timestamp)
- reason (text)
- changed_by (text: 'user' or 'system')
- fee_for_change (decimal, nullable)

#### ACCOUNT_TRANSFERS
- id (primary key, UUID)
- user_id (foreign key → USERS)
- from_account_id (foreign key → ACCOUNTS)
- to_account_id (foreign key → ACCOUNTS)
- amount (decimal)
- transfer_date (date)
- expected_arrival_date (date)
- actual_arrival_date (date, nullable)
- status (enum: scheduled, in_transit, completed, failed, canceled)
- related_payment_id (foreign key → PAYMENTS, nullable)
- notes (text)
- created_at

#### REMINDERS
- id (primary key, UUID)
- user_id (foreign key → USERS)
- payment_id (foreign key → PAYMENTS, nullable)
- reminder_type (enum: due_date, transfer_needed, overdue, payment_plan, custom)
- reminder_date (date)
- days_before (integer, nullable)
- message (text)
- delivery_method (enum: email, dashboard, both)
- is_sent (boolean)
- sent_at (timestamp, nullable)
- is_recurring (boolean)
- created_at

#### AUDIT_LOG (Complete activity history)
- id (primary key, UUID)
- user_id (foreign key → USERS)
- timestamp (timestamp)
- action_type (text)
- entity_type (text)
- entity_id (UUID, nullable)
- field_changed (text, nullable)
- old_value (text, nullable)
- new_value (text, nullable)
- changed_by (text)
- change_reason (text, nullable)
- ip_address (text, nullable)

#### ATTACHMENTS
- id (primary key, UUID)
- user_id (foreign key → USERS)
- entity_type (text)
- entity_id (UUID)
- file_name
- file_path
- file_type
- file_size (bigint)
- uploaded_at (timestamp)
- notes (text)

#### SAVED_SEARCHES
- id (primary key, UUID)
- user_id (foreign key → USERS)
- search_name
- search_criteria (JSONB)
- is_favorite (boolean)
- created_at
- last_used (timestamp, nullable)

#### INCOME_STREAMS (Track income sources and paychecks)
- id (primary key, UUID)
- user_id (foreign key → USERS)
- source_name (e.g., "Primary Job", "Freelance", "Rental Income")
- source_type (enum: salary, wages, freelance, business, rental, investment, gift, other)
- amount (decimal - amount per payment)
- is_variable (boolean - true if amount varies each time)
- to_account_id (foreign key → ACCOUNTS - which account receives it)
- is_recurring (boolean)
- recurrence_pattern (enum: daily, weekly, biweekly, monthly, quarterly, yearly, custom)
- recurrence_interval (integer, nullable)
- next_expected_date (date)
- recurrence_end_date (date, nullable)
- tax_withholding (decimal, nullable)
- notes (text)
- is_active (boolean)
- created_at
- updated_at

#### INCOME_TRANSACTIONS (Individual income receipts)
- id (primary key, UUID)
- income_stream_id (foreign key → INCOME_STREAMS)
- received_date (timestamp)
- amount (decimal)
- to_account_id (foreign key → ACCOUNTS)
- confirmation_number (text, nullable)
- notes (text, nullable)
- created_at

#### SPENDING_PLANS (What-if scenarios and planned purchases)
- id (primary key, UUID)
- user_id (foreign key → USERS)
- plan_name (text - e.g., "New Laptop Purchase")
- planned_amount (decimal)
- planned_date (date, nullable)
- from_account_id (foreign key → ACCOUNTS, nullable)
- category_id (foreign key → CATEGORIES, nullable)
- status (enum: planned, completed, cancelled)
- notes (text, nullable)
- created_at
- completed_at (timestamp, nullable)

#### USER_PREFERENCES (Detailed user settings beyond basic USERS.settings)
- id (primary key, UUID)
- user_id (foreign key → USERS)
- timezone (text - e.g., "America/New_York")
- date_range_preference (integer - default days to look ahead: 7/14/30/60/90)
- safety_buffer_type (enum: fixed, percentage)
- safety_buffer_amount (decimal)
- default_currency (text - default "USD")
- dashboard_widgets (JSONB - which widgets to show/hide, order)
- table_columns (JSONB - which columns to show in tables)
- display_density (enum: compact, comfortable, spacious)
- theme (enum: light, dark, auto)
- notification_preferences (JSONB)
- created_at
- updated_at

### Phase 1 Features (MVP - Build This Now)

#### 1. User Authentication
- Registration (username, email, password)
- Login/logout
- Session management with JWT
- Basic profile page (view/edit email, change password)

#### 2. Dashboard

- **Global Date Range Selector** (Top of dashboard):
  - Quick toggle buttons: [7 days] [14 days] [30 days] [60 days] [90 days] [Custom]
  - Custom opens date picker for any range
  - Affects: Upcoming bills, upcoming income, safe-to-spend calculation
  - Saves user's preference
  - Shows current selection prominently

- **Timezone Display** (Top right):
  - Shows current timezone (e.g., "EST 3:42 PM")
  - Click to change timezone temporarily
  - All dates/times displayed in user's selected timezone
  - Stored in user preferences

- **Safe-to-Spend Widget**: Show total "safe to spend" amount across all accounts
  - Calculate: Current Balance - Reserved for Upcoming Bills - Pending Transfers - Safety Buffer + Expected Income (optional toggle)
  - Allow user to configure: time horizon (uses global date range), safety buffer amount/percentage
  - Display breakdown per account
  - Option to include/exclude upcoming income in calculation
  - Color indicator: Green (plenty), Yellow (caution), Red (negative/need action)
  
- **What-If Spending Calculator Widget**: Plan purchases
  - Input field: "Amount to spend: $____"
  - Optional: From which account? [dropdown]
  - Optional: Planned date: [date picker]
  - Shows results:
    * Current safe-to-spend: $X
    * After this purchase: $Y
    * Remaining until next income: $Z
    * Next income: [Date] (+$Amount from [Source])
    * Balance after upcoming bills: $W
  - Warning indicators:
    * ⚠️ "This would put you below your safety buffer"
    * ⚠️ "You won't have enough for [Bill Name] due [Date]"
    * 💡 "Suggestion: Wait until [Date] (next paycheck)"
  - Option to save as "Planned Purchase" for tracking
  - Quick action: [What if I spend more?] opens scenarios page

- **Upcoming Bills Section**: Show bills due in selected date range
  - Group by: Today, Tomorrow, Next 3 Days, Next 7 Days, This Month, Later
  - Color-code: Red (overdue), Orange (due today/tomorrow), Yellow (due soon), Green (paid), Blue (scheduled)
  - Show: Contact name, amount, due date, status, from account
  - Quick actions: [Pay Now] [Reschedule] [View Details]
  - Summary: "X bills due in next [range] totaling $Y"
  - Filter options: [All] [Unpaid Only] [By Account] [By Category]

- **Upcoming Income Section**: Show expected income in selected date range
  - List all income sources with next expected date
  - Show: Source name, amount, expected date, to account, confidence level (fixed/variable)
  - Variable income shows estimate with indicator
  - Color-code: Green (confirmed received), Blue (expected), Gray (overdue - should have received)
  - Quick actions: [Mark as Received] [Adjust Amount] [View Details]
  - Summary: "Expecting $X from Y sources in next [range]"
  - Highlight: "Next income: [Date] - [Source] (+$Amount)"

- **Recent Activity Feed**: Last 10-20 activities
  - Payments recorded
  - Income received
  - Due dates changed
  - Bills created/updated
  - Missed payment alerts
  - Planned purchases added/completed
  - Interest accrued notices (Phase 2)
  - Filter: [All] [Bills] [Income] [Plans]

- **Accounts Overview**: Show all accounts with balances
  - Display: Account name, total balance, reserved amount, expected income, safe-to-spend amount
  - Visual progress bar showing allocation
  - Quick actions: [Manage Accounts] [Transfer Money] [Update Balance]
  - Expandable details per account

- **Alert Section**: Show warnings and notifications
  - Overdue payments
  - Bills due in next 3 days
  - Expected income not received (overdue)
  - Interest accruing on overdue bills (Phase 2)
  - Low safe-to-spend balance
  - Failed payments
  - Planned purchases approaching date
  - Transfer reminders (X days before bill due)

- **Dashboard Customization** (Options menu - gear icon):
  - Show/hide any widget
  - Reorder widgets (drag and drop)
  - Resize widgets (small/medium/large)
  - Save layout per user
  - Reset to default layout
  - Export/import layout settings

#### 3. Payment Management (CRUD)
- **Create Payment**:
  - Form fields: Contact, Description, Amount, Currency, Due Date, Payment Type (owed by me/to me), Category, From Account, Priority, Notes
  - Recurring payment setup: Frequency (daily/weekly/monthly/etc.), Interval, End date or number of occurrences
  - Reminder configuration: Days before due date
  - File attachment support (receipts, bills)
  
- **View Payment Details**:
  - Show all payment info
  - Payment history (all transactions)
  - Timeline of all changes
  - Remaining balance (original - paid)
  - Related reminders
  - Attachments
  - Quick actions: [Record Payment] [Edit] [Delete] [Mark as Paid] [Reschedule]

- **Edit Payment**: Update any field, log changes in audit_log

- **Delete Payment**: Soft delete or hard delete (ask for confirmation)

- **List Payments**:
  - Table view with columns: Contact, Description, Amount, Due Date, Status, Actions
  - Filters: Status, Date range, Contact, Category, Account, Amount range
  - Sort: Due date, Amount, Status, Created date
  - Pagination: 25/50/100 per page
  - Bulk actions: Mark multiple as paid, Delete selected, Export to CSV

#### 4. Partial Payment System
- **Record Payment Modal**:
  - Options: Pay remaining balance / Pay partial amount / Pay different amount
  - Fields: Payment date, Amount, Payment method, From account, Confirmation number, Notes, Receipt upload
  - Show: Current balance, Amount being paid, Remaining after this payment
  - Automatically update payment status: unpaid → partially_paid → paid

- **Payment Transaction History**:
  - Display all transactions for a payment
  - Show: Date, Amount, Method, Confirmation #, Running balance
  - Allow viewing/downloading receipts
  - Total paid to date

#### 5. Income Management (Track Multiple Income Streams)

- **Create/Edit Income Source**:
  - Form fields: Source name, Type (salary/wages/freelance/business/rental/investment/gift/other), Amount
  - Is variable income? (checkbox - if checked, amount is estimate)
  - To Account (which account receives this income)
  - Recurring settings: Frequency (weekly/biweekly/monthly/quarterly/yearly), Interval, Next expected date, End date
  - Tax withholding amount (optional, for tracking)
  - Notes
  - File attachment support (contracts, agreements)

- **View Income Source Details**:
  - Show all source info
  - Income history (all received payments from this source)
  - Next expected income date and amount
  - Year-to-date totals
  - Average income amount (if variable)
  - Reliability indicator (on-time percentage)
  - Quick actions: [Mark as Received] [Edit Source] [Delete] [View History]

- **Mark Income as Received**:
  - Modal opens when marking income received
  - Fields: Received date (default today), Actual amount (prefilled with expected), To account, Confirmation number, Notes
  - Creates INCOME_TRANSACTION record
  - Updates account balance (optional auto-update or manual)
  - Auto-generates next expected income if recurring
  - Logs in activity feed

- **Income List Page**:
  - Table view: Source name, Type, Amount, Frequency, Next expected, Account, Status, Actions
  - Filters: Active/Inactive, Type, Account, Recurring/One-time
  - Sort: Next expected date, Amount, Source name, Created date
  - Summary card: Total expected income (next 30 days), Number of sources, YTD total received
  - Quick action: [+ Add Income Source]

- **Income History View** (per source):
  - Timeline of all received income from this source
  - Show: Date received, Amount, Confirmation, Account, Running YTD total
  - Compare expected vs. actual amounts
  - Flag any late or missing income
  - Export to CSV

- **Recurring Income Auto-Generation** (scheduled job):
  - Daily cron job checks for income sources where next expected date is approaching
  - Creates reminder/notification (on dashboard)
  - After marked as received, auto-generates next expected income entry
  - Handles biweekly, monthly, quarterly, yearly patterns
  - Updates next_expected_date in INCOME_STREAMS

- **Income Dashboard Widget** (already in Dashboard section):
  - Shows next X days of expected income
  - Quick mark-as-received action
  - Alerts for overdue income (expected but not received)

#### 6. Contact Management
- **Create/Edit Contact**:
  - Form: Name, Type, Email, Phone, Address, Account number, Website, Payment portal URL, Notes
  
- **Contact Detail View**:
  - Display contact info
  - All payments to/from this contact (filterable, sortable)
  - Summary stats: Total paid (all time), Average payment, On-time payment rate, Number of missed payments
  - Name change history
  - Quick action: [Add Payment to This Contact]

- **Contact Name Change**:
  - Update contact name with reason
  - Log in CONTACT_NAME_HISTORY
  - Option to merge with another contact
  - Update all future recurring payments

- **Contact List**:
  - Display all contacts
  - Filter: Active/Inactive, Type
  - Sort: Name, Created date, Last payment date
  - Search: Name, email, phone

#### 6. Account Management
- **Create/Edit Account**:
  - Form: Name, Type, Institution, Balance, Last 4 digits, Transfer time (days), Is active, Default for bills, Notes
  - Optional (encrypted): Full account number, Routing number
  - SECURITY: If storing full numbers, show warning about encryption and security

- **Account Detail View**:
  - Display account info (never show full account number, only last 4)
  - Current balance, Available balance, Reserved for bills, Safe to spend
  - Recent transactions from this account
  - Option to [Edit Balance] [View Sensitive Info - with confirmation]

- **Account List**: Show all accounts with key stats

- **Account Balance Calculator** (automatic):
  - Reserved for Bills = Sum of upcoming bills due within X days (user configurable) assigned to this account
  - Safe to Spend = Current Balance - Reserved - Safety Buffer - Pending Outgoing Transfers

#### 7. Safe-to-Spend Calculator
- **Settings Page**:
  - Time horizon: Radio buttons (7 days / 14 days / 30 days / Custom: ___ days)
  - Safety buffer: Fixed amount ($___) or Percentage of balance (___%)
  - Apply per account or globally

- **Dashboard Display**:
  - Large widget showing total safe-to-spend
  - Breakdown per account (expandable)
  - Visual indicator: Green (plenty), Yellow (caution), Red (negative - need to transfer or reschedule)

- **Calculation Logic** (backend):
  ```
  For each account:
    upcoming_bills = SUM(payment.original_amount - SUM(transaction.amount)) 
                     WHERE payment.from_account_id = account.id
                     AND payment.current_due_date <= TODAY + time_horizon_days
                     AND payment.status NOT IN ('paid', 'canceled')
    
    pending_transfers_out = SUM(transfer.amount)
                            WHERE transfer.from_account_id = account.id
                            AND transfer.status IN ('scheduled', 'in_transit')
    
    safety_buffer = Calculate based on user settings (fixed or percentage)
    
    safe_to_spend = account.current_balance - upcoming_bills - pending_transfers_out - safety_buffer
  
  Total safe to spend = SUM(safe_to_spend across all active accounts)
  ```

#### 8. Missed Payment Tracking
- **Automatic Detection** (scheduled job, runs daily):
  - Check for payments where: status = 'unpaid' AND current_due_date < TODAY
  - Update status to 'missed'
  - Set missed_date = TODAY
  - Increment late_payment_count
  - Create alert on dashboard

- **Manual Recovery**:
  - User can record payment for missed bill
  - System marks as "paid late"
  - Keep record in history that it was missed

- **Display**:
  - Red warning indicator on dashboard
  - "Days Overdue" calculation
  - Alert: "You have X overdue payments totaling $Y"

#### 9. Payment Date Rescheduling
- **Reschedule Feature**:
  - Button on payment detail page: [Reschedule]
  - Modal: New due date picker, Reason (required text field), Fee for change (optional)
  - Log change in PAYMENT_DATE_CHANGES table
  - Update payment.current_due_date
  - Update related reminders automatically
  - Log in AUDIT_LOG

- **Change History Display**:
  - Show on payment detail page
  - Timeline: "Due date changed from X to Y on [date] - Reason: [reason]"

#### 10. Categories & Tags
- **Pre-populated Categories** (seed data):
  - Housing (Rent, Mortgage, HOA)
  - Utilities (Electric, Gas, Water, Internet, Phone)
  - Transportation (Car Payment, Insurance, Gas, Maintenance)
  - Medical (Doctor, Dentist, Pharmacy, Insurance)
  - Credit Cards
  - Subscriptions (Streaming, Software, Memberships)
  - Food & Dining
  - Personal Loans
  - Business Expenses
  - Other

- **Category Management**:
  - User can create/edit/delete custom categories
  - Assign color codes and icons
  - Hierarchical support (parent → child)
  - Assign multiple categories to one payment

- **Category Filtering**:
  - Filter payments by category
  - Color-code payments in lists/calendar

#### 11. Calendar View
- **Month View**:
  - Calendar grid showing days of month
  - Dots/badges on dates with bills due
  - Color-coded by status: Red (overdue), Orange (due today), Yellow (due soon), Green (paid), Blue (scheduled)
  - Click date to see all payments on that day

- **Week View**: Horizontal timeline showing week with payments

- **Day View**: List of all payments on selected day

- **Interactive Features**:
  - Click payment on calendar to view details
  - Navigate: Previous/Next month, Today button
  - Filter calendar: By account, category, contact, status

- **Additional Calendar Elements**:
  - Show "Transfer by" dates (calculate backwards from due date based on account.transfer_time_days)
  - Show payday markers (Phase 2 - income tracking)

#### 12. Search & History
- **Global Search Bar** (top of every page):
  - Search across: Payment descriptions, Contact names, Notes, Transaction confirmations, Amounts
  - Real-time suggestions as you type
  - Press Enter to see full results page

- **Advanced Search Page**:
  - Filters: 
    - Text search (description, notes, confirmation)
    - Date range (due date, payment date, created date)
    - Amount range (min/max)
    - Status (checkboxes: unpaid, partial, paid, overdue, etc.)
    - Payment type (owed by me / owed to me)
    - Contact (dropdown)
    - Category (dropdown)
    - Account (dropdown)
    - Payment method (dropdown)
    - Has attachment (checkbox)
    - Has notes (checkbox)
  - Search results: Table with sortable columns
  - Export results to CSV

- **Payment History View** (on payment detail page):
  - Timeline showing all activities:
    - Payment created
    - Transactions recorded
    - Due date changes
    - Status changes
    - Notes added
    - Attachments uploaded
    - Reminders sent
  - Each entry shows: Timestamp, Action, Details, User who did it

- **Complete Audit Log** (admin page):
  - View all activities across entire system
  - Useful for debugging and accountability

#### 13. Recurring Payments
- **Setup**:
  - When creating/editing payment, checkbox: "This is a recurring payment"
  - Fields: Frequency dropdown (daily/weekly/biweekly/monthly/quarterly/yearly/custom)
  - Interval: Every [X] [period]
  - Ends: Never / After [X] occurrences / On specific date

- **Auto-Generation** (scheduled job, runs daily):
  - Check recurring payments where next occurrence is due to be created
  - Create new payment record with:
    - Same contact, description, amount, category, account
    - Due date = last_due_date + recurrence_interval
    - Status = 'unpaid'
    - Link to original recurring payment template

- **Management**:
  - "View Series" button on recurring payments
  - Show all past and future occurrences
  - Option to edit future occurrences only or entire series
  - Option to stop recurrence

#### 14. Reminders
- **Automatic Reminder Creation**:
  - When payment is created, create reminder records based on user preference
  - Default: 7 days before, 3 days before, day of

- **Reminder Display**:
  - Dashboard: "Upcoming Reminders" section
  - Show: Payment name, Due date, Days until due, Action buttons

- **Reminder Delivery** (scheduled job):
  - Run daily at configured time (e.g., 9 AM)
  - Check for reminders where reminder_date = TODAY and is_sent = false
  - Display on dashboard (Phase 1)
  - Send email (Phase 2)
  - Mark as sent

- **User Reminder Settings** (in Settings page):
  - Default reminder times (e.g., 7 days, 3 days, 1 day before)
  - Reminder delivery method (dashboard only for Phase 1)

#### 15. File Attachments
- **Upload Support**:
  - When creating/editing payment or recording transaction
  - "Attach file" button: Click to upload or drag-and-drop
  - Supported types: PDF, JPG, PNG, GIF (images), DOC, DOCX
  - Max file size: 10MB per file
  - Store in: `uploads/[user_id]/[entity_type]/[entity_id]/[filename]`
  - Save metadata in ATTACHMENTS table

- **Viewing Attachments**:
  - Display thumbnail/icon on payment detail page
  - Click to view/download
  - Option to delete

- **Security**:
  - Only allow user to access their own files
  - Validate file types
  - Sanitize filenames

#### 16. User Preferences & Customization (Complete Interface Control)

- **General Settings Page** (`/settings`):
  
  **Account Settings:**
  - Change email
  - Change password
  - Change username
  - Delete account (with confirmation)
  
  **Regional Settings:**
  - Timezone selector (dropdown with search)
    * Auto-detect from browser (default)
    * Manual selection from all timezones
    * Show current local time
    * Option to temporarily change (for travel)
    * All dates/times throughout app display in selected timezone
  - Currency (default USD, but allow others)
  - Date format (MM/DD/YYYY, DD/MM/YYYY, YYYY-MM-DD)
  - Time format (12-hour, 24-hour)
  - First day of week (Sunday/Monday)
  
  **Financial Preferences:**
  - Default date range for upcoming views (7/14/30/60/90 days or custom)
  - Safety buffer type (fixed amount or percentage)
  - Safety buffer amount ($ or %)
  - Include expected income in safe-to-spend? (Yes/No toggle)
  - Low balance threshold (alert when safe-to-spend below $X)
  - Default payment method
  - Default account for bills
  
  **Dashboard Customization:**
  - Widget visibility (show/hide each widget):
    * Safe-to-spend calculator
    * What-if spending planner
    * Upcoming bills
    * Upcoming income
    * Recent activity
    * Accounts overview
    * Alerts
    * Quick actions
  - Widget order (drag and drop to reorder)
  - Widget size (small/medium/large for each)
  - Save as default layout
  - Reset to system default
  - Export layout (JSON)
  - Import layout (JSON)
  
  **Display Preferences:**
  - Display density:
    * Compact (more content, less spacing)
    * Comfortable (balanced - default)
    * Spacious (more spacing, less content per screen)
  - Theme:
    * Light mode (default)
    * Dark mode
    * Auto (follows system preference)
  - Font size (Small/Medium/Large)
  - Color scheme preference (accent color picker)
  
  **Table/List Preferences:**
  - Default rows per page (10/25/50/100)
  - Column visibility per page type:
    * Payments list (show/hide: description, amount, due date, status, account, category, etc.)
    * Income list (show/hide: source, amount, next expected, account, type, etc.)
    * Contacts list (show/hide: name, type, email, phone, last payment, etc.)
  - Default sort preference (per list type)
  - Default filter (e.g., show only unpaid bills by default)
  - Save column widths
  
  **Calendar Preferences:**
  - Default view (Month/Week/Day)
  - Color coding preference (by status, by category, by account)
  - Show amounts on calendar (Yes/No)
  - Show only unpaid bills (Yes/No)
  - Include income on calendar (Yes/No)
  
  **Notification Preferences:**
  - Dashboard alerts:
    * Show overdue payments (Yes/No)
    * Show bills due soon (Yes/No + how many days)
    * Show low balance warnings (Yes/No)
    * Show expected income not received (Yes/No)
    * Show planned purchases approaching (Yes/No)
  - Email notifications (Phase 2):
    * Enable/disable
    * Notification types
    * Frequency
  - Reminder settings:
    * Default days before bill due (e.g., 7, 3, 1)
    * Reminder time (e.g., 9:00 AM)
    * Days before to remind about transfers (based on account transfer time)
  
  **Data & Privacy:**
  - Export all data (JSON/CSV)
  - Download backup
  - View audit log (all changes you've made)
  - Clear cache
  - Delete old data (payments/income older than X years)
  
  **Advanced:**
  - Enable experimental features (Phase 2+)
  - Debug mode (show additional info for troubleshooting)
  - API access (Phase 2 - generate API key for external tools)

- **Quick Settings** (accessible from top right menu):
  - Timezone quick switch
  - Date range quick change
  - Theme toggle (light/dark)
  - Display density toggle

- **Contextual Settings** (options menus throughout app):
  - Each page has ⚙️ icon for page-specific settings
  - Examples:
    * Payment list: Column visibility, default filters
    * Calendar: View type, color scheme
    * Dashboard: Widget management
  
- **Settings Persistence**:
  - All settings saved to USER_PREFERENCES table
  - Synced across devices (stored server-side)
  - Settings backup included in data export
  - Settings can be reset to defaults

- **First-Time Setup Wizard** (optional, on first login):
  - Welcome screen
  - Set timezone
  - Set currency and date format
  - Configure safety buffer
  - Choose default date range
  - Select theme
  - Dashboard layout quick-pick (presets: Minimal, Balanced, Detailed)
  - Skip option available

### User Interface Requirements

#### Design Guidelines
- **Clean & Professional**: Modern, not cluttered
- **Mobile-Responsive**: Must work perfectly on phone, tablet, desktop
- **Color Scheme**: 
  - Primary: Blue (#3B82F6)
  - Success: Green (#10B981)
  - Warning: Yellow/Orange (#F59E0B)
  - Danger: Red (#EF4444)
  - Neutral: Gray shades
- **Typography**: System fonts, readable (16px base, 14px for small text)
- **Spacing**: Generous padding/margins, not cramped
- **Icons**: Use Heroicons or similar (consistent icon set)
- **Loading States**: Show spinners during data fetch
- **Error Handling**: Clear error messages, validation feedback
- **Confirmation Dialogs**: For destructive actions (delete, etc.)

#### Key Pages & Routes

1. **Public Routes**:
   - `/login` - Login page
   - `/register` - Registration page

2. **Protected Routes** (require authentication):
   - `/dashboard` - Main dashboard
   - `/payments` - All payments list
   - `/payments/new` - Create payment
   - `/payments/:id` - Payment detail
   - `/payments/:id/edit` - Edit payment
   - `/contacts` - All contacts list
   - `/contacts/new` - Create contact
   - `/contacts/:id` - Contact detail
   - `/contacts/:id/edit` - Edit contact
   - `/accounts` - All accounts list
   - `/accounts/new` - Create account
   - `/accounts/:id` - Account detail
   - `/accounts/:id/edit` - Edit account
   - `/calendar` - Calendar view
   - `/search` - Advanced search
   - `/categories` - Manage categories
   - `/settings` - User settings
   - `/profile` - User profile

#### Component Structure Examples

**Dashboard Layout**:
```
<Dashboard>
  <Header /> (logo, search bar, user menu)
  <SafeToSpendWidget />
  <AlertsBanner /> (if any warnings)
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    <UpcomingBillsCard />
    <RecentActivityCard />
  </div>
  <AccountsOverview />
  <QuickActions />
</Dashboard>
```

**Payment List**:
```
<PaymentList>
  <PageHeader title="All Payments" />
  <FilterBar /> (status, date range, contact, etc.)
  <PaymentTable data={payments} onRowClick={goToDetail} />
  <Pagination />
</PaymentList>
```

**Payment Detail**:
```
<PaymentDetail paymentId={id}>
  <PageHeader title={payment.description} backLink="/payments" />
  <PaymentSummaryCard /> (amount, status, due date, etc.)
  <PaymentHistorySection /> (all transactions)
  <TimelineSection /> (all changes)
  <AttachmentsSection />
  <NotesSection />
  <ActionButtons /> (Edit, Delete, Record Payment, Reschedule)
</PaymentDetail>
```

### API Endpoints (RESTful)

#### Authentication
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - Login (returns JWT)
- POST `/api/auth/logout` - Logout
- GET `/api/auth/me` - Get current user info

#### Payments
- GET `/api/payments` - List all payments (with filters, pagination)
- POST `/api/payments` - Create new payment
- GET `/api/payments/:id` - Get payment details
- PUT `/api/payments/:id` - Update payment
- DELETE `/api/payments/:id` - Delete payment
- POST `/api/payments/:id/transactions` - Record a payment transaction
- GET `/api/payments/:id/transactions` - Get all transactions for payment
- PUT `/api/payments/:id/reschedule` - Reschedule due date
- GET `/api/payments/:id/history` - Get change history

#### Contacts
- GET `/api/contacts` - List all contacts
- POST `/api/contacts` - Create contact
- GET `/api/contacts/:id` - Get contact details
- PUT `/api/contacts/:id` - Update contact
- DELETE `/api/contacts/:id` - Delete contact
- GET `/api/contacts/:id/payments` - Get all payments for contact
- PUT `/api/contacts/:id/rename` - Rename contact (logs history)

#### Accounts
- GET `/api/accounts` - List all accounts
- POST `/api/accounts` - Create account
- GET `/api/accounts/:id` - Get account details
- PUT `/api/accounts/:id` - Update account
- DELETE `/api/accounts/:id` - Delete account
- GET `/api/accounts/:id/transactions` - Get transactions from account
- GET `/api/accounts/:id/safe-to-spend` - Calculate safe-to-spend for account

#### Categories
- GET `/api/categories` - List all categories
- POST `/api/categories` - Create category
- PUT `/api/categories/:id` - Update category
- DELETE `/api/categories/:id` - Delete category

#### Dashboard
- GET `/api/dashboard/summary` - Get dashboard data (safe-to-spend, upcoming bills, recent activity, alerts)

#### Calendar
- GET `/api/calendar?month=YYYY-MM` - Get payments for calendar month

#### Search
- GET `/api/search?q=query&filters...` - Global search

#### Transfers (Phase 2)
- GET `/api/transfers` - List transfers
- POST `/api/transfers` - Create transfer
- PUT `/api/transfers/:id` - Update transfer status

#### Income Streams
- GET `/api/income` - List all income sources (with filters, pagination)
- POST `/api/income` - Create new income source
- GET `/api/income/:id` - Get income source details
- PUT `/api/income/:id` - Update income source
- DELETE `/api/income/:id` - Delete income source
- POST `/api/income/:id/receive` - Mark income as received (creates transaction)
- GET `/api/income/:id/transactions` - Get all transactions for income source
- GET `/api/income/:id/history` - Get income history
- GET `/api/income/upcoming` - Get upcoming expected income (with date range)
- GET `/api/income/stats` - Get income statistics (YTD, averages, etc.)

#### Spending Plans
- GET `/api/spending-plans` - List all spending plans
- POST `/api/spending-plans` - Create new spending plan (save what-if scenario)
- GET `/api/spending-plans/:id` - Get spending plan details
- PUT `/api/spending-plans/:id` - Update spending plan
- DELETE `/api/spending-plans/:id` - Delete spending plan
- POST `/api/spending-plans/:id/complete` - Mark plan as completed
- POST `/api/spending-plans/calculate` - Calculate what-if scenario (doesn't save)

#### User Preferences
- GET `/api/preferences` - Get all user preferences
- PUT `/api/preferences` - Update preferences (full or partial)
- GET `/api/preferences/dashboard-layout` - Get dashboard layout
- PUT `/api/preferences/dashboard-layout` - Update dashboard layout
- POST `/api/preferences/reset` - Reset to defaults
- GET `/api/preferences/export` - Export preferences as JSON
- POST `/api/preferences/import` - Import preferences from JSON

#### Settings
- GET `/api/settings` - Get user settings
- PUT `/api/settings` - Update settings

### Scheduled Jobs (node-cron)

Implement these background jobs:

1. **Daily Missed Payment Check** (runs at 1:00 AM):
   - Check for payments where current_due_date < TODAY and status = 'unpaid'
   - Update status to 'missed', set missed_date, increment late_payment_count
   - Create dashboard alert for overdue payments

2. **Daily Expected Income Check** (runs at 1:15 AM):
   - Check for income streams where next_expected_date < TODAY and not marked as received
   - Flag as overdue/late income
   - Create dashboard alert for missing income
   - Track reliability score for income sources

3. **Daily Reminder Check** (runs at 9:00 AM, user's timezone):
   - Find reminders where reminder_date = TODAY and is_sent = false
   - Mark as sent (for dashboard display)
   - Create reminder for income expected today
   - Create reminder for bills due today
   - Later: Send emails

4. **Daily Recurring Payment Generation** (runs at 2:00 AM):
   - Find recurring payments where next occurrence should be created
   - Create new payment records
   - Respect user's timezone for due dates

5. **Daily Recurring Income Generation** (runs at 2:15 AM):
   - Find recurring income streams where next occurrence is approaching
   - Update next_expected_date for tracking
   - Create income reminders (on dashboard)
   - Handle biweekly, monthly, quarterly, yearly patterns

6. **Daily Safe-to-Spend Calculation** (runs at 3:00 AM):
   - Recalculate safe_to_spend for all accounts
   - Factor in upcoming bills (based on user's date range preference)
   - Optionally factor in expected income (based on user preference)
   - Cache results for fast dashboard loading
   - Flag accounts with negative safe-to-spend
   - Generate low balance alerts

7. **Daily Timezone Updates** (runs at midnight UTC):
   - Handle daylight saving time changes
   - Update all scheduled job times based on user timezones
   - Log timezone transitions for audit

8. **Weekly Spending Plan Review** (runs Sunday at 8:00 AM, user's timezone):
   - Check spending plans with planned dates in upcoming week
   - Create reminders for planned purchases
   - Flag plans that might conflict with bills

### Setup & Installation Requirements

Please provide:

1. **Docker Compose Configuration** (`docker-compose.yml`):
   - Frontend container (React app served by Nginx)
   - Backend container (Node.js + Express)
   - PostgreSQL container (with persistent volume)
   - Nginx reverse proxy (routes to frontend/backend)
   - Volume mounts for uploads, database data
   - Environment variable configuration

2. **Environment Variables** (`.env.example`):
   ```
   # Database
   POSTGRES_USER=financeapp
   POSTGRES_PASSWORD=changeme
   POSTGRES_DB=finance_manager
   DATABASE_URL=postgresql://financeapp:changeme@postgres:5432/finance_manager
   
   # Backend
   NODE_ENV=production
   PORT=3001
   JWT_SECRET=changeme_generate_random_string
   JWT_EXPIRES_IN=7d
   ENCRYPTION_KEY=changeme_32_character_key_for_aes256
   
   # Frontend
   REACT_APP_API_URL=http://localhost:3001/api
   
   # File Upload
   MAX_FILE_SIZE=10485760
   UPLOAD_DIR=/app/uploads
   
   # App Settings
   DEFAULT_CURRENCY=USD
   DEFAULT_TIME_HORIZON_DAYS=30
   DEFAULT_SAFETY_BUFFER=100
   ```

3. **README.md** with:
   - Project overview
   - Prerequisites (Docker, Docker Compose)
   - Installation steps:
     ```bash
     # Clone repo
     # Copy .env.example to .env and configure
     # Run: docker-compose up -d
     # Access at: http://localhost
     ```
   - Default login credentials (if you seed a default user)
   - How to backup database
   - How to update app
   - Troubleshooting section

4. **Database Migrations**:
   - Use a migration tool (e.g., node-pg-migrate, Sequelize migrations, or TypeORM migrations)
   - Provide migration files to create all tables
   - Seed script for default categories

5. **File Structure**:
   ```
   /
   ├── docker-compose.yml
   ├── .env.example
   ├── README.md
   ├── backend/
   │   ├── Dockerfile
   │   ├── package.json
   │   ├── src/
   │   │   ├── server.js (main entry point)
   │   │   ├── config/
   │   │   │   ├── database.js
   │   │   │   ├── encryption.js
   │   │   │   └── jwt.js
   │   │   ├── middleware/
   │   │   │   ├── auth.js
   │   │   │   ├── errorHandler.js
   │   │   │   └── validation.js
   │   │   ├── models/ (database models/queries)
   │   │   ├── routes/ (API routes)
   │   │   ├── controllers/ (business logic)
   │   │   ├── jobs/ (cron jobs)
   │   │   └── utils/ (helper functions)
   │   └── migrations/
   ├── frontend/
   │   ├── Dockerfile
   │   ├── package.json
   │   ├── public/
   │   ├── src/
   │   │   ├── App.js
   │   │   ├── index.js
   │   │   ├── components/ (reusable UI components)
   │   │   ├── pages/ (page components)
   │   │   ├── context/ (React context for state)
   │   │   ├── hooks/ (custom hooks)
   │   │   ├── services/ (API calls)
   │   │   ├── utils/ (helper functions)
   │   │   └── styles/ (Tailwind config, global styles)
   │   └── tailwind.config.js
   └── nginx/
       ├── Dockerfile
       └── nginx.conf
   ```

### Security Implementation Details

1. **Password Hashing**:
   ```javascript
   const bcrypt = require('bcrypt');
   const saltRounds = 12;
   const hashedPassword = await bcrypt.hash(password, saltRounds);
   ```

2. **JWT Tokens**:
   ```javascript
   const jwt = require('jsonwebtoken');
   const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
     expiresIn: process.env.JWT_EXPIRES_IN
   });
   ```

3. **Sensitive Data Encryption** (account numbers, routing numbers):
   ```javascript
   const crypto = require('crypto');
   const algorithm = 'aes-256-cbc';
   const key = Buffer.from(process.env.ENCRYPTION_KEY, 'utf8'); // Must be 32 bytes
   
   function encrypt(text) {
     const iv = crypto.randomBytes(16);
     const cipher = crypto.createCipheriv(algorithm, key, iv);
     let encrypted = cipher.update(text, 'utf8', 'hex');
     encrypted += cipher.final('hex');
     return iv.toString('hex') + ':' + encrypted;
   }
   
   function decrypt(text) {
     const parts = text.split(':');
     const iv = Buffer.from(parts[0], 'hex');
     const encryptedText = parts[1];
     const decipher = crypto.createDecipheriv(algorithm, key, iv);
     let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
     decrypted += decipher.final('utf8');
     return decrypted;
   }
   ```

4. **Input Validation** (use express-validator):
   ```javascript
   const { body, validationResult } = require('express-validator');
   
   // Example route with validation
   router.post('/payments',
     authenticate,
     [
       body('description').trim().notEmpty().isLength({ max: 255 }),
       body('original_amount').isDecimal(),
       body('contact_id').isUUID(),
       // ... more validations
     ],
     (req, res) => {
       const errors = validationResult(req);
       if (!errors.isEmpty()) {
         return res.status(400).json({ errors: errors.array() });
       }
       // Process request...
     }
   );
   ```

5. **SQL Injection Prevention**:
   - Use parameterized queries ALWAYS
   - Example with node-postgres:
     ```javascript
     const result = await pool.query(
       'SELECT * FROM payments WHERE user_id = $1 AND id = $2',
       [userId, paymentId]
     );
     ```

### Additional Requirements

1. **Error Handling**:
   - Centralized error handler middleware
   - Meaningful error messages (don't expose internals)
   - Log errors to console/file for debugging
   - Return appropriate HTTP status codes

2. **Logging**:
   - Log important actions (login, payment created, etc.)
   - Use Winston or similar logging library
   - Different log levels (info, warning, error)
   - Don't log sensitive data (passwords, full account numbers)

3. **Testing** (Phase 2, but prepare structure):
   - Set up test framework (Jest for both frontend/backend)
   - Example test files (even if not comprehensive)

4. **Performance**:
   - Database indexes on frequently queried fields (user_id, contact_id, due_date, status)
   - Pagination for large lists
   - Cache dashboard calculations
   - Optimize database queries (avoid N+1 queries)

5. **Documentation**:
   - API documentation (comments or Swagger)
   - Code comments for complex logic
   - Component documentation (prop types)

### What I Don't Need Right Now

- Bank account integration (Plaid) - Phase 3
- Email sending - Phase 2
- Two-factor authentication - Phase 2
- Interest calculations - Phase 2
- Cost analysis dashboard - Phase 2
- Advanced analytics/charts - Phase 2
- Mobile app (React Native) - Phase 3
- OCR for receipts - Phase 3
- Credit score integration - Phase 3

### Success Criteria

The application is complete when:
1. ✅ I can run `docker-compose up -d` and access the app at `http://localhost`
2. ✅ I can register an account and login
3. ✅ I can create contacts, accounts, and categories
4. ✅ I can create both one-time and recurring payments
5. ✅ I can record partial payments and see running balance
6. ✅ Dashboard shows my safe-to-spend amount accurately
7. ✅ Dashboard shows upcoming bills grouped by urgency
8. ✅ I can reschedule due dates with reason tracking
9. ✅ Overdue payments are automatically detected and flagged
10. ✅ Calendar view shows all my payments color-coded by status
11. ✅ Search works across all payments, contacts, and notes
12. ✅ Complete history is tracked for every change
13. ✅ Mobile-responsive and works perfectly on phone
14. ✅ File attachments work (upload, view, download)
15. ✅ Sensitive data (account numbers) is encrypted in database
16. ✅ Income tracking works (can add sources, mark as received)
17. ✅ What-if spending calculator shows impact of purchases
18. ✅ Date range selector works and affects all relevant views
19. ✅ Timezone setting works (all dates display in user's timezone)
20. ✅ Customization options work (dashboard layout, table columns, theme, etc.)

### Building in Cursor - Context Window Strategy

**You are being run in Cursor**, which has excellent context window management. Here's how to handle this build:

**Approach: Build Everything with Smart Progress Tracking**

Since Cursor can handle large builds well and automatically manages context:

1. **Build in logical order**:
   - Start with database migrations (all tables)
   - Then backend structure (server, auth, middleware)
   - Then core API routes (payments, contacts, accounts)
   - Then new features (income, spending plans, preferences)
   - Then frontend structure (routing, auth, context)
   - Then core pages (dashboard, payments, income)
   - Then remaining pages (calendar, search, settings)
   - Finally Docker configuration and documentation

2. **Create a PROGRESS.md file** to track what's completed:
   ```markdown
   # Build Progress
   
   ## Completed
   - [x] Database migrations
   - [x] Backend authentication
   - [x] Payment API routes
   - [ ] Income API routes (in progress)
   
   ## Pending
   - [ ] Spending calculator
   - [ ] Frontend dashboard
   ...
   
   ## Current Status
   Working on: Income API implementation
   Next: Spending plans API
   ```

3. **If you need to split work across multiple responses**:
   - Complete one logical unit (e.g., all database migrations)
   - Update PROGRESS.md
   - State clearly: "Completed X, resuming with Y in next response"
   - Continue seamlessly

4. **Priority order if time/space constrained**:
   - ✅ Database schema (all 21 tables - MUST BE COMPLETE)
   - ✅ Backend auth & core infrastructure
   - ✅ Payment management API (CRUD + transactions)
   - ✅ Income management API (CRUD + tracking)
   - ✅ Account management API
   - ✅ Contact management API
   - ✅ Dashboard API with calculations
   - ✅ Spending calculator logic
   - ✅ Preferences API
   - ✅ Frontend core (auth, routing, API layer)
   - ✅ Dashboard UI (with all widgets)
   - ✅ Payment management UI
   - ✅ Income management UI
   - ✅ Settings/Preferences UI
   - ✅ Scheduled jobs (all 8 jobs)
   - ✅ Calendar, search, other pages
   - ✅ Docker configuration
   - ✅ README and setup docs

5. **Code quality expectations**:
   - Production-ready code (not prototypes)
   - Proper error handling throughout
   - Input validation on all endpoints
   - Security best practices (encryption, sanitization, parameterized queries)
   - Responsive UI that works on mobile
   - Clean, maintainable, well-commented code

6. **Testing reminders**:
   - Include example API calls in comments
   - Provide seed data for testing
   - Document any assumptions made

7. **If you complete everything**:
   - Review PROGRESS.md and mark all items complete
   - Provide final summary of what was built
   - List file count and structure
   - Highlight any deviations from spec (with reasons)
   - Provide clear "next steps" for deployment

**Notes for Cursor:**
- This is a large build (~70 files, 6000-8000 lines of code)
- Estimated completion: Can be done in one session with Cursor's context management
- Feel free to work through it systematically
- Update PROGRESS.md as you go so we can track if anything is interrupted

### Deliverables

Please provide:
1. Complete source code with file structure as specified
2. Docker Compose configuration
3. Comprehensive README with setup instructions
4. .env.example file
5. Database migrations/seed files
6. Brief explanation of key architectural decisions
7. Any known limitations or future improvement suggestions

### Questions for Me (if any)

Before starting, ask me if you need clarification on:
- Specific UI preferences or design references
- Any features that aren't clear
- Trade-offs between approaches
- Anything else that might affect implementation

---

## ADDITIONAL NOTES

- Build this as a production-ready application, not a quick prototype
- Write clean, maintainable, well-commented code
- Follow best practices for React (hooks, functional components) and Node.js
- Make it beginner-friendly to run (clear instructions, good error messages)
- Prioritize security given the sensitive financial data
- Make the UI intuitive (I'm not tech-savvy for finance apps)

Thank you!


