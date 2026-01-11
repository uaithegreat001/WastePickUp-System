import React from "react";
import StatusBadge from "../../components/reusable/StatusBadge";
import { formatDate } from "../../lib/dateUtils";

// Tabular display of pickups data
export default function UserDataTable({
  type = "pickups",
  data,
  onViewDetails,
}) {
  // if empty data show 0
  if (!data || data.length === 0) {
    const message =
      type === "orders" ? "No bin orders yet" : "No pickup requests found yet";
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
        <p className="text-gray-500">{message}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 capitalize">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 capitalize">
                Address
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 capitalize">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 capitalize">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 capitalize">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.map((item) => (
              <tr
                key={item.id}
                className={`hover:bg-gray-50 transition-colors ${
                  item.status === "pending" ? "font-bold" : ""
                }`}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatDate(item.createdAt)}
                </td>
                <td
                  className="px-6 py-4 text-sm text-gray-900 max-w-[200px] truncate"
                  title={item.pickupAddress}
                >
                  {item.location || "N/A"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  ₦{item.amount?.toLocaleString() || "0"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    {item.status === "syncing" ? (
                      <span className="text-xs bg-gray-500 text-white px-2 py-0.5 rounded-full font-medium">
                        Syncing...
                      </span>
                    ) : (
                      <StatusBadge status={item.status} size="small" />
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                  <button
                    onClick={() => onViewDetails(item)}
                    className="text-gray-600 hover:text-gray-900 font-medium"
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
