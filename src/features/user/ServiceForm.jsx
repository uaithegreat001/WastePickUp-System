import React, { useState, useEffect, useMemo, useRef } from "react";
import { Icon } from "@iconify/react";
import { PaystackButton } from "react-paystack";
import axios from "axios";
import { FormInput, FormSelect } from "../../components/reusable/FormInput";
import { SERVICE_AREAS } from "../../lib/constants";
import { adminService } from "../admin/adminService";
import toast from "react-hot-toast";
import { reverseGeocode } from "../../services/geocodingService";

const DEFAULT_PICKUP_PRICES = [
  { value: "50", label: "50 Litres", price: 500 },
  { value: "120", label: "120 Litres", price: 1000 },
  { value: "240", label: "240 Litres", price: 1500 },
];

export default function ServiceForm({ onSubmit, userData }) {
  const [pickupPrices, setPickupPrices] = useState(DEFAULT_PICKUP_PRICES);

  const prices = pickupPrices;

  const [form, setForm] = useState({
    location: "",
    serviceArea: "",
    contactPhone: "",
    binSize: "",
    paymentMethod: "onPickup", // Default to pickup
    latitude: null,
    longitude: null,
  });
  const [submitting, setSubmitting] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [total, setTotal] = useState(0);
  const locationDetected = useRef(false);

  // Auto-detect location on mount
  useEffect(() => {
    let toastId;
    const detectLocation = async () => {
      if (!navigator.geolocation || locationDetected.current) return;
      locationDetected.current = true;

      setDetecting(true);
      toastId = toast.loading("Detecting your location...");

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const geoData = await reverseGeocode(latitude, longitude);

            // Map detected LGA to SERVICE_AREAS
            const matchedArea = SERVICE_AREAS.find(
              (area) =>
                geoData.lga &&
                (area.lga.toLowerCase().includes(geoData.lga.toLowerCase()) ||
                  geoData.lga.toLowerCase().includes(area.lga.toLowerCase())),
            );

            setForm((prev) => ({
              ...prev,
              location: geoData.address,
              serviceArea: matchedArea?.lga || prev.serviceArea,
              latitude,
              longitude,
            }));

            toast.success("Location detected", { id: toastId });
          } catch (error) {
            console.error("Reverse geocoding failed:", error);
            // Even if reverse geocoding fails, we still have the coords
            setForm((prev) => ({ ...prev, latitude, longitude }));
            toast.error(
              "Could not determine address, but coordinates captured",
              { id: toastId },
            );
          } finally {
            setDetecting(false);
          }
        },
        (error) => {
          console.error("Geolocation error:", error);
          let msg = "Could not detect location";
          if (error.code === 1)
            msg = "Location access denied. Please enter address manually.";
          toast.error(msg, { id: toastId });
          setDetecting(false);
        },
        { enableHighAccuracy: true, timeout: 10000 },
      );
    };

    detectLocation();

    return () => {
      if (toastId) toast.dismiss(toastId);
    };
  }, []);

  useEffect(() => {
    const litres = parseFloat(form.binSize) || 0;
    setTotal(litres * 10);
  }, [form.binSize]);

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handlePayOnPickupSubmission = async () => {
    setSubmitting(true);
    const toastId = toast.loading("Submitting request...");

    try {
      const area = SERVICE_AREAS.find((a) => a.lga === form.serviceArea);
      await onSubmit({
        location: form.location,
        lga: area?.lga || form.serviceArea,
        latitude: form.latitude,
        longitude: form.longitude,
        contactPhone: form.contactPhone || userData?.phone || "",
        binSize: parseFloat(form.binSize) || 0,
        amount: total,
        paymentStatus: "pending_pickup",
        paymentMethod: "onPickup",
      });

      toast.success("Request submitted successfully", { id: toastId });
      resetForm();
    } catch (err) {
      toast.error("Failed to submit request", { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  const handlePaystackSuccess = async (reference) => {
    setSubmitting(true);
    const toastId = toast.loading("Verifying payment...");

    try {
      const res = await axios.post(import.meta.env.VITE_VERIFY_PAYMENT_URL, {
        reference: reference.reference,
        email: userData?.email,
        amount: Math.round(total * 100),
        type: "pickup",
      });

      if (!res.data.success) throw new Error("Verification failed");

      const area = SERVICE_AREAS.find((a) => a.lga === form.serviceArea);
      await onSubmit({
        location: form.location,
        lga: area?.lga || form.serviceArea,
        latitude: form.latitude,
        longitude: form.longitude,
        contactPhone: form.contactPhone || userData?.phone || "",
        binSize: parseFloat(form.binSize) || 0,
        amount: total,
        paymentStatus: "verified",
        paymentReference: reference.reference,
        paymentMethod: "online",
      });

      toast.success("Payment verified and request submitted", { id: toastId });
      resetForm();
    } catch (err) {
      toast.error("Payment verification failed", { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setForm({
      location: "",
      serviceArea: "",
      contactPhone: "",
      binSize: "",
      paymentMethod: "onPickup",
      latitude: null,
      longitude: null,
    });
    setTotal(0);
  };

  const handlePaystackClose = () => setSubmitting(false);

  const paystackConfig = useMemo(
    () => ({
      reference: `WP_${new Date().getTime()}`,
      email: userData?.email || "user@wastepickup.com",
      amount: total * 100,
      publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
    }),
    [total, userData?.email],
  );

  const isFormValid =
    form.location && form.serviceArea && form.binSize && total > 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-4">
            Pickup Location
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Pickup Location"
              value={form.location}
              onChange={(e) => updateField("location", e.target.value)}
              placeholder={
                detecting ? "Detecting location..." : "Enter full location"
              }
              className="md:col-span-2"
              required
            />
            <FormSelect
              label="Select Service Area"
              value={form.serviceArea}
              onChange={(e) => updateField("serviceArea", e.target.value)}
              options={SERVICE_AREAS.map((a) => ({
                value: a.lga,
                label: a.label,
              }))}
              required
            />
            <FormInput
              label="Contact Phone (Optional)"
              type="tel"
              value={form.contactPhone}
              onChange={(e) => updateField("contactPhone", e.target.value)}
              placeholder={userData?.phone || "Enter contact phone"}
            />
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Estimated Waste Volume (Litres)"
              type="number"
              min="1"
              value={form.binSize}
              onChange={(e) => updateField("binSize", e.target.value)}
              placeholder="Enter litres"
              required
            />
            <FormSelect
              label="Payment Method"
              value={form.paymentMethod}
              onChange={(e) => updateField("paymentMethod", e.target.value)}
              options={[
                { value: "onPickup", label: "Pay on Pickup" },
                { value: "online", label: "Pay Online Now" },
              ]}
              required
            />
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">
            Payment Summary
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Price per Litre</span>
              <span className="font-medium text-gray-900">₦10</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total Litres</span>
              <span className="font-medium text-gray-900">
                {form.binSize || 0}L
              </span>
            </div>
            <div className="pt-2 border-t border-gray-200 flex justify-between items-center">
              <span className="font-semibold text-gray-900">Total Amount</span>
              <span className="text-lg font-bold text-primary">
                ₦{total.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end pt-4 border-t border-gray-200">
          {!isFormValid ? (
            <button
              type="button"
              disabled
              className="px-6 py-2 text-sm font-medium text-white disabled:bg-gray-300 rounded-lg cursor-not-allowed"
            >
              Submit Request
            </button>
          ) : form.paymentMethod === "online" ? (
            <PaystackButton
              className="px-6 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-lg transition-colors flex items-center gap-2"
              {...paystackConfig}
              text={submitting ? "Processing..." : "Pay Now & Submit"}
              onSuccess={handlePaystackSuccess}
              onClose={handlePaystackClose}
            />
          ) : (
            <button
              onClick={handlePayOnPickupSubmission}
              disabled={submitting}
              className="px-6 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-lg transition-colors flex items-center gap-2"
            >
              {submitting ? "Submitting..." : "Submit (Pay on Pickup)"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
