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

export const collectorService = {
  /**
   * Subscribe to tasks assigned to a specific collector
   */
  subscribeToCollectorTasks(collectorName, callback) {
    try {
      const q = query(
        collection(db, "pickupRequests"),
        where("collectorName", "==", collectorName),
        orderBy("scheduledDate", "asc")
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const tasks = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            scheduledDate: toDate(data.scheduledDate),
            createdAt: toDate(data.createdAt),
          };
        });
        callback(tasks);
      });

      return unsubscribe;
    } catch (error) {
      console.error("Error subscribing to collector tasks:", error);
      return () => {};
    }
  },

  /**
   * Mark a task as collected/completed
   */
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
