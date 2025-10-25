// Server Control Panel Component
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import socketService from '../services/socket';

function ServerCard({ name, status, port, onStart, onStop, onRestart, loading }) {
    // Uptime is calculated directly from status.uptime, no need for state

    const formatUptime = (ms) => {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        
        if (hours > 0) return `${hours}h ${minutes % 60}m`;
        if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
        return `${seconds}s`;
    };

    const getStatusColor = () => {
        switch (status.status) {
            case 'running': return 'status-running';
            case 'stopped': return 'status-stopped';
            case 'starting': return 'status-starting';
            case 'error': return 'status-error';
            default: return 'status-stopped';
        }
    };

    const getStatusText = () => {
        switch (status.status) {
            case 'running': return 'Running';
            case 'stopped': return 'Stopped';
            case 'starting': return 'Starting...';
            case 'error': return 'Error';
            default: return 'Unknown';
        }
    };

    return (
        <div className="server-card">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-xl font-bold text-white mb-1">
                        {name === 'backend' ? '🚀 Backend' : '🎨 Frontend'}
                    </h3>
                    <div className="flex items-center text-sm text-slate-400">
                        <span className={`status-indicator ${getStatusColor()}`}></span>
                        <span>{getStatusText()}</span>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-2xl font-bold text-blue-400">:{port}</div>
                    {status.status === 'running' && (
                        <div className="text-sm text-slate-400">
                            {formatUptime(status.uptime || 0)}
                        </div>
                    )}
                </div>
            </div>

            <div className="flex gap-2">
                <button
                    onClick={onStart}
                    disabled={loading || status.status === 'running'}
                    className="btn btn-success flex-1"
                >
                    ▶ Start
                </button>
                <button
                    onClick={onStop}
                    disabled={loading || status.status === 'stopped'}
                    className="btn btn-danger flex-1"
                >
                    ⏸ Stop
                </button>
                <button
                    onClick={onRestart}
                    disabled={loading}
                    className="btn btn-secondary flex-1"
                >
                    🔄 Restart
                </button>
            </div>
        </div>
    );
}

function ServerControl() {
    const [serverStatus, setServerStatus] = useState({
        backend: { status: 'stopped', port: 3001, uptime: 0 },
        frontend: { status: 'stopped', port: 3000, uptime: 0 }
    });
    const [loading, setLoading] = useState({});

    useEffect(() => {
        loadStatus();

        // Listen for real-time updates
        socketService.on('server-status', handleStatusUpdate);

        return () => {
            socketService.off('server-status', handleStatusUpdate);
        };
    }, []);

    const handleStatusUpdate = (status) => {
        setServerStatus(status);
    };

    const loadStatus = async () => {
        try {
            const status = await api.getServerStatus();
            setServerStatus(status);
        } catch (error) {
            console.error('Failed to load status:', error);
        }
    };

    const handleAction = async (server, action) => {
        setLoading(prev => ({ ...prev, [server]: true }));
        try {
            if (action === 'start') {
                await api.startServer(server);
            } else if (action === 'stop') {
                await api.stopServer(server);
            } else if (action === 'restart') {
                await api.restartServer(server);
            }
            await loadStatus();
        } catch (error) {
            console.error(`Failed to ${action} ${server}:`, error);
            alert(`Failed to ${action} ${server}: ${error.response?.data?.error || error.message}`);
        } finally {
            setLoading(prev => ({ ...prev, [server]: false }));
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Server Control</h2>
                <button
                    onClick={loadStatus}
                    className="btn btn-secondary"
                >
                    🔄 Refresh Status
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ServerCard
                    name="backend"
                    status={serverStatus.backend}
                    port={serverStatus.backend.port}
                    onStart={() => handleAction('backend', 'start')}
                    onStop={() => handleAction('backend', 'stop')}
                    onRestart={() => handleAction('backend', 'restart')}
                    loading={loading.backend}
                />

                <ServerCard
                    name="frontend"
                    status={serverStatus.frontend}
                    port={serverStatus.frontend.port}
                    onStart={() => handleAction('frontend', 'start')}
                    onStop={() => handleAction('frontend', 'stop')}
                    onRestart={() => handleAction('frontend', 'restart')}
                    loading={loading.frontend}
                />
            </div>
        </div>
    );
}

export default ServerControl;

