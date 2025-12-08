import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import StatusBadge from './StatusBadge';
import { formatDate, formatDateForInput } from '../../lib/dateUtils';

// available drivers for assignment
const DRIVERS = [
    { id: 'd1', name: 'John Smith' },
    { id: 'd2', name: 'David Wilson' },
    { id: 'd3', name: 'Michael Brown' },
    { id: 'd4', name: 'Sarah Davis' },
    { id: 'd5', name: 'James Miller' }
];

// shows pickup or order details with scheduling form
export default function AdminDetailBox({ type, data, show, onClose, onSubmit }) {
    const isPickup = type === 'pickup';
    
    const [form, setForm] = useState({
        scheduledDate: '',
        scheduledTime: '',
        driver: ''
    });
    const [submitting, setSubmitting] = useState(false);

    // load existing schedule data when item changes
    useEffect(() => {
        if (data) {
            setForm({
                scheduledDate: data.scheduledDate ? formatDateForInput(data.scheduledDate) : '',
                scheduledTime: data.scheduledTime || '',
                driver: data.driver || ''
            });
        }
    }, [data]);

    // close on Escape key
    useEffect(() => {
        const handleKey = (e) => {
            if (e.key === 'Escape' && show) onClose();
        };
        document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, [show, onClose]);

    if (!show || !data) return null;

    // format timestamp to readable display with time
    const formatDateTime = (timestamp) => formatDate(timestamp, { includeTime: true });

    const handleBackdrop = (e) => {
        if (e.target === e.currentTarget) onClose();
    };

    const updateField = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        if (!form.scheduledDate || !form.scheduledTime) {
            alert(`Please set both date and time for the ${isPickup ? 'pickup' : 'delivery'} schedule`);
            return;
        }

        setSubmitting(true);
        try {
            await onSubmit(data.id, form);
            onClose();
        } catch (error) {
            console.error('Error updating schedule:', error);
            alert('Failed to update schedule. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={handleBackdrop}
        >
            <style>{`
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
            
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto hide-scrollbar shadow-2xl flex flex-col">
                {/* header */}
                <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-white sticky top-0 z-10">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">
                            {isPickup ? 'Request Details' : 'Order Details'}
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            {isPickup ? 'Requested' : 'Ordered'} on {formatDateTime(data.createdAt)}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-700">
                        <Icon icon="hugeicons:cancel-01" className="w-6 h-6" />
                    </button>
                </div>

                <div className="px-6 py-4 space-y-8">
                    {/* user info and status */}
                    <div className="flex flex-col md:flex-row gap-6 items-start justify-between bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="h-14 w-14 rounded-full bg-primary/5 border border-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                                {data.userName?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 text-lg">{data.userName || 'Unknown User'}</h3>
                                <div className="flex flex-col gap-1 mt-1">
                                    <div className="text-sm text-gray-600">{data.userEmail || 'No email'}</div>
                                    <div className="text-sm text-gray-600">{data.contactPhone || data.userPhone || 'No phone'}</div>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                            <span className="text-xs text-gray-500 tracking-wider">Current Status</span>
                            <StatusBadge status={data.status} size="large" />
                        </div>
                    </div>

                    {/* two-column details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* location */}
                        <div className="space-y-4">
                            <h4 className="text-sm text-gray-500">{isPickup ? 'Pickup' : 'Delivery'} Location</h4>
                            <div className="bg-gray-50 rounded-xl p-5 space-y-4 border border-gray-200">
                                <div>
                                    <label className="text-xs font-medium text-gray-500 block mb-1.5">Address</label>
                                    <p className="text-gray-900 font-medium leading-relaxed">
                                        {isPickup ? data.pickupAddress : (data.deliveryAddress || data.address || 'N/A')}
                                    </p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-medium text-gray-500 block mb-1.5">LGA</label>
                                        <p className="text-gray-900 font-medium">{data.lga || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-gray-500 block mb-1.5">Zipcode</label>
                                        <p className="text-gray-900 font-medium">{data.zipcode || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* bin/order details */}
                        <div className="space-y-4">
                            <h4 className="text-sm text-gray-500">{isPickup ? 'Waste & Payment' : 'Bin Order Details'}</h4>
                            <div className="bg-gray-50 rounded-xl p-5 space-y-4 border border-gray-200">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-medium text-gray-500 block mb-1.5">Bin Size</label>
                                        <p className="text-gray-900 font-medium">
                                            {(data.binSize || 'N/A')}{isPickup ? ' Litres' : ''}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-gray-500 block mb-1.5">Quantity</label>
                                        <p className="text-gray-900 font-medium">
                                            {data.quantity || 0} Bins
                                        </p>
                                    </div>
                                </div>
                                <div className="pt-3 border-t border-gray-200">
                                    <label className="text-xs font-medium text-gray-500 block mb-1.5">Total Amount</label>
                                    <p className="text-xl font-bold text-primary">
                                        ₦{(data.amount || 0).toLocaleString()}
                                    </p>
                                </div>
                                {data.notes && (
                                    <div className="pt-3 border-t border-gray-200">
                                        <label className="text-xs font-medium text-gray-500 block mb-1.5">Notes</label>
                                        <p className="text-sm text-gray-700">{data.notes}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* scheduling form */}
                    <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                        <h3 className="text-sm text-gray-500 mb-6">Schedule {isPickup ? 'Pickup' : 'Delivery'}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-gray-600">{isPickup ? 'Pickup' : 'Delivery'} Date</label>
                                <div className="relative">
                                    <Icon icon="hugeicons:calendar-01" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="date"
                                        value={form.scheduledDate}
                                        onChange={(e) => updateField('scheduledDate', e.target.value)}
                                        className="w-full h-11 pl-10 pr-4 rounded-lg bg-white border border-gray-200 text-gray-900 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-colors"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-medium text-gray-600">{isPickup ? 'Pickup' : 'Delivery'} Time</label>
                                <div className="relative">
                                    <Icon icon="hugeicons:time-01" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="time"
                                        value={form.scheduledTime}
                                        onChange={(e) => updateField('scheduledTime', e.target.value)}
                                        className="w-full h-11 pl-10 pr-4 rounded-lg bg-white border border-gray-200 text-gray-900 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-colors"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-medium text-gray-600">Assign Driver</label>
                                <div className="relative">
                                    <Icon icon="hugeicons:steering-wheel" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
                                    <select
                                        value={form.driver}
                                        onChange={(e) => updateField('driver', e.target.value)}
                                        className="w-full h-11 pl-10 pr-8 rounded-lg bg-white border border-gray-200 text-gray-900 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-colors appearance-none cursor-pointer"
                                    >
                                        <option value="">Select a driver...</option>
                                        {DRIVERS.map(driver => (
                                            <option key={driver.id} value={driver.name}>{driver.name}</option>
                                        ))}
                                    </select>
                                    <Icon icon="hugeicons:arrow-down-01" className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-4 mt-8 pt-6 border-t border-gray-200">
                            <button onClick={onClose} className="px-6 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors">
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={submitting}
                                className="px-6 py-2.5 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-lg transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {submitting ? (
                                    <>
                                        <Icon icon="hugeicons:loading-01" className="w-4 h-4 animate-spin" />
                                        <span>Sending Schedule...</span>
                                    </>
                                ) : (
                                    <span>Send Schedule</span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
