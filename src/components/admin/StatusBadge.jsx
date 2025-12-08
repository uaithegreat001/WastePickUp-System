import React from 'react';

const STATUS_CONFIG = {
    pending: {
        bgColor: 'bg-yellow-100',
        textColor: 'text-yellow-700',
        label: 'Pending'
    },
    scheduled: {
        bgColor: 'bg-blue-100',
        textColor: 'text-blue-700',
        label: 'Scheduled'
    },
    'in-progress': {
        bgColor: 'bg-orange-100',
        textColor: 'text-orange-700',
        label: 'In Progress'
    },
    completed: {
        bgColor: 'bg-green-100',
        textColor: 'text-green-700',
        label: 'Completed'
    },
    cancelled: {
        bgColor: 'bg-red-100',
        textColor: 'text-red-700',
        label: 'Cancelled'
    },
    approved: {
        bgColor: 'bg-blue-100',
        textColor: 'text-blue-700',
        label: 'Approved'
    },
    rejected: {
        bgColor: 'bg-red-100',
        textColor: 'text-red-700',
        label: 'Rejected'
    },
    open: {
        bgColor: 'bg-blue-100',
        textColor: 'text-blue-700',
        label: 'Open'
    },
    resolved: {
        bgColor: 'bg-green-100',
        textColor: 'text-green-700',
        label: 'Resolved'
    },
    closed: {
        bgColor: 'bg-gray-100',
        textColor: 'text-gray-700',
        label: 'Closed'
    }
};

export default function StatusBadge({ status, size = 'medium' }) {
    const statusKey = status?.toLowerCase() || 'pending';
    const config = STATUS_CONFIG[statusKey] || STATUS_CONFIG.pending;
    
    const sizeClasses = {
        small: 'px-2 py-0.5 text-xs',
        medium: 'px-2.5 py-1 text-xs',
        large: 'px-3 py-1.5 text-sm'
    };

    return (
        <span 
            className={`inline-flex items-center justify-center rounded-full font-medium ${config.bgColor} ${config.textColor} ${sizeClasses[size]}`}
        >
            {config.label}
        </span>
    );
}
