import React, { useState } from 'react';
import Sidebar from '../admin/Sidebar';
import Header from '../admin/Header';

export default function AdminLayout({ children }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    return (
        <div className="min-h-screen bg-gray-50">
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
            
            <div className="lg:pl-64 flex flex-col min-h-screen transition-all duration-300 pt-14">
                <Header toggleSidebar={toggleSidebar} />
                
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
