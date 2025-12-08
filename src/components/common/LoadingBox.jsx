import React from 'react';
import { Icon } from '@iconify/react';

// Loading overlay with spinner - matches SuccessBox style
export default function LoadingBox({ show, message }) {
    if (!show) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
                {/* Loading Content */}
                <div className="p-8 text-center space-y-4">
                    {/* Spinner Icon */}
                    <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                        <Icon 
                            icon="hugeicons:loading-03" 
                            className="w-10 h-10 text-primary animate-spin" 
                        />
                    </div>

                    {/* Message */}
                    <p className="text-sm text-gray-600 leading-relaxed">
                        {message || 'Processing...'}
                    </p>
                </div>
            </div>
        </div>
    );
}
