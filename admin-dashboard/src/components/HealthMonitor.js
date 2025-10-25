// Health Monitor Component
import React, { useState, useEffect } from 'react';
import api from '../services/api';

function HealthMonitor() {
    const [health, setHealth] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadHealth();
        const interval = setInterval(loadHealth, 10000); // Refresh every 10s
        return () => clearInterval(interval);
    }, []);

    const loadHealth = async () => {
        try {
            const data = await api.getHealthStatus();
            setHealth(data);
            setLoading(false);
        } catch (error) {
            console.error('Failed to load health:', error);
        }
    };

    if (loading || !health) {
        return <div className="text-center py-4 text-slate-400">Loading health status...</div>;
    }

    const HealthCard = ({ title, status, emoji }) => {
        const isHealthy = status?.status === 'ok';
        return (
            <div className={`p-4 rounded-lg border ${
                isHealthy 
                    ? 'bg-green-900 bg-opacity-20 border-green-500' 
                    : 'bg-red-900 bg-opacity-20 border-red-500'
            }`}>
                <div className="flex justify-between items-center">
                    <div>
                        <div className="text-2xl mb-1">{emoji}</div>
                        <div className="text-sm font-medium text-slate-300">{title}</div>
                    </div>
                    <div className={`text-xl font-bold ${isHealthy ? 'text-green-400' : 'text-red-400'}`}>
                        {isHealthy ? '✓' : '✗'}
                    </div>
                </div>
                {status?.responseTime && (
                    <div className="text-xs text-slate-400 mt-2">
                        {status.responseTime}ms
                    </div>
                )}
                {status?.error && (
                    <div className="text-xs text-red-400 mt-2">
                        {status.error}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">System Health</h2>
                <button onClick={loadHealth} className="text-sm text-blue-400 hover:text-blue-300">
                    🔄 Refresh
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <HealthCard title="Backend API" status={health.backend} emoji="🚀" />
                <HealthCard title="Frontend" status={health.frontend} emoji="🎨" />
                <HealthCard title="Database" status={health.database} emoji="💾" />
            </div>

            <div className="text-xs text-slate-500 text-center">
                Last updated: {new Date(health.timestamp).toLocaleString()}
            </div>
        </div>
    );
}

export default HealthMonitor;

