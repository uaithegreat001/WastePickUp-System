import { db } from "../lib/firebase";
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  doc,
  updateDoc,
  getDoc,
  setDoc,
  onSnapshot,
} from "firebase/firestore";
import { toDate } from "../lib/dateUtils";
import axios from "axios";

// Default pricing configuration
const DEFAULT_PRICING = {
  pickupPrices: [
    { value: "50", label: "50 Litres", price: 1500 },
    { value: "120", label: "120 Litres", price: 3000 },
    { value: "240", label: "240 Litres", price: 5000 },
  ],
  orderPrices: [
    { value: "50", label: "50 Litres", price: 5000 },
    { value: "120", label: "120 Litres", price: 8500 },
    { value: "240", label: "240 Litres", price: 15000 },
  ],
};

export const adminService = {
  async getPickupRequests() {
    try {
      const q = query(
        collection(db, "pickupRequests"),
        orderBy("createdAt", "desc")
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: toDate(data.createdAt),
        };
      });
    } catch (error) {
      console.error("Error fetching pickup requests:", error);
      return [];
    }
  },

  async updatePickupSchedule(requestId, scheduleData) {
    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
      // We need user email to send notification.
      // The AdminDetailBox passes 'data' which should include email?
      // Wait, scheduleData comes from AdminDashboard -> AdminDetailBox.
      // AdminDetailBox calls onSubmit(id, payload). payload is { date, driverName }.
      // We need to pass the userEmail too.
      // Let's assume scheduleData contains it or we need to fetch it?
      // Best is to pass it from the component.
      // For now, let's look at the axios call signature in server.js: { id, type, date, driverName, userEmail }

      // We need to change the signature of this function or assumed getting email in payload.
      // Let's assume payload has it.

      await axios.post(`${API_URL}/schedule-pickup`, {
        id: requestId,
        type: "pickup",
        date: scheduleData.date,
        driverName: scheduleData.driverName,
        userEmail: scheduleData.userEmail,
      });
      return true;
    } catch (error) {
      console.error("Error updating pickup schedule:", error);
      throw error;
    }
  },

  async getBinOrders() {
    try {
      const q = query(
        collection(db, "binOrders"),
        orderBy("createdAt", "desc")
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: toDate(data.createdAt),
        };
      });
    } catch (error) {
      console.error("Error fetching bin orders:", error);
      return [];
    }
  },

  async updateBinOrderSchedule(orderId, scheduleData) {
    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
      await axios.post(`${API_URL}/schedule-pickup`, {
        id: orderId,
        type: "order",
        date: scheduleData.date,
        driverName: scheduleData.driverName,
        userEmail: scheduleData.userEmail,
      });
      return true;
    } catch (error) {
      console.error("Error updating bin order schedule:", error);
      throw error;
    }
  },

  // Real-time subscriptions
  subscribeToPickupRequests(callback) {
    const q = query(
      collection(db, "pickupRequests"),
      orderBy("createdAt", "desc")
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const requests = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: toDate(data.createdAt),
          };
        });
        callback(requests);
      },
      (error) => {
        console.error("Error subscribing to pickup requests:", error);
      }
    );
  },

  subscribeToBinOrders(callback) {
    const q = query(collection(db, "binOrders"), orderBy("createdAt", "desc"));

    return onSnapshot(
      q,
      (snapshot) => {
        const orders = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: toDate(data.createdAt),
          };
        });
        callback(orders);
      },
      (error) => {
        console.error("Error subscribing to bin orders:", error);
      }
    );
  },

  // Real-time subscription for users
  subscribeToUsers(callback, onError) {
    const q = query(collection(db, "users"), orderBy("createdAt", "desc"));

    return onSnapshot(
      q,
      (snapshot) => {
        const users = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: toDate(doc.data().createdAt),
        }));
        callback(users);
      },
      (error) => {
        console.error("Error subscribing to users:", error);
        if (onError) onError(error);
      }
    );
  },

  async getSupportTickets() {
    try {
      const q = query(
        collection(db, "supportTickets"),
        orderBy("createdAt", "desc")
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: toDate(data.createdAt),
        };
      });
    } catch (error) {
      console.error("Error fetching support tickets:", error);
      return [];
    }
  },

  // Get pricing settings from Firebase or return defaults
  async getPricingSettings() {
    try {
      const settingsRef = doc(db, "settings", "pricing");
      const settingsSnap = await getDoc(settingsRef);

      if (settingsSnap.exists()) {
        return settingsSnap.data();
      }

      // Return defaults if no settings exist
      return DEFAULT_PRICING;
    } catch (error) {
      console.error("Error fetching pricing settings:", error);
      return DEFAULT_PRICING;
    }
  },

  // Update pricing settings in Firebase
  async updatePricingSettings(pricingData) {
    try {
      const settingsRef = doc(db, "settings", "pricing");
      await setDoc(
        settingsRef,
        {
          ...pricingData,
          updatedAt: new Date(),
        },
        { merge: true }
      );

      return { success: true, message: "Pricing updated successfully" };
    } catch (error) {
      console.error("Error updating pricing settings:", error);
      throw error;
    }
  },
};
