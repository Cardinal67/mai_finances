// Terminal Viewer Component
import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import socketService from '../services/socket';

function TerminalViewer() {
    const [activeServer, setActiveServer] = useState('backend');
    const [logs, setLogs] = useState([]);
    const [autoScroll, setAutoScroll] = useState(true);
    const terminalRef = useRef(null);

    useEffect(() => {
        loadLogs();

        // Listen for real-time log updates
        socketService.on('server-log', handleNewLog);

        return () => {
            socketService.off('server-log', handleNewLog);
        };
    }, [activeServer]);

    useEffect(() => {
        if (autoScroll && terminalRef.current) {
            terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
        }
    }, [logs, autoScroll]);

    const handleNewLog = (data) => {
        if (data.server === activeServer) {
            setLogs(prev => [...prev, data.log]);
        }
    };

    const loadLogs = async () => {
        try {
            const serverLogs = await api.getServerLogs(activeServer, 100);
            setLogs(serverLogs);
        } catch (error) {
            console.error('Failed to load logs:', error);
        }
    };

    const clearLogs = async () => {
        if (window.confirm(`Clear all ${activeServer} logs?`)) {
            try {
                await api.clearServerLogs(activeServer);
                setLogs([]);
            } catch (error) {
                console.error('Failed to clear logs:', error);
            }
        }
    };

    const getLogColor = (type) => {
        switch (type) {
            case 'error': return 'text-red-400';
            case 'stderr': return 'text-red-300';
            case 'info': return 'text-blue-400';
            case 'stdout': return 'text-green-300';
            default: return 'text-slate-300';
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div className="flex gap-2">
                    <button
                        onClick={() => setActiveServer('backend')}
                        className={`btn ${activeServer === 'backend' ? 'btn-primary' : 'btn-secondary'}`}
                    >
                        🚀 Backend
                    </button>
                    <button
                        onClick={() => setActiveServer('frontend')}
                        className={`btn ${activeServer === 'frontend' ? 'btn-primary' : 'btn-secondary'}`}
                    >
                        🎨 Frontend
                    </button>
                </div>

                <div className="flex gap-2 items-center">
                    <label className="flex items-center gap-2 text-sm text-slate-400">
                        <input
                            type="checkbox"
                            checked={autoScroll}
                            onChange={(e) => setAutoScroll(e.target.checked)}
                            className="rounded"
                        />
                        Auto-scroll
                    </label>
                    <button onClick={loadLogs} className="btn btn-secondary">
                        🔄 Refresh
                    </button>
                    <button onClick={clearLogs} className="btn btn-danger">
                        🗑️ Clear
                    </button>
                </div>
            </div>

            <div
                ref={terminalRef}
                className="bg-slate-900 border border-slate-700 rounded-lg p-4 h-96 overflow-auto terminal-output"
            >
                {logs.length === 0 ? (
                    <div className="text-slate-500 text-center py-8">
                        No logs yet. Start the {activeServer} server to see logs here.
                    </div>
                ) : (
                    logs.map((log, index) => (
                        <div key={index} className="flex gap-4 mb-1">
                            <span className="text-slate-500 text-xs font-mono whitespace-nowrap">
                                {new Date(log.timestamp).toLocaleTimeString()}
                            </span>
                            <span className={`flex-1 font-mono text-sm ${getLogColor(log.type)}`}>
                                {log.message}
                            </span>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default TerminalViewer;

