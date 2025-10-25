// Socket.IO Service for real-time updates
import { io } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_ADMIN_API || 'http://localhost:3002';

class SocketService {
    constructor() {
        this.socket = null;
        this.listeners = {};
    }

    connect(token) {
        if (this.socket) {
            return this.socket;
        }

        this.socket = io(SOCKET_URL, {
            auth: { token },
            transports: ['websocket', 'polling']
        });

        this.socket.on('connect', () => {
            console.log('Connected to admin server');
        });

        this.socket.on('disconnect', () => {
            console.log('Disconnected from admin server');
        });

        this.socket.on('server-status', (data) => {
            this.emit('server-status', data);
        });

        this.socket.on('server-log', (data) => {
            this.emit('server-log', data);
        });

        return this.socket;
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    requestStatus() {
        if (this.socket) {
            this.socket.emit('request-status');
        }
    }

    on(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    }

    off(event, callback) {
        if (this.listeners[event]) {
            this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
        }
    }

    emit(event, data) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(callback => callback(data));
        }
    }
}

const socketService = new SocketService();
export default socketService;

