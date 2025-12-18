import React from "react";
import StatusBadge from "../reusable/StatusBadge";
import { toDate, isToday, isYesterday } from "../../lib/dateUtils";

export default function AdminDataTable({ type, data = [], onViewDetails }) {
  const isPickup = type === "pickups";

  const formatDate = (timestamp) => {
    if (!timestamp) return "Not set";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const groupByDateAndZipcode = (items) => {
    const timeGroups = { today: [], yesterday: [], older: {} };

    items.forEach((item) => {
      const created = toDate(item.createdAt);

      if (isToday(created)) {
        timeGroups.today.push(item);
      } else if (isYesterday(created)) {
        timeGroups.yesterday.push(item);
      } else {
        const dateKey = formatDate(created);
        if (!timeGroups.older[dateKey]) timeGroups.older[dateKey] = [];
        timeGroups.older[dateKey].push(item);
      }
    });

    const groupByZip = (arr) => {
      const groups = {};
      arr.forEach((item) => {
        const zip = item.zipcode || "No Zipcode";
        if (!groups[zip]) groups[zip] = [];
        groups[zip].push(item);
      });
      return groups;
    };

    return {
      today: groupByZip(timeGroups.today),
      yesterday: groupByZip(timeGroups.yesterday),
      older: Object.entries(timeGroups.older).reduce((acc, [date, items]) => {
        acc[date] = groupByZip(items);
        return acc;
      }, {}),
    };
  };

  const isUnscheduled = (item) => !item.scheduledDate || !item.scheduledTime;

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
        <p className="text-gray-500 font-medium">
          No {isPickup ? "pickup requests" : "bin orders"} found
        </p>
      </div>
    );
  }

  const grouped = groupByDateAndZipcode(data);

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <div className="p-6 space-y-8 min-w-[800px]">
          {Object.keys(grouped.today).length > 0 && (
            <div className="space-y-6">
              <DateDivider label="Today" />
              {Object.entries(grouped.today).map(([zip, items]) => (
                <ZipGroup
                  key={`today-${zip}`}
                  zipcode={zip}
                  items={items}
                  isPickup={isPickup}
                  formatDate={formatDate}
                  isUnscheduled={isUnscheduled}
                  onViewDetails={onViewDetails}
                />
              ))}
            </div>
          )}

          {Object.keys(grouped.yesterday).length > 0 && (
            <div className="space-y-6">
              <DateDivider label="Yesterday" />
              {Object.entries(grouped.yesterday).map(([zip, items]) => (
                <ZipGroup
                  key={`yest-${zip}`}
                  zipcode={zip}
                  items={items}
                  isPickup={isPickup}
                  formatDate={formatDate}
                  isUnscheduled={isUnscheduled}
                  onViewDetails={onViewDetails}
                />
              ))}
            </div>
          )}

          {Object.entries(grouped.older).map(([date, zipGroups]) => (
            <div key={date} className="space-y-6">
              <DateDivider label={date} />
              {Object.entries(zipGroups).map(([zip, items]) => (
                <ZipGroup
                  key={`${date}-${zip}`}
                  zipcode={zip}
                  items={items}
                  isPickup={isPickup}
                  formatDate={formatDate}
                  isUnscheduled={isUnscheduled}
                  onViewDetails={onViewDetails}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DateDivider({ label }) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex-1 h-px bg-gray-300"></div>
      <span className="text-sm font-medium text-gray-600">{label}</span>
      <div className="flex-1 h-px bg-gray-300"></div>
    </div>
  );
}

function ZipGroup({
  zipcode,
  items,
  isPickup,
  formatDate,
  isUnscheduled,
  onViewDetails,
}) {
  return (
    <div className="space-y-0">
      <div className="mb-3">
        <span className="text-sm font-medium text-gray-600">
          Zipcode {zipcode}
        </span>
      </div>
      <div className="flex gap-3">
        <div className="w-px bg-gray-300 flex-shrink-0"></div>
        <div className="flex-1 space-y-2">
          {items.map((item) => (
            <ItemRow
              key={item.id}
              item={item}
              isPickup={isPickup}
              formatDate={formatDate}
              isUnscheduled={isUnscheduled}
              onViewDetails={onViewDetails}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function ItemRow({ item, isPickup, formatDate, isUnscheduled, onViewDetails }) {
  const unscheduled = isUnscheduled(item);

  return (
    <div
      className={`flex items-center py-3 px-6 rounded-lg border transition-colors ${
        unscheduled
          ? "border-gray-200 bg-white shadow-sm"
          : "border-gray-100 bg-gray-50/50 hover:bg-white"
      }`}
    >
      <div className="w-1/4 flex items-center gap-3">
        <div
          className={`h-9 w-9 rounded-full flex items-center justify-center text-sm flex-shrink-0 ${
            unscheduled
              ? "bg-primary/10 text-primary font-bold"
              : "bg-gray-200 text-gray-600 font-medium"
          }`}
        >
          {item.userName?.charAt(0)?.toUpperCase() || "U"}
        </div>
        <div className="min-w-0">
          <p
            className={`text-sm truncate ${
              unscheduled
                ? "font-bold text-gray-900"
                : "font-medium text-gray-700"
            }`}
          >
            {item.userName || "Unknown User"}
          </p>
          <p
            className={`text-xs truncate ${
              unscheduled ? "text-gray-600 font-medium" : "text-gray-500"
            }`}
          >
            {item.userEmail || ""}
          </p>
        </div>
      </div>

      <div className="w-1/4 px-2">
        <p
          className={`text-sm truncate ${
            unscheduled ? "font-bold text-gray-900" : "text-gray-600"
          }`}
        >
          {isPickup
            ? item.pickupAddress
            : item.deliveryAddress || item.address || "No address"}
        </p>
      </div>

      <div className="w-1/6 px-2">
        <span
          className={`text-sm ${
            unscheduled ? "font-bold text-gray-900" : "text-gray-500"
          }`}
        >
          {formatDate(item.createdAt)}
        </span>
      </div>

      <div className="w-1/6 px-2">
        <StatusBadge status={item.status} size="small" />
      </div>

      <div className="w-1/6 flex justify-end">
        <button
          onClick={() => onViewDetails(item)}
          className={`relative inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors border text-gray-600 hover:text-gray-900 hover:bg-gray-100 border-gray-200`}
        >
          <span>{unscheduled ? "Schedule" : "Details"}</span>
        </button>
      </div>
    </div>
  );
}
