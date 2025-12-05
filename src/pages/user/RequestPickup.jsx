import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import UserLayout from '../../components/layouts/UserLayout';
import ServiceForm from '../../components/user/ServiceForm';
import { userService } from '../../services/userService';
import { Icon } from '@iconify/react';

export default function RequestPickup() {
    const [showSuccess, setShowSuccess] = useState(false);
    const { userData, currentUser } = useAuth();
    
    const user = userData || { name: 'User', email: '', phone: '' };

    const handleSubmit = async (formData) => {
        try {
            const completeData = {
                ...formData,
                userName: user.name,
                userEmail: user.email,
                userPhone: user.phone,
                userId: currentUser?.uid || ''
            };

            await userService.createPickupRequest(completeData);
            
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 5000);
        } catch (error) {
            console.error('Failed to submit pickup request:', error);
            alert('Failed to submit request. Please try again.');
        }
    };

    return (
        <UserLayout userName={user.name}>
            <div className="max-w-4xl space-y-6">
                <div>
                    <h1 className="text-lg font-bold text-gray-900">Request Pickup</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Request a waste pickup service by filling out the form below.
                    </p>
                </div>

                {showSuccess && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                        <Icon icon="hugeicons:checkmark-circle-02" className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <h3 className="text-sm font-semibold text-green-900">Request Submitted Successfully!</h3>
                            <p className="text-xs text-green-700 mt-1">
                                Your pickup request has been submitted. An admin will review and schedule your pickup soon.
                            </p>
                        </div>
                    </div>
                )}

                <ServiceForm 
                    type="pickup"
                    onSubmit={handleSubmit}
                    userData={user}
                />
            </div>
        </UserLayout>
    );
}
