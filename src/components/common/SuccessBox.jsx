import React, { useEffect } from 'react';
import { Icon } from '@iconify/react';

// Success notification box with the same UI pattern as UserDetailBox
export default function SuccessBox({ show, onClose, title, message }) {
    
    // auto-close after 3 seconds
    useEffect(() => {
        if (show) {
            const timer = setTimeout(() => {
                onClose();
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [show, onClose]);

    // close on Escape key
    useEffect(() => {
        const handleKey = (e) => {
            if (e.key === 'Escape' && show) onClose();
        };
        document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, [show, onClose]);

    if (!show) return null;

    // close if clicking the dark backdrop
    const handleBackdrop = (e) => {
        if (e.target === e.currentTarget) onClose();
    };

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={handleBackdrop}
        >
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-scale-in">
                {/* Success Icon and Content */}
                <div className="p-8 text-center space-y-4">
                    {/* Success Icon */}
                    <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                        <Icon icon="hugeicons:checkmark-circle-02" className="w-10 h-10 text-green-600" />
                    </div>

                    {/* Title */}
                    <h2 className="text-xl font-bold text-gray-900">
                        {title || 'Success!'}
                    </h2>

                    {/* Message */}
                    <p className="text-sm text-gray-600 leading-relaxed">
                        {message || 'Your request has been submitted successfully.'}
                    </p>

                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="mt-4 px-6 py-2.5 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-lg transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>

            <style jsx>{`
                @keyframes scale-in {
                    from {
                        opacity: 0;
                        transform: scale(0.9);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }
                .animate-scale-in {
                    animation: scale-in 0.2s ease-out;
                }
            `}</style>
        </div>
    );
}
