# 🚀 Quick Setup - Run This Now!

## Step 1: Create `.env` file

**Create a file named `.env` in the project root** with this content:

```env
PORT=3001
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/finance_manager
JWT_SECRET=your_super_secret_jwt_key_change_in_production_min_32_chars
ENCRYPTION_KEY=exactly_32_character_key_here!!
CORS_ORIGIN=http://localhost:3000
REACT_APP_API_BASE_URL=http://localhost:3001/api
```

**⚠️ IMPORTANT:** If your PostgreSQL password is different, update the `DATABASE_URL` accordingly!

## Step 2: Create the Database

Open **pgAdmin** or **SQL Shell (psql)** and run:

```sql
CREATE DATABASE finance_manager;
```

Or from command line (if psql is in PATH):
```bash
psql -U postgres -c "CREATE DATABASE finance_manager;"
```

## Step 3: Run Migrations

```bash
cd backend
npm run migrate
```

You should see:
```
✅ Completed: 021_create_interest_charges.sql
🎉 Migration summary:
   ✅ Executed: 21
```

## Step 4: Start the Server

```bash
npm run dev
```

You should see:
```
🚀 Personal Finance Manager API
📡 Server running on port 3001
✅ Database connected successfully
📅 Active schedules initialized
```

## Step 5: Test It!

In another terminal:
```bash
curl http://localhost:3001/health
```

Should return:
```json
{
  "success": true,
  "message": "Personal Finance Manager API is running",
  "version": "1.0.0-dev"
}
```

## Step 6: Register a User

```bash
curl -X POST http://localhost:3001/api/auth/register -H "Content-Type: application/json" -d "{\"username\":\"testuser\",\"email\":\"test@example.com\",\"password\":\"Test1234\"}"
```

---

**Once this is working, I'll continue building the frontend automatically!** 🎯

