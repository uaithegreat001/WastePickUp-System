import React, { useState, useEffect } from "react";
import AdminLayout from "../../components/layouts/AdminLayout";
import { adminService } from "../../services/adminService";

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const [pickups, orders] = await Promise.all([
        adminService.getPickupRequests(),
        adminService.getBinOrders(),
      ]);

      const pickupPayments = pickups
        .filter((p) => p.amount && Number(p.amount) > 0)
        .map((p) => ({
          id: p.id,
          user: p.userName || p.contactName || "Unknown User",
          email: p.userEmail || p.contactPhone || "-",
          amount: Number(p.amount),
          date: p.createdAt,
          type: "Pickup Request",
          status: p.paymentStatus || (p.status === "paid" ? "paid" : "pending"),
          reference: p.paymentReference || "-",
        }));

      const orderPayments = orders
        .filter((o) => o.amount && Number(o.amount) > 0)
        .map((o) => ({
          id: o.id,
          user: o.userName || o.contactName || "Unknown User",
          email: o.userEmail || o.contactPhone || "-",
          amount: Number(o.amount),
          date: o.createdAt,
          type: "Bin Order",
          status: o.paymentStatus || (o.status === "paid" ? "paid" : "pending"),
          reference: o.paymentReference || "-",
        }));

      const allPayments = [...pickupPayments, ...orderPayments].sort(
        (a, b) => b.date - a.date
      );

      setPayments(allPayments);
    } catch (error) {
      console.error("Error fetching payments:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPayments = payments.filter(
    (payment) =>
      payment.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "paid":
        return "bg-green-100 text-green-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "failed":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <AdminLayout title="Payments & Transactions">
      <div className="space-y-6">
        <div>
          <h1 className="text-md font-medium text-gray-900">
            Transaction History{" "}
            <span className="text-gray-400 font-normal text-sm">
              ({payments.length})
            </span>
          </h1>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left py-3 px-6 text-xs font-semibold text-gray-500 capitalize tracking-wider">
                    Reference
                  </th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 capitalize tracking-wider">
                    User
                  </th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 capitalize tracking-wider">
                    Type
                  </th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 capitalize tracking-wider">
                    Amount
                  </th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 capitalize tracking-wider">
                    Date
                  </th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 capitalize tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-gray-500">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                        Loading transactions...
                      </div>
                    </td>
                  </tr>
                ) : filteredPayments.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-gray-500">
                      No transactions found
                    </td>
                  </tr>
                ) : (
                  filteredPayments.map((payment) => (
                    <tr
                      key={`${payment.type}-${payment.id}`}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="py-3 px-6 text-sm font-medium text-gray-900">
                        #{payment.reference.substring(0, 8)}...
                      </td>
                      <td className="py-3 px-6">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-900">
                            {payment.user}
                          </span>
                          <span className="text-xs text-gray-500">
                            {payment.email}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-6">
                        <span className="text-sm text-gray-700">
                          {payment.type === "Bin Order" ? "Order" : "Pickup"}
                        </span>
                      </td>
                      <td className="py-3 px-6 text-sm font-bold text-gray-900">
                        ?{payment.amount.toLocaleString()}
                      </td>
                      <td className="py-3 px-6 text-sm text-gray-500">
                        {payment.date
                          ? new Date(payment.date).toLocaleDateString()
                          : "N/A"}
                      </td>
                      <td className="py-3 px-6">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                            payment.status
                          )}`}
                        >
                          {payment.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
