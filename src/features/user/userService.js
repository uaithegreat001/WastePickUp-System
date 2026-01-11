import { db } from "../../config/firebase";
import {
  collection,
  addDoc,
  setDoc,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
  writeBatch,
  onSnapshot,
} from "firebase/firestore";
import { sortByCreatedAt } from "../../lib/dateUtils";
import { addToQueue, getPendingRequestsForUser } from "../../lib/indexedDb";
import { handleError, withErrorHandling } from "../../lib/errorHandler";

import { v4 as uuidv4 } from "uuid";

const makePayment = withErrorHandling(async (paymentData) => {
  const payload = {
    userId: paymentData.userId,
    requestId: paymentData.requestId,
    amount: paymentData.amount,
    status: paymentData.status || "pending",
    paymentMethod: paymentData.paymentMethod,
    paymentReference: paymentData.paymentReference || "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const docRef = await addDoc(collection(db, "payments"), payload);
  return { success: true, id: docRef.id };
}, "Payment Creation");

export const userService = {
  makePayment,

  createPickupRequest: withErrorHandling(
    async (requestData) => {
      // Generate a persistent ID for idempotency (offline & online)
      const requestId = uuidv4();

      const payload = {
        requestId, // store logic ID in document
        userId: requestData.userId,
        userName: requestData.userName,
        location: requestData.location,
        lga: requestData.lga,
        contactPhone: requestData.contactPhone,
        binSize: requestData.binSize,
        amount: requestData.amount,
        status: !navigator.onLine ? "syncing" : "pending",
        paymentStatus: requestData.paymentStatus || "pending_pickup",
        paymentMethod: requestData.paymentMethod || "onPickup",
        collectorName: requestData.collectorName || "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        targetCollection: "pickupRequests",
      };

      if (!navigator.onLine) {
        try {
          await addToQueue(payload);
          return {
            success: true,
            offline: true,
            message: "Pickup request queued offline.",
          };
        } catch (error) {
          handleError(error, "Offline Queue Storage", true);
          throw new Error(
            "Failed to save request offline. Please check your browser storage settings."
          );
        }
      }

      // Use setDoc with the pre-generated ID to guarantee consistency
      // and match the offline behavior logic
      const docRef = doc(db, "pickupRequests", requestId);
      await setDoc(docRef, payload);

      const paymentPayload = {
        userId: payload.userId,
        requestId: requestId,
        amount: payload.amount,
        status: payload.paymentStatus === "verified" ? "paid" : "pending",
        paymentMethod: payload.paymentMethod,
        paymentReference: requestData.paymentReference || "",
      };

      await makePayment(paymentPayload);

      return {
        success: true,
        id: docRef.id,
        message: "Pickup request submitted successfully",
      };
    },
    "Pickup Request Creation",
    false
  ), // Don't show toast here, let component handle it

  getUserPickupRequests: withErrorHandling(async (userId) => {
    let firestoreRequests = [];
    try {
      const q = query(
        collection(db, "pickupRequests"),
        where("userId", "==", userId)
      );

      const querySnapshot = await getDocs(q);
      firestoreRequests = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        syncStatus: "synced",
      }));
    } catch (error) {
      // If Firestore fails (e.g., offline), proceed with empty firestoreRequests
      console.warn(
        "Failed to fetch from Firestore, using local data only:",
        error.message
      );
    }

    const pendingRequests = await getPendingRequestsForUser(userId);
    const localRequests = pendingRequests.map((item) => ({
      ...item,
      syncStatus: "pending",
      id: `pending-${item.id}`,
    }));

    const allRequests = [...firestoreRequests, ...localRequests];
    return sortByCreatedAt(allRequests);
  }, "Fetching User Requests"),

  subscribeToUserPickupRequests: (userId, callback) => {
    const q = query(
      collection(db, "pickupRequests"),
      where("userId", "==", userId)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const requests = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        syncStatus: "synced",
      }));
      callback(requests);
    });

    return unsubscribe;
  },

  updateUserProfile: withErrorHandling(async (userId, profileData) => {
    const userDocRef = doc(db, "users", userId);
    const payload = {
      ...profileData,
      updatedAt: new Date().toISOString(),
    };
    await updateDoc(userDocRef, payload);

    return { success: true, message: "Profile updated successfully" };
  }, "Profile Update"),

  markAllNotificationsAsRead: withErrorHandling(async (userId) => {
    const q = query(
      collection(db, "notifications"),
      where("userId", "==", userId),
      where("read", "==", false)
    );

    const snapshot = await getDocs(q);
    if (snapshot.empty) return { success: true };

    const batch = writeBatch(db);
    snapshot.docs.forEach((document) => {
      batch.update(document.ref, { read: true });
    });

    await batch.commit();
    return { success: true };
  }, "Marking Notifications Read"),
};
