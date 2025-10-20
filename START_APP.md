# 🚀 Start Your Finance Manager App

## Quick Start Guide

### Prerequisites
- ✅ Node.js installed
- ✅ PostgreSQL installed and running
- ✅ Database created (`finance_manager`)
- ✅ Backend dependencies installed
- ✅ Frontend dependencies installed

---

## Start Backend (Terminal 1)

```powershell
cd backend
.\start.ps1
```

**Expected output:**
```
🚀 Personal Finance Manager API
📡 Server running on port 3001
✅ Database connected successfully
📅 All scheduled jobs initialized successfully!
✨ Ready to accept requests!
```

**Backend URL:** http://localhost:3001

---

## Start Frontend (Terminal 2)

```powershell
cd frontend
npm start
```

**Expected output:**
```
Compiled successfully!
You can now view personal-finance-manager-frontend in the browser.
Local: http://localhost:3000
```

**Frontend URL:** http://localhost:3000

---

## First Time Setup

### 1. Register Your Account
- Go to http://localhost:3000
- You'll be redirected to login
- Click "**Don't have an account? Register**"
- Fill in:
  - Username (min 3 characters)
  - Email
  - Password (min 8 characters, must have uppercase, lowercase, number)
  - Confirm Password
- Click "**Create account**"
- You'll be automatically logged in!

### 2. Set Up Your Accounts
- Go to **Accounts** (🏦)
- Click "**+ New Account**"
- Add your bank accounts (checking, savings, etc.)
- Enter current balance
- Save

### 3. Add Contacts
- Go to **Contacts** (👥)
- Click "**+ New Contact**"
- Add people/businesses you pay or receive money from
- Examples: Electric Company, Landlord, Employer
- Save

### 4. Add Payments
- Go to **Payments** (💰)
- Click "**+ New Payment**"
- Select contact
- Enter description, amount, due date
- Choose type (I Owe / Owed to Me)
- Save

### 5. Add Income Sources
- Go to **Income** (💵)
- Click "**+ New Income Source**"
- Enter source name (e.g., "Monthly Salary")
- Select type (salary, freelance, etc.)
- Set amount
- Choose if recurring
- Save

### 6. Configure Settings
- Go to **Settings** (⚙️)
- Set your timezone
- Set default currency
- Configure safety buffer
- Set date range preference
- Save

---

## Using the App

### Dashboard 📊
- View your financial summary
- See safe-to-spend amount
- Check upcoming bills
- Check upcoming income
- Use **what-if calculator** to plan purchases
- Adjust date range (7, 14, 30, 60, 90 days)

### Payments 💰
- Track bills you owe
- Track money owed to you
- Record partial payments
- See payment status
- Edit/delete payments

### Income 💵
- Track salary/wages
- Track freelance income
- Track business income
- Set up recurring income
- Mark as received

### Accounts 🏦
- View all your accounts
- See total balance
- See available balance
- Add/edit/delete accounts
- Track account types

### Contacts 👥
- Manage people/businesses
- Store contact information
- See payment count
- Edit/delete contacts

### Calendar 📅
- See all upcoming events
- View payments, income, reminders
- Adjust date range
- Color-coded events

### Spending Plans 🎯
- Plan future purchases
- Track planned spending
- Mark as completed
- Organize by category

### Settings ⚙️
- Change timezone
- Change currency
- Set safety buffer
- Adjust date range
- Choose theme
- Configure preferences

---

## Tips & Tricks

### Safe-to-Spend Calculator
The dashboard shows your "Safe to Spend" amount:
```
Safe to Spend = Available Balance - Upcoming Bills - Safety Buffer + Expected Income
```

### What-If Calculator
Before making a purchase:
1. Enter the amount you're thinking of spending
2. Click "Calculate"
3. See how it affects your safe-to-spend
4. Make an informed decision!

### Date Range
Adjust the date range to see:
- **7 days** - This week only
- **14 days** - Next two weeks
- **30 days** - Next month (default)
- **60 days** - Next two months
- **90 days** - Next quarter

### Safety Buffer
Set a safety buffer to always keep a cushion:
- **Fixed Amount** - e.g., Always keep $500
- **Percentage** - e.g., Always keep 10% of balance

---

## Troubleshooting

### Backend won't start
```powershell
# Check if PostgreSQL is running
Get-Service | Where-Object {$_.Name -like '*postgre*'}

# Check if port 3001 is in use
Get-NetTCPConnection -LocalPort 3001

# Check database connection
# Make sure .env file has correct DATABASE_URL
```

### Frontend won't start
```powershell
# Clear npm cache
npm cache clean --force

# Reinstall dependencies
Remove-Item node_modules -Recurse -Force
npm install

# Check if port 3000 is in use
Get-NetTCPConnection -LocalPort 3000
```

### Can't login
- Check backend is running (http://localhost:3001/health should respond)
- Check browser console for errors (F12)
- Clear browser cache and cookies
- Try different browser

### API errors
- Check backend console for error messages
- Verify `.env` file has correct settings
- Check database is running and accessible
- Verify migrations ran successfully

---

## 🎉 You're Ready!

Your personal finance manager is fully functional and ready to help you:
- ✅ Track all your bills
- ✅ Monitor income streams
- ✅ Calculate safe-to-spend
- ✅ Plan future purchases
- ✅ Never miss a payment
- ✅ Stay on top of your finances!

**Enjoy your new finance manager!** 💰📊

