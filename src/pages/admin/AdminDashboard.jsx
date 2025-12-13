import React, { useState, useEffect } from "react";
import AdminLayout from "../../components/layouts/AdminLayout";
import AdminDataTable from "../../components/admin/AdminDataTable";
import AdminDetailBox from "../../components/admin/AdminDetailBox";
import { adminService } from "../../services/adminService";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("pickups");
  const [pickups, setPickups] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // for detail box
  const [selected, setSelected] = useState(null);
  const [detailType, setDetailType] = useState(null);
  const [showDetail, setShowDetail] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pickupsData, ordersData] = await Promise.all([
          adminService.getPickupRequests(),
          adminService.getBinOrders(),
        ]);
        setPickups(pickupsData);
        setOrders(ordersData);
      } catch (error) {
        console.error("Failed to load dashboard data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

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

  const tabs = [
    { id: "pickups", label: `Pickup Requests (${pickups.length})` },
    { id: "orders", label: `Bin Orders (${orders.length})` },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* welcome */}
        <div>
          <h1 className="text-md font-medium text-gray-900">
            Dashboard Overview</h1>
          
        </div>

        {/* tabs and its content */}
        <div className="space-y-6">
          <div className="flex items-center gap-8 border-b border-gray-200">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-3 text-sm font-medium transition-all relative ${
                  activeTab === tab.id
                    ? "text-primary"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full" />
                )}
              </button>
            ))}
          </div>

          <div className="min-h-[400px]">
            {activeTab === "pickups" && (
              <AdminDataTable
                type="pickups"
                data={pickups}
                onViewDetails={(item) => openDetail(item, "pickup")}
                loading={loading}
              />
            )}
            {activeTab === "orders" && (
              <AdminDataTable
                type="orders"
                data={orders}
                onViewDetails={(item) => openDetail(item, "order")}
                loading={loading}
              />
            )}
          </div>
        </div>
      </div>

      {/* detail box for pickup and order */}
      <AdminDetailBox
        type={detailType}
        data={selected}
        show={showDetail}
        onClose={closeDetail}
        onSubmit={async (id, payload) => {
          try {
            if (detailType === "pickup") {
              await adminService.updatePickupSchedule(id, payload);
            } else {
              await adminService.updateBinOrderSchedule(id, payload);
            }
            const [p, o] = await Promise.all([
              adminService.getPickupRequests(),
              adminService.getBinOrders(),
            ]);
            setPickups(p);
            setOrders(o);
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
