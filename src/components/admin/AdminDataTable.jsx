import React from 'react';
import { Icon } from '@iconify/react';
import StatusBadge from './StatusBadge';
import { formatDate, toDate, isToday, isYesterday } from '../../lib/dateUtils';

// displays pickup requests or bin orders in a grouped table
export default function AdminDataTable({ type, data = [], onViewDetails }) {
    const isPickup = type === 'pickups';
    
    const formatDate = (timestamp) => {
        if (!timestamp) return 'Not set';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // group items by date (today, yesterday, older) then by zipcode
    const groupByDateAndZipcode = (items) => {
        const timeGroups = { today: [], yesterday: [], older: {} };

        items.forEach(item => {
            const created = toDate(item.createdAt);
            
            if (isToday(created)) {
                timeGroups.today.push(item);
            } else if (isYesterday(created)) {
                timeGroups.yesterday.push(item);
            } else {
                const dateKey = formatDate(created);
                if (!timeGroups.older[dateKey]) timeGroups.older[dateKey] = [];
                timeGroups.older[dateKey].push(item);
            }
        });

        const groupByZip = (arr) => {
            const groups = {};
            arr.forEach(item => {
                const zip = item.zipcode || 'No Zipcode';
                if (!groups[zip]) groups[zip] = [];
                groups[zip].push(item);
            });
            return groups;
        };

        return {
            today: groupByZip(timeGroups.today),
            yesterday: groupByZip(timeGroups.yesterday),
            older: Object.entries(timeGroups.older).reduce((acc, [date, items]) => {
                acc[date] = groupByZip(items);
                return acc;
            }, {})
        };
    };

    const isUnscheduled = (item) => !item.scheduledDate || !item.scheduledTime;

    // empty state
    if (!data || data.length === 0) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                <Icon icon={isPickup ? 'hugeicons:truck-02' : 'hugeicons:package'} className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No {isPickup ? 'pickup requests' : 'bin orders'} found</p>
            </div>
        );
    }

    const grouped = groupByDateAndZipcode(data);

    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {/* header */}
            <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="font-bold text-gray-900">All {isPickup ? 'Pickup Requests' : 'Bin Orders'}</h3>
            </div>

            {/* column headers */}
            <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center text-xs font-medium text-gray-500 capitalize">
                    <div className="w-1/4">Name</div>
                    <div className="w-1/4">{isPickup ? 'Pickup' : 'Delivery'} Address</div>
                    <div className="w-1/6">Date</div>
                    <div className="w-1/6">Status</div>
                    <div className="w-1/6 text-right">Action</div>
                </div>
            </div>

            {/* grouped rows */}
            <div className="p-6 space-y-8">
                {/* today */}
                {Object.keys(grouped.today).length > 0 && (
                    <div className="space-y-6">
                        <DateDivider label="Today" />
                        {Object.entries(grouped.today).map(([zip, items]) => (
                            <ZipGroup key={`today-${zip}`} zipcode={zip} items={items} isPickup={isPickup} formatDate={formatDate} isUnscheduled={isUnscheduled} onViewDetails={onViewDetails} />
                        ))}
                    </div>
                )}

                {/* yesterday */}
                {Object.keys(grouped.yesterday).length > 0 && (
                    <div className="space-y-6">
                        <DateDivider label="Yesterday" />
                        {Object.entries(grouped.yesterday).map(([zip, items]) => (
                            <ZipGroup key={`yest-${zip}`} zipcode={zip} items={items} isPickup={isPickup} formatDate={formatDate} isUnscheduled={isUnscheduled} onViewDetails={onViewDetails} />
                        ))}
                    </div>
                )}

                {/* older dates */}
                {Object.entries(grouped.older).map(([date, zipGroups]) => (
                    <div key={date} className="space-y-6">
                        <DateDivider label={date} />
                        {Object.entries(zipGroups).map(([zip, items]) => (
                            <ZipGroup key={`${date}-${zip}`} zipcode={zip} items={items} isPickup={isPickup} formatDate={formatDate} isUnscheduled={isUnscheduled} onViewDetails={onViewDetails} />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}

// horizontal date divider
function DateDivider({ label }) {
    return (
        <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-gray-300"></div>
            <span className="text-sm font-medium text-gray-600">{label}</span>
            <div className="flex-1 h-px bg-gray-300"></div>
        </div>
    );
}

// zipcode group with vertical thread line
function ZipGroup({ zipcode, items, isPickup, formatDate, isUnscheduled, onViewDetails }) {
    return (
        <div className="space-y-0">
            <div className="mb-3">
                <span className="text-sm font-medium text-gray-600">Zipcode {zipcode}</span>
            </div>
            <div className="flex gap-3">
                <div className="w-px bg-gray-300 flex-shrink-0"></div>
                <div className="flex-1 space-y-2">
                    {items.map(item => (
                        <ItemRow key={item.id} item={item} isPickup={isPickup} formatDate={formatDate} isUnscheduled={isUnscheduled} onViewDetails={onViewDetails} />
                    ))}
                </div>
            </div>
        </div>
    );
}

// single row for an item
function ItemRow({ item, isPickup, formatDate, isUnscheduled, onViewDetails }) {
    const unscheduled = isUnscheduled(item);

    return (
        <div className={`flex items-center py-3 px-6 rounded-lg border transition-colors ${
            unscheduled ? 'border-gray-300 bg-gray-50' : 'border-gray-200 bg-white hover:bg-gray-50'
        }`}>
            {/* name */}
            <div className="w-1/4 flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-semibold text-sm flex-shrink-0">
                    {item.userName?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div className="min-w-0">
                    <p className={`text-sm text-gray-900 truncate ${unscheduled ? 'font-bold' : 'font-medium'}`}>
                        {item.userName || 'Unknown User'}
                    </p>
                    <p className={`text-xs text-gray-500 truncate ${unscheduled ? 'font-semibold' : ''}`}>
                        {item.userEmail || ''}
                    </p>
                </div>
            </div>

            {/* address */}
            <div className="w-1/4 px-2">
                <p className={`text-sm text-gray-700 truncate ${unscheduled ? 'font-bold' : ''}`}>
                    {isPickup ? item.pickupAddress : (item.deliveryAddress || item.address || 'No address')}
                </p>
            </div>

            {/* date */}
            <div className="w-1/6 px-2">
                <span className={`text-sm ${unscheduled ? 'font-bold text-gray-900' : 'text-gray-600'}`}>
                    {formatDate(item.createdAt)}
                </span>
            </div>

            {/* status */}
            <div className="w-1/6 px-2">
                <StatusBadge status={item.status} size="small" />
            </div>

            {/* action */}
            <div className="w-1/6 flex justify-end">
                <button
                    onClick={() => onViewDetails(item)}
                    className="relative inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors border border-gray-300"
                >
                    <span>View Details</span>
                    <Icon icon="hugeicons:arrow-right-01" className="w-4 h-4" />
                    {unscheduled && (
                        <span className="absolute -top-1 -right-1 h-2.5 w-2.5 bg-black rounded-full"></span>
                    )}
                </button>
            </div>
        </div>
    );
}
