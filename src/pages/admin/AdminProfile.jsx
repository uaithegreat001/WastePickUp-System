import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import AdminLayout from '../../components/layouts/AdminLayout';
import { Icon } from '@iconify/react';
import { userService } from '../../services/userService';
import { FormInput } from '../../components/common/FormInput';
import SuccessBox from '../../components/common/SuccessBox';

export default function AdminProfile() {
    const auth = useAuth();
    const userData = auth?.userData;
    const [isEditing, setIsEditing] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [adminData, setAdminData] = useState({
        fullName: '',
        email: '',
        phone: '',
        role: '',
        department: '',
        joinedDate: new Date()
    });

    useEffect(() => {
        if (userData) {
            setAdminData({
                fullName: userData.fullName || 'Admin User',
                email: userData.email || '',
                phone: userData.phone || '',
                role: userData.role || 'Admin',
                department: userData.department || 'Operations',
                joinedDate: userData.createdAt ? new Date(userData.createdAt) : new Date()
            });
        }
    }, [userData]);

    const [isSaving, setIsSaving] = useState(false);

    // Helper to get initials (matches Header)
    const getInitials = (name) => {
        const names = name.split(' ');
        if (names.length >= 2) {
            return (names[0][0] + names[1][0]).toUpperCase();
        }
        return name.slice(0, 2).toUpperCase();
    };

    const handleSave = async () => {
        if (!auth?.currentUser?.uid) return;
        
        setIsSaving(true);
        try {
            await userService.updateUserProfile(auth.currentUser.uid, {
                fullName: adminData.fullName,
                phone: adminData.phone,
                department: adminData.department
            });
            
            setIsEditing(false);
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
            
            // Reload to refresh context
            window.location.reload();
        } catch (error) {
            console.error('Error saving profile:', error);
            alert('Failed to save profile. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <AdminLayout>
            <div className="max-w-4xl space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-lg font-bold text-gray-900">Admin Profile</h1>
                    <p className="text-xs text-gray-500 mt-1">Manage your admin account settings</p>
                </div>

                <SuccessBox 
                    show={showSuccess} 
                    onClose={() => setShowSuccess(false)}
                    title="Changes Saved!"
                    message="Your profile has been updated successfully."
                />

                {/* Profile Card */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl">
                                {getInitials(adminData.fullName)}
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">{adminData.fullName}</h2>
                                <p className="text-sm text-gray-500">{adminData.role}</p>
                                <p className="text-xs text-gray-400 mt-1">
                                    Joined {adminData.joinedDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsEditing(!isEditing)}
                            className="px-4 py-2 text-sm font-medium text-primary hover:bg-primary/5 rounded-lg transition-colors"
                        >
                            {isEditing ? 'Cancel' : 'Edit Profile'}
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            {isEditing ? (
                                <FormInput
                                    label="Full Name"
                                    value={adminData.fullName}
                                    onChange={(e) => setAdminData({...adminData, fullName: e.target.value})}
                                />
                            ) : (
                                <div>
                                    <label className="text-xs font-medium text-gray-500 block mb-2">Full Name</label>
                                    <p className="text-gray-900 font-medium">{adminData.fullName}</p>
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="text-xs font-medium text-gray-500 block mb-2">Email</label>
                            <p className="text-gray-900 font-medium">{adminData.email}</p>
                            <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                        </div>

                        <div>
                            {isEditing ? (
                                <FormInput
                                    label="Phone Number"
                                    type="tel"
                                    value={adminData.phone}
                                    onChange={(e) => setAdminData({...adminData, phone: e.target.value})}
                                />
                            ) : (
                                <div>
                                    <label className="text-xs font-medium text-gray-500 block mb-2">Phone Number</label>
                                    <p className="text-gray-900 font-medium">{adminData.phone}</p>
                                </div>
                            )}
                        </div>

                        <div>
                            {isEditing ? (
                                <FormInput
                                    label="Department"
                                    value={adminData.department}
                                    onChange={(e) => setAdminData({...adminData, department: e.target.value})}
                                />
                            ) : (
                                <div>
                                    <label className="text-xs font-medium text-gray-500 block mb-2">Department</label>
                                    <p className="text-gray-900 font-medium">{adminData.department}</p>
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="text-xs font-medium text-gray-500 block mb-2">Role</label>
                            <p className="text-gray-900 font-medium">{adminData.role}</p>
                        </div>
                    </div>

                    {isEditing && (
                        <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
                            <button
                                onClick={() => setIsEditing(false)}
                                className="px-6 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="px-6 py-2.5 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSaving ? (
                                    <>
                                        <Icon icon="hugeicons:loading-01" className="w-4 h-4 animate-spin" />
                                        <span>Saving...</span>
                                    </>
                                ) : (
                                    <span>Save Changes</span>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
