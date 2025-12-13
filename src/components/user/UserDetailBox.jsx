import React, { useEffect } from "react";
import { Icon } from "@iconify/react";
import StatusBadge from "../admin/StatusBadge";
import { formatDate } from "../../lib/dateUtils";
import PaymentButton from "../PaymentButton";

// Shows details box for pickups, orders, payments or messages
export default function UserDetailBox({ type, data, show, onClose, user }) {
  // close box
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape" && show) onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [show, onClose]);

  if (!show || !data) return null;

  // close if click out side th box
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

  // date format
  const formatShortDate = (timestamp) => formatDate(timestamp);

  // choosing which header title to use
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
      case "message":
        return {
          title: "Message Details",
          sub: `Sent on ${formatFullDate(data.createdAt)}`,
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
        {/* Header of the box */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-md font-medium text-gray-900 ">{header.title}</h2>
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

        {/* Rendering the box */}
        <div className="px-6 py-4 space-y-6">
          {type === "message" && (
            <MessageContent data={data} formatDate={formatShortDate} />
          )}
          {type === "pickup" && (
            <PickupContent
              data={data}
              formatDate={formatShortDate}
              user={user}
              onClose={onClose}
            />
          )}
          {type === "order" && (
            <OrderContent
              data={data}
              formatDate={formatShortDate}
              user={user}
              onClose={onClose}
            />
          )}
        </div>

        {/* close btn for message box details */}
        {type === "message" && (
          <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-xl flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// message-specific content
function MessageContent({ data, formatDate }) {
  return (
    <>
      <div className="flex items-center justify-between">
        {/* Subject of the message */}
        <div className="flex-1">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wider block mb-1">
            Subject
          </label>
          <p className="text-gray-900 font-medium text-lg">{data.subject}</p>
        </div>
      </div>

      {/* Message body */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
        <label className="text-xs font-medium text-gray-500 uppercase tracking-wider block mb-2">
          Message Content
        </label>
        <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
          {data.message}
        </p>
      </div>

      {/* admin reply if any */}
      {data.adminResponse && (
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
          <div className="flex items-center gap-2 mb-2">
            <Icon
              icon="hugeicons:customer-support"
              className="w-4 h-4 text-blue-600"
            />
            <label className="text-xs font-medium text-blue-800 uppercase tracking-wider">
              Admin Response
            </label>
          </div>
          <p className="text-sm text-blue-900 whitespace-pre-wrap leading-relaxed">
            {data.adminResponse}
          </p>
          {data.respondedAt && (
            <p className="text-xs text-blue-600 mt-2 text-right">
              Responded on {formatDate(data.respondedAt)}
            </p>
          )}
        </div>
      )}
    </>
  );
}

// Pickup box details content
function PickupContent({ data, formatDate, user, onClose }) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        {/* location */}
        <div className="space-y-3">
          <h4 className="text-sm text-gray-500">Pickup Location</h4>
          <div className="bg-gray-50 rounded-xl p-5 space-y-4 border border-gray-200">
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1.5">
                Address
              </label>
              <p className="text-gray-900 font-medium leading-relaxed">
                {data.pickupAddress || "N/A"}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1.5">
                  LGA
                </label>
                <p className="text-gray-900 font-medium">{data.lga || "N/A"}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1.5">
                  Zipcode
                </label>
                <p className="text-gray-900 font-medium">
                  {data.zipcode || "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* waste & payment */}
        <div className="space-y-3">
          <h4 className="text-sm text-gray-500">Waste & Payment</h4>
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
                Total Amount (Paid)
              </label>
              <p className="text-xl font-bold text-primary">
                ₦{data.amount?.toLocaleString() || "0"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// Order box details content
function OrderContent({ data, formatDate, user, onClose }) {
  return (
    <>
      {/* two-column layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        {/* delivery location */}
        <div className="space-y-3">
          <h4 className="text-sm text-gray-500">Delivery Location</h4>
          <div className="bg-gray-50 rounded-xl p-5 space-y-4 border border-gray-200">
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1.5">
                Address
              </label>
              <p className="text-gray-900 font-medium leading-relaxed">
                {data.deliveryAddress || data.address || "N/A"}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1.5">
                  LGA
                </label>
                <p className="text-gray-900 font-medium">{data.lga || "N/A"}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1.5">
                  Zipcode
                </label>
                <p className="text-gray-900 font-medium">
                  {data.zipcode || "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* order details */}
        <div className="space-y-3">
          <h4 className="text-sm text-gray-500">Bin Order Details</h4>
          <div className="bg-gray-50 rounded-xl p-5 space-y-4 border border-gray-200">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1.5">
                  Bin Size
                </label>
                <p className="text-gray-900 font-medium">
                  {data.binSize || "N/A"}
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
                Total Amount (Paid)
              </label>
              <p className="text-xl font-bold text-primary">
                ₦{(data.amount || 0).toLocaleString()}
              </p>
            </div>
            {data.notes && (
              <div className="pt-3 border-t border-gray-200">
                <label className="text-xs font-medium text-gray-500 block mb-1.5">
                  Notes
                </label>
                <p className="text-sm text-gray-700">{data.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
