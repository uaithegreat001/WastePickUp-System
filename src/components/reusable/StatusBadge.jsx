import React from "react";

const STATUS_CONFIG = {
  pending: {
    bgColor: "bg-yellow-100",
    textColor: "text-yellow-700",
    label: "Pending",
  },
  scheduled: {
    bgColor: "bg-blue-100",
    textColor: "text-blue-700",
    label: "Scheduled",
  },
  paid: {
    bgColor: "bg-green-100",
    textColor: "text-green-700",
    label: "Paid",
  },
  collected: {
    bgColor: "bg-green-100",
    textColor: "text-green-700",
    label: "Collected",
  },
  syncing: {
    bgColor: "bg-gray-200",
    textColor: "text-gray-700",
    label: "Syncing...",
  },
  unread: {
    bgColor: "bg-red-50",
    textColor: "text-red-600",
    label: "unread",
  },
  reply: {
    bgColor: "bg-red-50",
    textColor: "text-red-600",
    label: "unread",
  },
  dot: {
    bgColor: "bg-red-500",
    textColor: "text-white",
    label: "", // Empty label for dot
  },
};

export default function StatusBadge({ status, size = "medium" }) {
  const statusKey = status?.toLowerCase() || "pending";
  const config = STATUS_CONFIG[statusKey] || STATUS_CONFIG.pending;

  const sizeClasses = {
    small: "px-2 py-0.5 text-xs",
    medium: "px-2.5 py-1 text-xs",
    large: "px-3 py-1.5 text-sm",
  };

  if (statusKey === "dot") {
    return (
      <span className="w-2 h-2 rounded-full bg-red-500 inline-block align-middle" />
    );
  }

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full font-medium ${config.bgColor} ${config.textColor} ${sizeClasses[size]}`}
    >
      {config.label}
    </span>
  );
}
