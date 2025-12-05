import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import UserLayout from '../../components/layouts/UserLayout';
import UserStatsCard from '../../components/user/UserStatsCard';
import UserDataTable from '../../components/user/UserDataTable';
import UserDetailBox from '../../components/user/UserDetailBox';
import { userService } from '../../services/userService';

export default function UserDashboard() {
    const { userData, currentUser } = useAuth();
    
    const user = userData || { name: 'User', email: '', phone: '' };

    const [activeTab, setActiveTab] = useState('pickups');
    const [stats, setStats] = useState({
        totalPickups: 0,
        pendingPickups: 0,
        completedPickups: 0,
        totalSpent: 0
    });
    const [recentPickups, setRecentPickups] = useState([]);
    const [recentOrders, setRecentOrders] = useState([]);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // for the detail popup
    const [selected, setSelected] = useState(null);
    const [detailType, setDetailType] = useState(null);
    const [showDetail, setShowDetail] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsData, pickups, orders, supportTickets] = await Promise.all([
                    userService.getUserDashboardStats(currentUser?.uid),
                    userService.getUserPickupRequests(currentUser?.uid),
                    userService.getUserBinOrders(currentUser?.uid),
                    userService.getUserSupportTickets(currentUser?.uid)
                ]);
                
                setStats(statsData);
                setRecentPickups(pickups);
                setRecentOrders(orders);
                setMessages(supportTickets);
            } catch (error) {
                console.error('Failed to load dashboard data', error);
            } finally {
                setLoading(false);
            }
        };

        if (currentUser?.uid) {
            fetchData();
        }
    }, [currentUser?.uid]);

    // open the detail box for any item type
    const openDetail = (item, type) => {
        setSelected(item);
        setDetailType(type);
        setShowDetail(true);
    };

    const closeDetail = () => {
        setShowDetail(false);
        setSelected(null);
        setDetailType(null);
    };

    // calculate pending count from both pickups and orders
    const pendingPickups = recentPickups.filter(p => p.status === 'pending').length;
    const pendingOrders = recentOrders.filter(o => o.status === 'pending').length;
    const totalPending = pendingPickups + pendingOrders;

    const statCards = [
        { title: 'Total Pendings', value: totalPending, icon: 'hugeicons:time-01' },
        { title: 'Total Spent', value: `₦${stats.totalSpent.toLocaleString()}`, icon: 'hugeicons:money-bag-02' },
    ];

    const tabs = [
        { id: 'pickups', label: `Pickup Requests (${recentPickups.length})` },
        { id: 'orders', label: `Bin Orders (${recentOrders.length})` },
        { id: 'messages', label: `Messages (${messages.length})` },
    ];

    const sidebarCounts = {
        pickups: recentPickups.length,
        orders: recentOrders.length,
        messages: messages.length
    };

    return (
        <UserLayout userName={user.name} counts={sidebarCounts}>
            <div className="space-y-8">
                {/* welcome */}
                <div>
                    <h1 className="text-lg font-bold text-gray-900">Hi, <span className="font-medium">{user.name}</span></h1>
                </div>

                {/* stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {statCards.map((stat, index) => (
                        <UserStatsCard key={index} {...stat} />
                    ))}
                </div>

                {/* tabs and content */}
                <div className="space-y-6">
                    <div className="flex items-center gap-8 border-b border-gray-200">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`pb-3 text-sm font-medium transition-all relative ${
                                    activeTab === tab.id
                                        ? 'text-primary'
                                        : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                {tab.label}
                                {activeTab === tab.id && (
                                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full" />
                                )}
                            </button>
                        ))}
                    </div>

                    <div className="min-h-[400px]">
                        {activeTab === 'pickups' && (
                            <UserDataTable 
                                type="pickups"
                                data={recentPickups} 
                                onViewDetails={(item) => openDetail(item, 'pickup')}
                            />
                        )}
                        {activeTab === 'orders' && (
                            <UserDataTable 
                                type="orders"
                                data={recentOrders} 
                                onViewDetails={(item) => openDetail(item, 'order')}
                            />
                        )}
                        {activeTab === 'messages' && (
                            <UserDataTable 
                                type="messages"
                                data={messages} 
                                onViewDetails={(item) => openDetail(item, 'message')}
                            />
                        )}
                    </div>
                </div>
            </div>

            {/* single detail box that handles all types */}
            <UserDetailBox
                type={detailType}
                data={selected}
                show={showDetail}
                onClose={closeDetail}
            />
        </UserLayout>
    );
}
