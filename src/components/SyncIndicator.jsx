import React, { useState, useEffect } from "react";
import { useNetwork } from "../hooks/useNetwork";
import { getPendingQueue } from "../lib/indexedDb";
import { Icon } from "@iconify/react";

/**
 * Premium Sync Indicator with glassmorphism and vibrant colors.
 * Shows online/offline status, pending items, and sync progress.
 */
const SyncIndicator = () => {
  const { isOnline } = useNetwork();
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const updatePendingCount = async () => {
      try {
        const pending = await getPendingQueue();
        setPendingCount(pending.length);
      } catch (error) {
        console.error("Error getting pending count:", error);
      }
    };

    updatePendingCount();

    // Listen for sync events
    const handleSyncStart = () => setIsSyncing(true);
    const handleSyncComplete = () => {
      setIsSyncing(false);
      updatePendingCount();
    };

    window.addEventListener("syncStart", handleSyncStart);
    window.addEventListener("syncComplete", handleSyncComplete);

    return () => {
      window.removeEventListener("syncStart", handleSyncStart);
      window.removeEventListener("syncComplete", handleSyncComplete);
    };
  }, []);

  const getStatusInfo = () => {
    if (isSyncing) {
      return {
        icon: "solar:refresh-circle-bold",
        text: "Syncing...",
        bgClass: "bg-blue-500/20 border-blue-500/30 text-blue-400",
        animate: true,
      };
    }

    if (!isOnline) {
      return {
        icon: "solar:cloud-cross-bold",
        text: "Offline Mode",
        bgClass: "bg-rose-500/20 border-rose-500/30 text-rose-400",
        animate: false,
      };
    }

    if (pendingCount > 0) {
      return {
        icon: "solar:cloud-upload-bold",
        text: `${pendingCount} pending`,
        bgClass: "bg-amber-500/20 border-amber-500/30 text-amber-400",
        animate: true,
      };
    }

    return {
      icon: "solar:cloud-check-bold",
      text: "All synced",
      bgClass: "bg-emerald-500/20 border-emerald-500/30 text-emerald-400",
      animate: false,
    };
  };

  const { text } = getStatusInfo();

  // Log status to console
  console.log(
    `Sync Status: ${text}${
      !isOnline && pendingCount > 0 ? ` (${pendingCount} queued)` : ""
    }${isOnline && pendingCount > 0 && !isSyncing ? " (Auto-syncing)" : ""}`
  );

  // Only show visual indicator when syncing
  if (!isSyncing) return null;

  return (
    <div className="fixed top-4 right-4 md:top-6 md:right-6 z-50 bg-primary/50 text-white px-3 py-2 md:px-4 md:py-2 rounded-full shadow-lg text-xs md:text-sm font-medium">
      Syncing...
    </div>
  );
};

export default SyncIndicator;
