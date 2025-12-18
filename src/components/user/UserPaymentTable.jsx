import React from "react";
import StatusBadge from "../reusable/StatusBadge";
import { formatDate } from "../../lib/dateUtils";

// Displays payment history from pickups and orders
export default function UserPaymentTable({ data, onViewDetails }) {
  // show empty state if no data
  if (!data || data.length === 0) {
    return <EmptyState />;
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
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 capitalize">
                Description
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
              <PaymentRow
                key={item.id}
                item={item}
                formatDate={formatDate}
                onViewDetails={onViewDetails}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// empty state when there's nothing to show
function EmptyState() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
      <p className="text-gray-500">No payment history yet</p>
    </div>
  );
}

// row content for payment items
function PaymentRow({ item, formatDate, onViewDetails }) {
  const isPickup = item.type === "pickup";
  const binSize = item.binSize || "N/A";
  const quantity = item.quantity || 1;

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {formatDate(item.createdAt)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-700">
            {isPickup ? "Pickup" : "Order"}
          </span>
        </div>
      </td>
      <td className="px-6 py-4 text-sm text-gray-900">
        {isPickup
          ? `${binSize} bin pickup${quantity > 1 ? ` (${quantity}x)` : ""}`
          : `${binSize} bin order${quantity > 1 ? ` (${quantity}x)` : ""}`}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
        ₦{item.amount?.toLocaleString() || "0"}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <StatusBadge status="paid" size="small" />
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
  );
}
