import { db } from "../../config/firebase";
import {
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  updateDoc,
  getDoc,
  setDoc,
  onSnapshot,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { toDate } from "../../lib/dateUtils";
import { addToQueue } from "../../lib/indexedDb";
import axios from "axios";

// Default pricing configuration
const DEFAULT_PRICING = {
  pickupPrices: [
    { value: "50", label: "50 Litres", price: 1500 },
    { value: "120", label: "120 Litres", price: 3000 },
    { value: "240", label: "240 Litres", price: 5000 },
  ],
};

export const adminService = {
  async getUsers() {
    try {
      const q = query(collection(db, "users"), orderBy("createdAt", "desc"));

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
      console.error("Error fetching users:", error);
      return [];
    }
  },

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

  subscribeToPickupRequests(callback) {
    try {
      const q = query(
        collection(db, "pickupRequests"),
        orderBy("createdAt", "desc")
      );

      const unsubscribe = onSnapshot(q, async (querySnapshot) => {
        const dataPromises = querySnapshot.docs.map(async (docSnap) => {
          const docData = docSnap.data();
          let userEmail = docData.userEmail;
          if (!userEmail && docData.userId) {
            try {
              const userDoc = await getDoc(doc(db, "users", docData.userId));
              if (userDoc.exists()) {
                userEmail = userDoc.data().email;
              }
            } catch (err) {
              console.error("Error fetching user email:", err);
            }
          }
          return {
            id: docSnap.id,
            ...docData,
            userEmail,
            createdAt: toDate(docData.createdAt),
          };
        });
        const data = await Promise.all(dataPromises);
        callback(data);
      });

      return unsubscribe;
    } catch (error) {
      console.error("Error subscribing to pickup requests:", error);
      return () => {};
    }
  },

  async updatePickupSchedule(requestId, scheduleData) {
    try {
      const payload = {
        action: "update",
        targetCollection: "pickupRequests",
        docId: requestId,
        status: "scheduled",
        scheduledDate: scheduleData.date,
        collectorName: scheduleData.collectorName,
        scheduledAt: new Date().toISOString(),
      };

      if (!navigator.onLine) {
        await addToQueue(payload);
        return {
          success: true,
          offline: true,
          message: "Schedule queued offline.",
        };
      }

      const requestRef = doc(db, "pickupRequests", requestId);
      await updateDoc(requestRef, {
        status: "scheduled",
        scheduledDate: scheduleData.date,
        collectorName: scheduleData.collectorName,
        scheduledAt: serverTimestamp(),
      });

      // Create in-app notification
      const requestDoc = await getDoc(doc(db, "pickupRequests", requestId));
      if (requestDoc.exists()) {
        const userId = requestDoc.data().userId;
        await addDoc(collection(db, "notifications"), {
          userId: userId,
          type: "pickup",
          title: "Pickup Scheduled",
          message: `<p>Hi there,</p><p>Great news! Your waste pickup is now scheduled for:</p><div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;"><p><strong>Date:</strong> ${new Date(
            scheduleData.date
          ).toLocaleDateString()}</p><p><strong>Time:</strong> ${new Date(
            scheduleData.date
          ).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}</p><p><strong>Collector:</strong> ${
            scheduleData.collectorName
          }</p></div><p>Please ensure your bin is ready and accessible. We're committed to keeping your environment clean!</p>`,
          read: false,
          createdAt: new Date().toISOString(),
          relatedId: requestId,
        });
      }

      return true;
    } catch (error) {
      console.error("Error updating pickup schedule:", error);
      throw error;
    }
  },
};
