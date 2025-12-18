import React, { useState, useEffect } from "react";
import AdminLayout from "../../components/layouts/AdminLayout";
import { Icon } from "@iconify/react";
import StatusBadge from "../../components/reusable/StatusBadge";
import { adminService } from "../../services/adminService";

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <AdminLayout title="Payments & Transactions">
      <div className="space-y-6">
        {/* Header with Revenue */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-md font-medium text-gray-900">
            Transaction History{" "}
            <span className="text-gray-400 font-normal text-sm">
              ({payments.length})
            </span>
          </h1>

          <div className=" px-4 py-2 ">
            <span className="text-sm font-medium text-gray-600 mr-2">
              Total Revenue =
            </span>
            <span className="text-md font-bold text-primary">
              ₦
              {payments
                .reduce((acc, curr) => acc + curr.amount, 0)
                .toLocaleString()}
            </span>
          </div>
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
                {payments.length === 0 && !loading ? (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-gray-500">
                      No transactions found
                    </td>
                  </tr>
                ) : (
                  payments.map((payment) => (
                    <tr
                      key={`${payment.type}-${payment.id}`}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="py-3 px-6 text-sm font-medium text-gray-900">
                        #{payment.reference}
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
                        ₦{payment.amount.toLocaleString()}
                      </td>
                      <td className="py-3 px-6 text-sm text-gray-500">
                        {payment.date
                          ? new Date(payment.date).toLocaleDateString()
                          : "N/A"}
                      </td>
                      <td className="py-3 px-6">
                        <StatusBadge status="paid" size="small" />
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
