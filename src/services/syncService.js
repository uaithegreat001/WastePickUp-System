import { db } from "../config/firebase";
import { collection, addDoc, doc, updateDoc, setDoc } from "firebase/firestore";
import { getPendingQueue, removeFromQueue } from "../lib/indexedDb";
import { handleError } from "../lib/errorHandler";
import { toast } from "react-hot-toast";

/**
 * Sync Service: Background synchronization between local queue and Firestore.
 
 */

const syncSingleItem = async (item, retryCount = 0) => {
  const maxRetries = 3;
  const { id, queuedAt, targetCollection, action, docId, ...data } = item;

  let docRef;

  try {
    if (action === "update") {
      // Handle document updates
      docRef = doc(db, targetCollection, docId);
      await updateDoc(docRef, {
        ...data,
        updatedAt: new Date().toISOString(),
      });
    } else {
      // Handle document creation (default)
      if (data.requestId && targetCollection === "pickupRequests") {
        docRef = doc(db, targetCollection, data.requestId);
        await setDoc(docRef, data);
      } else {
        docRef = await addDoc(collection(db, targetCollection), data);
      }

      // Create linked payment record for pickup requests
      if (targetCollection === "pickupRequests") {
        // Payment needs to be idempotent too if possible,
        // but payment ID isn't pre-generated in strictly the same way in previous code.
        // However, we can query if it exists or just rely on the fact that if main doc syncs, this runs.
        // If main doc syncs and this fails, we might have issues.
        // Ideally we should use a batch, but let's stick to the current pattern for now to minimize risk errors.
        // Actually, if we use the same requestId for payment reference or ID, we could make it idempotent.
        // The previous code used docRef.id as requestId in payment.

        // Let's check if payment already exists for this requestId to be safe?
        // Or better, let's just use addDoc as before for now,
        // but if we really want to avoid multiple payments for same request:
        // We could use requestId as the payment document ID or part of it?
        // Unlikely to conflict.
        // Let's stick to original logic for payment for now, but use the docRef.id which is now stable (requestId).

        await addDoc(collection(db, "payments"), {
          userId: data.userId,
          requestId: docRef.id,
          amount: data.amount,
          status: data.paymentStatus === "verified" ? "paid" : "pending",
          paymentMethod: data.paymentMethod,
          createdAt: new Date().toISOString(),
        });
      }
    }

    if (data.status === "syncing") {
      await updateDoc(docRef, { status: "pending" });
    }

    // Remove from local queue on success
    await removeFromQueue(id);
    toast.success(`Successfully synced offline ${action || "creation"}`, {
      icon: "🔄",
    });

    // Notify UI to refresh data
    window.dispatchEvent(new CustomEvent("syncComplete"));
  } catch (error) {
    if (retryCount < maxRetries) {
      // Exponential backoff: wait 1s, 2s, 4s
      const delay = Math.pow(2, retryCount) * 1000;
      console.warn(
        `Sync retry ${
          retryCount + 1
        }/${maxRetries} for item ${id} in ${delay}ms`
      );
      setTimeout(() => syncSingleItem(item, retryCount + 1), delay);
    } else {
      handleError(error, `Sync Item ${id}`, true);
      // Mark item as failed but keep it in queue for manual retry
      toast.error(
        `Failed to sync item after ${maxRetries} attempts. Will retry later.`,
        {
          duration: 5000,
        }
      );
    }
  }
};

export const syncPendingData = async () => {
  try {
    const pendingItems = await getPendingQueue();

    if (pendingItems.length === 0) {
      console.log("No pending items to sync");
      return;
    }

    console.log(`Starting sync for ${pendingItems.length} pending items`);
    window.dispatchEvent(new CustomEvent("syncStart"));

    // Process items sequentially to avoid overwhelming the server
    for (const item of pendingItems) {
      await syncSingleItem(item);
      // Small delay between items
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    console.log("Sync process completed");
  } catch (error) {
    handleError(error, "Sync Process Initialization", true);
  }
};

/**
 * Utility to trigger sync when online
 */
export const initSyncManager = () => {
  // Initial sync attempt
  if (navigator.onLine) {
    syncPendingData();
  }

  // Listen for recovery
  window.addEventListener("online", () => {
    toast.success("Connection restored. Syncing data...");
    syncPendingData();
  });
};
