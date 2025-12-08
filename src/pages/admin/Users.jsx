import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/layouts/AdminLayout';
import { Icon } from '@iconify/react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export default function Users() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
                const querySnapshot = await getDocs(q);
                const usersData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate() : new Date()
                }));
                setUsers(usersData);
            } catch (error) {
                console.error('Error fetching users:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    const formatDate = (date) => {
        if (!date) return 'N/A';
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };



    const handleViewUser = (user) => {
        setSelectedUser(user);
        setShowModal(true);
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-lg font-bold text-gray-900">Users Management</h1>
                        <p className="text-xs text-gray-500 mt-1">View and manage all system users</p>
                    </div>
                    <div className="bg-gray-100 px-4 py-2 rounded-lg">
                        <span className="text-sm font-medium text-gray-600">Total Users: {users.length}</span>
                    </div>
                </div>





                {/* Users Table */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 capitalize tracking-wider">User</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 capitalize tracking-wider">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 capitalize tracking-wider">Phone</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 capitalize tracking-wider">Role</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 capitalize tracking-wider">Joined</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 capitalize tracking-wider">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {users.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                            No users found
                                        </td>
                                    </tr>
                                ) : (
                                    users.map((user) => (
                                        <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                                        {user.fullName?.charAt(0)?.toUpperCase() || 'U'}
                                                    </div>
                                                    <span className="font-medium text-gray-900">{user.fullName || 'Unknown'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{user.email || 'N/A'}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{user.phone || 'N/A'}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                                                    user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                                                }`}>
                                                    {user.role === 'admin' ? 'Admin' : 'Customer'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{formatDate(user.createdAt)}</td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => handleViewUser(user)}
                                                    className="text-gray-600 hover:text-gray-900 font-medium text-sm"
                                                >
                                                    View Details
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* User Detail Modal */}
            {showModal && selectedUser && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                    onClick={() => setShowModal(false)}
                >
                    <div className="bg-white rounded-2xl w-full max-w-2xl p-6" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900">User Details</h2>
                            <button
                                onClick={() => setShowModal(false)}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <Icon icon="hugeicons:cancel-01" className="w-6 h-6 text-gray-500" />
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-center gap-4 p-5 bg-gray-50 rounded-xl">
                                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl">
                                    {selectedUser.fullName?.charAt(0)?.toUpperCase() || 'U'}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 text-lg">{selectedUser.fullName || 'Unknown'}</h3>
                                    <p className="text-sm text-gray-500">{selectedUser.role === 'admin' ? 'Administrator' : 'Customer'}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-medium text-gray-500 block mb-1.5">Email</label>
                                    <p className="text-gray-900">{selectedUser.email || 'N/A'}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-500 block mb-1.5">Phone</label>
                                    <p className="text-gray-900">{selectedUser.phone || 'N/A'}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-500 block mb-1.5">LGA</label>
                                    <p className="text-gray-900">{selectedUser.lga || 'N/A'}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-500 block mb-1.5">Zipcode</label>
                                    <p className="text-gray-900">{selectedUser.zipcode || 'N/A'}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-500 block mb-1.5">Joined</label>
                                    <p className="text-gray-900">{formatDate(selectedUser.createdAt)}</p>
                                </div>
                                <div className="col-span-2">
                                    <label className="text-xs font-medium text-gray-500 block mb-1.5">Address</label>
                                    <p className="text-gray-900">{selectedUser.address || 'N/A'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
