// API Service for Admin Dashboard
import axios from 'axios';

const API_BASE = process.env.REACT_APP_ADMIN_API || 'http://localhost:3002';

class AdminAPI {
    constructor() {
        this.token = localStorage.getItem('admin_token');
    }

    getHeaders() {
        return {
            'Content-Type': 'application/json',
            ...(this.token && { 'Authorization': `Bearer ${this.token}` })
        };
    }

    // Auth
    async login(username, password) {
        const response = await axios.post(`${API_BASE}/api/admin/auth/login`, {
            username,
            password
        });
        this.token = response.data.token;
        localStorage.setItem('admin_token', this.token);
        localStorage.setItem('admin_user', JSON.stringify(response.data.user));
        return response.data;
    }

    logout() {
        this.token = null;
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
    }

    // Server Control
    async getServerStatus() {
        const response = await axios.get(`${API_BASE}/api/admin/servers/status`, {
            headers: this.getHeaders()
        });
        return response.data;
    }

    async startServer(server) {
        const response = await axios.post(
            `${API_BASE}/api/admin/servers/${server}/start`,
            {},
            { headers: this.getHeaders() }
        );
        return response.data;
    }

    async stopServer(server) {
        const response = await axios.post(
            `${API_BASE}/api/admin/servers/${server}/stop`,
            {},
            { headers: this.getHeaders() }
        );
        return response.data;
    }

    async restartServer(server) {
        const response = await axios.post(
            `${API_BASE}/api/admin/servers/${server}/restart`,
            {},
            { headers: this.getHeaders() }
        );
        return response.data;
    }

    async getServerLogs(server, limit = 100) {
        const response = await axios.get(
            `${API_BASE}/api/admin/servers/${server}/logs?limit=${limit}`,
            { headers: this.getHeaders() }
        );
        return response.data.logs;
    }

    async clearServerLogs(server) {
        const response = await axios.delete(
            `${API_BASE}/api/admin/servers/${server}/logs`,
            { headers: this.getHeaders() }
        );
        return response.data;
    }

    // Users
    async getUsers() {
        const response = await axios.get(`${API_BASE}/api/admin/users`, {
            headers: this.getHeaders()
        });
        return response.data.users;
    }

    async getUser(id) {
        const response = await axios.get(`${API_BASE}/api/admin/users/${id}`, {
            headers: this.getHeaders()
        });
        return response.data.user;
    }

    async updateUser(id, data) {
        const response = await axios.put(
            `${API_BASE}/api/admin/users/${id}`,
            data,
            { headers: this.getHeaders() }
        );
        return response.data;
    }

    async resetUserPassword(id, newPassword) {
        const response = await axios.post(
            `${API_BASE}/api/admin/users/${id}/reset-password`,
            { newPassword },
            { headers: this.getHeaders() }
        );
        return response.data;
    }

    async deleteUser(id) {
        const response = await axios.delete(
            `${API_BASE}/api/admin/users/${id}`,
            { headers: this.getHeaders() }
        );
        return response.data;
    }

    async getUserStats() {
        const response = await axios.get(`${API_BASE}/api/admin/users/stats/overview`, {
            headers: this.getHeaders()
        });
        return response.data.stats;
    }

    // Health
    async getHealthStatus() {
        const response = await axios.get(`${API_BASE}/api/admin/health/all`, {
            headers: this.getHeaders()
        });
        return response.data;
    }
}

export default new AdminAPI();

