// User Management Component
import React, { useState, useEffect } from 'react';
import api from '../services/api';

function UserManagement() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showResetModal, setShowResetModal] = useState(false);
    const [newPassword, setNewPassword] = useState('');

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const data = await api.getUsers();
            setUsers(data);
        } catch (error) {
            console.error('Failed to load users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async () => {
        if (!selectedUser || !newPassword) return;

        if (newPassword.length < 6) {
            alert('Password must be at least 6 characters');
            return;
        }

        try {
            await api.resetUserPassword(selectedUser.id, newPassword);
            alert(`Password reset successfully for ${selectedUser.username}`);
            setShowResetModal(false);
            setSelectedUser(null);
            setNewPassword('');
        } catch (error) {
            console.error('Failed to reset password:', error);
            alert('Failed to reset password');
        }
    };

    const toggleAdmin = async (user) => {
        if (window.confirm(`${user.is_admin ? 'Remove' : 'Grant'} admin access for ${user.username}?`)) {
            try {
                await api.updateUser(user.id, { is_admin: !user.is_admin });
                await loadUsers();
            } catch (error) {
                console.error('Failed to update user:', error);
                alert('Failed to update user');
            }
        }
    };

    const deleteUser = async (user) => {
        if (window.confirm(`Are you sure you want to delete ${user.username}? This action cannot be undone.`)) {
            try {
                await api.deleteUser(user.id);
                await loadUsers();
            } catch (error) {
                console.error('Failed to delete user:', error);
                alert(error.response?.data?.error || 'Failed to delete user');
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">User Management</h2>
                <button onClick={loadUsers} className="btn btn-secondary">
                    🔄 Refresh
                </button>
            </div>

            {loading ? (
                <div className="text-center py-8 text-slate-400">Loading users...</div>
            ) : (
                <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-slate-900">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                                    User
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                                    Email
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                                    Role
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                                    Created
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700">
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-slate-700">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                                                {user.username[0].toUpperCase()}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-white">
                                                    {user.username}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-slate-300">{user.email}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            user.is_admin
                                                ? 'bg-purple-900 text-purple-200'
                                                : 'bg-slate-700 text-slate-300'
                                        }`}>
                                            {user.is_admin ? '👑 Admin' : '👤 User'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                                        {new Date(user.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => {
                                                setSelectedUser(user);
                                                setShowResetModal(true);
                                            }}
                                            className="text-blue-400 hover:text-blue-300 mr-4"
                                        >
                                            🔑 Reset PW
                                        </button>
                                        <button
                                            onClick={() => toggleAdmin(user)}
                                            className="text-purple-400 hover:text-purple-300 mr-4"
                                        >
                                            {user.is_admin ? '👤 Remove Admin' : '👑 Make Admin'}
                                        </button>
                                        <button
                                            onClick={() => deleteUser(user)}
                                            className="text-red-400 hover:text-red-300"
                                        >
                                            🗑️ Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Reset Password Modal */}
            {showResetModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 max-w-md w-full mx-4">
                        <h3 className="text-xl font-bold text-white mb-4">
                            Reset Password for {selectedUser?.username}
                        </h3>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                New Password
                            </label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                placeholder="Enter new password (min 6 chars)"
                            />
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={handleResetPassword}
                                className="btn btn-primary flex-1"
                            >
                                Reset Password
                            </button>
                            <button
                                onClick={() => {
                                    setShowResetModal(false);
                                    setSelectedUser(null);
                                    setNewPassword('');
                                }}
                                className="btn btn-secondary flex-1"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default UserManagement;

