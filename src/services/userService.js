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

