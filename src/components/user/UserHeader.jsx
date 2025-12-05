import React from 'react';
import { Icon } from '@iconify/react';
import { useLocation } from 'react-router-dom';

export default function UserHeader({ toggleSidebar, userName = 'User' }) {
    const location = useLocation();

    // Helper to get initials
    const getInitials = (name) => {
        const names = name.split(' ');
        if (names.length >= 2) {
            return (names[0][0] + names[1][0]).toUpperCase();
        }
        return name.slice(0, 2).toUpperCase();
    };

    // Helper to truncate name
    const getDisplayName = (name) => {
        if (name.length > 15) {
            return name.slice(0, 15) + '...';
        }
        return name;
    };

    return (
        <header className="fixed top-0 right-0 z-30 flex h-14 w-full lg:w-[calc(100%-16rem)] items-center justify-between bg-white px-6 border-b border-gray-200 transition-all duration-300">
            <div className="flex items-center gap-4">
                <button 
                    onClick={toggleSidebar}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg lg:hidden"
                >
                    <Icon icon="hugeicons:menu-01" className="w-6 h-6" />
                </button>
            </div>

            <div className="flex items-center gap-6">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3 pl-4">
                        <div className="text-right hidden md:block">
                            <p className="text-sm font-medium text-gray-900">{getDisplayName(userName)}</p>
                        </div>
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                            {getInitials(userName)}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
