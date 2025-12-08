import { db } from '../lib/firebase';
import { collection, getDocs, query, orderBy, limit, where, doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import { toDate } from '../lib/dateUtils';

// Default pricing configuration
const DEFAULT_PRICING = {
    pickupPrices: [
        { value: '50', label: '50 Litres', price: 1500 },
        { value: '120', label: '120 Litres', price: 3000 },
        { value: '240', label: '240 Litres', price: 5000 }
    ],
    orderPrices: [
        { value: '50', label: '50 Litres', price: 5000 },
        { value: '120', label: '120 Litres', price: 8500 },
        { value: '240', label: '240 Litres', price: 15000 }
    ]
};

export const adminService = {
    async getDashboardStats() {
        try {
            // Fetch users
            const usersSnapshot = await getDocs(collection(db, 'users'));
            const totalUsers = usersSnapshot.size;

            // Fetch all pickup requests
            const requestsSnapshot = await getDocs(collection(db, 'pickupRequests'));
            const totalRequests = requestsSnapshot.size;

            // Fetch all bin orders for revenue
            const ordersSnapshot = await getDocs(collection(db, 'binOrders'));

            // Calculate revenue and pending requests
            let revenue = 0;
            let totalPending = 0;

            requestsSnapshot.forEach(doc => {
                const data = doc.data();
                if (data.amount) {
                    revenue += Number(data.amount) || 0;
                }
                if (data.status === 'pending') {
                    totalPending++;
                }
            });

            ordersSnapshot.forEach(doc => {
                const data = doc.data();
                if (data.amount) {
                    revenue += Number(data.amount) || 0;
                }
            });

            return {
                totalUsers,
                totalRequests,
                totalPending,
                revenue
            };
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            // Return default values on error to prevent UI crash
            return {
                totalUsers: 0,
                totalRequests: 0,
                totalPending: 0,
                revenue: 0
            };
        }
    },

    async getRecentActivities() {
        try {
            // Fetch recent pickup requests
            const pickupQuery = query(
                collection(db, 'pickupRequests'),
                orderBy('createdAt', 'desc'),
                limit(10)
            );

            // Fetch recent bin orders
            const orderQuery = query(
                collection(db, 'binOrders'),
                orderBy('createdAt', 'desc'),
                limit(10)
            );

            const [pickupSnapshot, orderSnapshot] = await Promise.all([
                getDocs(pickupQuery),
                getDocs(orderQuery)
            ]);

            // Map pickup requests
            const pickups = pickupSnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    createdAt: toDate(data.createdAt),
                    type: 'Pickup Request',
                    user: data.userName || 'Unknown User'
                };
            });

            // Map bin orders
            const orders = orderSnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    createdAt: toDate(data.createdAt),
                    type: 'Bin Order',
                    user: data.userName || 'Unknown User'
                };
            });

            // Combine and sort by date
            const allActivities = [...pickups, ...orders].sort((a, b) => {
                return b.createdAt - a.createdAt;
            });

            // Return only the 10 most recent
            return allActivities.slice(0, 10);
        } catch (error) {
            console.error('Error fetching recent activities:', error);
            return [];
        }
    },

    async getPickupRequests() {
        try {
            const q = query(
                collection(db, 'pickupRequests'),
                orderBy('createdAt', 'desc')
            );

            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    createdAt: toDate(data.createdAt)
                };
            });
        } catch (error) {
            console.error('Error fetching pickup requests:', error);
            return [];
        }
    },

    async getPickupRequestStats() {
        try {
            const querySnapshot = await getDocs(collection(db, 'pickupRequests'));
            
            let total = 0;
            let pending = 0;
            let completed = 0;

            querySnapshot.forEach(doc => {
                const data = doc.data();
                total++;
                if (data.status === 'pending') pending++;
                if (data.status === 'completed') completed++;
            });

            return {
                total,
                pending,
                completed
            };
        } catch (error) {
            console.error('Error fetching pickup request stats:', error);
            return {
                total: 0,
                pending: 0,
                completed: 0
            };
        }
    },

    async updatePickupSchedule(requestId, scheduleData) {
        try {
            const requestRef = doc(db, 'pickupRequests', requestId);
            await updateDoc(requestRef, {
                ...scheduleData,
                status: 'scheduled',
                updatedAt: new Date()
            });
            return true;
        } catch (error) {
            console.error('Error updating pickup schedule:', error);
            throw error;
        }
    },

    async getBinOrders() {
        try {
            const q = query(
                collection(db, 'binOrders'),
                orderBy('createdAt', 'desc')
            );

            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    createdAt: toDate(data.createdAt)
                };
            });
        } catch (error) {
            console.error('Error fetching bin orders:', error);
            return [];
        }
    },

    async getBinOrderStats() {
        try {
            const querySnapshot = await getDocs(collection(db, 'binOrders'));
            
            let total = 0;
            let pending = 0;
            let completed = 0;

            querySnapshot.forEach(doc => {
                const data = doc.data();
                total++;
                if (data.status === 'pending') pending++;
                if (data.status === 'completed') completed++;
            });

            return {
                total,
                pending,
                completed
            };
        } catch (error) {
            console.error('Error fetching bin order stats:', error);
            return {
                total: 0,
                pending: 0,
                completed: 0
            };
        }
    },

    async updateBinOrderSchedule(orderId, scheduleData) {
        try {
            const orderRef = doc(db, 'binOrders', orderId);
            await updateDoc(orderRef, {
                ...scheduleData,
                status: 'scheduled',
                updatedAt: new Date()
            });
            return true;
        } catch (error) {
            console.error('Error updating bin order schedule:', error);
            throw error;
        }
    },

    // Get pricing settings from Firebase or return defaults
    async getPricingSettings() {
        try {
            const settingsRef = doc(db, 'settings', 'pricing');
            const settingsSnap = await getDoc(settingsRef);
            
            if (settingsSnap.exists()) {
                return settingsSnap.data();
            }
            
            // Return defaults if no settings exist
            return DEFAULT_PRICING;
        } catch (error) {
            console.error('Error fetching pricing settings:', error);
            return DEFAULT_PRICING;
        }
    },

    // Update pricing settings in Firebase
    async updatePricingSettings(pricingData) {
        try {
            const settingsRef = doc(db, 'settings', 'pricing');
            await setDoc(settingsRef, {
                ...pricingData,
                updatedAt: new Date()
            }, { merge: true });
            
            return { success: true, message: 'Pricing updated successfully' };
        } catch (error) {
            console.error('Error updating pricing settings:', error);
            throw error;
        }
    }
};
