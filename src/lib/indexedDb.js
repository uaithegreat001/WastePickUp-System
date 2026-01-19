const DB_NAME = "WastePickUpOfflineDB";
const STORE_NAME = "pendingSync";
const DB_VERSION = 1;

export const openOfflineDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, {
          keyPath: "id",
          autoIncrement: true,
        });
      }
    };

    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = (event) => reject(event.target.error);
  });
};

export const addToQueue = async (data) => {
  const db = await openOfflineDB();
  const tx = db.transaction(STORE_NAME, "readwrite");
  const store = tx.objectStore(STORE_NAME);

  // add timestamp for conflict resolution
  const queueItem = {
    ...data,
    queuedAt: new Date().toISOString(),
  };

  store.add(queueItem);

  window.dispatchEvent(new CustomEvent("localQueueUpdated"));

  return tx.complete;
};

// get pending queue
export const getPendingQueue = async () => {
  const db = await openOfflineDB();
  const tx = db.transaction(STORE_NAME, "readonly");
  const store = tx.objectStore(STORE_NAME);

  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

// remove from queue
export const removeFromQueue = async (id) => {
  const db = await openOfflineDB();
  const tx = db.transaction(STORE_NAME, "readwrite");
  const store = tx.objectStore(STORE_NAME);

  store.delete(id);
  window.dispatchEvent(new CustomEvent("localQueueUpdated"));

  return tx.complete;
};

export const getPendingRequestsForUser = async (
  userId,
  collection = "pickupRequests",
) => {
  const allPending = await getPendingQueue();
  return allPending.filter(
    (item) => item.userId === userId && item.targetCollection === collection,
  );
};
