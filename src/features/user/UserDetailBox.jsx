import React, { useEffect } from "react";
import { Icon } from "@iconify/react";
import StatusBadge from "../../components/reusable/StatusBadge";
import { formatDate } from "../../lib/dateUtils";

// Default pricing configuration
const DEFAULT_PRICING = {
  pickupPrices: [
    { value: "50", label: "50 Litres", price: 1500 },
    { value: "120", label: "120 Litres", price: 3000 },
    { value: "240", label: "240 Litres", price: 5000 },
  ],
  orderPrices: [
    { value: "50", label: "50 Litres", price: 5000 },
    { value: "120", label: "120 Litres", price: 8500 },
    { value: "240", label: "240 Litres", price: 15000 },
  ],
};

// Calculate total price based on bin size and quantity
const calculateTotalPrice = (binSize, quantity, priceList) => {
  if (!binSize || !quantity) return 0;
  const priceItem = priceList.find((item) => item.value === binSize.toString());
  if (!priceItem) return 0;
  return priceItem.price * quantity;
};

// user detail box component
export default function UserDetailBox({ type, data, show, onClose }) {
  if (!show || !data) return null;

  // handle backdrop click
  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  // Date, weekday, and time format
  const formatFullDate = (timestamp) =>
    formatDate(timestamp, {
      includeTime: true,
      includeWeekday: true,
      dateStyle: "long",
    });

  // update header title & sub title of the box details
  const getHeader = () => {
    switch (type) {
      case "pickup":
        return {
          title: "Pickup Request Details",
          sub: `Requested on ${formatFullDate(data.createdAt)}`,
        };
      case "order":
        return {
          title: "Bin Order Details",
          sub: `Ordered on ${formatFullDate(data.createdAt)}`,
        };
      default:
        return { title: "Details", sub: "" };
    }
  };

  const header = getHeader();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={handleBackdrop}
    >
      <style>{`
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>

      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto hide-scrollbar shadow-2xl flex flex-col">
        {/* update header title of the box details */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-md font-medium text-gray-900 ">
              {header.title}
            </h2>
            <div className="flex items-center gap-3 mt-1">
              <p className="text-sm text-gray-500">{header.sub}</p>
              {data.status && <StatusBadge status={data.status} size="small" />}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-700"
          >
            <Icon icon="hugeicons:cancel-01" className="w-6 h-6" />
          </button>
        </div>

        {/* rendering the box  content details */}
        <div className="px-6 py-4 space-y-6">
          {type === "pickup" && <PickupContent data={data} />}
        </div>
      </div>
    </div>
  );
}

// Pickup box details content
function PickupContent({ data }) {
  // Calculate total price
  const totalPrice = calculateTotalPrice(
    data.binSize,
    data.quantity,
    DEFAULT_PRICING.pickupPrices
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
      {/* location */}
      <div className="space-y-3">
        <h4 className="text-sm text-gray-500">Pickup Location</h4>
        <div className="bg-gray-50 rounded-xl p-5 space-y-4 border border-gray-200">
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1.5">
              Location
            </label>
            <p className="text-gray-900 font-medium leading-relaxed">
              {data.location || "N/A"}
            </p>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1.5">
              LGA
            </label>
            <p className="text-gray-900 font-medium">{data.lga || "N/A"}</p>
          </div>
        </div>
      </div>

      {/* pickup request details */}
      <div className="space-y-3">
        <h4 className="text-sm text-gray-500">Pickup Request Details</h4>
        <div className="bg-gray-50 rounded-xl p-5 space-y-4 border border-gray-200">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1.5">
                Bin Size
              </label>
              <p className="text-gray-900 font-medium">
                {data.binSize || "N/A"} Litres
              </p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1.5">
                Quantity
              </label>
              <p className="text-gray-900 font-medium">
                {data.quantity || 0} Bins
              </p>
            </div>
          </div>
          <div className="pt-3 border-t border-gray-200">
            <label className="text-xs font-medium text-gray-500 block mb-1.5">
              Estimated Total
            </label>
            <p className="text-xl font-bold text-[rgb(36,157,119)]">
              ₦{totalPrice.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
