import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/layouts/AdminLayout';
import { Icon } from '@iconify/react';
import StatusBadge from '../../components/admin/StatusBadge';
import { collection, getDocs, query, orderBy, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { formatDate } from '../../lib/dateUtils';

export default function UsersMessages() {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [showModal, setShowModal] = useState(false);

    // Fetch tickets from Firebase
    useEffect(() => {
        const fetchTickets = async () => {
            try {
                const q = query(collection(db, 'supportTickets'), orderBy('createdAt', 'desc'));
                const snapshot = await getDocs(q);
                const ticketData = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setTickets(ticketData);
            } catch (error) {
                console.error('Error fetching tickets:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchTickets();
    }, []);



    const handleViewTicket = (ticket) => {
        setSelectedTicket(ticket);
        setShowModal(true);
    };

    const handleStatusUpdate = async (ticketId, newStatus) => {
        try {
            const ticketRef = doc(db, 'supportTickets', ticketId);
            await updateDoc(ticketRef, {
                status: newStatus,
                updatedAt: new Date()
            });
            
            // Update local state
            setTickets(tickets.map(t => 
                t.id === ticketId ? { ...t, status: newStatus, updatedAt: new Date() } : t
            ));
            if (selectedTicket?.id === ticketId) {
                setSelectedTicket({ ...selectedTicket, status: newStatus });
            }
        } catch (error) {
            console.error('Error updating ticket status:', error);
        }
    };

    // Truncate text helper
    const truncateText = (text, maxLength = 30) => {
        if (!text) return 'N/A';
        return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-lg font-bold text-gray-900">Users Messages</h1>
                        <p className="text-xs text-gray-500 mt-1">Manage customer support tickets and messages</p>
                    </div>
                    <div className="bg-gray-100 px-4 py-2 rounded-lg">
                        <span className="text-sm font-medium text-gray-600">Total Messages: {tickets.length}</span>
                    </div>
                </div>





                {/* Tickets Table */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 capitalize tracking-wider">Subject</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 capitalize tracking-wider">User</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 capitalize tracking-wider">Message</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 capitalize tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 capitalize tracking-wider">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {loading ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                            <Icon icon="hugeicons:loading-01" className="w-6 h-6 animate-spin mx-auto mb-2" />
                                            Loading messages...
                                        </td>
                                    </tr>
                                ) : tickets.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                            No messages found
                                        </td>
                                    </tr>
                                ) : (
                                    tickets.map((ticket) => (
                                        <tr key={ticket.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900 max-w-[150px] truncate" title={ticket.subject}>
                                                {truncateText(ticket.subject, 25)}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600 max-w-[150px] truncate" title={ticket.userName}>
                                                {truncateText(ticket.userName, 20)}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600 max-w-[200px] truncate" title={ticket.message}>
                                                {truncateText(ticket.message, 40)}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                                                {formatDate(ticket.createdAt)}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => handleViewTicket(ticket)}
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

            {/* Ticket Detail Modal */}
            {showModal && selectedTicket && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                    onClick={() => setShowModal(false)}
                >
                    <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">Message Details</h2>
                                <p className="text-xs text-gray-500 mt-1">Sent on {formatDate(selectedTicket.createdAt)}</p>
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <Icon icon="hugeicons:cancel-01" className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* User Info */}
                            <div className="bg-gray-50 rounded-xl p-5">
                                <h3 className="text-xs font-semibold text-gray-500 mb-3">User Information</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-medium text-gray-500">Name</label>
                                        <p className="text-sm text-gray-900 mt-1">{selectedTicket.userName}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-gray-500">Email</label>
                                        <p className="text-sm text-gray-900 mt-1 break-all">{selectedTicket.userEmail}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Message Content - Full display */}
                            <div>
                                <h3 className="text-xs font-semibold text-gray-500 mb-3">Message Content</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs font-medium text-gray-500">Subject</label>
                                        <p className="text-sm text-gray-900 font-medium mt-1">{selectedTicket.subject}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-gray-500">Message</label>
                                        <p className="text-sm text-gray-700 mt-1 leading-relaxed whitespace-pre-wrap">{selectedTicket.message}</p>
                                    </div>
                                </div>
                            </div>


                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
