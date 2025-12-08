import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import UserLayout from '../../components/layouts/UserLayout';
import ServiceForm from '../../components/user/ServiceForm';
import { userService } from '../../services/userService';
import SuccessBox from '../../components/common/SuccessBox';

export default function RequestPickup() {
    const [showSuccess, setShowSuccess] = useState(false);
    const { userData, currentUser } = useAuth();
    
    const user = userData || { fullName: 'User', email: '', phone: '' };

    const handleSubmit = async (formData) => {
        try {
            const completeData = {
                ...formData,
                userName: user.fullName,
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
        <UserLayout userName={user.fullName}>
            <div className="max-w-4xl space-y-6">
                <div>
                    <h1 className="text-lg font-bold text-gray-900">Request Pickup</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Request a waste pickup service by filling out the form below.
                    </p>
                </div>

                <ServiceForm 
                    type="pickup"
                    onSubmit={handleSubmit}
                    userData={user}
                />
            </div>

            <SuccessBox
                show={showSuccess}
                onClose={() => setShowSuccess(false)}
                title="Request Submitted Successfully!"
                message="Your pickup request has been submitted. An admin will review and schedule your pickup soon."
            />
        </UserLayout>
    );
}
