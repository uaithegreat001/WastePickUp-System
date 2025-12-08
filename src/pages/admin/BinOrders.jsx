import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/layouts/AdminLayout';
import StatsCard from '../../components/admin/StatsCard';
import AdminDataTable from '../../components/admin/AdminDataTable';
import AdminDetailBox from '../../components/admin/AdminDetailBox';
import { adminService } from '../../services/adminService';

export default function BinOrders() {
    const [orders, setOrders] = useState([]);
    const [stats, setStats] = useState({ total: 0, pending: 0, completed: 0 });
    const [selected, setSelected] = useState(null);
    const [showDetail, setShowDetail] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [ordersData, statsData] = await Promise.all([
                adminService.getBinOrders(),
                adminService.getBinOrderStats()
            ]);
            setOrders(ordersData);
            setStats(statsData);
        } catch (error) {
            console.error('Failed to load bin orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = (order) => {
        setSelected(order);
        setShowDetail(true);
    };

    const handleUpdateSchedule = async (orderId, scheduleData) => {
        try {
            await adminService.updateBinOrderSchedule(orderId, scheduleData);
            await fetchData();
            alert('Delivery schedule sent successfully!');
        } catch (error) {
            console.error('Failed to update schedule:', error);
            throw error;
        }
    };

    const statCards = [
        { title: 'Total Bin Orders', value: stats.total, icon: 'hugeicons:package' },
        { title: 'Pending Deliveries', value: stats.pending, icon: 'hugeicons:time-01' },
        { title: 'Completed Deliveries', value: stats.completed, icon: 'hugeicons:checkmark-circle-02' }
    ];

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-lg font-bold text-gray-900">Bin Orders</h1>
                        <p className="text-xs text-gray-500 mt-1">Manage bin purchase and rental orders</p>
                    </div>
                    <div className="bg-gray-100 px-4 py-2 rounded-lg">
                        <span className="text-sm font-medium text-gray-600">Total Orders: {orders.length}</span>
                    </div>
                </div>



                <AdminDataTable 
                    type="orders"
                    data={orders} 
                    onViewDetails={handleViewDetails} 
                />

                <AdminDetailBox
                    type="order"
                    data={selected}
                    show={showDetail}
                    onClose={() => setShowDetail(false)}
                    onSubmit={handleUpdateSchedule}
                />
            </div>
        </AdminLayout>
    );
}
