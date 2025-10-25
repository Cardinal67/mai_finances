// Process Manager - Controls Backend and Frontend Servers
const { spawn } = require('child_process');
const path = require('path');

class ProcessManager {
    constructor() {
        this.processes = {
            backend: {
                process: null,
                status: 'stopped',
                port: 3001,
                startTime: null,
                logs: []
            },
            frontend: {
                process: null,
                status: 'stopped',
                port: 3000,
                startTime: null,
                logs: []
            }
        };
        this.io = null;
    }

    setIO(io) {
        this.io = io;
    }

    addLog(server, type, message) {
        const log = {
            timestamp: new Date().toISOString(),
            type, // 'stdout', 'stderr', 'info', 'error'
            message: message.toString().trim()
        };

        this.processes[server].logs.push(log);

        // Keep only last 500 logs per server
        if (this.processes[server].logs.length > 500) {
            this.processes[server].logs.shift();
        }

        // Emit to connected clients
        if (this.io) {
            this.io.emit('server-log', { server, log });
        }

        return log;
    }

    startBackend() {
        return new Promise((resolve, reject) => {
            if (this.processes.backend.status === 'running') {
                return reject(new Error('Backend is already running'));
            }

            const backendPath = path.resolve(__dirname, '../../backend');
            
            this.addLog('backend', 'info', '🚀 Starting backend server...');
            
            const proc = spawn('node', ['src/server.js'], {
                cwd: backendPath,
                shell: true,
                env: { ...process.env }
            });

            this.processes.backend.process = proc;
            this.processes.backend.status = 'starting';
            this.processes.backend.startTime = new Date();

            proc.stdout.on('data', (data) => {
                this.addLog('backend', 'stdout', data);
                
                // Check if server started successfully
                if (data.toString().includes('Ready to accept requests')) {
                    this.processes.backend.status = 'running';
                    this.emitStatus();
                }
            });

            proc.stderr.on('data', (data) => {
                this.addLog('backend', 'stderr', data);
            });

            proc.on('error', (error) => {
                this.addLog('backend', 'error', `Process error: ${error.message}`);
                this.processes.backend.status = 'error';
                this.emitStatus();
                reject(error);
            });

            proc.on('exit', (code) => {
                this.addLog('backend', 'info', `Process exited with code ${code}`);
                this.processes.backend.process = null;
                this.processes.backend.status = 'stopped';
                this.emitStatus();
            });

            // Give it a moment to start
            setTimeout(() => {
                if (this.processes.backend.status !== 'error') {
                    this.processes.backend.status = 'running';
                    this.emitStatus();
                    resolve({ success: true, message: 'Backend started' });
                }
            }, 2000);
        });
    }

    startFrontend() {
        return new Promise((resolve, reject) => {
            if (this.processes.frontend.status === 'running') {
                return reject(new Error('Frontend is already running'));
            }

            const frontendPath = path.resolve(__dirname, '../../frontend');
            
            this.addLog('frontend', 'info', '🎨 Starting frontend server...');
            
            const proc = spawn('npm', ['start'], {
                cwd: frontendPath,
                shell: true,
                env: { ...process.env, BROWSER: 'none' }
            });

            this.processes.frontend.process = proc;
            this.processes.frontend.status = 'starting';
            this.processes.frontend.startTime = new Date();

            proc.stdout.on('data', (data) => {
                this.addLog('frontend', 'stdout', data);
                
                // Check if server started successfully
                if (data.toString().includes('webpack compiled') || 
                    data.toString().includes('Compiled successfully')) {
                    this.processes.frontend.status = 'running';
                    this.emitStatus();
                }
            });

            proc.stderr.on('data', (data) => {
                this.addLog('frontend', 'stderr', data);
            });

            proc.on('error', (error) => {
                this.addLog('frontend', 'error', `Process error: ${error.message}`);
                this.processes.frontend.status = 'error';
                this.emitStatus();
                reject(error);
            });

            proc.on('exit', (code) => {
                this.addLog('frontend', 'info', `Process exited with code ${code}`);
                this.processes.frontend.process = null;
                this.processes.frontend.status = 'stopped';
                this.emitStatus();
            });

            // Give it more time to start (React takes longer)
            setTimeout(() => {
                if (this.processes.frontend.status !== 'error') {
                    this.processes.frontend.status = 'running';
                    this.emitStatus();
                    resolve({ success: true, message: 'Frontend started' });
                }
            }, 5000);
        });
    }

    stopBackend() {
        return new Promise((resolve) => {
            if (!this.processes.backend.process) {
                return resolve({ success: true, message: 'Backend was not running' });
            }

            this.addLog('backend', 'info', '⏸️  Stopping backend server...');

            this.processes.backend.process.kill('SIGTERM');
            
            setTimeout(() => {
                if (this.processes.backend.process) {
                    this.processes.backend.process.kill('SIGKILL');
                }
                this.processes.backend.status = 'stopped';
                this.emitStatus();
                resolve({ success: true, message: 'Backend stopped' });
            }, 2000);
        });
    }

    stopFrontend() {
        return new Promise((resolve) => {
            if (!this.processes.frontend.process) {
                return resolve({ success: true, message: 'Frontend was not running' });
            }

            this.addLog('frontend', 'info', '⏸️  Stopping frontend server...');

            this.processes.frontend.process.kill('SIGTERM');
            
            setTimeout(() => {
                if (this.processes.frontend.process) {
                    this.processes.frontend.process.kill('SIGKILL');
                }
                this.processes.frontend.status = 'stopped';
                this.emitStatus();
                resolve({ success: true, message: 'Frontend stopped' });
            }, 2000);
        });
    }

    async restartBackend() {
        await this.stopBackend();
        await new Promise(resolve => setTimeout(resolve, 1000));
        return await this.startBackend();
    }

    async restartFrontend() {
        await this.stopFrontend();
        await new Promise(resolve => setTimeout(resolve, 1000));
        return await this.startFrontend();
    }

    getStatus() {
        return {
            backend: {
                status: this.processes.backend.status,
                port: this.processes.backend.port,
                startTime: this.processes.backend.startTime,
                uptime: this.processes.backend.startTime 
                    ? Date.now() - new Date(this.processes.backend.startTime).getTime()
                    : 0
            },
            frontend: {
                status: this.processes.frontend.status,
                port: this.processes.frontend.port,
                startTime: this.processes.frontend.startTime,
                uptime: this.processes.frontend.startTime 
                    ? Date.now() - new Date(this.processes.frontend.startTime).getTime()
                    : 0
            }
        };
    }

    getLogs(server, limit = 100) {
        const logs = this.processes[server]?.logs || [];
        return logs.slice(-limit);
    }

    clearLogs(server) {
        if (this.processes[server]) {
            this.processes[server].logs = [];
            this.addLog(server, 'info', 'Logs cleared');
        }
    }

    emitStatus() {
        if (this.io) {
            this.io.emit('server-status', this.getStatus());
        }
    }
}

// Singleton instance
const processManager = new ProcessManager();

module.exports = processManager;

