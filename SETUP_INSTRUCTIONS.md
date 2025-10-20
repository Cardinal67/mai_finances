# Setup Instructions - Personal Finance Manager

## 🚨 URGENT: Fix "Route not found" Error

The backend server needs configuration. Follow these steps:

### Step 1: Create `.env` file

Create a file named `.env` in the **root directory** with this content:

```env
# Backend Configuration
PORT=3001
DATABASE_URL="postgresql://postgres:password@localhost:5432/finance_manager"
JWT_SECRET="your_jwt_secret_key_change_this_in_production"
ENCRYPTION_KEY="change_this_to_32_char_key_now!!"

# Frontend Configuration
REACT_APP_API_BASE_URL=http://localhost:3001/api

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Docker Configuration (for Nginx)
NGINX_HOST_HTTP_PORT=80
NGINX_HOST_HTTPS_PORT=443
```

**⚠️ IMPORTANT:** Change `JWT_SECRET` and `ENCRYPTION_KEY` to random secure values!

### Step 2: Install Dependencies

```powershell
cd backend
npm install
```

### Step 3: Setup Database

Make sure PostgreSQL is running, then create the database:

```powershell
# In psql or pgAdmin
CREATE DATABASE finance_manager;
```

### Step 4: Run Migrations

```powershell
# Still in backend directory
npm run migrate
```

### Step 5: Start the Server

```powershell
# Still in backend directory
npm run dev
```

### Step 6: Test the Auth Endpoint

The `/api/auth/register` endpoint should now work!

Test with curl or Postman:

```bash
POST http://localhost:3001/api/auth/register
Content-Type: application/json

{
  "username": "testuser",
  "email": "test@example.com",
  "password": "Test1234"
}
```

---

## What's Been Built So Far

✅ **Database Schema (21 tables)**
- All migration files created
- Includes: Users, Payments, Income, Accounts, Contacts, Categories, etc.

✅ **Backend Core**
- Express server setup
- Database connection
- JWT authentication
- Password hashing (bcrypt)
- Data encryption (AES-256)
- Input validation

✅ **Authentication API**
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - Login
- GET `/api/auth/profile` - Get user profile
- PUT `/api/auth/profile` - Update profile

---

## Next Steps (Auto-continuing)

I'm continuing to build:
1. ✅ Auth system (DONE)
2. 🔄 Payments API (NEXT)
3. 🔄 Income API
4. 🔄 Accounts API
5. 🔄 Dashboard API
6. ... and 40+ more endpoints

Progress is being tracked in `PROGRESS.md`!

