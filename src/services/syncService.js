import { db } from "../config/firebase";
import { collection, addDoc, doc, updateDoc, setDoc } from "firebase/firestore";
import { getPendingQueue, removeFromQueue } from "../lib/indexedDb";
import { handleError } from "../lib/errorHandler";
import { toast } from "react-hot-toast";

// Sync queued data from IndexedDB to Firestore
const syncSingleItem = async (item, retryCount = 0) => {
  const maxRetries = 3;
  const { id, queuedAt, targetCollection, action, docId, ...data } = item;

  let docRef;

  try {
    if (action === "update") {
      docRef = doc(db, targetCollection, docId);
      await updateDoc(docRef, {
        ...data,
        updatedAt: new Date().toISOString(),
      });
    } else {
      if (data.requestId && targetCollection === "pickupRequests") {
        docRef = doc(db, targetCollection, data.requestId);
        await setDoc(docRef, data);
      } else {
        docRef = await addDoc(collection(db, targetCollection), data);
      }

      if (targetCollection === "pickupRequests") {
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
    await removeFromQueue(id);
    toast.success(`Successfully synced offline ${action || "creation"}`);

    window.dispatchEvent(new CustomEvent("syncComplete"));
  } catch (error) {
    if (retryCount < maxRetries) {
      const delay = Math.pow(2, retryCount) * 1000;
      console.warn(
        `Sync retry ${
          retryCount + 1
        }/${maxRetries} for item ${id} in ${delay}ms`,
      );
      setTimeout(() => syncSingleItem(item, retryCount + 1), delay);
    } else {
      handleError(error, `Sync Item ${id}`, true);
      toast.error(
        `Failed to sync item after ${maxRetries} attempts. Will retry later`,
        {
          duration: 5000,
        },
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

    for (const item of pendingItems) {
      await syncSingleItem(item);
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    console.log("Sync process completed");
  } catch (error) {
    handleError(error, "Sync Process Initialization", true);
  }
};

// Initialize sync on load and when connection is restored
export const initSyncManager = () => {
  if (navigator.onLine) {
    syncPendingData();
  }

  window.addEventListener("online", () => {
    toast.success("Connection restored. Syncing data...");
    syncPendingData();
  });
};
