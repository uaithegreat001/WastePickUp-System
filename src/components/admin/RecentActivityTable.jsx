import React from 'react';
import { Icon } from '@iconify/react';
import StatusBadge from './StatusBadge';

export default function RecentActivityTable({ data = [] }) {
    const formatDate = (date) => {
        if (!date) return 'N/A';
        const dateObj = date?.toDate ? date.toDate() : new Date(date);
        return dateObj.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getTypeIcon = (type) => {
        if (type === 'Pickup Request') return 'hugeicons:clean';
        if (type === 'Bin Order') return 'hugeicons:waste';
        return 'hugeicons:file-01';
    };

    if (!data || data.length === 0) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                <Icon icon="hugeicons:activity" className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No recent activity found.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <h3 className="font-bold text-gray-900">Recent Activity</h3>
                <span className="text-xs text-gray-500">{data.length} activities</span>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-500 font-medium text-xs capitalize tracking-wider">
                        <tr>
                            <th className="px-6 py-3">Type</th>
                            <th className="px-6 py-3">User</th>
                            <th className="px-6 py-3">Date</th>
                            <th className="px-6 py-3">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {data.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <div className="h-8 w-8 rounded-full bg-gray-50 flex items-center justify-center">
                                            <Icon icon={getTypeIcon(item.type)} className="w-4 h-4 text-gray-600" />
                                        </div>
                                        <span className="font-medium text-gray-900">{item.type || 'Activity'}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-gray-600">
                                    {item.userName || item.user || 'Unknown User'}
                                </td>
                                <td className="px-6 py-4 text-gray-500">
                                    {formatDate(item.createdAt)}
                                </td>
                                <td className="px-6 py-4">
                                    <StatusBadge status={item.status} size="small" />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

