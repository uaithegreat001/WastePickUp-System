import React, { useState, useEffect } from "react";
import AdminLayout from "./AdminLayout";
import AdminDetailBox from "./AdminDetailBox";
import StatusBadge from "../../components/reusable/StatusBadge";
import { adminService } from "./adminService";
import AdminDataTable from "./AdminDataTable";

// admin dashboard component
export default function AdminDashboard() {
  const [pickups, setPickups] = useState([]);

  // for detail box
  const [selected, setSelected] = useState(null);
  const [detailType, setDetailType] = useState(null);
  const [showDetail, setShowDetail] = useState(false);

  // fetch data on load from the admin service
  useEffect(() => {
    // Subscribe to real-time updates
    const unsubscribePickups = adminService.subscribeToPickupRequests(
      (data) => {
        setPickups(data);
      }
    );

    return () => {
      unsubscribePickups();
    };
  }, []);

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
    <AdminLayout>
      <div className="space-y-8">
        {/* header */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage all incoming pickup requests and monitor system-wide
            activity.
          </p>
        </div>

        {/* content */}
        <div className="min-h-[400px]">
          <AdminDataTable
            data={pickups}
            onViewDetails={(item) => openDetail(item, "pickup")}
          />
        </div>
      </div>

      {/* detail box for handling pickup data */}
      <AdminDetailBox
        type={detailType}
        data={selected}
        show={showDetail}
        onClose={closeDetail}
        onSubmit={async (id, payload) => {
          try {
            await adminService.updatePickupSchedule(id, {
              ...payload,
              userEmail: selected.userEmail,
            });

            closeDetail();
          } catch (e) {
            console.error(e);
            throw e;
          }
        }}
      />
    </AdminLayout>
  );
}
