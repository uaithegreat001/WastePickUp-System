import React, { useState, useEffect } from "react";
import { useAuth } from "../auth/AuthContext";
import UserLayout from "./UserLayout";
import UserDataTable from "./UserDataTable";
import UserDetailBox from "./UserDetailBox";
import { userService } from "./userService";
import { getPendingRequestsForUser } from "../../lib/indexedDb";
import { sortByCreatedAt } from "../../lib/dateUtils";

// user dashboard component
export default function UserDashboard() {
  const { userData, currentUser } = useAuth();
  const user = userData || { fullName: "User", email: "", phone: "" };
  const [recentPickups, setRecentPickups] = useState([]);

  // firestore data  
  const [firestoreData, setFirestoreData] = useState([]);
  // local data
  const [localData, setLocalData] = useState([]);

  // for detail box
  const [selected, setSelected] = useState(null);
  const [detailType, setDetailType] = useState(null);
  const [showDetail, setShowDetail] = useState(false);

  // Subscribe to Firestore (Online Data)
  useEffect(() => {
    if (!currentUser?.uid) return;

    const unsubscribe = userService.subscribeToUserPickupRequests(
      currentUser.uid,
      (data) => {
        setFirestoreData(data);
      }
    );

    return () => unsubscribe();
  }, [currentUser?.uid]);

  // fetch local data 
  const fetchLocalData = async () => {
    if (!currentUser?.uid) return;
    try {
      const pending = await getPendingRequestsForUser(currentUser.uid);
      const formattedLocal = pending.map((item) => ({
        ...item,
        syncStatus: "pending",
        id: `pending-${item.id}`, 
      }));
      setLocalData(formattedLocal);
    } catch (error) {
      console.error("Error fetching local data:", error);
    }
  };

  // 
  useEffect(() => {
    fetchLocalData();

    const handleLocalUpdate = () => fetchLocalData();
    // when sync completes
    const handleSyncComplete = () => fetchLocalData();

    window.addEventListener("localQueueUpdated", handleLocalUpdate);
    window.addEventListener("syncComplete", handleSyncComplete);

    return () => {
      window.removeEventListener("localQueueUpdated", handleLocalUpdate);
      window.removeEventListener("syncComplete", handleSyncComplete);
    };
  }, [currentUser?.uid]);

  // merge and sort data  
  useEffect(() => {
    const merged = [...firestoreData, ...localData];
    setRecentPickups(sortByCreatedAt(merged));
  }, [firestoreData, localData]);

  
  useEffect(() => {
    if (selected && showDetail) {
      const updatedItem = recentPickups.find((item) => item.id === selected.id);
      if (updatedItem) {
        setSelected(updatedItem);
      }
    }
  }, [recentPickups, selected, showDetail]);

  // open the detail box
  const openDetail = (item, type) => {
    setSelected(item);
    setDetailType(type);
    setShowDetail(true);
  };
  const closeDetail = () => {
    setShowDetail(false);
    setSelected(null);
    setDetailType(null);
  };

  return (
    <UserLayout userName={user.fullName}>
      <div className="space-y-8">
        {/* header */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage your waste pickup requests and track their status in
            real-time.
          </p>
        </div>

        <div className="min-h-[400px]">
          {/* pickups table */}
          <UserDataTable
            data={recentPickups}
            onViewDetails={(item) => openDetail(item, "pickup")}
          />
        </div>
      </div>

      {/* detail box for handling user pickup requests */}
      <UserDetailBox
        type={detailType}
        data={selected}
        show={showDetail}
        onClose={closeDetail}
      />
    </UserLayout>
  );
}
