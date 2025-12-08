import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/layouts/AdminLayout';
import StatsCard from '../../components/admin/StatsCard';
import AdminDataTable from '../../components/admin/AdminDataTable';
import AdminDetailBox from '../../components/admin/AdminDetailBox';
import { adminService } from '../../services/adminService';

export default function PickupRequests() {
    const [requests, setRequests] = useState([]);
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
            const [requestsData, statsData] = await Promise.all([
                adminService.getPickupRequests(),
                adminService.getPickupRequestStats()
            ]);
            setRequests(requestsData);
            setStats(statsData);
        } catch (error) {
            console.error('Failed to load pickup requests:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = (request) => {
        setSelected(request);
        setShowDetail(true);
    };

    const handleUpdateSchedule = async (requestId, scheduleData) => {
        try {
            await adminService.updatePickupSchedule(requestId, scheduleData);
            await fetchData();
            alert('Pickup schedule sent successfully!');
        } catch (error) {
            console.error('Failed to update schedule:', error);
            throw error;
        }
    };

    const statCards = [
        { title: 'Total New Request', value: stats.total, icon: 'hugeicons:truck-02' },
        { title: 'Pending Requests', value: stats.pending, icon: 'hugeicons:time-01' },
        { title: 'Completed Requests', value: stats.completed, icon: 'hugeicons:checkmark-circle-02' }
    ];

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-lg font-bold text-gray-900">Pickup Requests</h1>
                        <p className="text-xs text-gray-500 mt-1">View and manage waste pickup requests from users</p>
                    </div>
                    <div className="bg-gray-100 px-4 py-2 rounded-lg">
                        <span className="text-sm font-medium text-gray-600">Total Requests: {requests.length}</span>
                    </div>
                </div>



                <AdminDataTable 
                    type="pickups"
                    data={requests} 
                    onViewDetails={handleViewDetails} 
                />

                <AdminDetailBox
                    type="pickup"
                    data={selected}
                    show={showDetail}
                    onClose={() => setShowDetail(false)}
                    onSubmit={handleUpdateSchedule}
                />
            </div>
        </AdminLayout>
    );
}
