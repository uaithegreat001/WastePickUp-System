import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import UserLayout from '../../components/layouts/UserLayout';
import { Icon } from '@iconify/react';
import { userService } from '../../services/userService';
import { FormInput, FormTextarea } from '../../components/common/FormInput';
import SuccessBox from '../../components/common/SuccessBox';

export default function UserMessage() {
    const { userData, currentUser } = useAuth();
    const user = userData || {
        fullName: 'User',
        email: '',
        phone: ''
    };

    const [formData, setFormData] = useState({
        subject: '',
        message: ''
    });
    const [errors, setErrors] = useState({});
    const [showSuccess, setShowSuccess] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const validate = () => {
        const errs = {};
        if (!formData.subject.trim()) errs.subject = 'Subject is required';
        if (!formData.message.trim()) errs.message = 'Message is required';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setSubmitting(true);
        try {
            await userService.createSupportTicket({
                ...formData,
                userId: currentUser?.uid || '',
                userEmail: user.email,
                userName: user.fullName
            });
            
            setFormData({ subject: '', message: '' });
            setShowSuccess(true);
        } catch (error) {
            console.error('Error submitting message:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const updateField = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    return (
        <UserLayout userName={user.fullName}>
            <div className="max-w-4xl space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-lg font-bold text-gray-900">Message</h1>
                    <p className="text-xs text-gray-500 mt-1">
                        Send us a message and we'll get back to you shortly
                    </p>
                </div>

                <SuccessBox 
                    show={showSuccess} 
                    onClose={() => setShowSuccess(false)}
                    title="Message Sent!"
                    message="Your message has been sent. We'll respond shortly."
                />

                {/* Message Form */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <FormInput
                            label="Subject"
                            value={formData.subject}
                            onChange={(e) => updateField('subject', e.target.value)}
                            error={errors.subject}
                            placeholder="Brief description of your issue"
                            required
                        />

                        <FormTextarea
                            label="Message"
                            value={formData.message}
                            onChange={(e) => updateField('message', e.target.value)}
                            error={errors.message}
                            placeholder="Describe your issue in detail..."
                            rows={5}
                            required
                        />

                        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={() => {
                                    setFormData({ subject: '', message: '' });
                                    setErrors({});
                                }}
                                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                Reset
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="px-6 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {submitting ? (
                                    <>
                                        <Icon icon="hugeicons:loading-01" className="w-4 h-4 animate-spin" />
                                        <span>Sending...</span>
                                    </>
                                ) : (
                                    <span>Send Message</span>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </UserLayout>
    );
}
