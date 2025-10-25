// Auth Context for Admin Dashboard
import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import socketService from '../services/socket';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is logged in
        const storedUser = localStorage.getItem('admin_user');
        const token = localStorage.getItem('admin_token');
        
        if (storedUser && token) {
            setUser(JSON.parse(storedUser));
            socketService.connect(token);
        }
        
        setLoading(false);
    }, []);

    const login = async (username, password) => {
        try {
            const data = await api.login(username, password);
            setUser(data.user);
            socketService.connect(data.token);
            return { success: true };
        } catch (error) {
            console.error('Login error:', error);
            return { 
                success: false, 
                error: error.response?.data?.error || 'Login failed' 
            };
        }
    };

    const logout = () => {
        api.logout();
        socketService.disconnect();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
}

