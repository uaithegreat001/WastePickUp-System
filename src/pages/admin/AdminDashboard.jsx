import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import AdminLayout from '../../components/layouts/AdminLayout';
import StatsCard from '../../components/admin/StatsCard';
import RecentActivityTable from '../../components/admin/RecentActivityTable';
import { adminService } from '../../services/adminService';

export default function AdminDashboard() {
    const { userData } = useAuth();
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalRequests: 0,
        totalPending: 0,
        revenue: 0
    });
    const [recentActivity, setRecentActivity] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentDateTime, setCurrentDateTime] = useState(new Date());

    useEffect(() => {
        // Update time every second
        const timer = setInterval(() => {
            setCurrentDateTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsData, activityData] = await Promise.all([
                    adminService.getDashboardStats(),
                    adminService.getRecentActivities()
                ]);
                setStats(statsData);
                setRecentActivity(activityData);
            } catch (error) {
                console.error("Failed to load dashboard data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const formatDate = (date) => {
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatTime = (date) => {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const statCards = [
        { 
            title: 'Total Users', 
            value: stats.totalUsers, 
            icon: 'hugeicons:user-group-03',
            iconBg: 'bg-blue-50',
            iconColor: 'text-blue-600'
        },
        { 
            title: 'Total Pickup Requests', 
            value: stats.totalRequests, 
            icon: 'hugeicons:clean',
            iconBg: 'bg-orange-50',
            iconColor: 'text-orange-600'
        },
        { 
            title: 'Total Pending', 
            value: stats.totalPending, 
            icon: 'hugeicons:activity-01',
            iconBg: 'bg-yellow-50',
            iconColor: 'text-yellow-600'
        },
        { 
            title: 'Total Revenue', 
            value: `₦${stats.revenue.toLocaleString()}`, 
            icon: 'hugeicons:money-bag-02',
            iconBg: 'bg-green-50',
            iconColor: 'text-green-600'
        },
    ];

    return (
        <AdminLayout>
            <div className="space-y-6 ">
                {/* Welcome Section with Date & Time */}
                <div className="flex flex-col gap-1  ">
                    <h1 className="text-lg font-bold text-gray-900">Dashboard Overview</h1>
                    <div className="flex flex-col gap-1">
                        <p className="text-xs text-gray-500">Welcome back, {userData?.fullName || 'Admin'}</p>
                        <p className="text-xs font-medium text-gray-500 flex items-center gap-2">
                            <span>{formatDate(currentDateTime)}</span>
                            <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                            <span>{formatTime(currentDateTime)}</span>
                        </p>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {statCards.map((stat, index) => (
                        <StatsCard key={index} {...stat} />
                    ))}
                </div>

                {/* Recent Activity - Full Width since Quick Actions is removed */}
                <div className="grid grid-cols-1 gap-6">
                    <RecentActivityTable data={recentActivity} />
                </div>
            </div>
        </AdminLayout>
    );
}