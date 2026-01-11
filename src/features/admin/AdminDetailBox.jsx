import React, { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import StatusBadge from "../../components/reusable/StatusBadge";
import { formatDate, formatDateForInput } from "../../lib/dateUtils";
import toast from "react-hot-toast";

// collectors list
const COLLECTORS = [
  { id: "c1", name: "Musa Isa" },
  { id: "c2", name: "Mohd Lawan" },
  
];

// admin detail box component
export default function AdminDetailBox({ data, show, onClose, onSubmit }) {
  const [form, setForm] = useState({
    scheduledDate: "",
    scheduledTime: "",
    collector: "",
  });
  const [submitting, setSubmitting] = useState(false);

  // update form state when data changes
  useEffect(() => {
    if (data) {
      setForm({
        scheduledDate: data.scheduledDate
          ? formatDateForInput(data.scheduledDate)
          : "",
        scheduledTime: data.scheduledTime || "",
        collector: data.collectorName || "",
      });
    }
  }, [data]);

  if (!data || !show) return null;

  // handle backdrop click
  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // handle form submission
  const handleSubmit = async () => {
    if (!form.scheduledDate || !form.scheduledTime) {
      toast.error("Please select both a date and time for the schedule.");
      return;
    }
    setSubmitting(true);

    // update schedule by admin
    try {
      // Convert morning/afternoon to actual time
      const timeString = form.scheduledTime === 'morning' ? '10:00' : '14:00';
      await onSubmit(data.id, {
        date: new Date(
          `${form.scheduledDate}T${timeString}`
        ).toISOString(),
        collectorName: form.collector,
        userEmail: data.userEmail,
      });

      toast.success(
        `Schedule sent successfully to ${data.userName || "user"}!`
      );

      onClose();
    } catch (error) {
      toast.error("Failed to send schedule. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const isScheduled = !!data.scheduledDate;

  // Date, weekday, and time format
  const formatFullDate = (timestamp) =>
    formatDate(timestamp, {
      includeTime: true,
      includeWeekday: true,
      dateStyle: "long",
    });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={handleBackdrop}
    >
      <style>{`
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>

      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto hide-scrollbar shadow-2xl flex flex-col relative">
        {/* update header title of the box details */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-md font-medium text-gray-900">
              Pickup Request Details
            </h2>
            <div className="flex items-center gap-3 mt-1">
              <p className="text-sm text-gray-500">
                Requested on {formatFullDate(data.createdAt)}
              </p>
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

        {/* rendering the box details content */}
        <div className="px-6 py-4 space-y-8">
          <PickupContent
            data={data}
            form={form}
            updateField={updateField}
            submitting={submitting}
            handleSubmit={handleSubmit}
            isScheduled={isScheduled}
            onClose={onClose}
          />
        </div>
      </div>
    </div>
  );
}

// Pickup box details content
function PickupContent({
  data,
  form,
  updateField,
  submitting,
  handleSubmit,
  isScheduled,
  onClose,
}) {
  return (
    <div className="space-y-8">
      <UserSection data={data} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* location */}
        <div className="space-y-4">
          <h4 className="text-sm text-gray-500">Pickup Location</h4>
          <div className="bg-gray-50 rounded-xl p-5 space-y-4 border border-gray-200">
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1.5">
                Location
              </label>
              <p className="text-gray-900 font-medium leading-relaxed">
                {data.location || data.pickupAddress || "N/A"}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1.5">
                  LGA
                </label>
                <p className="text-gray-900 font-medium">{data.lga || "N/A"}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-sm text-gray-500">Pickup Request Details</h4>
          <div className="bg-gray-50 rounded-xl p-5 space-y-4 border border-gray-200">
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1.5">
                Bin Size
              </label>
              <p className="text-gray-900 font-medium">
                {data.binSize || "N/A"} Litres
              </p>
            </div>
            <div className="pt-3 border-t border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <label className="text-xs font-medium text-gray-500 block mb-1.5">
                    Total Amount
                  </label>
                  <p className="text-xl font-bold text-primary">
                    ₦{(data.amount || 0).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <label className="text-xs font-medium text-gray-500 block mb-1.5">
                    Payment
                  </label>
                  <StatusBadge
                    status={
                      data.paymentStatus === "verified"
                        ? "paid"
                        : data.paymentMethod === "onPickup"
                        ? "onPickup"
                        : "pending"
                    }
                    size="small"
                  />
                  <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider">
                    {data.paymentMethod || "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ScheduleSection
        form={form}
        updateField={updateField}
        submitting={submitting}
        handleSubmit={handleSubmit}
        isScheduled={isScheduled}
        onClose={onClose}
      />
    </div>
  );
}

// User section shared between Pickup and Order
function UserSection({ data }) {
  return (
    <div className="flex flex-col md:flex-row gap-6 items-start justify-between bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="h-14 w-14 rounded-full bg-primary/5 border border-primary/10 flex items-center justify-center text-primary font-bold text-xl">
          {data.userName?.charAt(0)?.toUpperCase() || "U"}
        </div>
        <div>
          <h3 className="font-bold text-gray-900 text-lg">
            {data.userName || "Unknown User"}
          </h3>
          <div className="flex flex-col gap-1 mt-1">
            <div className="text-sm text-gray-600">
              {data.userEmail || "No email"}
            </div>
            <div className="text-sm text-gray-600">
              {data.contactPhone || data.userPhone || "No phone"}
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-end gap-2"></div>
    </div>
  );
}

// Schedule section shared between Pickup and Order
function ScheduleSection({
  form,
  updateField,
  submitting,
  handleSubmit,
  isScheduled,
  onClose,
}) {
  return (
    <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
      <h3 className="text-md font-medium text-gray-900 mb-6">
        Schedule the Pickup
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-600">
            Pickup Date
          </label>
          <div className="relative">
            <Icon
              icon="hugeicons:calendar-01"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            />
            <input
              type="date"
              value={form.scheduledDate}
              onChange={(e) => updateField("scheduledDate", e.target.value)}
              className="w-full h-11 pl-10 pr-4 rounded-lg bg-white border border-gray-200 text-gray-900 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-colors"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-600">
            Pickup Time
          </label>
          <div className="relative">
            <Icon
              icon="hugeicons:time-01"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10"
            />
            <select
              value={form.scheduledTime}
              onChange={(e) => updateField("scheduledTime", e.target.value)}
              className="w-full h-11 pl-10 pr-8 rounded-lg bg-white border border-gray-200 text-gray-900 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-colors appearance-none cursor-pointer"
            >
              <option value="">Select time...</option>
              <option value="morning">Morning (8AM - 12PM)</option>
              <option value="afternoon">Afternoon (12PM - 5PM)</option>
            </select>
            <Icon
              icon="hugeicons:arrow-down-01"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-600">
            Assign Collector
          </label>
          <div className="relative">
            <Icon
              icon="hugeicons:truck-delivery"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10"
            />
            <select
              value={form.collector}
              onChange={(e) => updateField("collector", e.target.value)}
              className="w-full h-11 pl-10 pr-8 rounded-lg bg-white border border-gray-200 text-gray-900 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-colors appearance-none cursor-pointer"
            >
              <option value="">Select a collector...</option>
              {COLLECTORS.map((collector) => (
                <option key={collector.id} value={collector.name}>
                  {collector.name}
                </option>
              ))}
            </select>
            <Icon
              icon="hugeicons:arrow-down-01"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-4 mt-8 pt-6 border-t border-gray-200">
        <button
          onClick={onClose}
          className="px-6 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors"
        >
          Cancel
        </button>
        {isScheduled ? (
          <button
            disabled={true}
            className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-transparent rounded-lg disabled:opacity-80 disabled:cursor-not-allowed"
          >
            <span>Scheduled</span>
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={submitting || !form.scheduledDate || !form.scheduledTime || !['morning', 'afternoon'].includes(form.scheduledTime)}
            className="px-6 py-2.5 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-lg transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {submitting ? "Sending..." : "Send Schedule"}
          </button>
        )}
      </div>
    </div>
  );
}
