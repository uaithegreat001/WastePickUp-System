import React from 'react';
import { Icon } from '@iconify/react';

export default function StatsCard({ title, value, icon, trend, trendValue, iconBg = 'bg-gray-50', iconColor = 'text-gray-600' }) {
    return (
        <div className="bg-transparent border border-gray-200 rounded-xl p-5 transition-all">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-xs font-medium text-gray-500 mb-2">{title}</p>
                    <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
                </div>
                <div className={`h-12 w-12 rounded-full flex items-center justify-center ${iconBg}`}>
                    <Icon icon={icon} className={`w-6 h-6 ${iconColor}`} />
                </div>
            </div>
            
            {trend && (
                <div className="mt-4 flex items-center text-sm">
                    <span className={`flex items-center font-medium ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                        <Icon icon={trend === 'up' ? 'hugeicons:trending-up' : 'hugeicons:trending-down'} className="w-4 h-4 mr-1" />
                        {trendValue}
                    </span>
                    <span className="text-gray-400 ml-2">vs last month</span>
                </div>
            )}
        </div>
    );
}
