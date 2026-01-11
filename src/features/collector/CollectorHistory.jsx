import React, { useState, useEffect } from "react";
import CollectorLayout from "./CollectorLayout";
import StatusBadge from "../../components/reusable/StatusBadge";
import { formatDate } from "../../lib/dateUtils";
import { useAuth } from "../auth/AuthContext";
import { collectorService } from "./collectorService";
import { Icon } from "@iconify/react";

export default function CollectorHistory() {
  const { userData } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userData?.fullName) return;

    setLoading(true);
    const unsubscribe = collectorService.subscribeToCollectorTasks(
      userData.fullName,
      (liveTasks) => {
        setHistory(liveTasks.filter((t) => t.status === "collected"));
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userData]);

  return (
    <CollectorLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Pickup History</h1>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : history.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 capitalize">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 capitalize">
                      Completion Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 capitalize">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 capitalize">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 capitalize">
                      Payment
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {history.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {item.userName || "Resident"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(item.completedAt || item.scheduledDate)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-[200px] truncate">
                        {item.location}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ₦{(item.amount || 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge
                          status={
                            item.paymentStatus === "verified"
                              ? "paid"
                              : "pending"
                          }
                          size="small"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-20">
              
              <p className="text-gray-500 text-sm">No pickup history found yet</p>
            </div>
          )}
        </div>
      </div>
    </CollectorLayout>
  );
}
