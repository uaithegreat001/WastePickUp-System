import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import UserLayout from '../../components/layouts/UserLayout';
import { Icon } from '@iconify/react';
import { userService } from '../../services/userService';

export default function UserSupport() {
    const { userData, currentUser } = useAuth();
    const user = userData || {
        name: 'User',
        email: '',
        phone: ''
    };

    const [formData, setFormData] = useState({
        subject: '',
        message: ''
    });
    const [showSuccess, setShowSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await userService.createSupportTicket({
                ...formData,
                userId: currentUser?.uid || '',
                userEmail: user.email,
                userName: user.name
            });
            
            setFormData({ subject: '', message: '' });
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 5000);
        } catch (error) {
            console.error('Error submitting message:', error);
        }
    };

    return (
        <UserLayout userName={user.name}>
            <div className="max-w-4xl space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-lg font-bold text-gray-900">Messages</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Send us a message and we'll get back to you shortly
                    </p>
                </div>

                {/* Success Alert */}
                {showSuccess && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                        <Icon icon="hugeicons:checkmark-circle-02" className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <h3 className="text-sm font-semibold text-green-900">Message Sent!</h3>
                            <p className="text-xs text-green-700 mt-1">
                                Your message has been sent. We'll respond shortly.
                            </p>
                        </div>
                    </div>
                )}

                {/* Message Form */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-gray-700 block mb-2">Subject</label>
                            <input
                                type="text"
                                value={formData.subject}
                                onChange={(e) => setFormData({...formData, subject: e.target.value})}
                                required
                                className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                placeholder="Brief description of your issue"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-700 block mb-2">Message</label>
                            <textarea
                                value={formData.message}
                                onChange={(e) => setFormData({...formData, message: e.target.value})}
                                required
                                rows={5}
                                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                                placeholder="Describe your issue in detail..."
                            />
                        </div>


                        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={() => setFormData({ subject: '', message: '' })}
                                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                Reset
                            </button>
                            <button
                                type="submit"
                                className="px-6 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-lg transition-colors flex items-center gap-2"
                            >
                                <span>Send Message</span>
                                <Icon icon="hugeicons:arrow-right-01" className="w-4 h-4" />
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </UserLayout>
    );
}
