// Main Dashboard Page
import React from 'react';
import { useAuth } from '../context/AuthContext';
import ServerControl from '../components/ServerControl';
import TerminalViewer from '../components/TerminalViewer';
import UserManagement from '../components/UserManagement';
import HealthMonitor from '../components/HealthMonitor';

function Dashboard() {
    const { user, logout } = useAuth();

    return (
        <div className="min-h-screen bg-slate-900">
            {/* Header */}
            <header className="bg-slate-800 border-b border-slate-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div>
                            <h1 className="text-2xl font-bold text-blue-500">
                                🎛️ Admin Dashboard
                            </h1>
                            <p className="text-sm text-slate-400">Mai Finances Control Panel</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <div className="text-sm font-medium text-white">{user?.username}</div>
                                <div className="text-xs text-slate-400">{user?.email}</div>
                            </div>
                            <button
                                onClick={logout}
                                className="btn btn-secondary"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="space-y-8">
                    {/* Health Monitor */}
                    <HealthMonitor />

                    {/* Server Control */}
                    <ServerControl />

                    {/* Terminal Viewer */}
                    <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                        <h2 className="text-2xl font-bold text-white mb-6">Live Terminal</h2>
                        <TerminalViewer />
                    </div>

                    {/* User Management */}
                    <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                        <UserManagement />
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-slate-800 border-t border-slate-700 mt-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="text-center text-slate-400 text-sm">
                        <p>Mai Finances Admin Dashboard</p>
                        <p className="mt-1">
                            <a
                                href="http://localhost:3000"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-400 hover:text-blue-300"
                            >
                                🌐 Open Main App
                            </a>
                            {' '} • {' '}
                            <a
                                href="http://localhost:3001/health"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-400 hover:text-blue-300"
                            >
                                🔗 Backend API
                            </a>
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default Dashboard;

