import React from "react";
import StatusBadge from "../../components/reusable/StatusBadge";
import { formatDate } from "../../lib/dateUtils";

export default function AdminDataTable({ data, onViewDetails }) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
        <p className="text-gray-500">No pickup requests yet</p>
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
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 capitalize">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 capitalize">
                Location
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
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                      {item.userName?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {item.userName || item.contactPhone || "User"}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatDate(item.createdAt)}
                </td>
                <td
                  className="px-6 py-4 text-sm text-gray-900 max-w-[200px] truncate"
                  title={item.location}
                >
                  {item.location || "N/A"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  ₦{item.amount?.toLocaleString() || "0"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status={item.status} size="small" />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                  <button
                    onClick={() => onViewDetails(item)}
                    className={`${
                      item.status !== "pending"
                        ? "text-gray-400 hover:text-gray-600"
                        : "text-primary hover:text-primary-hover"
                    } font-medium`}
                  >
                    {item.status !== "pending" ? "Scheduled" : "Schedule"}
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
