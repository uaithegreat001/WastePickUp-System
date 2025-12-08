import { db } from '../lib/firebase';
import { collection, addDoc, getDocs, query, where, orderBy, limit, doc, updateDoc } from 'firebase/firestore';
import { sortByCreatedAt } from '../lib/dateUtils';

export const userService = {
    async createPickupRequest(requestData) {
        try {
            const docRef = await addDoc(collection(db, 'pickupRequests'), {
                ...requestData,
                status: 'pending',
                createdAt: new Date(),
                updatedAt: new Date()
            });
            
            return {
                success: true,
                id: docRef.id,
                message: 'Pickup request submitted successfully'
            };
        } catch (error) {
            console.error('Error creating pickup request:', error);
            throw error;
        }
    },

    async getUserPickupRequests(userId) {
        try {
            const q = query(
                collection(db, 'pickupRequests'),
                where('userId', '==', userId)
            );
            
            const querySnapshot = await getDocs(q);
            const requests = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Sort by createdAt desc
            return sortByCreatedAt(requests);
        } catch (error) {
            console.error('Error fetching user pickup requests:', error);
            throw error;
        }
    },

    async createBinOrder(orderData) {
        try {
            const docRef = await addDoc(collection(db, 'binOrders'), {
                ...orderData,
                status: 'pending',
                createdAt: new Date(),
                updatedAt: new Date()
            });
            
            return {
                success: true,
                id: docRef.id,
                message: 'Bin order submitted successfully'
            };
        } catch (error) {
            console.error('Error creating bin order:', error);
            throw error;
        }
    },

    async getUserBinOrders(userId) {
        try {
            const q = query(
                collection(db, 'binOrders'),
                where('userId', '==', userId)
            );
            
            const querySnapshot = await getDocs(q);
            const orders = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Sort by createdAt desc
            return sortByCreatedAt(orders);
        } catch (error) {
            console.error('Error fetching user bin orders:', error);
            throw error;
        }
    },

    async getUserDashboardStats(userId) {
        try {
            const [pickupRequests, binOrders] = await Promise.all([
                this.getUserPickupRequests(userId),
                this.getUserBinOrders(userId)
            ]);

            const totalPickups = pickupRequests.length;
            const pendingPickups = pickupRequests.filter(r => r.status === 'pending').length;
            const completedPickups = pickupRequests.filter(r => r.status === 'completed').length;
            const totalSpent = [...pickupRequests, ...binOrders].reduce((sum, item) => {
                return sum + (item.amount || 0);
            }, 0);

            return {
                totalPickups,
                pendingPickups,
                completedPickups,
                totalSpent
            };
        } catch (error) {
            console.error('Error fetching user dashboard stats:', error);
            return {
                totalPickups: 0,
                pendingPickups: 0,
                completedPickups: 0,
                totalSpent: 0
            };
        }
    },

    async getUserRecentActivity(userId, limitCount = 5) {
        try {
            const pickupQuery = query(
                collection(db, 'pickupRequests'),
                where('userId', '==', userId)
            );

            const binOrderQuery = query(
                collection(db, 'binOrders'),
                where('userId', '==', userId)
            );

            const [pickupSnapshot, orderSnapshot] = await Promise.all([
                getDocs(pickupQuery),
                getDocs(binOrderQuery)
            ]);

            const pickups = pickupSnapshot.docs.map(doc => ({
                id: doc.id,
                type: 'pickup',
                ...doc.data()
            }));

            const orders = orderSnapshot.docs.map(doc => ({
                id: doc.id,
                type: 'order',
                ...doc.data()
            }));

            // Combine and sort by date
            const allActivity = sortByCreatedAt([...pickups, ...orders]);

            return allActivity.slice(0, limitCount);
        } catch (error) {
            console.error('Error fetching user recent activity:', error);
            return [];
        }
    },

    async createSupportTicket(ticketData) {
        try {
            const docRef = await addDoc(collection(db, 'supportTickets'), {
                ...ticketData,
                status: 'open',
                createdAt: new Date(),
                updatedAt: new Date()
            });
            
            return {
                success: true,
                id: docRef.id,
                message: 'Support ticket submitted successfully'
            };
        } catch (error) {
            console.error('Error creating support ticket:', error);
            throw error;
        }
    },

    async getUserSupportTickets(userId) {
        try {
            const q = query(
                collection(db, 'supportTickets'),
                where('userId', '==', userId)
            );
            
            const querySnapshot = await getDocs(q);
            const tickets = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Sort by createdAt desc
            return sortByCreatedAt(tickets);
        } catch (error) {
            console.error('Error fetching user support tickets:', error);
            throw error;
        }
    },

    async updateUserProfile(userId, profileData) {
        try {
            const { doc: docRef, updateDoc } = await import('firebase/firestore');
            const userDocRef = docRef(db, 'users', userId);
            
            await updateDoc(userDocRef, {
                ...profileData,
                updatedAt: new Date()
            });
            
            return {
                success: true,
                message: 'Profile updated successfully'
            };
        } catch (error) {
            console.error('Error updating user profile:', error);
            throw error;
        }
    }
};

