import React, { useState } from 'react';
import UserSidebar from '../user/UserSidebar';
import UserHeader from '../user/UserHeader';

export default function UserLayout({ children, userName, counts = {} }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    return (
        <div className="min-h-screen bg-gray-50">
            <UserSidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} counts={counts} />
            
            <div className="lg:pl-64 flex flex-col min-h-screen transition-all duration-300 pt-14">
                <UserHeader toggleSidebar={toggleSidebar} userName={userName} />
                
                <main className="flex-1 p-6">
                    {children}
                </main>
            </div>
            
            {/* Mobile overlay */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 z-30 bg-black/50 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}
        </div>
    );
}
