import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import UserLayout from '../../components/layouts/UserLayout';
import { Icon } from '@iconify/react';
import { userService } from '../../services/userService';
import { SERVICE_AREAS } from '../../constants/serviceAreas';

export default function UserProfile() {
    const { userData, currentUser } = useAuth();
    const [profileData, setProfileData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        serviceArea: ''
    });

    // Helper to get initials
    const getInitials = (name) => {
        if (!name) return 'U';
        const names = name.split(' ');
        if (names.length >= 2) {
            return (names[0][0] + names[1][0]).toUpperCase();
        }
        return name.slice(0, 2).toUpperCase();
    };

    useEffect(() => {
        if (userData) {
            setProfileData({
                name: userData.name || '',
                email: userData.email || '',
                phone: userData.phone || '',
                address: userData.address || '',
                serviceArea: userData.zipcode || ''
            });
        }
    }, [userData]);

    const [isEditing, setIsEditing] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        if (!currentUser) return;
        
        setIsSaving(true);
        try {
            // Extract zipcode and lga from selected service area
            const selectedArea = SERVICE_AREAS.find(area => area.zipcode === profileData.serviceArea);
            
            await userService.updateUserProfile(currentUser.uid, {
                name: profileData.name,
                phone: profileData.phone,
                address: profileData.address,
                lga: selectedArea.lga,
                zipcode: selectedArea.zipcode
            });
            
            setIsEditing(false);
            setShowSuccess(true);
            setTimeout(() => {
                setShowSuccess(false);
                // Reload to refresh userData from context
                window.location.reload();
            }, 1000);
        } catch (error) {
            console.error('Error saving profile:', error);
            alert('Failed to update profile. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <UserLayout userName={profileData.name}>
            <div className="max-w-3xl space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-lg font-bold text-gray-900">My Profile</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Manage your account information and preferences
                    </p>
                </div>

                {/* Success Alert */}
                {showSuccess && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                        <Icon icon="hugeicons:checkmark-circle-02" className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <h3 className="text-sm font-semibold text-green-900">Profile Updated!</h3>
                            <p className="text-xs text-green-700 mt-1">Your profile has been updated successfully.</p>
                        </div>
                    </div>
                )}

                {/* Profile Card */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-3xl">
                                {getInitials(profileData.name)}
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">{profileData.name}</h2>
                                <p className="text-sm text-gray-500">Customer</p>
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
                            <label className="text-xs font-medium text-gray-500 block mb-2">Full Name</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={profileData.name}
                                    onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                                    className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                />
                            ) : (
                                <p className="text-gray-900 font-medium">{profileData.name}</p>
                            )}
                        </div>

                        <div>
                            <label className="text-xs font-medium text-gray-500 block mb-2">Email</label>
                            <p className="text-gray-900 font-medium">{profileData.email}</p>
                            <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                        </div>

                        <div>
                            <label className="text-xs font-medium text-gray-500 block mb-2">Phone Number</label>
                            {isEditing ? (
                                <input
                                    type="tel"
                                    value={profileData.phone}
                                    onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                                    className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                />
                            ) : (
                                <p className="text-gray-900 font-medium">{profileData.phone}</p>
                            )}
                        </div>

                        <div>
                            <label className="text-xs font-medium text-gray-500 block mb-2">Select Service Area</label>
                            {isEditing ? (
                                <div className="relative">
                                    <select
                                        value={profileData.serviceArea}
                                        onChange={(e) => setProfileData({...profileData, serviceArea: e.target.value})}
                                        className="w-full h-10 px-3 pr-10 rounded-lg border border-gray-200 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary appearance-none bg-white"
                                    >
                                        <option value="">Select Service Area</option>
                                        {SERVICE_AREAS.map((area) => (
                                            <option key={area.zipcode} value={area.zipcode}>
                                                {area.label}
                                            </option>
                                        ))}
                                    </select>
                                    <Icon 
                                        icon="hugeicons:arrow-down-01" 
                                        className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" 
                                    />
                                </div>
                            ) : (
                                <p className="text-gray-900 font-medium">
                                    {SERVICE_AREAS.find(area => area.zipcode === profileData.serviceArea)?.label || 'N/A'}
                                </p>
                            )}
                        </div>

                        <div className="md:col-span-2">
                            <label className="text-xs font-medium text-gray-500 block mb-2">Address</label>
                            {isEditing ? (
                                <textarea
                                    value={profileData.address}
                                    onChange={(e) => setProfileData({...profileData, address: e.target.value})}
                                    rows={2}
                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                />
                            ) : (
                                <p className="text-gray-900 font-medium">{profileData.address}</p>
                            )}
                        </div>
                    </div>

                    {isEditing && (
                        <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
                            <button
                                onClick={() => setIsEditing(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="px-6 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
        </UserLayout>
    );
}
