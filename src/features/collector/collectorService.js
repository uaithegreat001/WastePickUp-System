import { db } from "../../config/firebase";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { toDate } from "../../lib/dateUtils";

// Collector Service
export const collectorService = {
  // Subscribe to collector tasks
  subscribeToCollectorTasks(collectorName, callback) {
    try {
      const q = query(
        collection(db, "pickupRequests"),
        where("collectorName", "==", collectorName),
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const tasks = snapshot.docs
          .map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              scheduledDate: toDate(data.scheduledDate),
              createdAt: toDate(data.createdAt),
            };
          })
          .sort((a, b) => {
            // Sort tasks by scheduledDate
            if (!a.scheduledDate && !b.scheduledDate) return 0;
            if (!a.scheduledDate) return 1;
            if (!b.scheduledDate) return -1;
            return a.scheduledDate - b.scheduledDate;
          });
        callback(tasks);
      });

      return unsubscribe;
    } catch (error) {
      console.error("Error subscribing to collector tasks:", error);
      return () => {};
    }
  },

  // Track task completion
  async completeTask(taskId, paymentVerified = false) {
    try {
      const taskRef = doc(db, "pickupRequests", taskId);
      const updateData = {
        status: "collected",
        completedAt: serverTimestamp(),
      };

      if (paymentVerified) {
        updateData.paymentStatus = "verified";
      }

      await updateDoc(taskRef, updateData);
      return { success: true };
    } catch (error) {
      console.error("Error completing task:", error);
      throw error;
    }
  },
};
