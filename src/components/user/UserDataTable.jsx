import React from "react";
import StatusBadge from "../../components/reusable/StatusBadge";
import { formatDate } from "../../lib/dateUtils";

// Tabular display of pickups or orders data
export default function UserDataTable({ type, data, onViewDetails }) {
  // if empty data show 0
  if (!data || data.length === 0) {
    return <EmptyState type={type} />;
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {type === "pickups" && <PickupHeaders />}
              {type === "orders" && <OrderHeaders />}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                {type === "pickups" && (
                  <PickupRow item={item} formatDate={formatDate} />
                )}
                {type === "orders" && (
                  <OrderRow item={item} formatDate={formatDate} />
                )}
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

// Empty state when there's data to show
function EmptyState({ type }) {
  const texts = {
    pickups: "No pickup requests yet",
    orders: "No bin orders yet",
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
      <p className="text-gray-500">{texts[type]}</p>
    </div>
  );
}

// table headers for each type
function PickupHeaders() {
  return (
    <>
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
    </>
  );
}

function OrderHeaders() {
  return (
    <>
      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 capitalize">
        Date
      </th>
      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 capitalize">
        Bin Size
      </th>
      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 capitalize">
        Quantity
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
    </>
  );
}

// row content data for pickup
function PickupRow({ item, formatDate }) {
  return (
    <>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {formatDate(item.createdAt)}
      </td>
      <td
        className="px-6 py-4 text-sm text-gray-900 max-w-[200px] truncate"
        title={item.pickupAddress}
      >
        {item.pickupAddress || "N/A"}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
        ₦{item.amount?.toLocaleString() || "0"}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <StatusBadge status={item.status} size="small" />
      </td>
    </>
  );
}
// row content data for bin orders
function OrderRow({ item, formatDate }) {
  return (
    <>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {formatDate(item.createdAt)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {item.binSize || "N/A"}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {item.quantity || 0}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
        ₦{(item.amount || 0).toLocaleString()}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <StatusBadge status={item.status} size="small" />
      </td>
    </>
  );
}
