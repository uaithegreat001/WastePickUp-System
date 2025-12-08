import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/layouts/AdminLayout';
import { Icon } from '@iconify/react';
import StatusBadge from '../../components/admin/StatusBadge';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { formatDate } from '../../lib/dateUtils';

export default function Payments() {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        const fetchPayments = async () => {
            try {
                // Fetch from both pickup requests and bin orders and combine
                const [pickupSnapshot, orderSnapshot] = await Promise.all([
                    getDocs(query(collection(db, 'pickupRequests'), orderBy('createdAt', 'desc'))),
                    getDocs(query(collection(db, 'binOrders'), orderBy('createdAt', 'desc')))
                ]);

                const pickupPayments = pickupSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    type: 'Pickup Service',
                    createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate() : new Date()
                }));

                const orderPayments = orderSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    type: 'Bin Order',
                    createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate() : new Date()
                }));

                const allPayments = [...pickupPayments, ...orderPayments].sort((a, b) => b.createdAt - a.createdAt);
                setPayments(allPayments);
            } catch (error) {
                console.error('Error fetching payments:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPayments();
    }, []);

    // Format date with time using our utility
    const formatDateTime = (date) => formatDate(date, { includeTime: true });

    const totalRevenue = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const completedRevenue = payments
        .filter(p => p.status === 'completed')
        .reduce((sum, p) => sum + (p.amount || 0), 0);
    const pendingRevenue = payments
        .filter(p => p.status === 'pending')
        .reduce((sum, p) => sum + (p.amount || 0), 0);



    const handleViewPayment = (payment) => {
        setSelectedPayment(payment);
        setShowModal(true);
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-lg font-bold text-gray-900">Payments & Revenue</h1>
                        <p className="text-xs text-gray-500 mt-1">Track all transactions and revenue</p>
                    </div>
                    <div className="bg-gray-100 px-4 py-2 rounded-lg">
                        <span className="text-sm font-medium text-gray-600">Total Revenue: ₦{totalRevenue.toLocaleString()}</span>
                    </div>
                </div>





                {/* Payments Table */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 capitalize tracking-wider">Transaction ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 capitalize tracking-wider">User</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 capitalize tracking-wider">Type</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 capitalize tracking-wider">Amount</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 capitalize tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 capitalize tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 capitalize tracking-wider">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {payments.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                            No payments found
                                        </td>
                                    </tr>
                                ) : (
                                    payments.map((payment) => (
                                        <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 text-sm text-gray-600 font-mono">
                                                {payment.id.substring(0, 8)}...
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                                {payment.userName || 'Unknown'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <Icon 
                                                        icon={payment.type === 'Pickup Service' ? 'hugeicons:clean' : 'hugeicons:waste'} 
                                                        className="w-4 h-4 text-gray-600" 
                                                    />
                                                    <span className="text-sm text-gray-600">{payment.type}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-bold text-gray-900">
                                                ₦{(payment.amount || 0).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {formatDateTime(payment.createdAt)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <StatusBadge status={payment.status} size="small" />
                                            </td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => handleViewPayment(payment)}
                                                    className="text-gray-600 hover:text-gray-900 font-medium text-sm"
                                                >
                                                    View Details
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
                </div>


            {/* Payment Detail Modal */}
            {showModal && selectedPayment && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                    onClick={() => setShowModal(false)}
                >
                    <div className="bg-white rounded-2xl w-full max-w-2xl p-6" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Transaction Details</h2>
                            <button
                                onClick={() => setShowModal(false)}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <Icon icon="hugeicons:cancel-01" className="w-6 h-6 text-gray-500" />
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-center gap-4 p-5 bg-gray-50 rounded-xl">
                                <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center shadow-sm">
                                    <Icon 
                                        icon={selectedPayment.type === 'Pickup Service' ? 'hugeicons:clean' : 'hugeicons:waste'} 
                                        className="w-6 h-6 text-primary" 
                                    />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 text-lg">{selectedPayment.type}</h3>
                                    <p className="text-sm text-gray-500">ID: {selectedPayment.id}</p>
                                </div>
                                <div className="ml-auto text-right">
                                    <h3 className="font-bold text-gray-900 text-xl">₦{(selectedPayment.amount || 0).toLocaleString()}</h3>
                                    <StatusBadge status={selectedPayment.status} size="small" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-medium text-gray-500 block mb-1.5">User Name</label>
                                    <p className="text-gray-900 font-medium">{selectedPayment.userName || 'Unknown'}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-500 block mb-1.5">User Email</label>
                                    <p className="text-gray-900">{selectedPayment.userEmail || 'N/A'}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-500 block mb-1.5">Date</label>
                                    <p className="text-gray-900">{formatDateTime(selectedPayment.createdAt)}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-500 block mb-1.5">Payment Method</label>
                                    <p className="text-gray-900 capitalize">{selectedPayment.paymentMethod || 'Card'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
