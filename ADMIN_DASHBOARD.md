# 🎛️ Mai Finances Admin Dashboard

Complete administrative control panel for managing your Mai Finances application.

## 🚀 Features

### Server Control
- ✅ **Start/Stop/Restart** - Full control over backend and frontend servers
- ✅ **Live Status** - Real-time server status indicators
- ✅ **Uptime Tracking** - Monitor how long servers have been running
- ✅ **Independent Operation** - Admin panel runs separately, works even when main servers crash

### Live Terminal Streaming
- ✅ **Real-time Logs** - Watch backend and frontend logs in real-time
- ✅ **Auto-scroll** - Automatically scroll to latest logs
- ✅ **Color-coded Output** - Distinguish between stdout, stderr, info, and errors
- ✅ **Log Management** - Clear logs or refresh on demand

### User Management
- ✅ **View All Users** - See all registered users at a glance
- ✅ **Reset Passwords** - Quickly reset any user's password
- ✅ **Admin Management** - Grant or revoke admin privileges
- ✅ **Delete Users** - Remove users from the system
- ✅ **User Statistics** - View user counts and activity

### Health Monitoring
- ✅ **System Health** - Monitor backend, frontend, and database health
- ✅ **Response Times** - Track API response times
- ✅ **Auto-refresh** - Health checks run automatically
- ✅ **Visual Indicators** - Color-coded health status cards

## 📋 Prerequisites

- Node.js installed
- PostgreSQL database running
- Mai Finances backend and frontend set up
- Admin privileges (is_admin = TRUE in database)

## 🔧 Quick Start

### Option 1: Use the Startup Script (Recommended)

**Start everything:**
```powershell
.\start-app.ps1 all
```

**Start just the admin dashboard:**
```powershell
.\start-app.ps1 admin
```

**Interactive menu:**
```powershell
.\start-app.ps1
```

### Option 2: Manual Start

**1. Start Admin Server (Port 3002):**
```powershell
cd admin-server
npm install
node server.js
```

**2. Start Admin Dashboard (Port 3003):**
```powershell
cd admin-dashboard
npm install
npm start
```

## 🔐 Login

1. Open http://localhost:3003
2. Login with an admin account:
   - **Username:** `cardinal`
   - **Password:** `TestPassword123!`

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│  Admin Dashboard (Port 3003)            │
│  React Frontend                         │
└──────────────┬──────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────┐
│  Admin Server (Port 3002)               │
│  Express + Socket.IO                    │
│  - Process Manager                      │
│  - Real-time Updates                    │
└──────────────┬──────────────────────────┘
               │
      ┌────────┴────────┐
      ↓                 ↓
┌──────────┐      ┌──────────┐
│ Backend  │      │ Frontend │
│ Port 3001│      │ Port 3000│
└──────────┘      └──────────┘
```

## 📁 Directory Structure

```
mai_finances/
├── admin-server/          # Admin backend (Port 3002)
│   ├── server.js         # Main server file
│   ├── routes/           # API endpoints
│   │   ├── auth.js      # Authentication
│   │   ├── servers.js   # Server control
│   │   ├── users.js     # User management
│   │   └── health.js    # Health checks
│   ├── services/
│   │   └── processManager.js  # Server process control
│   └── middleware/
│       └── auth.js      # Admin authentication
│
├── admin-dashboard/       # Admin frontend (Port 3003)
│   ├── src/
│   │   ├── components/   # UI components
│   │   │   ├── ServerControl.js
│   │   │   ├── TerminalViewer.js
│   │   │   ├── UserManagement.js
│   │   │   └── HealthMonitor.js
│   │   ├── pages/
│   │   │   ├── Login.js
│   │   │   └── Dashboard.js
│   │   ├── context/
│   │   │   └── AuthContext.js
│   │   ├── services/
│   │   │   ├── api.js    # API client
│   │   │   └── socket.js # Socket.IO client
│   │   └── App.js
│   └── package.json
│
└── start-app.ps1         # Startup script
```

## 🎯 API Endpoints

### Authentication
- `POST /api/admin/auth/login` - Admin login

### Server Control
- `GET /api/admin/servers/status` - Get server status
- `POST /api/admin/servers/:server/start` - Start server
- `POST /api/admin/servers/:server/stop` - Stop server
- `POST /api/admin/servers/:server/restart` - Restart server
- `GET /api/admin/servers/:server/logs` - Get logs
- `DELETE /api/admin/servers/:server/logs` - Clear logs

### User Management
- `GET /api/admin/users` - List all users
- `GET /api/admin/users/:id` - Get user details
- `PUT /api/admin/users/:id` - Update user
- `POST /api/admin/users/:id/reset-password` - Reset password
- `DELETE /api/admin/users/:id` - Delete user
- `GET /api/admin/users/stats/overview` - Get user statistics

### Health Monitoring
- `GET /api/admin/health/all` - Get all health status
- `GET /api/admin/health/backend` - Backend health
- `GET /api/admin/health/frontend` - Frontend health
- `GET /api/admin/health/database` - Database health

## 🔌 Real-time Events (Socket.IO)

- `server-status` - Server status updates
- `server-log` - New log entries
- `request-status` - Request status update

## 🛡️ Security

- **Admin-only access** - Only users with `is_admin = TRUE` can login
- **JWT Authentication** - Secure token-based authentication
- **Role verification** - Every API call verifies admin status
- **Audit logging** - All admin actions can be logged

## 📊 Usage Examples

### Starting Servers from Admin Dashboard
1. Login to admin dashboard
2. Go to "Server Control" section
3. Click "Start" button for desired server
4. Watch live logs in terminal viewer

### Resetting a User Password
1. Go to "User Management" section
2. Find the user in the table
3. Click "Reset PW"
4. Enter new password (min 6 characters)
5. Click "Reset Password"

### Monitoring System Health
1. Health status is shown at top of dashboard
2. Green = Healthy, Red = Error
3. Shows response times for each service
4. Auto-refreshes every 10 seconds

## 🐛 Troubleshooting

**Admin dashboard won't start:**
```powershell
cd admin-dashboard
npm install
npm start
```

**Can't login:**
- Make sure you're an admin: `UPDATE users SET is_admin = TRUE WHERE username = 'your-username';`
- Check credentials are correct
- Verify backend is running on port 3001

**Servers won't start from dashboard:**
- Check paths in processManager.js are correct
- Verify you have permission to spawn processes
- Try starting manually first to check for errors

**Socket.IO not connecting:**
- Verify admin server is running on port 3002
- Check browser console for errors
- Check CORS settings in admin server

## 🚧 Future Enhancements

- [ ] Database management (run migrations, view tables)
- [ ] Log export functionality
- [ ] Email notifications for errors
- [ ] Server performance metrics (CPU, memory)
- [ ] Scheduled tasks management
- [ ] Backup/restore functionality
- [ ] API rate limiting dashboard
- [ ] WebSocket connection monitoring

## 📝 Development

**Admin Server:**
```powershell
cd admin-server
npm install
node server.js
```

**Admin Dashboard:**
```powershell
cd admin-dashboard
npm install
npm start
```

## 🎨 Theme

The admin dashboard uses a professional dark theme:
- **Primary:** Blue (`#3b82f6`)
- **Success:** Green (`#10b981`)
- **Warning:** Orange (`#f59e0b`)
- **Danger:** Red (`#ef4444`)
- **Background:** Slate 900
- **Card:** Slate 800

## 📜 License

Part of Mai Finances application.

---

**Made with 💙 by Scott**

**Access:**
- 🌐 Main App: http://localhost:3000
- 🎛️ Admin Dashboard: http://localhost:3003
- 🚀 Backend API: http://localhost:3001
- 🔧 Admin API: http://localhost:3002

