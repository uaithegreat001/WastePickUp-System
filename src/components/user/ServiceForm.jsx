import React, { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { PaystackButton } from "react-paystack";
import axios from "axios";
import { FormInput, FormSelect } from "../common/FormInput";
import { SERVICE_AREAS } from "../../lib/constants";
import { adminService } from "../../services/adminService";

// Default pricing (used as a fallback)
const DEFAULT_ORDER_PRICES = [
  {
    value: "50",
    label: "50 Litres",
    price: 5000,
    image: "/bin-50l.png",
    description: "Best for small households or minimal waste disposal",
  },
  {
    value: "120",
    label: "120 Litres",
    price: 8500,
    image: "/bin-120l.png",
    description:
      "Best for average households and regular use of waste disposal",
  },
  {
    value: "240",
    label: "240 Litres",
    price: 15000,
    image: "/bin-240l.png",
    description:
      "Best for large households or commercial use of waste disposal",
  },
];

const DEFAULT_PICKUP_PRICES = [
  { value: "50", label: "50 Litres", price: 1500 },
  { value: "120", label: "120 Litres", price: 3000 },
  { value: "240", label: "240 Litres", price: 5000 },
];

// Handles both bin orders and pickup requests
export default function ServiceForm({ type, onSubmit, userData }) {
  const isOrder = type === "order";

  // Dynamic pricing state
  const [orderPrices, setOrderPrices] = useState(DEFAULT_ORDER_PRICES);
  const [pickupPrices, setPickupPrices] = useState(DEFAULT_PICKUP_PRICES);
  const [loadingPrices, setLoadingPrices] = useState(true);

  const prices = isOrder ? orderPrices : pickupPrices;

  const [form, setForm] = useState({
    address: "",
    serviceArea: "",
    contactPhone: "",
    quantity: 1,
    binSize: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [total, setTotal] = useState(0);

  // Fetch pricing from Firebase on mount
  useEffect(() => {
    const fetchPricing = async () => {
      try {
        const data = await adminService.getPricingSettings();
        if (data.pickupPrices) {
          setPickupPrices(data.pickupPrices);
        }
        if (data.orderPrices) {
          // Merge with descriptions and images from defaults
          const mergedOrderPrices = data.orderPrices.map((price, index) => ({
            ...DEFAULT_ORDER_PRICES[index],
            ...price,
          }));
          setOrderPrices(mergedOrderPrices);
        }
      } catch (error) {
        console.error("Error fetching pricing:", error);
      } finally {
        setLoadingPrices(false);
      }
    };
    fetchPricing();
  }, []);

  // Recalculate total when bin size, quantity, or prices change
  useEffect(() => {
    const bin = prices.find((b) => b.value === form.binSize);
    setTotal(bin ? bin.price * form.quantity : 0);
  }, [form.binSize, form.quantity, prices]);

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!form.address.trim())
      errs.address = `${isOrder ? "Delivery" : "Pickup"} address is required`;
    if (!form.serviceArea) errs.serviceArea = "Service area is required";
    if (!form.binSize) errs.binSize = "Bin size is required";
    if (form.quantity < 1) errs.quantity = "Quantity must be at least 1";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Payment configuration
  const [paystackConfig, setPaystackConfig] = useState(null);

  const handlePaystackSuccess = async (reference) => {
    setSubmitting(true);
    try {
      // 1. Verify payment on backend
      const verifyResponse = await axios.post(
        "http://localhost:3000/verify-payment",
        {
          reference: reference.reference,
          email: userData?.email || form.contactPhone || "unknown@user.com",
          amount: total,
        }
      );

      if (verifyResponse.data.success) {
        // 2. If verified, Save to DB
        const area = SERVICE_AREAS.find((a) => a.zipcode === form.serviceArea);
        const phone = form.contactPhone.trim() || userData?.phone || "";

        const data = {
          [isOrder ? "deliveryAddress" : "pickupAddress"]: form.address,
          zipcode: area?.zipcode || "",
          lga: area?.lga || "",
          contactPhone: phone,
          quantity: form.quantity,
          binSize: form.binSize,
          amount: total,
          paymentStatus: "paid", // CONFIRMED PAID
          paymentReference: reference.reference,
          ...(isOrder && form.notes && { notes: form.notes }),
        };

        await onSubmit(data);

        // Reset form only after successful save
        setForm({
          address: "",
          serviceArea: "",
          contactPhone: "",
          quantity: 1,
          binSize: "",
          notes: "",
        });
        setTotal(0);
      } else {
        alert("Payment verification failed. Please contact support.");
      }
    } catch (err) {
      console.error("Payment/Save Error:", err);
      alert("An error occurred during payment verification.");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePaystackClose = () => {
    console.log("Payment closed");
    setSubmitting(false);
  };

  const config = {
    reference: new Date().getTime().toString(),
    email: userData?.email || "user@wastepickup.com",
    amount: total * 100, // kobo
    publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    // Check if user wants to proceed to payment
    // We can't trigger Paystack hook programmatically easily without a button click usually,
    // but we can render the PaystackButton as the submit button.
    // However, we need to validate first.
    // simpler approach: The "Proceed to Payment" button IS the PaystackButton,
    // but maybe disabled until valid? Or we wrap it.
    // Let's use the PaystackButton component directly for simplicity as requested.
  };

  const selectedBin = prices.find((b) => b.value === form.binSize);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      {/* Fetch user info from DB */}
      {userData && (
        <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="flex items-center gap-2">
              <Icon icon="hugeicons:user-03" className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-900">
                {userData.fullName}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Icon
                icon="hugeicons:mail-01"
                className="w-4 h-4 text-gray-400"
              />
              <span className="text-sm text-gray-600">{userData.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Icon icon="hugeicons:call-02" className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">{userData.phone}</span>
            </div>
          </div>
        </div>
      )}

      {/* Form Fields */}
      <div className="space-y-6">
        {/* location section */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-4">
            {isOrder ? "Delivery Location" : "Pickup Location"}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label={isOrder ? "Delivery Address" : "Pickup Address"}
              value={form.address}
              onChange={(e) => updateField("address", e.target.value)}
              error={errors.address}
              placeholder="Enter full address"
              className="md:col-span-2"
              required
            />
            <FormSelect
              label="Select Service Area"
              value={form.serviceArea}
              onChange={(e) => updateField("serviceArea", e.target.value)}
              error={errors.serviceArea}
              options={SERVICE_AREAS.map((a) => ({
                value: a.zipcode,
                label: a.label,
              }))}
              required
            />
            <FormInput
              label="Contact Phone (Optional)"
              type="tel"
              value={form.contactPhone}
              onChange={(e) => updateField("contactPhone", e.target.value)}
              error={errors.contactPhone}
              placeholder={userData?.phone || "Enter contact phone"}
             
            />
          </div>
        </div>

        {/* bin details section */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-4">
            Bin Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormSelect
              label="Bin Size"
              value={form.binSize}
              onChange={(e) => updateField("binSize", e.target.value)}
              error={errors.binSize}
              options={prices}
              required
            />
            <FormInput
              label="Quantity of Bins"
              type="number"
              min="1"
              value={form.quantity}
              onChange={(e) =>
                updateField("quantity", parseInt(e.target.value) || 1)
              }
              error={errors.quantity}
              placeholder="1"
              required
            />
          </div>

          {/* bin product card select section */}
          {isOrder && selectedBin && (
            <div className="mt-4 bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-start gap-4">
                <div className="w-24 h-24 bg-white rounded-lg border border-gray-200 flex items-center justify-center flex-shrink-0">
                  <img
                    src={selectedBin.image}
                    alt={selectedBin.label}
                    className="w-20 h-20 object-contain"
                  />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-gray-900">
                    {selectedBin.label} Waste Bin
                  </h4>
                  <p className="text-xs text-gray-600 mt-1">
                    {selectedBin.description}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* payment summary section*/}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">
            Payment Summary
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">
                {isOrder ? "Bin Price" : "Bin Size Price"}
              </span>
              <span className="font-medium text-gray-900">
                {form.binSize
                  ? `₦${prices
                      .find((b) => b.value === form.binSize)
                      ?.price.toLocaleString()}`
                  : "₦0"}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Quantity</span>
              <span className="font-medium text-gray-900">{form.quantity}</span>
            </div>
            <div className="pt-2 border-t border-gray-200 flex justify-between items-center">
              <span className="font-semibold text-gray-900">Total Amount</span>
              <span className="text-lg font-bold text-primary">
                ₦{total.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Payment actions */}
        <div className="flex items-center justify-end pt-4 border-t border-gray-200">
        
          {form.address && form.serviceArea && form.binSize && total > 0 ? (
            <PaystackButton
              className="px-6 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-lg transition-colors flex items-center gap-2"
              {...config}
              text={submitting ? "Processing..." : "Proceed to Payment"}
              onSuccess={handlePaystackSuccess}
              onClose={handlePaystackClose}
            />
          ) : (
            <button
              type="button"
              disabled={true}
              className="px-6 py-2 text-sm font-medium text-white bg-gray-300 rounded-lg cursor-not-allowed flex items-center gap-2"
            >
              Proceed to Payment
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
