import React, { useEffect } from 'react';
import { Icon } from '@iconify/react';
import StatusBadge from '../admin/StatusBadge';
import { formatDate } from '../../lib/dateUtils';
import PaymentButton from '../PaymentButton';

// Shows details for pickups, orders, or messages in a popup overlay
export default function UserDetailBox({ type, data, show, onClose, user }) {
    
    // close on Escape key
    useEffect(() => {
        const handleKey = (e) => {
            if (e.key === 'Escape' && show) onClose();
        };
        document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, [show, onClose]);

    if (!show || !data) return null;

    // close if clicking the dark backdrop
    const handleBackdrop = (e) => {
        if (e.target === e.currentTarget) onClose();
    };

    // format date with time and weekday for headers
    const formatFullDate = (timestamp) => formatDate(timestamp, { includeTime: true, includeWeekday: true, dateStyle: 'long' });
    
    // format date without time for scheduled dates
    const formatShortDate = (timestamp) => formatDate(timestamp);

    // figure out which title and subtitle to show
    const getHeader = () => {
        switch (type) {
            case 'pickup':
                return { title: 'Pickup Request Details', sub: `Requested on ${formatFullDate(data.createdAt)}` };
            case 'order':
                return { title: 'Bin Order Details', sub: `Ordered on ${formatFullDate(data.createdAt)}` };
            case 'message':
                return { title: 'Message Details', sub: `Sent on ${formatFullDate(data.createdAt)}` };
            default:
                return { title: 'Details', sub: '' };
        }
    };

    const header = getHeader();

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
                        <h2 className="font-bold text-gray-900">{header.title}</h2>
                        <p className="text-sm text-gray-500 mt-1">{header.sub}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-700"
                    >
                        <Icon icon="hugeicons:cancel-01" className="w-6 h-6" />
                    </button>
                </div>

                {/* body - render based on type */}
                <div className="px-6 py-4 space-y-6">
                    {type === 'message' && <MessageContent data={data} formatDate={formatShortDate} />}
                    {type === 'pickup' && <PickupContent data={data} formatDate={formatShortDate} user={user} onClose={onClose} />}
                    {type === 'order' && <OrderContent data={data} formatDate={formatShortDate} user={user} onClose={onClose} />}
                </div>

                {/* footer with close button for messages */}
                {type === 'message' && (
                    <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-xl flex justify-end">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                            Close
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

// message-specific content
function MessageContent({ data, formatDate }) {
    const getStatusColor = (status) => {
        const colors = {
            'open': 'bg-blue-100 text-blue-700',
            'in-progress': 'bg-yellow-100 text-yellow-700',
            'resolved': 'bg-green-100 text-green-700',
            'closed': 'bg-gray-100 text-gray-700'
        };
        return colors[status] || 'bg-gray-100 text-gray-700';
    };

    return (
        <>
            {/* status */}
            <div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(data.status)}`}>
                    {data.status ? data.status.replace('_', ' ') : 'Unknown'}
                </span>
            </div>

            {/* subject */}
            <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider block mb-1">Subject</label>
                <p className="text-gray-900 font-medium">{data.subject}</p>
            </div>

            {/* message body */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider block mb-2">Message Content</label>
                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{data.message}</p>
            </div>

            {/* admin reply if any */}
            {data.adminResponse && (
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                    <div className="flex items-center gap-2 mb-2">
                        <Icon icon="hugeicons:customer-support" className="w-4 h-4 text-blue-600" />
                        <label className="text-xs font-medium text-blue-800 uppercase tracking-wider">Admin Response</label>
                    </div>
                    <p className="text-sm text-blue-900 whitespace-pre-wrap leading-relaxed">{data.adminResponse}</p>
                    {data.respondedAt && (
                        <p className="text-xs text-blue-600 mt-2 text-right">
                            Responded on {formatDate(data.respondedAt)}
                        </p>
                    )}
                </div>
            )}
        </>
    );
}

// pickup-specific content
function PickupContent({ data, formatDate, user, onClose }) {
    return (
        <>
            {/* status row */}
            <div className="flex items-center justify-between bg-white p-5 rounded-xl border border-gray-200">
                <div>
                    <span className="text-xs text-gray-500 tracking-wider">Current Status</span>
                    <div className="mt-2">
                        <StatusBadge status={data.status} size="large" />
                    </div>
                </div>
                {data.scheduledDate && (
                    <div className="text-right">
                        <span className="text-xs text-gray-500">Scheduled For</span>
                        <p className="text-sm font-medium text-gray-900 mt-1">{formatDate(data.scheduledDate, false)}</p>
                    </div>
                )}
            </div>

            {/* two-column layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* location */}
                <div className="space-y-3">
                    <h4 className="text-sm text-gray-500">Pickup Location</h4>
                    <div className="bg-gray-50 rounded-xl p-5 space-y-4 border border-gray-200">
                        <div>
                            <label className="text-xs font-medium text-gray-500 block mb-1.5">Address</label>
                            <p className="text-gray-900 font-medium leading-relaxed">{data.pickupAddress || 'N/A'}</p>
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

                {/* waste & payment */}
                <div className="space-y-3">
                    <h4 className="text-sm text-gray-500">Waste & Payment</h4>
                    <div className="bg-gray-50 rounded-xl p-5 space-y-4 border border-gray-200">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-medium text-gray-500 block mb-1.5">Bin Size</label>
                                <p className="text-gray-900 font-medium">{data.binSize || 'N/A'} Litres</p>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-500 block mb-1.5">Quantity</label>
                                <p className="text-gray-900 font-medium">{data.quantity || 0} Bins</p>
                            </div>
                        </div>
                        <div className="pt-3 border-t border-gray-200">
                            <label className="text-xs font-medium text-gray-500 block mb-1.5">Total Amount</label>
                            <p className="text-xl font-bold text-primary">₦{data.amount?.toLocaleString() || '0'}</p>
                        </div>
                    </div>
                </div>
            </div>

            
            {data.status === 'pending' && (
                <div className="mt-6 pt-6 border-t border-gray-100 flex justify-end">
                     <PaymentButton 
                        email={user?.email} 
                        amount={data.amount || 0} 
                        onSuccess={() => {
                            // TODO: Refresh data or close
                            onClose();
                        }}
                    />
                </div>
            )}
        </>
    );
}

// order-specific content
function OrderContent({ data, formatDate, user, onClose }) {
    return (
        <>
            {/* status row */}
            <div className="flex items-center justify-between bg-white p-5 rounded-xl border border-gray-200">
                <div>
                    <span className="text-xs text-gray-500 tracking-wider">Current Status</span>
                    <div className="mt-2">
                        <StatusBadge status={data.status} size="large" />
                    </div>
                </div>
                {data.scheduledDate && (
                    <div className="text-right">
                        <span className="text-xs text-gray-500">Scheduled For</span>
                        <p className="text-sm font-medium text-gray-900 mt-1">{formatDate(data.scheduledDate, false)}</p>
                    </div>
                )}
            </div>

            {/* two-column layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* delivery location */}
                <div className="space-y-3">
                    <h4 className="text-sm text-gray-500">Delivery Location</h4>
                    <div className="bg-gray-50 rounded-xl p-5 space-y-4 border border-gray-200">
                        <div>
                            <label className="text-xs font-medium text-gray-500 block mb-1.5">Address</label>
                            <p className="text-gray-900 font-medium leading-relaxed">{data.deliveryAddress || data.address || 'N/A'}</p>
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

                {/* order details */}
                <div className="space-y-3">
                    <h4 className="text-sm text-gray-500">Bin Order Details</h4>
                    <div className="bg-gray-50 rounded-xl p-5 space-y-4 border border-gray-200">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-medium text-gray-500 block mb-1.5">Bin Size</label>
                                <p className="text-gray-900 font-medium">{data.binSize || 'N/A'}</p>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-500 block mb-1.5">Quantity</label>
                                <p className="text-gray-900 font-medium">{data.quantity || 0} Bins</p>
                            </div>
                        </div>
                        <div className="pt-3 border-t border-gray-200">
                            <label className="text-xs font-medium text-gray-500 block mb-1.5">Total Amount</label>
                            <p className="text-xl font-bold text-primary">₦{(data.amount || 0).toLocaleString()}</p>
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


            {data.status === 'pending' && (
                <div className="mt-6 pt-6 border-t border-gray-100 flex justify-end">
                     <PaymentButton 
                        email={user?.email} 
                        amount={data.amount || 0} 
                        onSuccess={() => {
                             // TODO: Refresh data or close
                             onClose();
                        }}
                    />
                </div>
            )}
        </>
    );
}
